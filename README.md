# sileo-native

An opinionated, physics-based toast library for React Native and Expo, ported from [sileo](https://github.com/hiaaryan/sileo). Built in the open by [rayanstudio](https://rayanstudio.dev).

**Docs and live playground: [sileo.rayanstudio.dev](https://sileo.rayanstudio.dev)**

```sh
npx expo install sileo-native @shopify/react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler react-native-svg react-native-safe-area-context
```

## Repository

| Path | What it is |
| --- | --- |
| [`packages/sileo-native`](packages/sileo-native) | The `sileo-native` npm package |
| [`apps/example`](apps/example) | The playground app, for Expo Go on iOS and Android |
| [`apps/site`](apps/site) | The docs and web playground at sileo.rayanstudio.dev, an Expo Router static site running the library's own renderer in the browser |

## Development

```sh
yarn                  # install every workspace
yarn test             # library tests
yarn typecheck        # the whole monorepo
yarn lint
yarn build            # build the package into packages/sileo-native/lib

yarn example start    # the example app in Expo Go
yarn site start       # the docs site at localhost:8081
yarn site build       # the static site into apps/site/dist
```

## License

MIT. Ported from [sileo](https://github.com/hiaaryan/sileo) by [hiaaryan](https://github.com/hiaaryan), MIT.
