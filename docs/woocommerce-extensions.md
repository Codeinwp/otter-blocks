# WooCommerce Extensions

In WordPress, WooCommerce is the most popular plugin for e-commerce. In a simple view of a plugin developer: people with business that have a high chance to pay for a premium plugin. The market is so big that we can't ignore it. Otter can not a respectable plugin, without WooCommerce integration.

The available WooCommerce extensions are:
- Add to cart Block
- Woo Comparison Block
- Product Review with Woo Sync
- Live Search (show product information in search results)
- Small Showcase Blocks (title, price, rating, stock, etc.)

Woo Commerce own plugin offer a lot of features for Gutenberg, and is mostly redundant to re-invent the wheel for most of them. So winning strategy is to allow Otter users to integrate WooCommerce with Otter Blocks. You use Product Review at the beginning then migrate to WooCommerce, no need to redo things, you can just sync it. The feeling is more like a 'handy feature` than a full blow WooCommerce extension plugin.

## Structure

| Feature | Location |
| :-- | :-- |
| Frontend Render Add to Cart | `./plugins/otter-pro/inc/render/class-add-to-cart-button-block.php` |
| Frontend Render Woo Comparison | `./plugins/otter-pro/inc/render/class-woo-comparison-block.php` |
| Frontend Render Small Blocks | `./plugins/otter-pro/inc/render/woocommerce` |
| Editor Add to Cart | `./src/pro/blocks/add-to-cart-button` |
| Editor Woo Comparison | `./src/pro/blocks/woo-comparison` |
| Editor Small Blocks | `./src/pro/woocommerce` |

For Live Search, learn more [here](live-search.md).

## Mentions

- All of those feature require WooCommerce to be installed and activated. If WooCommerce is not installed, the block will be disabled. The features are built on top of WooCommerce API, so it is not possible to use them without WooCommerce.
- When developing a new feature, you should always check if WooCommerce is installed and activated. If not, you should disable the feature.
- Have stability always in mind. An e-commerce website is extremely important for the owner. Crashing the website is like hiding the owner's wallet.  