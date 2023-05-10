# Live Search

Live Search plugin is an enhancement to default Search block. It unlock new style and the ability to preview search results.

## Structure

| Feature | Location |
| :-- | :-- |
| Editor Block Extension Upsell | `./src/blocks/plugins/live-search` |
| Editor Block Extension | `./src/pro/plugins/live-search` |
| Frontend | `./src/blocks/frontend/live-search` |
| Backend | `./plugins/otter-pro/inc/plugins/class-live-search` |


## How it works

The normal search will only show the results when you press the Submit button, and the result will be a page with a list of posts. Live Search will show the results as you type, and the result will be shown as a dropdown with list of posts, pages, products, and other custom post types.

Every time you type a new character, the search will be triggered with [this function](https://github.com/Codeinwp/otter-blocks/blob/4d9eafabaec64c02d0e522d78f08404e56a80396/src/blocks/frontend/live-search/index.ts#L59-L79). The request will be processed [here](https://github.com/Codeinwp/otter-blocks/blob/4d9eafabaec64c02d0e522d78f08404e56a80396/plugins/otter-pro/inc/server/class-live-search-server.php#L131-L171) by leveraging WordPress `WP_Query`.

In a nutshell, this is just fancy interface that makes the classic Search Block to feel more modern. The inspiration point was the [search bar for MDN Web Docs](https://developer.mozilla.org/en-US/) [#1135](https://github.com/Codeinwp/otter-blocks/issues/1135).

The main selling point of this plugin is showing useful information to the end user. This information is mostly from metadata, like: date, author, product price, category, etc. Users to run e-commerce websites will find this plugin very useful. 

When you are developing a new feature for it have those in mind:
- Monitor the request time, it should be as fast as possible.
- Watch the requests number. You don't want to overload the server.
- Pay attention to error handling when integrating with other plugins. 
