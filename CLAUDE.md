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
- Only the owner, `bbrainttech`, merges into `main`; GitHub rules and the
  release workflow enforce it. Never merge or push to `main`: push to `staging`
  and tell the owner it is ready.
- Never run `npm publish` locally. CI publishes through npm trusted publishing,
  from the `npm` environment only.

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
4. In `packages/sileo-native`, run
   `npm version <patch|minor|major> --no-git-tag-version --workspaces-update=false`
   (the release workflow creates the tag; without the last flag npm fails on
   yarn's `workspace:` versions after bumping). Commit it on its own as
   `chore(release): X.Y.Z`, and say in your summary that the next merge to
   `main` publishes it.

No bump for changes that don't ship: the docs site, the example app, tests, CI,
and repo docs.

## Commits

The repo is public. Split work into focused commits, each a one-line
[Conventional Commit](https://www.conventionalcommits.org) that passes
commitlint's conventional config: `type: subject`, with a lowercase subject and
no period ("fix: keep bottom toasts on screen on the web").

- `feat`, `fix`, `perf`, `refactor`: the library, `packages/sileo-native`. Add
  `!` for a breaking change (`feat!: rename onPress to onAction`).
- `docs`: the docs site (`apps/site`) and repo docs (README, CONTRIBUTING,
  CLAUDE.md).
- `test`: tests. `ci`: `.github`. `build`: build config and dependencies.
- `chore`: the rest, such as the example app (`chore(example): ...`) and
  version bumps (`chore(release): 0.1.1`).

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
