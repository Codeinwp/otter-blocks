<?php
/**
 * Class Test_Form_Records_Meta_Box
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Form_Records_Meta_Box;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Submissions;

/**
 * Form Records edit-screen rendering test case.
 *
 * The save handler, list table and file cleanup are covered in
 * test-form-submissions.php; this file covers the meta box markup.
 */
class Test_Form_Records_Meta_Box extends WP_UnitTestCase {

	/**
	 * The meta box instance.
	 *
	 * @var Form_Records_Meta_Box
	 */
	protected $meta_box;

	/**
	 * Set up the test.
	 */
	public function set_up() {
		parent::set_up();
		$this->meta_box = new Form_Records_Meta_Box();
	}

	/**
	 * Create a form record post with the given record meta.
	 *
	 * @param array $meta Record meta (stored under FORM_RECORD_META_KEY).
	 * @param array $extra_meta Additional post meta keyed by meta key.
	 * @return int The record post ID.
	 */
	private function create_record( $meta = array(), $extra_meta = array() ) {
		$record_id = self::factory()->post->create(
			array(
				'post_type'   => Form_Submissions::FORM_RECORD_TYPE,
				'post_status' => 'unread',
			)
		);

		if ( ! empty( $meta ) ) {
			update_post_meta( $record_id, Form_Submissions::FORM_RECORD_META_KEY, $meta );
		}

		foreach ( $extra_meta as $key => $value ) {
			update_post_meta( $record_id, $key, $value );
		}

		return $record_id;
	}

	/**
	 * Render a meta box callback and return its output.
	 *
	 * @param string $method The markup method to call.
	 * @param int    $record_id The record post ID.
	 * @return string
	 */
	private function render( $method, $record_id ) {
		ob_start();
		$this->meta_box->{$method}( get_post( $record_id ) );
		return ob_get_clean();
	}

	/**
	 * The Errors and AI Autoresponder boxes should register only when their meta exists.
	 */
	public function test_conditional_meta_box_registration() {
		global $wp_meta_boxes;

		$plain_id = $this->create_record();

		$wp_meta_boxes = array();
		$this->meta_box->add_form_record_meta_box( Form_Submissions::FORM_RECORD_TYPE, get_post( $plain_id ) );

		$boxes = $wp_meta_boxes[ Form_Submissions::FORM_RECORD_TYPE ];
		$this->assertArrayHasKey( 'field_values_meta_box', $boxes['advanced']['default'] );
		$this->assertArrayHasKey( 'submitpost', $boxes['side']['default'] );
		$this->assertArrayNotHasKey( 'form_record_errors_meta_box', $boxes['advanced']['default'] );
		$this->assertArrayNotHasKey( 'ai_autoresponder_meta_box', $boxes['advanced']['default'] );

		$full_id = $this->create_record(
			array(),
			array(
				Form_Submissions::ISSUES_META_KEY           => array( array( 'code' => 'x', 'message' => 'y' ) ),
				Form_Submissions::AI_AUTORESPONDER_META_KEY => array( 'outcome' => 'ai' ),
			)
		);

		$wp_meta_boxes = array();
		$this->meta_box->add_form_record_meta_box( Form_Submissions::FORM_RECORD_TYPE, get_post( $full_id ) );

		$boxes = $wp_meta_boxes[ Form_Submissions::FORM_RECORD_TYPE ];
		$this->assertArrayHasKey( 'form_record_errors_meta_box', $boxes['advanced']['default'] );
		$this->assertArrayHasKey( 'ai_autoresponder_meta_box', $boxes['advanced']['default'] );
	}

	/**
	 * Submitted values and labels must come out escaped in the fields box.
	 */
	public function test_fields_meta_box_escapes_labels_and_values() {
		$record_id = $this->create_record(
			array(
				'inputs' => array(
					'abcd1234' => array(
						'type'  => 'text',
						'label' => '<em>Name</em>',
						'value' => '"><script>alert(1)</script>',
					),
				),
			)
		);

		$output = $this->render( 'fields_meta_box_markup', $record_id );

		$this->assertStringContainsString( 'otter_meta_abcd1234', $output );
		$this->assertStringNotContainsString( '<script>', $output );
		$this->assertStringNotContainsString( '<em>', $output );
		$this->assertStringContainsString( '&lt;em&gt;Name&lt;/em&gt;', $output );
	}

	/**
	 * Stripe fields are internal and must not render; repeated field-option labels render once.
	 */
	public function test_fields_meta_box_skips_stripe_fields_and_dedupes_option_labels() {
		$record_id = $this->create_record(
			array(
				'inputs' => array(
					'stripe01' => array(
						'type'  => 'stripe-field',
						'label' => 'Stripe Session',
						'value' => 'cs_test_secret',
					),
					'choice01' => array(
						'type'     => 'text',
						'label'    => 'Favorite Color',
						'value'    => 'red',
						'metadata' => array( 'fieldOptionName' => 'opt-1' ),
					),
					'choice02' => array(
						'type'     => 'text',
						'label'    => 'Favorite Color',
						'value'    => 'blue',
						'metadata' => array( 'fieldOptionName' => 'opt-1' ),
					),
				),
			)
		);

		$output = $this->render( 'fields_meta_box_markup', $record_id );

		$this->assertStringNotContainsString( 'cs_test_secret', $output );
		$this->assertSame( 1, substr_count( $output, 'Favorite Color' ), 'Fields sharing a fieldOptionName should render their label once' );
		$this->assertStringContainsString( 'value="red"', $output );
		$this->assertStringContainsString( 'value="blue"', $output );
	}

	/**
	 * Textarea values must not be able to break out of the textarea element.
	 */
	public function test_render_field_escapes_textarea_breakout() {
		ob_start();
		$this->meta_box->render_field(
			array(
				'type'  => 'textarea',
				'value' => '</textarea><script>alert(1)</script>',
			),
			'abcd1234'
		);
		$output = ob_get_clean();

		$this->assertStringNotContainsString( '</textarea><script>', $output );
		$this->assertStringContainsString( '&lt;/textarea&gt;', $output );
	}

	/**
	 * File fields link to the media URL or a path relative to wp-content, and images render a preview.
	 */
	public function test_render_field_file_variants() {
		// Non-media upload with an absolute server path: link should be trimmed to /wp-content.
		ob_start();
		$this->meta_box->render_field(
			array(
				'type'      => 'file',
				'path'      => '/var/www/html/wp-content/uploads/otter-files/doc.pdf',
				'mime_type' => 'application/pdf',
				'metadata'  => array( 'name' => 'doc.pdf' ),
			),
			'file0001'
		);
		$output = ob_get_clean();

		$this->assertStringContainsString( 'href="/wp-content/uploads/otter-files/doc.pdf"', $output );
		$this->assertStringContainsString( 'doc.pdf', $output );
		$this->assertStringNotContainsString( '/var/www/html', $output );
		$this->assertStringNotContainsString( '<img', $output );

		// Image mime type: an inline preview is rendered instead of the file name.
		ob_start();
		$this->meta_box->render_field(
			array(
				'type'      => 'file',
				'path'      => 'http://example.org/wp-content/uploads/otter-files/pic.png',
				'mime_type' => 'image/png',
				'metadata'  => array( 'name' => 'pic.png' ),
			),
			'file0002'
		);
		$output = ob_get_clean();

		$this->assertStringContainsString( '<img', $output );
		$this->assertStringContainsString( 'http://example.org/wp-content/uploads/otter-files/pic.png', $output );

		// Missing path or name: nothing is rendered.
		ob_start();
		$this->meta_box->render_field( array( 'type' => 'file' ), 'file0003' );
		$this->assertSame( '', ob_get_clean() );
	}

	/**
	 * The Errors box escapes issue codes and messages and renders nothing without issues.
	 */
	public function test_errors_meta_box_escapes_issues() {
		$record_id = $this->create_record(
			array(),
			array(
				Form_Submissions::ISSUES_META_KEY => array(
					array(
						'code'    => 'provider_error',
						'message' => '<script>alert(1)</script> failed',
					),
				),
			)
		);

		$output = $this->render( 'errors_meta_box_markup', $record_id );

		$this->assertStringContainsString( 'provider_error', $output );
		$this->assertStringNotContainsString( '<script>', $output );
		$this->assertStringContainsString( '&lt;script&gt;alert(1)&lt;/script&gt; failed', $output );

		$plain_id = $this->create_record();
		$this->assertSame( '', $this->render( 'errors_meta_box_markup', $plain_id ), 'No output expected without recorded issues' );
	}

	/**
	 * The AI Autoresponder box maps outcomes to labels and sanitizes the generated body.
	 */
	public function test_ai_autoresponder_meta_box_sanitizes_generated_body() {
		$record_id = $this->create_record(
			array(),
			array(
				Form_Submissions::AI_AUTORESPONDER_META_KEY => array(
					'outcome'        => 'ai',
					'valid'          => true,
					'reason'         => 'Looks legitimate',
					'used_tokens'    => 123,
					'generated_body' => '<script>alert(1)</script><p>Hello there</p>',
				),
			)
		);

		$output = $this->render( 'ai_autoresponder_meta_box_markup', $record_id );

		$this->assertStringContainsString( 'AI reply sent', $output );
		$this->assertStringContainsString( 'Valid', $output );
		$this->assertStringContainsString( 'Looks legitimate', $output );
		$this->assertStringContainsString( '123', $output );
		$this->assertStringContainsString( 'Hello there', $output );
		$this->assertStringNotContainsString( '<script>', $output );

		$plain_id = $this->create_record();
		$this->assertSame( '', $this->render( 'ai_autoresponder_meta_box_markup', $plain_id ), 'No output expected without AI audit data' );
	}

	/**
	 * The Update box renders record metadata and the failed delivery details, and
	 * stays silent for records without meta.
	 */
	public function test_update_meta_box_renders_delivery_failure_details() {
		$record_id = $this->create_record(
			array(
				'form'     => array(
					'label' => 'Form',
					'value' => 'wp-block-themeisle-blocks-form-abcdef12',
				),
				'post_url' => array( 'value' => 'http://example.org/contact/' ),
			),
			array(
				Form_Submissions::DELIVERY_STATUS_META_KEY => Form_Submissions::DELIVERY_STATUS_FAILED,
				Form_Submissions::DELIVERY_ERRORS_META_KEY => array(
					array(
						'action'  => 'sendinblue',
						'message' => 'API key <script>rejected</script>',
					),
				),
			)
		);

		$output = $this->render( 'update_meta_box_markup', $record_id );

		$this->assertStringContainsString( 'abcdef12', $output, 'The short form ID should be rendered' );
		$this->assertStringContainsString( 'http://example.org/contact/', $output );
		$this->assertStringContainsString( 'Failed', $output );
		$this->assertStringContainsString( 'sendinblue', $output );
		$this->assertStringNotContainsString( '<script>rejected</script>', $output );
		$this->assertStringContainsString( 'Move to Trash', $output );

		$empty_id = $this->create_record();
		$this->assertSame( '', $this->render( 'update_meta_box_markup', $empty_id ), 'No output expected for a record without meta' );
	}
}
