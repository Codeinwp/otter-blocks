# Automated Testing

#### [Testing overview from Gutenberg.](https://developer.wordpress.org/block-editor/contributors/code/testing-overview/)

## Unit Testing

Unit testing will be used to test functions (with [Jest](https://jestjs.io/docs/getting-started)) and React components (with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)).

The test will pe places in `tests/unit`

They can be run with the command `npm run test:unit`.

For debugging the test, use `npm run test:unit:debug`

## E2E Testing

E2E are used to test the code on a running WordPress instance. They are very helpful for testing component that depends on the WP ecosystem like block, hooks (e.g.: `blockInit`).

[Docs for Gutenberg utils](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-e2e-test-utils/)

:warning: Most the code from Gutenberg is written in Puppeter, but they are migrating to Playwright which make the feature to not a very stable situation like Unit testing. [Source](https://make.wordpress.org/core/2022/03/23/migrating-wordpress-e2e-tests-to-playwright/)

- [Puppeter Docs](https://pptr.dev) 
- [Playwright Docs](https://playwright.dev/docs/intro) and [Gutenberg Repo](https://github.com/WordPress/gutenberg/tree/trunk/test/e2e)

You will need to use Docker for creating the WP Instace via `npm run wp-env start` command.

The tests can be run with the command `npm run test:e2e'.

For interactive mode (a Chromium instance will be created to watch), use `npm run test:e2e:interactive'

For debugging the test, use `npm run test:e2e:debug`

:warning: The e2e is a very slow test. Expect minutes of running.



