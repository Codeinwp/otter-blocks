<?php
/**
 * Plugin Name: Otter E2E Pattern Fixtures
 * Description: Registers Design Library test patterns containing wp:pattern references (issue #2854).
 */

// Late priority: mu-plugins load before Otter, and the library's "Featured"
// sort is registration order — registering late keeps the fixtures out of the
// grid's first cards, which other tests insert blindly.
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

		// One registered reference, one unresolvable reference — a single insert
		// exercises both paths of the Design Library's pattern expansion.
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
