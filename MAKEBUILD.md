## Creating a build

### Step 1: Adding otter blocks

Gutenberg Blocks, Animation, etc do not come by default in the repository. They are more like a dependency handled by `composer`.

**To install them run this command in the terminal: `composer install`**.You will see how the composer will pull the other repository.

### Step 2: Zip'n'Load

At this point, you have all the repository of the blocks set to `main/master` branch. If that is enough, you could just `zip` the `otter-blocks` folder and load it to WordPress. 

**Remember to exclude folders from the `zip` file like `node_modules` or `.git`**.They do not affect the plugin, but they occupy a lot of space in the zip file.

### Step 3: Testing branches on the block repository

If you want to test a new block of the Gutenberg Block from someone fork ([Hardeep](https://github.com/HardeepAsrani/gutenberg-blocks), [Robert](https://github.com/Soare-Robert-Daniel/gutenberg-blocks)), you need to go in `/packages/codeinwp/` and delete the folder that you want and replace with the desired repo.

E.g:

```bash
pwd # check if I am in the root folder
#=> Output: /var/www/html/wp-content/plugins/otter-blocks
cd /packages/codeinwp/ # go to block repos
rm -rf gutenberg-blocks # delete gutenberg block
git clone https://github.com/Soare-Robert-Daniel/gutenberg-blocks # Get Robert repos
cd gutenberg-blocks # go to the folder
git checkout contact-form-v1 # change from the `main` branch to the branch that has the Form Block
```

#### Testing the development branch

If you want to test the next release of the Gutenberg Block, you do not need to clone someone fork since all the block are pushed to the main repo. You just need to change the branch from `main` to `development` in the `gutenberg-blocks` folder. (This is also available for the rest of the repos like Animation, they fallow the same convention)

E.g:

```bash
pwd # check if I am in the root folder
#=> Output: /var/www/html/wp-content/plugins/otter-blocks
cd /packages/codeinwp/gutenberg-blocks # go to block repo
git checkout development # change from the `main` branch to the dev branch 
```

### Zip file

To create a zip file you can use your os solution for this ([Mac](https://support.apple.com/guide/mac-help/zip-and-unzip-files-and-folders-on-mac-mchlp2528/mac), [Windows](https://support.microsoft.com/en-us/windows/zip-and-unzip-files-8d28fa72-f2f9-712f-67df-f80cf89fd4e5)) or `zip` command for [Linux](https://www.geeksforgeeks.org/zip-command-in-linux-with-examples/)

E.g. for `zip`
```bash
zip -r otter-build.zip . -x "**/node_modules/**" -x "**/.git/**" -x "**/composer/**" -x "**/squizlabs/**" -x "node_modules/*" -x ".git/*" -x "**/wp-coding-standards/**"
```