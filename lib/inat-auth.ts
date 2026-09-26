import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { hasNetwork } from '@/lib/network';

WebBrowser.maybeCompleteAuthSession();

// Static member-expression read — EXPO_PUBLIC_* vars are inlined by Babel at
// build time from literal `process.env.X` expressions, not dynamic lookups
// (see lib/firebase.ts). Left blank, the connect flow is simply not offered
// and identification stays on-device — this is optional, unlike Firebase's
// required env vars.
const INAT_CLIENT_ID = process.env.EXPO_PUBLIC_INATURALIST_OAUTH_CLIENT_ID ?? '';

// Must exactly match the redirect URI registered on the iNaturalist OAuth
// application (see .env.example) — "wildlens" comes from app.json's `scheme`.
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'wildlens', path: 'oauth-callback' });

// iNaturalist doesn't publish an OIDC discovery document, so this is
// hardcoded rather than fetched via useAutoDiscovery().
const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://www.inaturalist.org/oauth/authorize',
  tokenEndpoint: 'https://www.inaturalist.org/oauth/token',
};

const API_TOKEN_URL = 'https://www.inaturalist.org/users/api_token';
const USER_ME_URL = 'https://api.inaturalist.org/v1/users/me';
const STORAGE_KEY = 'inat_oauth_tokens';

// Re-mint the JWT a bit before its real ~24h expiry so a borderline-stale
// token is never handed to a caller that's about to make a real request.
const JWT_FRESH_WINDOW_MS = 23 * 60 * 60 * 1000;
// Refresh the OAuth access token slightly before it actually expires.
const ACCESS_TOKEN_EXPIRY_MARGIN_MS = 60 * 1000;

type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  apiJwt?: string;
  apiJwtMintedAt?: number;
  username?: string;
};

let cache: StoredTokens | null | undefined; // undefined = not loaded yet

async function loadStored(): Promise<StoredTokens | null> {
  if (cache !== undefined) return cache;
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    cache = null;
  }
  return cache;
}

async function saveStored(tokens: StoredTokens): Promise<void> {
  cache = tokens;
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
}

async function clearStored(): Promise<void> {
  cache = null;
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

export async function isConnected(): Promise<boolean> {
  return (await loadStored()) !== null;
}

export async function getStoredUsername(): Promise<string | null> {
  const stored = await loadStored();
  return stored?.username ?? null;
}

export async function connectINaturalist(): Promise<{ username: string | null }> {
  if (!INAT_CLIENT_ID) {
    throw new Error(
      'iNaturalist is not configured (missing EXPO_PUBLIC_INATURALIST_OAUTH_CLIENT_ID).',
    );
  }
  if (!(await hasNetwork())) {
    throw new Error('Connecting to iNaturalist requires a network connection.');
  }

  const request = new AuthSession.AuthRequest({
    clientId: INAT_CLIENT_ID,
    redirectUri: REDIRECT_URI,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    scopes: [],
  });

  const result = await request.promptAsync(discovery);
  if (result.type !== 'success') {
    throw new Error(
      result.type === 'error'
        ? (result.error?.message ?? 'iNaturalist login failed.')
        : 'iNaturalist login was cancelled.',
    );
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: INAT_CLIENT_ID,
      code: result.params.code,
      redirectUri: REDIRECT_URI,
      extraParams: { code_verifier: request.codeVerifier ?? '' },
    },
    discovery,
  );

  const accessTokenExpiresAt = tokenResponse.expiresIn
    ? Date.now() + tokenResponse.expiresIn * 1000
    : Date.now() + 60 * 60 * 1000; // conservative fallback if iNat omits expires_in

  let username: string | null = null;
  try {
    const meRes = await fetch(USER_ME_URL, {
      headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
    });
    if (meRes.ok) {
      const json: { results?: Array<{ login?: string }> } = await meRes.json();
      username = json.results?.[0]?.login ?? null;
    }
  } catch {
    // Non-fatal — the connection itself still succeeded.
  }

  await saveStored({
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken ?? '',
    accessTokenExpiresAt,
    username: username ?? undefined,
  });

  return { username };
}

export async function disconnectINaturalist(): Promise<void> {
  await clearStored();
}

export async function getValidApiToken(): Promise<string | null> {
  const stored = await loadStored();
  if (!stored || !stored.refreshToken) return null;

  if (
    stored.apiJwt &&
    stored.apiJwtMintedAt &&
    Date.now() - stored.apiJwtMintedAt < JWT_FRESH_WINDOW_MS
  ) {
    return stored.apiJwt;
  }

  if (!(await hasNetwork())) return null;

  try {
    let accessToken = stored.accessToken;
    let refreshToken = stored.refreshToken;
    let accessTokenExpiresAt = stored.accessTokenExpiresAt;

    if (Date.now() >= accessTokenExpiresAt - ACCESS_TOKEN_EXPIRY_MARGIN_MS) {
      const refreshed = await AuthSession.refreshAsync(
        { clientId: INAT_CLIENT_ID, refreshToken },
        discovery,
      );
      accessToken = refreshed.accessToken;
      // Doorkeeper commonly rotates the refresh token but doesn't guarantee
      // it in every response — keep the old one if a new one isn't returned.
      refreshToken = refreshed.refreshToken ?? refreshToken;
      accessTokenExpiresAt = refreshed.expiresIn
        ? Date.now() + refreshed.expiresIn * 1000
        : Date.now() + 60 * 60 * 1000;
    }

    const jwtRes = await fetch(API_TOKEN_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!jwtRes.ok) {
      if (jwtRes.status === 401) await clearStored();
      return null;
    }
    const jwtJson: { api_token: string } = await jwtRes.json();

    await saveStored({
      ...stored,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      apiJwt: jwtJson.api_token,
      apiJwtMintedAt: Date.now(),
    });

    return jwtJson.api_token;
  } catch {
    // Transient network/server failure — don't disconnect the user over it,
    // just decline this attempt and let the caller fall back to on-device.
    return null;
  }
}
