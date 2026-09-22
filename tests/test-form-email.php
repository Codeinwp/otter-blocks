<?php
/**
 * Class Test_Form_Email
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Email;

/**
 * Form email tests.
 */
class Test_Form_Email extends WP_UnitTestCase {
	/**
	 * Build a request the same way the frontend route does, so the fields pass through intake sanitization.
	 *
	 * @param array $fields The form input data.
	 * @return Form_Data_Request
	 */
	private function make_form_data( $fields ) {
		$request = new WP_REST_Request( 'POST', '/otter/v1/form/frontend' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'handler' => 'submit',
					'payload' => array(
						'formId'         => 'test-form',
						'formOption'     => 'wp_block_test',
						'formInputsData' => $fields,
					),
				)
			)
		);

		return new Form_Data_Request( $request );
	}

	/**
	 * Submitted labels and values must be escaped before they reach the HTML mail body.
	 */
	public function test_build_body_escapes_submitted_label_and_value() {
		$form_data = $this->make_form_data(
			array(
				array(
					'id'       => 'field-0001',
					'label'    => 'Company & "Co"',
					'value'    => 'Bread & butter — 5 " long',
					'type'     => 'text',
					'metadata' => array( 'position' => 0 ),
				),
			)
		);

		$body = Form_Email::instance()->build_body( $form_data );

		$fields = $form_data->get_fields();
		$label  = $fields[0]['label'];
		$value  = $fields[0]['value'];

		$this->assertStringContainsString( esc_html( $label ), $body );
		$this->assertStringContainsString( esc_html( $value ), $body );
		$this->assertStringNotContainsString( $label, $body );
		$this->assertStringNotContainsString( $value, $body );
	}

	/**
	 * A value the visitor typed as entity text must reach the admin verbatim, not decoded by the mail client (otter-internals#313).
	 */
	public function test_build_body_double_encodes_entity_text() {
		$typed = '&lt;strong&gt;URGENT&lt;/strong&gt;';

		$form_data = $this->make_form_data(
			array(
				array(
					'id'       => 'field-0001',
					'label'    => 'Message',
					'value'    => $typed,
					'type'     => 'text',
					'metadata' => array( 'position' => 0 ),
				),
			)
		);

		$body = Form_Email::instance()->build_body( $form_data );

		// The mail body must carry the ampersands encoded, so an HTML mail client renders the typed characters back.
		$this->assertStringContainsString( '&amp;lt;strong&amp;gt;URGENT&amp;lt;/strong&amp;gt;', $body );
		$this->assertStringNotContainsString( '> ' . $typed . '<', $body );

		// What the reader ends up seeing is what was typed.
		preg_match( '#<tr><td><strong>Message:</strong> (.*?)</td></tr>#', $body, $matches );
		$this->assertSame( $typed, html_entity_decode( $matches[1], ENT_QUOTES ) );
	}

	/**
	 * Values sharing a position are joined first and escaped once, so the separator stays literal.
	 */
	public function test_build_body_escapes_joined_multi_value_field() {
		$form_data = $this->make_form_data(
			array(
				array(
					'id'       => 'field-0001',
					'label'    => 'Toppings',
					'value'    => 'Salt & pepper',
					'type'     => 'checkbox',
					'metadata' => array( 'position' => 0 ),
				),
				array(
					'id'       => 'field-0001',
					'label'    => 'Toppings',
					'value'    => 'Oil & vinegar',
					'type'     => 'checkbox',
					'metadata' => array( 'position' => 0 ),
				),
			)
		);

		$body = Form_Email::instance()->build_body( $form_data );

		$this->assertStringContainsString( 'Salt &amp; pepper, Oil &amp; vinegar', $body );
		$this->assertStringNotContainsString( 'Salt & pepper', $body );
	}
}
