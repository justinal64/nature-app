# WildLens (nature)

Expo Router app for identifying plants and animals in the wild. Mobile-first
(iOS + Android), with web supported only for browser testing.

## Architecture: offline-first

This is the most important thing to internalize before suggesting any data
work — **the app must function fully offline**. Most use happens in the
backcountry where users have no cell signal. That drives a different shape
than a typical Expo + Firebase app:

- **Species catalog (Trees, Birds, Insects, Snakes — taxonomy, photos,
  identifying features, range notes) ships inside the app bundle**, not
  Firestore. Updating the catalog means shipping an app update.
- **ML models for #3 / #18 also ship in-app** (or are downloaded once and
  cached), not called via a network API.
- **User-generated content** (sightings, photos, journal entries, favorites)
  is **local-first**. Use on-device storage (`expo-file-system` for photos,
  AsyncStorage / SQLite / MMKV for metadata) as the source of truth. If we
  ever want cross-device sync, layer Firestore on top as a background sync
  target — but reads always come from local first.
- **Firebase's role is intentionally narrow:** auth (requires internet on
  first sign-in, then session token is cached), and maybe optional cloud
  backup of sightings later. Don't reach for Firestore as the default
  persistence layer the way skateboard does.
- **Network calls in the hot path are a bug.** If something needs to render
  while the user is identifying a plant in the desert, it can't depend on
  reaching the internet.

Implications for existing issues: #8 (Firestore schema) is much narrower than
it reads — auth profile only, not catalog. #10 (replace hardcoded data) is
actually about moving the hardcoded arrays into a bundled catalog file, not
about Firestore queries. #17/#19/#20 (data sourcing) are about what to bundle
at build time, not what to fetch at runtime.

## Sibling project

`/Users/justin.leggett/Projects/react-native/skateboard/` is the canonical
reference for **auth, theming, Zustand store, jest setup, EAS config, and
file layout**. When the user says "use the same strategy as skateboard,"
port those patterns from there.

**Do not port skateboard's Firestore-heavy data model** — skateboard is an
online-first app where collections are the source of truth. WildLens is
offline-first (see above). The places where the two apps diverge most are
data persistence and the role of Firebase. Match skateboard's file layout
when adding equivalents, but don't assume its Firestore patterns apply.

## Stack

- Expo SDK 55, React 19, React Native 0.83, expo-router 55
- TypeScript strict mode
- NativeWind 4 (Tailwind) is installed but most screens use inline styles
  with `COLORS` from `constants/AppTheme.ts` — be consistent with neighbouring
  code rather than mixing approaches in one file
- `react-native-svg` for species illustrations and landscape backdrops
- `firebase` (Web SDK, JS) for auth + Firestore — *not* `@react-native-firebase`
- `expo-image` available; `expo-camera` is **not yet installed** (issue #1)

## File layout

```
app/
  (tabs)/        Home, Guide, Journal, Profile, plus capture-tab redirect
  _layout.tsx    AuthProvider + segments-based redirect lives here
  login.tsx, register.tsx, verify-email.tsx
  capture.tsx    Camera modal (currently stubbed)
  result.tsx     ID result (currently hardcoded Saguaro)
  species/[id].tsx
components/     Shared UI: SpeciesIcon, LandscapeHeader, TextField, PasswordInput, ...
constants/      AppTheme (COLORS + helpers + NatureTheme)
context/        AuthContext
lib/            firebase.ts
utils/          errors, validation
```

## Palette

The whole app uses one warm-earth palette from `constants/AppTheme.ts`:

- `ink` `#3D2519` — primary text
- `clay` `#B85C3A` — primary accent / CTAs
- `sand` `#E8D5B7` — borders
- `sage` `#9CAB87` — secondary accent, "seen" species tiles
- `dusk` `#6B4E6B` — avatar / decorative
- `cream` `#F4ECDA` — background
- `bark` `#8B6F47` — secondary text (`textDim`)
- `gold` `#D4A437` — hero card / desert sky

Also exports semantic aliases (`background`, `surface`, `text`, `textDim`,
`primary`, `secondary`, `border`) and helpers: `glow()`, `softShadow()`,
`textGlow()`.

## Auth pattern

- `lib/firebase.ts` initializes from `EXPO_PUBLIC_FIREBASE_*` env vars
- `context/AuthContext.tsx` exposes `{ user, loading, emailVerified, signOut, refreshUser, deleteAccount }`
- `app/_layout.tsx` wraps everything in `<AuthProvider>` and runs the
  segments-based redirect:
  - no user → `/login`
  - user + unverified → `/verify-email`
  - user + verified + on a public page → `/`
- Email verification is **required** before the tabs unlock. Don't bypass it.

### Gotcha: `user.reload()` does not trigger re-renders

The Firebase JS SDK mutates the `User` instance in place when you call
`reload()`. React doesn't see a new reference, so any effect that depends on
`user.emailVerified` will not re-fire. Use `refreshUser()` from `AuthContext`
instead — it tracks `emailVerified` as separate state and bumps it explicitly.

## Routing

- `(tabs)/` is the authenticated app
- `/capture` is a modal route — pushed from the center tab FAB (see
  `(tabs)/capture-tab.tsx`, which is a thin `<Redirect>` so the tab can
  exist without being a regular screen)
- `/result` is full-screen, transitioned via fade
- `/species/[id]` is a stack-pushed detail screen

When you add routes, you'll see stale type errors against
`.expo/types/router.d.ts`. Fix: delete the file and run
`npx expo start --offline` briefly to regenerate it.

## SVG conventions

Species are drawn as `<SpeciesIcon kind="cactus|bird|insect|snake" />`. The
SVG paths live in `components/SpeciesIcon.tsx` — don't inline new versions
elsewhere; extend the kind union if you need more.

Decorative backdrops (warm curved waves, desert sunset) are in
`components/LandscapeHeader.tsx`.

## Style gotchas

- `softShadow()` returns a strict `ViewStyle` — applying it to a `TextInput`
  is a type error. Wrap the input in a `<View>` if you need a shadow there.
- Inline literal `'` and `"` inside JSX text trigger
  `react/no-unescaped-entities` — use `&apos;` / `&quot;` or rephrase.

## Env vars

Six `EXPO_PUBLIC_FIREBASE_*` keys (api key, auth domain, project id, storage
bucket, sender id, app id). Local dev reads `.env` (gitignored); a template
lives in `.env.example`. Production builds need them set as EAS secrets — see
issue #7.

## Verify before reporting work as done

```
npx tsc --noEmit
npx expo lint
```

Both must be clean. The user is fine with paid `--cache`-clearing dev server
restarts when env vars change (`npx expo start -c`).

## Workflow

- **Git push:** use `git push` as transport (no `gh` equivalent), but rely on
  `gh` CLI for any GitHub-side operation (issues, PRs, status checks).
- **Commits:** always include the
  `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer.
- **Closing issues from commits:** `Closes #N` in the commit body auto-closes
  on push to `main`. The user is OK with this.
- **Issue tracking:** the user prefers filing issues for problems noticed in
  passing — proactively suggest filing one rather than silently fixing
  off-task things.

## Data layer status

Two kinds of "fake" data live in the screens right now:

1. **Catalog data** (species names, regions, photos, descriptions) — currently
   inline arrays per screen. The *bundle-with-the-app* end state is similar
   in shape; the work is to extract these into a single source of truth
   (e.g. `constants/catalog.ts` or `assets/catalog.json`) keyed by id, then
   import it from each screen. **Not** a Firestore migration.
2. **User-specific data** (counters like "47 species · 14d streak", recent
   finds, journal entries, favorites, sightings) — also hardcoded today.
   This needs an actual local persistence layer (AsyncStorage or SQLite),
   keyed by the signed-in user's uid. Sync to Firestore is optional and out
   of scope for the offline-first MVP.

Always treat the visible numbers in the Profile / Home screens as fiction
until #10 lands.

## Out of scope (don't add without asking)

- Passwordless / magic-link sign-in — explicitly left disabled in Firebase
- Social auth (Google / Apple) — the email + verify pattern is intentional
- `@react-native-firebase/*` native modules — we use the JS SDK on purpose
- `firebase-admin` or server SDKs — this is a pure client app
- **Network-dependent code paths in the identification or guide flow** —
  app must work offline (see Architecture above). Auth is the one exception.
- Streaming photos / catalog data from Firestore Storage on demand —
  bundle it in the app instead
- Comments that explain WHAT the code does — keep them for non-obvious WHY
- New marketing / docs `.md` files — write to the PR description or an issue
  instead unless asked
