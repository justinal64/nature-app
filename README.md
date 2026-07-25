# WildLens (nature-app)

Expo Router app for identifying plants and animals in the wild. See
`CLAUDE.md` for architecture notes (this app is offline-first — read that
before touching data persistence or the identification flow).

## Local development

```
cp .env.example .env
# fill in the 6 EXPO_PUBLIC_FIREBASE_* values from the Firebase console,
# and optionally EXPO_PUBLIC_INATURALIST_API_TOKEN
npx expo start
```

`.env` is gitignored and only read by the local dev server / Metro — it is
never bundled into a production build.

## Production builds: EAS secrets

Production builds via EAS do **not** read `.env`. The 6 Firebase env vars
must be uploaded as EAS secrets on the project once:

```
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value <value>
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value <value>
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value <value>
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value <value>
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value <value>
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value <value>
```

List existing secrets with `eas secret:list`; delete/replace with
`eas secret:delete` before re-creating if a value changes.

Verify a build can actually sign in before shipping:

```
eas build --profile preview --platform ios
```

Without these secrets, `lib/firebase.ts` throws on startup in a production
build (`Missing Firebase environment variables: ...`) — auth fails
immediately rather than silently, but only once someone launches the built
app.

### Future consideration: separate Firebase projects per environment

Right now dev and prod share one Firebase project, so test-account sign-ups
during development pollute prod auth/analytics. Splitting into separate
`wildlens-dev` / `wildlens-prod` Firebase projects (with their own env var
sets / EAS secrets) would isolate that, at the cost of maintaining two
Firebase configs. Not done yet — noted here for whoever picks it up.
