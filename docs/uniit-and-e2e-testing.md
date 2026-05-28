# Automated Testing

#### [Testing overview from Gutenberg.](https://developer.wordpress.org/block-editor/contributors/code/testing-overview/)

## Unit Testing

Unit testing will be used to test functions (with [Jest](https://jestjs.io/docs/getting-started)) and React components (with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)).

Unit tests are located in `src/blocks/test/unit`.

They can be run with the command `npm run test:unit`.

For debugging tests, use `npm run test:unit:debug`.

## E2E Testing

E2E tests are used to test code on a running WordPress instance. They are very helpful for testing components that depend on the WP ecosystem like blocks and hooks (e.g. `blockInit`).

[Docs for Gutenberg utils](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-e2e-test-utils/)

The suite uses Playwright.
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Gutenberg E2E tests](https://github.com/WordPress/gutenberg/tree/trunk/test/e2e)

You can start the local WordPress environment with `npm run wp-env start`.

Run the full E2E suite with `npm run test:e2e:playwright`.

Run serial-only specs with `npm run test:e2e:playwright:serial`.

Run parallel-safe specs with `npm run test:e2e:playwright:parallel`.

For interactive mode (Playwright UI), use `npm run test:e2e:playwright-ui`.

:warning: The e2e is a very slow test. Expect minutes of running.



