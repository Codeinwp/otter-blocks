<?php
/**
 * Mailchimp server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Class Mailchimp_Integration
 *
 * @since 2.0.3
 */
class Mailchimp_Integration implements FormSubscribeServiceInterface {

	/**
	 * The API Key of the service.
	 *
	 * @var string
	 */
	protected $api_key = '';

	/**
	 * The list id.
	 *
	 * @var string
	 */
	protected $list_id = '';

	/**
	 * The server name of the service.
	 *
	 * @var string
	 */
	protected $server_name = '';

	/**
	 * The form data.
	 * 
	 * @var Form_Data_Request|null
	 */
	protected $form_data = null;


	/**
	 * The default constructor.
	 */
	public function __construct() {

	}

	/**
	 * Extract the API Key and the contact list.
	 *
	 * @access  public
	 * @param Form_Settings_Data $wp_options_form The integration data.
	 * @since 2.0.3
	 */
	public function extract_data_from_integration( $wp_options_form ) {
		$this->set_api_key( $wp_options_form->get_api_key() );
		$this->set_list_id( $wp_options_form->get_list_id() );
		return $this;
	}

	/**
	 * Get information about contact lists from Mailchimp.
	 *
	 * @return mixed
	 *
	 * @see https://mailchimp.com/developer/marketing/api/list-members/
	 * @since 2.0.3
	 */
	public function get_lists() {
		$return = array(
			'success' => false,
		);

		$url  = 'https://' . $this->server_name . '.api.mailchimp.com/3.0/lists?count=1000';
		$args = array(
			'method'  => 'GET',
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'user:' . $this->api_key ),
			),
		);

		$response = '';

		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			$response = vip_safe_wp_remote_get( $url, '', 3, 1, 20, $args );
		} else {
			$response = wp_remote_get( $url, $args ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			$return['error'] = ! empty( $body['detail'] ) && 'null' !== $body['detail'] ? $body['detail'] : __( 'Provider settings are invalid! Please check your API Key and the contact list in the form.', 'otter-blocks' );
		} else {
			$return['success'] = true;
			$return['list_id'] = array_map(
				function( $item ) {
					return array(
						'id'   => $item['id'],
						'name' => $item['name'],
					);
				},
				$body['lists']
			);
		}

		return $return;
	}

	/**
	 * Make a request that add the email to the contact list.
	 *
	 * @param string $email The email address.
	 * @return array|\WP_Error The response from Mailchimp.
	 * 
	 * @see https://mailchimp.com/developer/marketing/api/list-members/add-member-to-list/
	 */
	public function make_subscribe_request( $email ) {
		$user_status = $this->get_new_user_status_mailchimp( $this->list_id );

		$url = 'https://' . $this->server_name . '.api.mailchimp.com/3.0/lists/' . $this->list_id . '/members/' . md5( strtolower( $email ) );
		
		$payload = array(
			'email_address' => $email,
			'status'        => $user_status,
		);
		
		$linked_merge_fields = $this->get_linked_merge_fields();
		if ( ! empty( $linked_merge_fields ) ) {
			$url                     = add_query_arg( 'skip_merge_validation', 'true', $url );
			$payload['merge_fields'] = $linked_merge_fields;
		}

		$args = array(
			'method'  => 'PUT',
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'user:' . $this->api_key ),
			),
			'body'    => wp_json_encode( $payload ),
		);

		return wp_remote_post( $url, $args );
	}

	/**
	 * Add a new subscriber to Mailchimp.
	 *
	 * @param Form_Data_Request $form_data The wrapper around request data.
	 * @return Form_Data_Request
	 * @since 2.0.3
	 */
	public function subscribe( $form_data ) {

		$this->form_data = $form_data;
		$email           = $form_data->get_first_email_from_input_fields();
		$response        = $this->make_subscribe_request( $email );
		$body            = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {

			if ( ! empty( $body['detail'] ) && strpos( $body['detail'], 'fake' ) !== false ) {
				$form_data->set_error( Form_Data_Response::ERROR_PROVIDER_INVALID_EMAIL );
			} else {
				if ( $this->is_credential_error( $body['status'] ) ) {
					$form_data->set_error( Form_Data_Response::ERROR_PROVIDER_CREDENTIAL_ERROR );
				} else {
					$form_data->set_error( Form_Data_Response::ERROR_PROVIDER_SUBSCRIBE_ERROR, $body['detail'] );
				}
			}
		}

		return $form_data;
	}

	/**
	 * Set the API Key.
	 *
	 * @param string $api_key The API Key of the provider.
	 * @since 2.0.3
	 */
	public function set_api_key( $api_key ) {
		$valid_api_key = $this::validate_api_key( $api_key );

		if ( ! $valid_api_key['valid'] ) {
			return;
		}

		$this->api_key     = $api_key;
		$key_info          = explode( '-', $api_key );
		$this->server_name = $key_info[1];
		return $this;
	}

	/**
	 * Set the list id.
	 *
	 * @param string $list_id The list id.
	 * @return $this
	 * @since 2.0.3
	 */
	public function set_list_id( $list_id ) {
		$this->list_id = $list_id;
		return $this;
	}

	/**
	 * Validate the given API Key.
	 *
	 * @param string $api_key The API Key of the provider.
	 * @return array[
	 *  'validate' => boolean,
	 *  'reason' => string,
	 *  'code' => string
	 * ]
	 * @since 2.0.3
	 */
	public static function validate_api_key( $api_key ) {
		if ( '' === $api_key ) {
			return array(
				'valid'  => false,
				'reason' => __( 'API Key is missing!', 'otter-blocks' ),
				'code'   => Form_Data_Response::ERROR_PROVIDER_INVALID_KEY,
			);
		}

		$key_info = explode( '-', $api_key );
		if ( 2 !== count( $key_info ) || ! isset( $key_info[1] ) ) {
			return array(
				'valid'  => false,
				'reason' => __( 'Invalid API Key format!', 'otter-blocks' ),
				'code'   => Form_Data_Response::ERROR_PROVIDER_INVALID_API_KEY_FORMAT,
			);
		}
		return array(
			'valid'  => true,
			'reason' => '',
			'code'   => '',
		);
	}

	/**
	 * Check if the subscribing list has double opt-in.
	 * If the option is activated, return pending status for new users, else return subscribed.
	 *
	 * @param string $list_id List id.
	 *
	 * @return string
	 *
	 * @see https://github.com/Codeinwp/themeisle-content-forms/blob/master/includes/widgets-public/newsletter_public.php#L181
	 * @since 2.0.3
	 */
	private function get_new_user_status_mailchimp( $list_id ) {
		$url  = 'https://' . $this->server_name . '.api.mailchimp.com/3.0/lists/' . $list_id;
		$args = array(
			'method'  => 'GET',
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'user:' . $this->api_key ),
			),
		);

		$response = wp_remote_post( $url, $args );

		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return 'pending';
		}

		return array_key_exists( 'double_optin', $body ) && true === $body['double_optin'] ? 'pending' : 'subscribed';
	}

	/**
	 * Get the data from the provider, like: contact list.
	 *
	 * @param Form_Data_Request $request The request.
	 * @return false[]|mixed
	 * @since 2.0.3
	 */
	public function get_information_from_provider( $request ) {
		if ( $request->is_root_data_set( 'action' ) ) {
			if ( $request->get_root_data( 'action' ) == 'listId' ) {
				return $this->get_lists();
			}
		}
		return $this->get_lists();
	}

	/**
	 * Check if the response is caused by invalid credential.
	 *
	 * @param int $response_code The response code.
	 * @return bool
	 * @see https://mailchimp.com/developer/marketing/docs/errors/
	 * @since 2.0.3
	 */
	private function is_credential_error( $response_code ) {
		return in_array( $response_code, array( 401, 403, 404, 500 ) );
	}

	/**
	 * Get the merge fields from Mailchimp.
	 *
	 * @return array An array of merge fields, each containing:
	 *               - string $tag The merge field's tag
	 *               - string $type The merge field's type (e.g., 'text')
	 * @since 2.7.0
	 * 
	 * @see https://mailchimp.com/developer/marketing/api/list-merges/list-merge-fields/
	 */
	public function get_merge_fields() {
		$url  = 'https://' . $this->server_name . '.api.mailchimp.com/3.0/lists/' . $this->list_id . '/merge-fields';
		$args = array(
			'method'  => 'GET',
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'user:' . $this->api_key ),
			),
		);
		
		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			$response = vip_safe_wp_remote_get( $url, '', 3, 1, 20, $args );
		} else {
			$response = wp_remote_get( $url, $args ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
		}

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return array();
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! isset( $body['merge_fields'] ) || empty( $body['merge_fields'] ) ) {
			return array();
		}

		return array_filter(
			$body['merge_fields'],
			function( $item ) {
				return ! empty( $item['tag'] );
			}
		);
	}

	/**
	 * Link the form fields with their corresponding merge fields.
	 * 
	 * @return array The available merge fields to link with the form fields.
	 * @since 2.7.0
	 */
	protected function get_linked_merge_fields() {

		// Check if it is necessary to link the fields.
		$form_fields = $this->form_data->get_fields();
		if ( empty( $form_fields ) ) {
			return array();
		}

		$available_fields_tags = array();

		foreach ( $form_fields as $field ) {
			if ( empty( $field['metadata']['mappedName'] ) ) {
				continue;
			}

			$available_fields_tags[] = array(
				'tag'   => strtoupper( $field['metadata']['mappedName'] ),
				'value' => $field['value'],
			);
		}

		if ( empty( $available_fields_tags ) ) {
			return array();
		}
		

		$merge_fields = $this->get_merge_fields();
		if ( empty( $merge_fields ) ) {
			return array();
		}

		// Link based on the tag of the merge fields.
		$linked_fields = array();
		foreach ( $available_fields_tags as $field ) {
			foreach ( $merge_fields as $merge_field ) {
				if ( $field['tag'] !== $merge_field['tag'] ) {
					continue;
				}

				$linked_fields[ $merge_field['tag'] ] = $field['value'];
			}
		}

		return $linked_fields;
	}
}
