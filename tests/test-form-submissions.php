<?php
/**
 * Class Test_Form_Submissions
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Records_Export;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Records_Filters;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Records_Post_Type;
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
		( new Form_Records_Post_Type() )->set_form_records_cap();

		update_option( 'themeisle_stripe_api_key', 'sk_test_e2e' );
		\Stripe\ApiRequestor::setHttpClient( new StripeHttpClientMock() );
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		unset( $_REQUEST[ Form_Submissions::FORM_RECORD_TYPE ], $_REQUEST['_wpnonce'], $_REQUEST['post'] );
		unset( $_POST['action'], $_POST['_wpnonce'], $_POST['_nonce'] );
		unset( $_GET['post_type'], $_GET['filter_action'], $_GET['filters_nonce'], $_GET['otter_form_filter'], $_REQUEST['otter_form_filter'] );
		unset( $_GET['otter_post_filter'], $_REQUEST['otter_post_filter'] );
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

		( new Form_Records_Export() )->export_submissions();
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

	/**
	 * Ensure the list-table delivery column reflects a failed delivery.
	 *
	 * Exercised through the `manage_{type}_posts_custom_column` hook so it stays valid
	 * regardless of which class owns the callback.
	 */
	public function test_delivery_column_renders_failed_status() {
		$record_id = $this->create_record( 'unread' );
		update_post_meta( $record_id, Form_Submissions::DELIVERY_STATUS_META_KEY, Form_Submissions::DELIVERY_STATUS_FAILED );
		update_post_meta(
			$record_id,
			Form_Submissions::DELIVERY_ERRORS_META_KEY,
			array(
				array(
					'action'  => 'email',
					'message' => 'SMTP failed',
				),
			)
		);

		ob_start();
		do_action( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', 'delivery', $record_id );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'Failed', $output );
	}

	/**
	 * Ensure record deletion never deletes files outside the uploads directory,
	 * even when the stored path uses traversal to point there.
	 */
	public function test_permanent_delete_never_touches_files_outside_uploads() {
		$uploads      = wp_upload_dir();
		$outside_path = dirname( $uploads['basedir'] ) . '/otter-outside-uploads.txt';
		file_put_contents( $outside_path, 'must survive' );

		wp_mkdir_p( $uploads['basedir'] . '/otter-tests' );
		$traversal = $uploads['basedir'] . '/otter-tests/../../' . basename( $outside_path );
		$record_id = $this->create_record( 'unread', $this->get_file_record_meta( $traversal ) );

		try {
			wp_delete_post( $record_id, true );
			$this->assertFileExists( $outside_path );
		} finally {
			@unlink( $outside_path );
		}
	}

	/**
	 * Ensure the record edit-screen save handler dies on an invalid nonce.
	 */
	public function test_meta_box_save_rejects_invalid_nonce() {
		wp_set_current_user( $this->admin_id );
		$record_id = $this->create_record();

		$_POST['action']   = 'editpost';
		$_POST['_wpnonce'] = 'invalid-nonce';

		$this->expectException( 'WPDieException' );
		$this->expectExceptionMessage( 'Nonce not verified.' );

		do_action( 'save_post', $record_id, get_post( $record_id ) );
	}

	/**
	 * Ensure a valid nonce is not enough: the user must be able to edit the record.
	 */
	public function test_meta_box_save_requires_edit_capability() {
		wp_set_current_user( $this->editor_id );
		$record_id = $this->create_record();

		$_POST['action']   = 'editpost';
		$_POST['_wpnonce'] = wp_create_nonce( 'update-post_' . $record_id );

		$this->expectException( 'WPDieException' );
		$this->expectExceptionMessage( 'User cannot edit this post.' );

		do_action( 'save_post', $record_id, get_post( $record_id ) );
	}

	/**
	 * Ensure backslashes in an edited field value survive the save round-trip
	 * (the handler wp_slash()es the meta because update_post_meta unslashes it).
	 */
	public function test_meta_box_save_preserves_backslashes() {
		wp_set_current_user( $this->admin_id );

		$record_id = $this->create_record(
			'unread',
			array(
				'inputs' => array(
					'slash123' => array(
						'label'    => 'Path',
						'value'    => 'old',
						'type'     => 'text',
						'metadata' => array(),
					),
				),
			)
		);

		$value = 'C:\Users\test\file.txt';

		$_POST['action']              = 'editpost';
		$_POST['_wpnonce']            = wp_create_nonce( 'update-post_' . $record_id );
		$_POST['otter_meta_slash123'] = wp_slash( $value );

		do_action( 'save_post', $record_id, get_post( $record_id ) );

		$meta = get_post_meta( $record_id, Form_Submissions::FORM_RECORD_META_KEY, true );

		unset( $_POST['otter_meta_slash123'] );

		$this->assertSame( $value, $meta['inputs']['slash123']['value'] );
	}

	/**
	 * Ensure the list-table filter leaves the query untouched when Pro is not active,
	 * even with otherwise valid filter parameters.
	 */
	public function test_filter_query_untouched_without_pro() {
		$this->assertFalse( \ThemeIsle\GutenbergBlocks\Pro::is_pro_active() );

		set_current_screen( 'edit-' . Form_Submissions::FORM_RECORD_TYPE );

		global $pagenow;
		$previous_pagenow = $pagenow;
		$pagenow          = 'edit.php';

		$_GET['post_type']             = Form_Submissions::FORM_RECORD_TYPE;
		$_GET['filter_action']         = 'Filter';
		$_GET['filters_nonce']         = wp_create_nonce( 'filter' );
		$_GET['otter_form_filter']     = 'guard-form';
		$_REQUEST['otter_form_filter'] = 'guard-form';

		$query        = new WP_Query();
		$query->query = array( 'post_type' => Form_Submissions::FORM_RECORD_TYPE );

		// Called directly: `parse_query` is fired as an action by core, so other
		// void-returning callbacks would break an apply_filters() chain.
		$result = ( new Form_Records_Filters() )->form_record_filter_query( $query );

		$pagenow = $previous_pagenow;

		$this->assertArrayNotHasKey( 'meta_query', $result->query_vars );
	}

	/**
	 * Ensure the list-table filter leaves the query untouched when the nonce is invalid,
	 * even with Pro active.
	 */
	public function test_filter_query_untouched_with_invalid_nonce() {
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

		$_GET['post_type']             = Form_Submissions::FORM_RECORD_TYPE;
		$_GET['filter_action']         = 'Filter';
		$_GET['filters_nonce']         = 'invalid-nonce';
		$_GET['otter_form_filter']     = 'guard-form';
		$_REQUEST['otter_form_filter'] = 'guard-form';

		$query        = new WP_Query();
		$query->query = array( 'post_type' => Form_Submissions::FORM_RECORD_TYPE );

		$result = ( new Form_Records_Filters() )->form_record_filter_query( $query );

		remove_filter( 'product_otter_license_status', $license );
		$pagenow = $previous_pagenow;

		$this->assertArrayNotHasKey( 'meta_query', $result->query_vars );
	}

	/**
	 * Ensure bulk export dies on an invalid nonce even with Pro active and an admin user.
	 */
	public function test_export_rejects_invalid_nonce() {
		if ( ! \ThemeIsle\GutenbergBlocks\Pro::is_pro_installed() ) {
			$this->markTestSkipped( 'Otter Pro is not installed in this test environment.' );
		}

		add_filter( 'product_otter_license_status', array( $this, 'valid_license' ) );

		wp_set_current_user( $this->admin_id );
		$_POST['_nonce'] = 'invalid-nonce';

		$this->expectException( 'WPDieException' );
		$this->expectExceptionMessage( 'Invalid nonce.' );

		( new Form_Records_Export() )->export_submissions();
	}

	/**
	 * Ensure bulk export requires manage_options, even with Pro active and a valid nonce.
	 */
	public function test_export_requires_manage_options() {
		if ( ! \ThemeIsle\GutenbergBlocks\Pro::is_pro_installed() ) {
			$this->markTestSkipped( 'Otter Pro is not installed in this test environment.' );
		}

		add_filter( 'product_otter_license_status', array( $this, 'valid_license' ) );

		wp_set_current_user( $this->editor_id );
		$_POST['_nonce'] = wp_create_nonce( 'otter_form_export_submissions' );

		$this->expectException( 'WPDieException' );
		$this->expectExceptionMessage( 'You are not allowed to export submissions.' );

		( new Form_Records_Export() )->export_submissions();
	}

	/**
	 * Ensure the list-table bulk actions match the current status view.
	 */
	public function test_list_table_bulk_actions_follow_status_view() {
		$hook = 'bulk_actions-edit-' . Form_Submissions::FORM_RECORD_TYPE;

		$this->assertSame( array( 'trash', 'unread', 'read' ), array_keys( apply_filters( $hook, array() ) ) );

		$_GET['post_status'] = 'unread';
		$this->assertSame( array( 'trash', 'read' ), array_keys( apply_filters( $hook, array() ) ) );

		$_GET['post_status'] = 'read';
		$this->assertSame( array( 'trash', 'unread' ), array_keys( apply_filters( $hook, array() ) ) );

		$_GET['post_status'] = 'trash';
		$this->assertSame( array( 'untrash', 'delete' ), array_keys( apply_filters( $hook, array() ) ) );

		unset( $_GET['post_status'] );
	}

	/**
	 * Ensure the row actions swap read/unread based on the record status and
	 * carry the nonce the row-action handler verifies.
	 */
	public function test_list_table_row_actions_follow_record_status() {
		$defaults = array(
			'edit'                => 'Edit',
			'inline hide-if-no-js' => 'Quick Edit',
		);

		// Non-record posts keep their actions untouched.
		$post_id = self::factory()->post->create();
		$this->assertSame( $defaults, apply_filters( 'post_row_actions', $defaults, get_post( $post_id ) ) );

		$unread  = $this->create_record( 'unread' );
		$actions = apply_filters( 'post_row_actions', $defaults, get_post( $unread ) );

		$this->assertArrayNotHasKey( 'edit', $actions );
		$this->assertArrayNotHasKey( 'inline hide-if-no-js', $actions );
		$this->assertArrayHasKey( 'view', $actions );
		$this->assertArrayHasKey( 'read', $actions );
		$this->assertArrayNotHasKey( 'unread', $actions );
		$this->assertStringContainsString(
			wp_create_nonce( 'read-' . Form_Submissions::FORM_RECORD_TYPE . '_' . $unread ),
			$actions['read']
		);

		$read    = $this->create_record( 'read' );
		$actions = apply_filters( 'post_row_actions', $defaults, get_post( $read ) );

		$this->assertArrayHasKey( 'unread', $actions );
		$this->assertArrayNotHasKey( 'read', $actions );
	}

	/**
	 * Ensure the form column links to the source page anchor when Pro is not active.
	 */
	public function test_list_table_form_column_links_to_post_anchor_without_pro() {
		$this->assertFalse( \ThemeIsle\GutenbergBlocks\Pro::is_pro_active() );

		$record_id = $this->create_record();

		ob_start();
		do_action( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', 'form', $record_id );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'https://example.com/cap#cap-form', $output );
		// Unread rows render bold.
		$this->assertStringContainsString( '<strong>', $output );
	}

	/**
	 * Ensure the Record post type is registered private, out of the REST API, with the
	 * mapped create capability and the custom read/unread statuses.
	 */
	public function test_record_post_type_is_private_with_custom_create_cap_and_statuses() {
		( new Form_Records_Post_Type() )->create_form_records_type();

		$post_type = get_post_type_object( Form_Submissions::FORM_RECORD_TYPE );

		$this->assertNotNull( $post_type );
		$this->assertFalse( $post_type->public );
		$this->assertFalse( $post_type->show_in_rest );
		$this->assertSame( Form_Submissions::FORM_RECORD_TYPE, $post_type->capability_type );
		$this->assertSame( 'create_otter_form_records', $post_type->cap->create_posts );

		$stati = get_post_stati();
		$this->assertArrayHasKey( 'read', $stati );
		$this->assertArrayHasKey( 'unread', $stati );
	}

	/**
	 * Ensure administrators get the record management capabilities but the create
	 * capability is deliberately removed (records only come from submissions).
	 */
	public function test_admin_role_gets_record_caps_but_never_create() {
		$role = get_role( 'administrator' );

		foreach ( array( 'edit', 'read', 'delete' ) as $cap ) {
			$this->assertTrue( $role->has_cap( $cap . '_' . Form_Submissions::FORM_RECORD_TYPE ), "Administrator should have the {$cap} record cap." );
			$this->assertTrue( $role->has_cap( $cap . '_' . Form_Submissions::FORM_RECORD_TYPE . 's' ), "Administrator should have the plural {$cap} records cap." );
		}

		$this->assertFalse( $role->has_cap( 'create_' . Form_Submissions::FORM_RECORD_TYPE ) );
		$this->assertFalse( $role->has_cap( 'create_' . Form_Submissions::FORM_RECORD_TYPE . 's' ) );
	}

	/**
	 * Ensure the Pro post filter appends a LIKE meta_query clause carrying the
	 * esc_url_raw'd value, not the raw GET input.
	 */
	public function test_pro_filter_query_adds_sanitized_post_meta_clause() {
		if ( ! \ThemeIsle\GutenbergBlocks\Pro::is_pro_installed() ) {
			$this->markTestSkipped( 'Otter Pro is not installed in this test environment.' );
		}

		add_filter( 'product_otter_license_status', array( $this, 'valid_license' ) );

		set_current_screen( 'edit-' . Form_Submissions::FORM_RECORD_TYPE );

		global $pagenow;
		$previous_pagenow = $pagenow;
		$pagenow          = 'edit.php';

		$raw       = 'https://example.com/a b"c';
		$sanitized = esc_url_raw( $raw );
		// The fixture must be a value esc_url_raw actually alters.
		$this->assertNotSame( $raw, $sanitized );

		$_GET['post_type']             = Form_Submissions::FORM_RECORD_TYPE;
		$_GET['filter_action']         = 'Filter';
		$_GET['filters_nonce']         = wp_create_nonce( 'filter' );
		$_REQUEST['otter_post_filter'] = $raw;

		$query        = new WP_Query();
		$query->query = array( 'post_type' => Form_Submissions::FORM_RECORD_TYPE );

		$result = ( new Form_Records_Filters() )->form_record_filter_query( $query );

		$pagenow = $previous_pagenow;
		unset( $_GET['post_type'], $_GET['filter_action'], $_GET['filters_nonce'], $_REQUEST['otter_post_filter'] );

		$meta_query = isset( $result->query_vars['meta_query'] ) ? $result->query_vars['meta_query'] : array();

		$found = false;
		foreach ( $meta_query as $clause ) {
			if (
				is_array( $clause ) &&
				isset( $clause['key'], $clause['value'], $clause['compare'] ) &&
				Form_Submissions::FORM_RECORD_META_KEY === $clause['key'] &&
				$sanitized === $clause['value'] &&
				'LIKE' === $clause['compare']
			) {
				$found = true;
			}
		}

		$this->assertTrue( $found, 'Post filter should append a LIKE meta_query clause with the esc_url_raw value.' );
	}

	/**
	 * Ensure each early-return guard of the list-table filter leaves the query untouched:
	 * wrong post_type GET, not on edit.php, and missing filter_action.
	 */
	public function test_filter_query_guards_leave_query_untouched() {
		if ( ! \ThemeIsle\GutenbergBlocks\Pro::is_pro_installed() ) {
			$this->markTestSkipped( 'Otter Pro is not installed in this test environment.' );
		}

		add_filter( 'product_otter_license_status', array( $this, 'valid_license' ) );

		set_current_screen( 'edit-' . Form_Submissions::FORM_RECORD_TYPE );

		global $pagenow;
		$previous_pagenow = $pagenow;

		$_GET['filters_nonce']         = wp_create_nonce( 'filter' );
		$_GET['filter_action']         = 'Filter';
		$_REQUEST['otter_form_filter'] = 'guard-form';

		$filters    = new Form_Records_Filters();
		$make_query = function () {
			$query        = new WP_Query();
			$query->query = array( 'post_type' => Form_Submissions::FORM_RECORD_TYPE );
			return $query;
		};

		// Wrong post_type GET.
		$pagenow           = 'edit.php';
		$_GET['post_type'] = 'post';
		$result            = $filters->form_record_filter_query( $make_query() );
		$this->assertArrayNotHasKey( 'meta_query', $result->query_vars, 'A non-record post_type GET must leave the query untouched.' );

		// Not on the list-table screen.
		$_GET['post_type'] = Form_Submissions::FORM_RECORD_TYPE;
		$pagenow           = 'post.php';
		$result            = $filters->form_record_filter_query( $make_query() );
		$this->assertArrayNotHasKey( 'meta_query', $result->query_vars, 'A pagenow other than edit.php must leave the query untouched.' );

		// Missing filter_action.
		$pagenow = 'edit.php';
		unset( $_GET['filter_action'] );
		$result = $filters->form_record_filter_query( $make_query() );
		$this->assertArrayNotHasKey( 'meta_query', $result->query_vars, 'A missing filter_action must leave the query untouched.' );

		// Sanity: with every guard satisfied the clause is appended, so the guards above
		// were the only reason the query stayed untouched.
		$_GET['filter_action'] = 'Filter';
		$result                = $filters->form_record_filter_query( $make_query() );
		$this->assertArrayHasKey( 'meta_query', $result->query_vars );

		$pagenow = $previous_pagenow;
		unset( $_GET['post_type'], $_GET['filter_action'], $_GET['filters_nonce'], $_REQUEST['otter_form_filter'] );
	}

	/**
	 * Ensure the file cleanup ignores non-record post types: deleting a regular post whose
	 * meta happens to reference an uploads path leaves the file intact.
	 */
	public function test_delete_regular_post_referencing_upload_keeps_file() {
		$path    = $this->create_upload_file( 'regular-post-upload.txt' );
		$post_id = self::factory()->post->create();

		add_post_meta( $post_id, Form_Submissions::FORM_RECORD_META_KEY, $this->get_file_record_meta( $path ) );

		wp_delete_post( $post_id, true );

		$this->assertFileExists( $path );
	}

	/**
	 * Ensure the LIKE prefilter match is re-verified: another record that merely mentions
	 * the file path in a plain text field does not protect the file from deletion.
	 */
	public function test_non_file_mention_in_another_record_does_not_protect_file() {
		$path  = $this->create_upload_file( 'mentioned-upload.txt' );
		$owner = $this->create_record( 'unread', $this->get_file_record_meta( $path ) );

		// This record's serialized meta contains the path, so the LIKE query matches it,
		// but it has no owning file field.
		$this->create_record(
			'unread',
			array(
				'inputs' => array(
					'text-input' => array(
						'label'    => 'Message',
						'value'    => $path,
						'type'     => 'text',
						'metadata' => array(),
					),
				),
			)
		);

		wp_delete_post( $owner, true );

		$this->assertFileDoesNotExist( $path );
	}

	/**
	 * Ensure malformed file meta (non-string path, path on a non-file input) neither
	 * fatals nor deletes anything.
	 */
	public function test_malformed_file_meta_neither_fatals_nor_deletes() {
		$path = $this->create_upload_file( 'malformed-upload.txt' );

		$record_id = $this->create_record(
			'unread',
			array(
				'inputs' => array(
					'array-path'     => array(
						'label' => 'Upload',
						'type'  => 'file',
						'path'  => array( $path ),
					),
					'text-with-path' => array(
						'label' => 'Message',
						'type'  => 'text',
						'path'  => $path,
					),
				),
			)
		);

		wp_delete_post( $record_id, true );

		$this->assertFileExists( $path );
	}

	/**
	 * Ensure the meta-box save handler ignores non-record post types entirely: no record
	 * meta is written even with an editpost action, a valid nonce and an otter_meta_ key.
	 */
	public function test_meta_box_save_ignores_non_record_post_types() {
		wp_set_current_user( $this->admin_id );

		$post_id = self::factory()->post->create();

		$_POST['action']              = 'editpost';
		$_POST['_wpnonce']            = wp_create_nonce( 'update-post_' . $post_id );
		$_POST['otter_meta_abcd1234'] = 'Injected';

		do_action( 'save_post', $post_id, get_post( $post_id ) );

		unset( $_POST['otter_meta_abcd1234'] );

		$this->assertFalse( metadata_exists( 'post', $post_id, Form_Submissions::FORM_RECORD_META_KEY ) );
	}

	/**
	 * Ensure a missing or non-editpost action is a silent no-op: no meta write and no
	 * wp_die, even though no valid nonce is present.
	 */
	public function test_meta_box_save_requires_editpost_action() {
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

		// Missing action: returns before the nonce check, so no WPDieException.
		$_POST['otter_meta_abcd1234'] = 'New Value';
		do_action( 'save_post', $record_id, get_post( $record_id ) );

		$meta = get_post_meta( $record_id, Form_Submissions::FORM_RECORD_META_KEY, true );
		$this->assertSame( 'Old Value', $meta['inputs']['abcd1234']['value'] );

		// Non-editpost action: same silent no-op.
		$_POST['action'] = 'inline-save';
		do_action( 'save_post', $record_id, get_post( $record_id ) );

		$meta = get_post_meta( $record_id, Form_Submissions::FORM_RECORD_META_KEY, true );

		unset( $_POST['otter_meta_abcd1234'] );

		$this->assertSame( 'Old Value', $meta['inputs']['abcd1234']['value'] );
	}

	/**
	 * Ensure the meta-box save only processes otter_meta_-prefixed keys and silently
	 * skips ids that do not exist in the stored inputs.
	 */
	public function test_meta_box_save_ignores_unrelated_keys_and_unknown_fields() {
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
		$_POST['not_otter_abcd1234']  = 'Injected';
		$_POST['otter_meta_zzzz9999'] = 'Ghost';

		do_action( 'save_post', $record_id, get_post( $record_id ) );

		$meta = get_post_meta( $record_id, Form_Submissions::FORM_RECORD_META_KEY, true );

		unset( $_POST['not_otter_abcd1234'], $_POST['otter_meta_zzzz9999'] );

		$this->assertSame( 'Old Value', $meta['inputs']['abcd1234']['value'] );
		$this->assertArrayNotHasKey( 'zzzz9999', $meta['inputs'] );
	}

	/**
	 * Ensure the delivery column renders Complete for completed deliveries and an
	 * em-dash when no delivery status has been recorded.
	 */
	public function test_delivery_column_renders_complete_and_dash_for_missing_status() {
		$complete = $this->create_record( 'read' );
		update_post_meta( $complete, Form_Submissions::DELIVERY_STATUS_META_KEY, Form_Submissions::DELIVERY_STATUS_COMPLETE );

		ob_start();
		do_action( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', 'delivery', $complete );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'Complete', $output );

		$pending = $this->create_record( 'read' );

		ob_start();
		do_action( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', 'delivery', $pending );
		$output = ob_get_clean();

		$this->assertStringContainsString( '&#8212;', $output );
	}

	/**
	 * Ensure the Post column resolves the source title and permalink from the stored
	 * post_id meta when present.
	 */
	public function test_post_url_column_resolves_title_via_post_id_meta() {
		$source_id = self::factory()->post->create( array( 'post_title' => 'Source Page' ) );
		$record_id = $this->create_record(
			'read',
			array(
				'post_id' => array(
					'label' => 'Post ID',
					'value' => (string) $source_id,
				),
			)
		);

		ob_start();
		do_action( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', 'post_url', $record_id );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'Source Page', $output );
		$this->assertStringContainsString( esc_url( get_permalink( $source_id ) ), $output );
	}

	/**
	 * Ensure the Post column falls back to the raw stored URL as the link text when the
	 * URL cannot be resolved to a local post.
	 */
	public function test_post_url_column_falls_back_to_raw_url_when_unresolvable() {
		$record_id = $this->create_record( 'read' );

		ob_start();
		do_action( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', 'post_url', $record_id );
		$output = ob_get_clean();

		// The external URL from the record fixture is both the href and the visible text.
		$this->assertStringContainsString( '>https://example.com/cap</a>', $output );
	}

	/**
	 * Ensure the Post column shows the "(no title)" placeholder when the resolved source
	 * post has an empty title.
	 */
	public function test_post_url_column_shows_placeholder_for_empty_title() {
		$source_id = self::factory()->post->create( array( 'post_title' => '' ) );
		$record_id = $this->create_record(
			'read',
			array(
				'post_id' => array(
					'label' => 'Post ID',
					'value' => (string) $source_id,
				),
			)
		);

		ob_start();
		do_action( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', 'post_url', $record_id );
		$output = ob_get_clean();

		$this->assertStringContainsString( '(no title)', $output );
	}

	/**
	 * License filter callback (a method so tear_down survives wp_die tests; WP resets filters between tests).
	 *
	 * @return string
	 */
	public function valid_license() {
		return 'valid';
	}
}
