<?php
/**
 * Class Test_AI_Usage
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Server\AI_Usage;

/**
 * Tests for the AI usage tracker: per-action counters, the distinct-action cap and
 * the last-N prompt trimming that keep the autoloaded option bounded.
 */
class Test_AI_Usage extends WP_UnitTestCase {

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		delete_option( AI_Usage::OPTION_NAME );

		parent::tear_down();
	}

	/**
	 * Read the stored usage count for an action.
	 *
	 * @param string $action The action key.
	 * @return int|null
	 */
	private function get_usage_count( $action ) {
		$usage = get_option( AI_Usage::OPTION_NAME );

		foreach ( isset( $usage['usage_count'] ) ? $usage['usage_count'] : array() as $entry ) {
			if ( $entry['key'] === $action ) {
				return $entry['value'];
			}
		}

		return null;
	}

	/**
	 * Read the stored prompts for an action.
	 *
	 * @param string $action The action key.
	 * @return string[]
	 */
	private function get_prompts( $action ) {
		$usage = get_option( AI_Usage::OPTION_NAME );

		foreach ( isset( $usage['prompts'] ) ? $usage['prompts'] : array() as $entry ) {
			if ( $entry['key'] === $action ) {
				return $entry['values'];
			}
		}

		return array();
	}

	/**
	 * Ensure recording creates a new entry and increments an existing one.
	 */
	public function test_record_creates_and_increments_action_count() {
		AI_Usage::record( 'formAutoresponder::generate', 'first prompt' );

		$this->assertSame( 1, $this->get_usage_count( 'formAutoresponder::generate' ) );
		$this->assertSame( array( 'first prompt' ), $this->get_prompts( 'formAutoresponder::generate' ) );

		AI_Usage::record( 'formAutoresponder::generate', 'second prompt' );

		$this->assertSame( 2, $this->get_usage_count( 'formAutoresponder::generate' ) );
		$this->assertSame( array( 'first prompt', 'second prompt' ), $this->get_prompts( 'formAutoresponder::generate' ) );
	}

	/**
	 * Ensure a new action is dropped once 50 distinct actions exist, while existing
	 * actions keep incrementing (the option is autoloaded and must stay bounded).
	 */
	public function test_record_caps_distinct_actions_at_fifty() {
		for ( $i = 1; $i <= 50; $i++ ) {
			AI_Usage::record( 'action-' . $i, 'prompt' );
		}

		AI_Usage::record( 'action-51', 'prompt' );

		$this->assertNull( $this->get_usage_count( 'action-51' ) );
		$this->assertEmpty( $this->get_prompts( 'action-51' ) );

		AI_Usage::record( 'action-1', 'prompt' );

		$this->assertSame( 2, $this->get_usage_count( 'action-1' ) );
	}

	/**
	 * Ensure only the last 10 prompts per action are kept (FIFO).
	 */
	public function test_record_keeps_only_last_ten_prompts() {
		for ( $i = 1; $i <= 12; $i++ ) {
			AI_Usage::record( 'textTransformation', 'prompt ' . $i );
		}

		$prompts = $this->get_prompts( 'textTransformation' );

		$this->assertCount( 10, $prompts );
		$this->assertSame( 'prompt 3', $prompts[0] );
		$this->assertSame( 'prompt 12', $prompts[9] );
		$this->assertSame( 12, $this->get_usage_count( 'textTransformation' ) );
	}

	/**
	 * Ensure an action that sanitizes to an empty string is a no-op.
	 */
	public function test_record_ignores_empty_action() {
		AI_Usage::record( '', 'prompt' );
		AI_Usage::record( "\n\t ", 'prompt' );

		// The option is registered with a default, so check no entries were recorded.
		$usage = get_option( AI_Usage::OPTION_NAME );
		$this->assertEmpty( isset( $usage['usage_count'] ) ? $usage['usage_count'] : array() );
		$this->assertEmpty( isset( $usage['prompts'] ) ? $usage['prompts'] : array() );
	}

	/**
	 * Ensure legacy stored data with a non-numeric count is coerced instead of fataling.
	 */
	public function test_record_coerces_legacy_non_numeric_count() {
		update_option(
			AI_Usage::OPTION_NAME,
			array(
				'usage_count' => array(
					array(
						'key'   => 'legacy',
						'value' => 'not-a-number',
					),
				),
				'prompts'     => array(),
			)
		);

		AI_Usage::record( 'legacy', 'prompt' );

		$this->assertSame( 1, $this->get_usage_count( 'legacy' ) );
	}
}
