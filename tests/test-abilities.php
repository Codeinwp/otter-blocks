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
	 * @dataProvider uninitialized_forms
	 */
	public function test_listed_form_without_option_name_can_be_updated( bool $empty_option, bool $nested, bool $supply_post ): void {
		$block_id = 'wp-block-themeisle-blocks-form-abc12345';
		$attrs    = array( 'id' => $block_id );
		if ( $empty_option ) {
			$attrs['optionName'] = '';
		}
		$content = '<!-- wp:themeisle-blocks/form ' . wp_json_encode( $attrs ) . ' --><div id="' . $block_id . '" class="wp-block-themeisle-blocks-form"><form></form></div><!-- /wp:themeisle-blocks/form -->';
		if ( $nested ) {
			$content = '<!-- wp:group --><div class="wp-block-group">' . $content . '</div><!-- /wp:group -->';
		}
		wp_update_post( array( 'ID' => $this->post_id, 'post_content' => $content ) );
		delete_option( Abilities::FORM_OPTION );

		$list = wp_get_ability( 'otter/list-forms' )->execute( array( 'post_id' => $this->post_id ) );
		$this->assertIsArray( $list );
		$this->assertCount( 1, $list['forms'] );
		$form_id = $list['forms'][0]['form_id'];
		$this->assertSame( $block_id, $form_id );
		$this->assertSame( array(), get_option( Abilities::FORM_OPTION ) );
		$this->assertSame( $content, get_post( $this->post_id )->post_content );

		$input = array( 'form_id' => $form_id, 'delivery' => array( 'subject' => 'Contact request', 'email_notification' => false ) );
		if ( $supply_post ) {
			$input['post_id'] = $this->post_id;
		}
		$input['dry_run'] = true;
		$result           = wp_get_ability( 'otter/update-form' )->execute( $input );
		$this->assertIsArray( $result );
		$this->assertFalse( $result['updated'] );
		$this->assertSame( array(), get_option( Abilities::FORM_OPTION ) );

		$input['dry_run'] = false;
		$result           = wp_get_ability( 'otter/update-form' )->execute( $input );
		$this->assertIsArray( $result );
		$this->assertTrue( $result['updated'] );
		$this->assertSame( $form_id, $result['form_id'] );
		$again = wp_get_ability( 'otter/list-forms' )->execute( array( 'post_id' => $this->post_id ) );
		$this->assertSame( 'Contact request', $again['forms'][0]['delivery']['subject'] );
		$this->assertFalse( $again['forms'][0]['delivery']['email_notification'] );
		$this->assertStringContainsString( 'data-option-name="' . $form_id . '"', do_blocks( $content ) );
		$this->assertSame( $content, get_post( $this->post_id )->post_content );
		$this->assertFalse( wp_get_ability( 'otter/update-form' )->execute( $input )['updated'] );
		$this->assertCount( 1, get_option( Abilities::FORM_OPTION ) );
	}

	public function uninitialized_forms(): array {
		return array(
			'missing, direct, explicit post' => array( false, false, true ),
			'empty, nested, explicit post'   => array( true, true, true ),
			'missing, nested, discover post' => array( false, true, false ),
			'empty, direct, discover post'   => array( true, false, false ),
		);
	}

	public function test_form_with_invalid_attribute_json_renders_unchanged(): void {
		$markup  = '<div class="wp-block-themeisle-blocks-form"><form></form></div>';
		$content = '<!-- wp:themeisle-blocks/form {"id":} -->' . $markup . '<!-- /wp:themeisle-blocks/form -->';

		$this->assertNull( parse_blocks( $content )[0]['attrs'] );
		$this->assertSame( $markup, do_blocks( $content ) );
	}

	public function test_existing_form_option_name_keeps_precedence(): void {
		$list = wp_get_ability( 'otter/list-forms' )->execute( array( 'post_id' => $this->post_id ) );
		$this->assertSame( 'contact_form', $list['forms'][0]['form_id'] );
		$content = '<!-- wp:themeisle-blocks/form {"id":"form-block","optionName":"contact_form"} --><div class="wp-block-themeisle-blocks-form"></div><!-- /wp:themeisle-blocks/form -->';
		$output  = do_blocks( $content );
		$this->assertStringContainsString( 'data-option-name="contact_form"', $output );
		$this->assertStringNotContainsString( 'data-option-name="form-block"', $output );
	}

	public function test_form_update_requires_permission_to_edit_containing_post(): void {
		$block_id = 'wp-block-themeisle-blocks-form-auth1234';
		wp_update_post(
			array(
				'ID'           => $this->post_id,
				'post_content' => '<!-- wp:themeisle-blocks/form {"id":"' . $block_id . '"} /-->',
			)
		);
		$list = wp_get_ability( 'otter/list-forms' )->execute( array( 'post_id' => $this->post_id ) );
		$this->assertSame( $block_id, $list['forms'][0]['form_id'] );
		$settings = get_option( Abilities::FORM_OPTION );

		$user = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		get_user_by( 'id', $user )->add_cap( 'manage_options' );
		wp_set_current_user( $user );
		foreach ( array( 0, $this->post_id ) as $post_id ) {
			$input = array( 'form_id' => $block_id, 'delivery' => array( 'subject' => 'Denied' ) );
			if ( $post_id ) {
				$input['post_id'] = $post_id;
			}
			$result = wp_get_ability( 'otter/update-form' )->execute( $input );
			$this->assertWPError( $result );
			$this->assertSame( 'otter_forbidden', $result->get_error_code() );
			$this->assertSame( $settings, get_option( Abilities::FORM_OPTION ) );
		}
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
