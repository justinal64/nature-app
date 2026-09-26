import type * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'wildlens://oauth-callback'),
  AuthRequest: jest.fn(),
  ResponseType: { Code: 'code' },
  refreshAsync: jest.fn(),
  exchangeCodeAsync: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('@/lib/network', () => ({
  hasNetwork: jest.fn().mockResolvedValue(true),
}));

function storedBlob(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessTokenExpiresAt: Date.now() + 60 * 60 * 1000,
    ...overrides,
  });
}

// jest.resetModules() alone breaks a top-level `import * as SecureStore`
// reference (it'd point at a stale mock instance from before the reset), so
// each test requires both modules together inside one isolated registry and
// keeps the returned references — that's the only way the SecureStore mock
// object a test configures is the same one lib/inat-auth.ts actually calls.
function loadInatAuth() {
  let inatAuth!: typeof import('@/lib/inat-auth');
  let secureStore!: jest.Mocked<typeof SecureStore>;
  jest.isolateModules(() => {
    secureStore = require('expo-secure-store');
    inatAuth = require('@/lib/inat-auth');
  });
  return { ...inatAuth, secureStore };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isConnected / getStoredUsername', () => {
  it('returns false/null when nothing is stored', async () => {
    const { isConnected, getStoredUsername, secureStore } = loadInatAuth();
    secureStore.getItemAsync.mockResolvedValue(null);
    expect(await isConnected()).toBe(false);
    expect(await getStoredUsername()).toBeNull();
  });

  it('returns true/username when a token pair is stored', async () => {
    const { isConnected, getStoredUsername, secureStore } = loadInatAuth();
    secureStore.getItemAsync.mockResolvedValue(storedBlob({ username: 'nature_fan' }));
    expect(await isConnected()).toBe(true);
    expect(await getStoredUsername()).toBe('nature_fan');
  });
});

describe('getValidApiToken', () => {
  it('returns null when not connected', async () => {
    const { getValidApiToken, secureStore } = loadInatAuth();
    secureStore.getItemAsync.mockResolvedValue(null);
    expect(await getValidApiToken()).toBeNull();
  });

  it('returns the cached JWT without a network call when it is still fresh', async () => {
    const { getValidApiToken, secureStore } = loadInatAuth();
    secureStore.getItemAsync.mockResolvedValue(
      storedBlob({ apiJwt: 'jwt-fresh', apiJwtMintedAt: Date.now() - 1000 }),
    );
    const fetchSpy = jest.spyOn(global, 'fetch');

    expect(await getValidApiToken()).toBe('jwt-fresh');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('mints a new JWT when the cached one is past the freshness window', async () => {
    const { getValidApiToken, secureStore } = loadInatAuth();
    secureStore.getItemAsync.mockResolvedValue(
      storedBlob({ apiJwt: 'jwt-stale', apiJwtMintedAt: Date.now() - 24 * 60 * 60 * 1000 }),
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ api_token: 'jwt-new' }),
    }) as jest.Mock;

    expect(await getValidApiToken()).toBe('jwt-new');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://www.inaturalist.org/users/api_token',
      expect.objectContaining({ headers: { Authorization: 'Bearer access-token' } }),
    );
    expect(secureStore.setItemAsync).toHaveBeenCalled();
  });

  it('clears stored credentials and returns null on a 401 minting the JWT', async () => {
    const { getValidApiToken, secureStore } = loadInatAuth();
    secureStore.getItemAsync.mockResolvedValue(storedBlob());
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as jest.Mock;

    expect(await getValidApiToken()).toBeNull();
    expect(secureStore.deleteItemAsync).toHaveBeenCalled();
  });

  it('returns null (without disconnecting) on a transient network failure', async () => {
    const { getValidApiToken, secureStore } = loadInatAuth();
    secureStore.getItemAsync.mockResolvedValue(storedBlob());
    global.fetch = jest.fn().mockRejectedValue(new Error('network blip')) as jest.Mock;

    expect(await getValidApiToken()).toBeNull();
    expect(secureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});
