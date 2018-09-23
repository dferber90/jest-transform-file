# jest-transform-file

A Jest transformer which enables importing images into Jest's `jsdom`.

**If you are not here for Visual Regression Testing, but just want to make your tests work with images, then you are likley looking for [the Jest docs on "Handling Static Assets"](https://jestjs.io/docs/en/webpack#handling-static-assets).**

> ⚠️ **This package is experimental.**
> It works with the tested project setups, but needs to be tested in more.
> If you struggle to set it up properly, it might be the fault of this package.
> Please file an issue and provide reproduction, or even open a PR to add support.
>
> The document is also sparse at the moment. Feel free to open an issue in case you have any questions!
>
> If this approach is working for you, please let me know on Twitter ([@dferber90](https://twitter.com/dferber90)) or by starring the [GitHub repo](https://github.com/dferber90/jest-transform-file).
>
> I am looking for contributors to help improve this package!

> ⚠️ **Only images supported for now.**
> This package only works with **Images** for now. It should be possbile to add other file types (like movies) if necessary though!

## Description

When you want to do Visual Regression Testing in Jest, it is important that the images used by components are available in the test setup. So far, images were not part of tests as they were mocked away using (if you were following [the Jest docs](https://jestjs.io/docs/en/webpack#handling-static-assets)):

```
"moduleNameMapper": {
  "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
}
```

This would result in the screenshots of components not containing their images. To work around this, `jest-transform-file` loads the images into the setup (using base64).

`jest-transform-file` is intended to be used in an `jsdom` environment. When any component imports images, they will be available in the test environment as their contents will be loaded instead of their file path. Similar to how `file-loader` would work in a production environment. This means the full images are available in `jsdom`.

This doesn't make much sense at first, as `jsdom` is headless (non-visual). However, we can copy the resulting document markup ("the HTML") of `jsdom` and copy it to a [`puppeteer`](https://github.com/googlechrome/puppeteer/) instance. We can let the markup render there and take a screenshot there. The [`jsdom-screenshot`](https://github.com/dferber90/jsdom-screenshot) package does exactly this.

Once we obtained a screenshot, we can compare it to the last version of that screenshot we took, and make tests fail in case they did. The [`jest-image-snapshot`](https://github.com/americanexpress/jest-image-snapshot) plugin does that.

## Installation

```bash
yarn add jest-transform-file --dev
```

## Setup

### Setup - adding `transform`

Open `jest.config.js` and modify the `transform`:

```
transform: {
  "^.+\\.js$": "babel-jest",
  "\\.(jpg|jpeg|png|gif|webp|svg)$": "jest-transform-file",
}
```

> Notice that `babel-jest` gets added as well.
>
> The `babel-jest` code preprocessor is enabled by default, when no other preprocessors are added. As `jest-transform-file` is a code preprocessor, `babel-jest` gets disabled when `jest-transform-file` is added.
>
> So it needs to be added again manually.
>
> See https://github.com/facebook/jest/tree/master/packages/babel-jest#setup

### Setup - removing images `moduleNameMapper`

We now need to stop mocking images in our test setup, so that the `transform` gets applied.
So remove the `moduleNameMapper` for images:

```diff
"moduleNameMapper": {
- "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
+ "\\.(eot|otf|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
}
```
