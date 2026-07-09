<?php
/**
 * Plugin Name: Otter E2E Pattern Fixtures
 * Description: Registers Design Library test patterns containing wp:pattern references (issue #2854).
 */

// Register after Otter's patterns: "Featured" sort is registration order and
// other tests insert the grid's first card blindly.
add_action(
	'init',
	function () {
		register_block_pattern(
			'otter-e2e/referenced-inner',
			array(
				'title'   => 'E2E Referenced Inner Pattern',
				'content' => '<!-- wp:paragraph --><p>E2E inner pattern content</p><!-- /wp:paragraph -->',
			)
		);

		// One registered and one unresolvable reference — one insert covers both paths.
		register_block_pattern(
			'otter-e2e/pattern-reference-fixture',
			array(
				'title'      => 'E2E Pattern Reference Fixture',
				'categories' => array( 'otter-blocks' ),
				'content'    => '<!-- wp:heading --><h2>E2E reference fixture heading</h2><!-- /wp:heading --><!-- wp:pattern {"slug":"otter-e2e/referenced-inner"} /--><!-- wp:pattern {"slug":"otter-e2e/slug-that-is-not-registered"} /-->',
			)
		);
	},
	100
);
