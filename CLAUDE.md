# sileo-native

A toast library for React Native and Expo, ported from [sileo](https://github.com/hiaaryan/sileo).

- `packages/sileo-native`: the library, published to npm as `sileo-native`
- `apps/site`: the docs and playground at sileo.rayanstudio.dev, deployed by Vercel
- `apps/example`: the Expo example app

## Branches and releases

- Work on `staging`: commit and push there. Never commit to `main` directly.
- `main` only moves by merging `staging` into it. A merge to `main` deploys the site
  to production and runs `.github/workflows/release.yml`.
- The release workflow publishes only when the version in
  `packages/sileo-native/package.json` is not on npm yet, then creates a `vX.Y.Z`
  GitHub release. To ship the library, bump that version on `staging` first:
  patch for fixes, minor for features. A merge without a bump ships the site only.
- Never run `npm publish` locally. CI publishes through npm trusted publishing.

## Commits

The repo is public. Keep commit messages to one short line ("Fix bottom toasts on
the web"), and split work into focused commits.

## Before pushing

```sh
yarn test        # library unit tests
yarn build       # library build, including its type definitions
yarn site build  # docs export
```

## Gotchas

- The docs dev server (`yarn site start`) can keep serving old code after edits to
  `packages/sileo-native/src`. Restart it with `--clear`. Port 8081 is often taken
  by the example app; use `--port 8082`.
- `expo start` in `apps/site` rewrites `tsconfig.json` and `.gitignore` and adds
  `expo-env.d.ts`. Revert those changes before committing.
- On the web, Skia hands a `Canvas` style straight to a DOM element, so RN-only
  style values (transform arrays, the `pointerEvents` prop) do nothing there, and
  resizing a canvas rebuilds its GPU surface and stalls a frame.
