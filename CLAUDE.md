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
  GitHub release. A merge without a version bump ships the site only.
- Never run `npm publish` locally. CI publishes through npm trusted publishing.

## Versioning

Bump the version yourself; don't wait to be asked. Whenever a task changes what
the package ships (`packages/sileo-native/src`, or its `package.json` exports,
peer dependencies or files), finish the task by bumping
`packages/sileo-native/package.json` on `staging`:

1. Compare with what is released: `npm view sileo-native version`.
2. Pick the bump the work since that release needs. While the version is `0.x`:
   - **minor** (`0.1.3` → `0.2.0`) for a breaking change: a removed or renamed
     export, prop or option, a changed default, or a raised peer dependency
     minimum.
   - **patch** (`0.1.3` → `0.1.4`) for everything else that ships: fixes,
     performance, new features, props and exports.

   From `1.0.0` on, use plain semver: major for breaking, minor for features,
   patch for fixes.

3. Bump once per release. If `staging` is already ahead of npm, raise it only
   when the new work needs a bigger bump than the one already made, measured
   from the released version.
4. Run `npm version <patch|minor|major> --no-git-tag-version` in
   `packages/sileo-native` (the release workflow creates the tag), commit it on
   its own as `Bump version to X.Y.Z`, and say in your summary that the next
   merge to `main` publishes it.

No bump for changes that don't ship: the docs site, the example app, tests, CI,
and repo docs.

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
