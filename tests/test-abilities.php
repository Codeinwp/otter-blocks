<?php
/**
 * Class Abilities
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Abilities;

/**
 * Abilities Test Case.
 */
class Test_Abilities extends WP_UnitTestCase {

	/**
	 * Post containing the form under test.
	 *
	 * @var int
	 */
	private $post_id;

	/**
	 * Set up an administrator and a post with a Form block.
	 */
	public function set_up(): void {
		parent::set_up();

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$this->post_id = self::factory()->post->create(
			array( 'post_content' => '<!-- wp:themeisle-blocks/form {"id":"wp-block-themeisle-blocks-form-abc123","optionName":"contact_form"} /-->' )
		);
	}

	/**
	 * Reset the current user.
	 */
	public function tear_down(): void {
		wp_set_current_user( 0 );

		parent::tear_down();
	}

	/**
	 * A comma-separated recipient list is accepted for `email_to`.
	 */
	public function test_update_form_accepts_comma_separated_email_to(): void {
		$result = $this->update_email_to( 'first@example.org, second@example.org' );

		$this->assertIsArray( $result );
		$this->assertSame( 'first@example.org, second@example.org', $result['delivery']['email_to'] );
	}

	/**
	 * A recipient list containing an invalid address is rejected.
	 */
	public function test_update_form_rejects_email_to_list_with_invalid_address(): void {
		$result = $this->update_email_to( 'first@example.org, not-an-email' );

		$this->assertWPError( $result );
		$this->assertSame( 'otter_invalid_email', $result->get_error_code() );
	}

	/**
	 * Run a dry-run `otter/update-form` that sets the form recipient.
	 *
	 * @param string $email_to The recipient value.
	 * @return array<string, mixed>|WP_Error
	 */
	private function update_email_to( string $email_to ) {
		return Abilities::instance()->update_form(
			array(
				'form_id'  => 'contact_form',
				'post_id'  => $this->post_id,
				'dry_run'  => true,
				'delivery' => array( 'email_to' => $email_to ),
			)
		);
	}
}
