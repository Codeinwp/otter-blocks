## Setup

This projects requires you to have Node.js (with npm) and Composer.

- You can run `npm ci` & `composer install` to install dependencies.
- Once done, you can run `npm run build` to generate build files.
- You can also use `npm run start` to generate dev build if you are working on the files.

The project also ships with a `docker-compose.yml` file, you can run `docker compose up-d` to bring the instance up.

## Project Structure

This repo is codebase for five different plugins, which are:

- Otter Blocks
- Otter Pro
- Blocks Animation
- Blocks CSS
- Blocks Export Import

Blocks Animation, CSS & Export Import are also shipped as part of Otter Blocks. Codebase of each sister-plugin of Otter, which is plugin-specific, can be found in `/plugins` folder of the repo, while the code which is shared in both Otter & sister-plugins is kept inside `/inc` folder.

You can take a look at `/bin/dist.sh` file to see how each plugin is generated. Each sister-plugin has its own `.distignore` and `.wordpress-org` file/directory that needs to be maintained with latest changes.

And finally, `blocks.json` file defines the build path of block assets.

## Compatibility

Any change you make, you should test with at least last 2 major versions of WordPress.

## Releasing

This repository uses conventional [changelog commit](https://github.com/Codeinwp/conventional-changelog-simple-preset) messages to trigger release

How to release a new version:

- Clone the master branch
- Do your changes
- Send a PR to master and merge it using the following subject message
  - `release: <release short description>` - for patch release
  - `release(minor): <release short description>` - for minor release
  - `release(major): <release short description>` - for major release
    The release notes will inherit the body of the commit message which triggered the release. For more details check the [simple-preset](https://github.com/Codeinwp/conventional-changelog-simple-preset) that we use.
