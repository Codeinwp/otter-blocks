<?php
/**
 * Class Test_Form_Submissions
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Submissions;
use ThemeIsle\GutenbergBlocks\Tests\StripeHttpClientMock;

/**
 * Tests for the Submission Records storage layer: save guards, capability checks on the
 * dashboard actions and the Stripe confirmation flow.
 */
class Test_Form_Submissions extends WP_UnitTestCase {

	/**
	 * @var Form_Submissions
	 */
	private $submissions;

	/**
	 * @var int
	 */
	private $admin_id;

	/**
	 * @var int
	 */
	private $editor_id;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();

		$this->submissions = Form_Submissions::instance();

		$this->admin_id  = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$this->editor_id = self::factory()->user->create( array( 'role' => 'editor' ) );

		// Grant the custom record capabilities the same way admin_init does.
		$this->submissions->set_form_records_cap();

		update_option( 'themeisle_stripe_api_key', 'sk_test_e2e' );
		\Stripe\ApiRequestor::setHttpClient( new StripeHttpClientMock() );
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		unset( $_REQUEST[ Form_Submissions::FORM_RECORD_TYPE ], $_REQUEST['_wpnonce'], $_REQUEST['post'] );
		unset( $GLOBALS['otter_test_stripe_record_id'] );
		unset( $GLOBALS['otter_legacy_store_called'] );

		delete_option( 'themeisle_stripe_api_key' );
		wp_clear_scheduled_hook( 'otter_form_automatic_confirmation' );

		$this->cleanup_upload_fixtures();

		parent::tear_down();
	}

	/**
	 * Remove upload fixtures created during tests.
	 *
	 * @return void
	 */
	private function cleanup_upload_fixtures() {
		$uploads = wp_upload_dir();
		$dir     = $uploads['basedir'] . '/otter-tests';

		if ( ! is_dir( $dir ) ) {
			return;
		}

		foreach ( glob( $dir . '/*' ) as $file ) {
			if ( is_file( $file ) ) {
				wp_delete_file( $file );
			}
		}

		@rmdir( $dir );
	}

	/**
	 * Build a minimal valid form data request.
	 *
	 * @return Form_Data_Request
	 */
	private function build_form_data() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/form/frontend' );
		$request->set_body(
			wp_json_encode(
				array(
					'handler' => 'submit',
					'payload' => array(
						'formId'         => 'guard-form',
						'postUrl'        => 'https://example.com/guard',
						'formOption'     => 'guard_form',
						'formInputsData' => array(
							array(
								'id'       => 'wp-block-themeisle-blocks-form-input-guard001',
								'type'     => 'text',
								'label'    => 'Name',
								'value'    => 'Ada Lovelace',
								'metadata' => array( 'position' => 0 ),
							),
						),
					),
				)
			)
		);

		$form_data = new Form_Data_Request( $request );
		$form_data->set_form_options( new Form_Settings_Data( array() ) );

		return $form_data;
	}

	/**
	 * Get all stored records.
	 *
	 * @return WP_Post[]
	 */
	private function get_records() {
		return get_posts(
			array(
				'post_type'   => Form_Submissions::FORM_RECORD_TYPE,
				'post_status' => array( 'draft', 'unread', 'read', 'trash' ),
				'numberposts' => -1,
				'orderby'     => 'ID',
				'order'       => 'ASC',
			)
		);
	}

	/**
	 * Create a stored record directly.
	 *
	 * @param string $status The post status.
	 * @return int The record ID.
	 */
	private function create_record( $status = 'unread', $meta = array() ) {
		$record_id = wp_insert_post(
			array(
				'post_type'   => Form_Submissions::FORM_RECORD_TYPE,
				'post_status' => $status,
				'post_title'  => 'Submission (test)',
			)
		);

		add_post_meta(
			$record_id,
			Form_Submissions::FORM_RECORD_META_KEY,
			array_merge(
				array(
					'form'     => array(
						'label' => 'Form',
						'value' => 'cap-form',
					),
					'post_url' => array(
						'label' => 'Post URL',
						'value' => 'https://example.com/cap',
					),
					'inputs'   => array(),
				),
				$meta
			)
		);

		return $record_id;
	}

	/**
	 * Create an upload fixture.
	 *
	 * @param string $name The file name.
	 * @return string The file path.
	 */
	private function create_upload_file( $name ) {
		$uploads = wp_upload_dir();
		wp_mkdir_p( $uploads['basedir'] . '/otter-tests' );

		$path = $uploads['basedir'] . '/otter-tests/' . $name;
		file_put_contents( $path, 'test file' );

		return $path;
	}

	/**
	 * Build record meta containing a single file field.
	 *
	 * @param string $path The file path.
	 * @param bool   $saved_in_media Whether the file was saved to the media library.
	 * @param string $key The input key.
	 * @return array
	 */
	private function get_file_record_meta( $path, $saved_in_media = false, $key = 'file-input' ) {
		return array(
			'inputs' => array(
				$key => array(
					'label'          => 'Upload',
					'value'          => basename( $path ),
					'type'           => 'file',
					'path'           => $path,
					'saved_in_media' => $saved_in_media,
					'metadata'       => array(
						'name' => basename( $path ),
						'size' => filesize( $path ),
					),
				),
			),
		);
	}

	/**
	 * Ensure the save handler never stores the same submission twice: re-fired hooks carry
	 * the Record ID and duplicates are skipped.
	 */
	public function test_store_form_record_guards_against_double_save() {
		$form_data = $this->build_form_data();

		$this->submissions->store_form_record( $form_data );

		$this->assertCount( 1, $this->get_records() );
		$this->assertTrue( $form_data->has_record_id() );

		// Re-firing the save hook with the same form data (e.g. payment confirmation) is a no-op.
		$this->submissions->store_form_record( $form_data );
		$this->assertCount( 1, $this->get_records() );

		// Submissions marked duplicate are never stored.
		$duplicate = $this->build_form_data();
		$duplicate->mark_as_duplicate();
		$this->submissions->store_form_record( $duplicate );
		$this->assertCount( 1, $this->get_records() );

		// Submissions with a hard error are never stored.
		$rejected = $this->build_form_data();
		$rejected->set_error( Form_Data_Response::ERROR_BOT_DETECTED );
		$this->submissions->store_form_record( $rejected );
		$this->assertCount( 1, $this->get_records() );
	}

	/**
	 * Ensure an older Pro storage object cannot reintroduce the legacy Email Only skip.
	 */
	public function test_legacy_pro_bridge_uses_lite_storage_without_legacy_save_location_gate() {
		$form_data = $this->build_form_data();

		$old_instance = \ThemeIsle\OtterPro\Plugins\Form_Emails_Storing::$instance;
		\ThemeIsle\OtterPro\Plugins\Form_Emails_Storing::$instance = new class() {
			public function store_form_record( $form_data ) {
				$GLOBALS['otter_legacy_store_called'] = true;
				return $form_data;
			}
		};

		try {
			$this->submissions->bridge_legacy_pro_store( $form_data );
		} finally {
			\ThemeIsle\OtterPro\Plugins\Form_Emails_Storing::$instance = $old_instance;
		}

		$this->assertTrue( $form_data->has_record_id() );
		$this->assertCount( 1, $this->get_records() );
		$this->assertArrayNotHasKey( 'otter_legacy_store_called', $GLOBALS );
	}

	/**
	 * Ensure deleting a Submission Record deletes its owned non-media upload.
	 */
	public function test_permanent_delete_removes_owned_non_media_upload_file() {
		$path      = $this->create_upload_file( 'owned-upload.txt' );
		$record_id = $this->create_record( 'unread', $this->get_file_record_meta( $path ) );

		$this->assertFileExists( $path );

		wp_delete_post( $record_id, true );

		$this->assertFileDoesNotExist( $path );
	}

	/**
	 * Ensure deleting a Submission Record keeps media-library and shared upload files.
	 */
	public function test_permanent_delete_keeps_media_library_and_shared_upload_files() {
		$media_path  = $this->create_upload_file( 'media-upload.txt' );
		$shared_path = $this->create_upload_file( 'shared-upload.txt' );

		$first_id = $this->create_record(
			'unread',
			array(
				'inputs' => array_merge(
					$this->get_file_record_meta( $media_path, true, 'media-file-input' )['inputs'],
					$this->get_file_record_meta( $shared_path, false, 'shared-file-input' )['inputs']
				),
			)
		);
		$this->create_record( 'unread', $this->get_file_record_meta( $shared_path, false, 'shared-file-input' ) );

		wp_delete_post( $first_id, true );

		$this->assertFileExists( $media_path );
		$this->assertFileExists( $shared_path );
	}

	/**
	 * Ensure the Delivery Status writer ignores autoresponder warnings.
	 */
	public function test_delivery_status_ignores_autoresponder_warnings() {
		$form_data = $this->build_form_data();
		$this->submissions->store_form_record( $form_data );

		$form_data->add_warning( Form_Data_Response::ERROR_AUTORESPONDER_COULD_NOT_SEND );
		$form_data->add_warning( Form_Data_Response::ERROR_AUTORESPONDER_MISSING_EMAIL_FIELD );

		$this->submissions->record_delivery_status( $form_data );

		$this->assertSame(
			Form_Submissions::DELIVERY_STATUS_COMPLETE,
			get_post_meta( $form_data->get_record_id(), Form_Submissions::DELIVERY_STATUS_META_KEY, true )
		);
		$this->assertEmpty( get_post_meta( $form_data->get_record_id(), Form_Submissions::DELIVERY_ERRORS_META_KEY, true ) );
	}

	/**
	 * Ensure bulk status changes skip records the user cannot edit.
	 */
	public function test_bulk_actions_respect_capabilities() {
		$first  = $this->create_record();
		$second = $this->create_record();

		// An editor without the record capabilities cannot change statuses.
		wp_set_current_user( $this->editor_id );
		$this->submissions->handle_form_record_bulk_actions( '', 'read', array( $first, $second ) );

		$this->assertSame( 'unread', get_post_status( $first ) );
		$this->assertSame( 'unread', get_post_status( $second ) );

		// An administrator can.
		wp_set_current_user( $this->admin_id );
		$this->submissions->handle_form_record_bulk_actions( '', 'read', array( $first, $second ) );

		$this->assertSame( 'read', get_post_status( $first ) );
		$this->assertSame( 'read', get_post_status( $second ) );
	}

	/**
	 * Ensure the row-action validation rejects users without the edit capability,
	 * even with a valid nonce.
	 */
	public function test_row_action_check_requires_capability() {
		$record_id = $this->create_record();

		wp_set_current_user( $this->editor_id );

		$_REQUEST[ Form_Submissions::FORM_RECORD_TYPE ] = (string) $record_id;
		$_REQUEST['_wpnonce']                           = wp_create_nonce( 'read-' . Form_Submissions::FORM_RECORD_TYPE . '_' . $record_id );

		$this->expectException( 'WPDieException' );
		$this->expectExceptionMessage( 'You are not allowed to manage this submission.' );

		$this->submissions->check_posts( 'read' );
	}

	/**
	 * Ensure the row-action validation passes for users with the edit capability.
	 */
	public function test_row_action_check_passes_for_admin() {
		$record_id = $this->create_record();

		wp_set_current_user( $this->admin_id );

		$_REQUEST[ Form_Submissions::FORM_RECORD_TYPE ] = (string) $record_id;
		$_REQUEST['_wpnonce']                           = wp_create_nonce( 'read-' . Form_Submissions::FORM_RECORD_TYPE . '_' . $record_id );

		$this->assertSame( (string) $record_id, $this->submissions->check_posts( 'read' ) );
	}

	/**
	 * Ensure viewing a record only flips it to read for users who can edit it.
	 */
	public function test_mark_read_on_edit_requires_capability() {
		$record_id        = $this->create_record();
		$_REQUEST['post'] = (string) $record_id;

		wp_set_current_user( $this->editor_id );
		$this->submissions->mark_read_on_edit();
		$this->assertSame( 'unread', get_post_status( $record_id ) );

		wp_set_current_user( $this->admin_id );
		$this->submissions->mark_read_on_edit();
		$this->assertSame( 'read', get_post_status( $record_id ) );
	}

	/**
	 * Ensure bulk export is refused without an active Pro license.
	 */
	public function test_export_requires_pro() {
		wp_set_current_user( $this->admin_id );

		$this->expectException( 'WPDieException' );
		$this->expectExceptionMessage( 'Exporting submissions requires Otter Pro.' );

		$this->submissions->export_submissions();
	}

	/**
	 * Ensure an unpaid Stripe session does not confirm the submission.
	 */
	public function test_confirm_submission_rejects_unpaid_session() {
		$request = new WP_REST_Request( 'GET', '/otter/v1/form/confirm' );
		$request->set_param( 'stripe_checkout', 'sess_unpaid' );

		$response = $this->submissions->confirm_submission( new Form_Data_Response(), $request );
		$data     = $response->build_response()->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_STRIPE_PAYMENT_UNPAID, $data['code'] );
	}

	/**
	 * Ensure a paid session without a Record reference is surfaced as an error.
	 */
	public function test_confirm_submission_rejects_session_without_record_reference() {
		$request = new WP_REST_Request( 'GET', '/otter/v1/form/confirm' );
		$request->set_param( 'stripe_checkout', 'sess_no_record' );

		$response = $this->submissions->confirm_submission( new Form_Data_Response(), $request );
		$data     = $response->build_response()->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_STRIPE_METADATA_RECORD_NOT_FOUND, $data['code'] );
	}

	/**
	 * Ensure a paid session flips the draft Record to unread, carries the redirect link,
	 * and confirming twice stays successful without breaking the Record.
	 */
	public function test_confirm_submission_flips_draft_and_is_idempotent() {
		$record_id = $this->create_record( 'draft' );

		$GLOBALS['otter_test_stripe_record_id'] = $record_id;

		$request = new WP_REST_Request( 'GET', '/otter/v1/form/confirm' );
		$request->set_param( 'stripe_checkout', 'sess_with_record' );

		$response = $this->submissions->confirm_submission( new Form_Data_Response(), $request );
		$data     = $response->build_response()->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( 'https://example.com/thanks', $data['redirectLink'] );
		$this->assertSame( 'unread', get_post_status( $record_id ) );

		// A repeated confirmation (e.g. page refresh on the success URL) is a success no-op.
		$second = $this->submissions->confirm_submission( new Form_Data_Response(), $request );
		$data   = $second->build_response()->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( 'unread', get_post_status( $record_id ) );
		$this->assertCount( 1, $this->get_records() );
	}

	/**
	 * Ensure the Stripe confirmation cron is scheduled only once a draft has a checkout session.
	 */
	public function test_update_submission_dump_data_schedules_confirmation_only_for_stripe_drafts() {
		$record_id = $this->create_record( 'draft' );
		$form_data = $this->build_form_data();
		$form_data->mark_as_temporary();

		$this->submissions->update_submission_dump_data( $form_data, $record_id );
		$this->assertFalse( wp_next_scheduled( 'otter_form_automatic_confirmation' ) );

		$form_data->metadata['otter_form_stripe_checkout_session_id'] = 'sess_123';
		$this->submissions->update_submission_dump_data( $form_data, $record_id );

		$this->assertNotFalse( wp_next_scheduled( 'otter_form_automatic_confirmation' ) );
	}

	/**
	 * Ensure the Pro list-table filter appends a meta_query clause for the selected form.
	 *
	 * Exercised through the `parse_query` hook so it stays valid regardless of which class
	 * owns the callback.
	 */
	public function test_pro_filter_query_adds_form_meta_clause() {
		if ( ! \ThemeIsle\GutenbergBlocks\Pro::is_pro_installed() ) {
			$this->markTestSkipped( 'Otter Pro is not installed in this test environment.' );
		}

		$license = function () {
			return 'valid';
		};
		add_filter( 'product_otter_license_status', $license );

		set_current_screen( 'edit-' . Form_Submissions::FORM_RECORD_TYPE );

		global $pagenow;
		$previous_pagenow = $pagenow;
		$pagenow          = 'edit.php';

		$_GET['post_type']                            = Form_Submissions::FORM_RECORD_TYPE;
		$_GET['filter_action']                        = 'Filter';
		$_GET['filters_nonce']                        = wp_create_nonce( 'filter' );
		$_GET['otter_form_filter']                    = 'guard-form';
		$_REQUEST['otter_form_filter']                = 'guard-form';

		$query        = new WP_Query();
		$query->query = array( 'post_type' => Form_Submissions::FORM_RECORD_TYPE );

		$result = apply_filters( 'parse_query', $query );

		$meta_query = isset( $result->query_vars['meta_query'] ) ? $result->query_vars['meta_query'] : array();

		$found = false;
		foreach ( $meta_query as $clause ) {
			if (
				is_array( $clause ) &&
				isset( $clause['key'], $clause['value'] ) &&
				Form_Submissions::FORM_RECORD_META_KEY === $clause['key'] &&
				'guard-form' === $clause['value']
			) {
				$found = true;
			}
		}

		remove_filter( 'product_otter_license_status', $license );
		$pagenow = $previous_pagenow;
		unset(
			$_GET['post_type'],
			$_GET['filter_action'],
			$_GET['filters_nonce'],
			$_GET['otter_form_filter'],
			$_REQUEST['otter_form_filter']
		);

		$this->assertTrue( $found, 'Pro form filter should append a meta_query clause matching the form value.' );
	}

	/**
	 * Ensure the record edit screen persists edited field values.
	 *
	 * Exercised through the `save_post` hook so it stays valid regardless of which class
	 * owns the callback.
	 */
	public function test_meta_box_save_persists_edited_field_value() {
		wp_set_current_user( $this->admin_id );

		$record_id = $this->create_record(
			'unread',
			array(
				'inputs' => array(
					'abcd1234' => array(
						'label'    => 'Name',
						'value'    => 'Old Value',
						'type'     => 'text',
						'metadata' => array(),
					),
				),
			)
		);

		$_POST['action']              = 'editpost';
		$_POST['_wpnonce']            = wp_create_nonce( 'update-post_' . $record_id );
		$_POST['otter_meta_abcd1234'] = 'New Value';

		do_action( 'save_post', $record_id, get_post( $record_id ) );

		$meta = get_post_meta( $record_id, Form_Submissions::FORM_RECORD_META_KEY, true );

		unset( $_POST['action'], $_POST['_wpnonce'], $_POST['otter_meta_abcd1234'] );

		$this->assertSame( 'New Value', $meta['inputs']['abcd1234']['value'] );
	}
}
