<?php
/**
 * Plugin Name: Otter E2E Atomic Wind Late Post
 * Description: Renders the post named by ?otter_e2e_late_post in the footer, like a hooked layout, so its cached Atomic Wind CSS loads late.
 */

add_filter(
	'query_vars',
	static function ( $vars ) {
		$vars[] = 'otter_e2e_late_post';
		return $vars;
	}
);

// Before Atomic Wind collects late CSS at priority 19.
add_action(
	'wp_footer',
	static function () {
		$post_id = absint( get_query_var( 'otter_e2e_late_post' ) );

		if ( ! $post_id ) {
			return;
		}

		$layout = new WP_Query(
			array(
				'p'                   => $post_id,
				'post_status'         => 'publish',
				'ignore_sticky_posts' => true,
			)
		);

		while ( $layout->have_posts() ) {
			$layout->the_post();
			the_content();
		}

		wp_reset_postdata();
	},
	10
);
