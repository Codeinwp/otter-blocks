<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Class Sendinblue_Integration
 *
 * @since 2.0.3
 */
class Sendinblue_Integration implements FormSubscribeServiceInterface {

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
	 * The default constructor.
	 */
	public function __construct() {

	}

	/**
	 * Extract the API Key and the contact list.
	 *
	 * @access  public
	 * @param Form_Settings_Data|null $wp_options_form The integration data.
	 */
	public function extract_data_from_integration( $wp_options_form ) {
		if ( isset( $wp_options_form ) ) {
			$this->set_api_key( $wp_options_form->get_api_key() );
			$this->set_list_id( $wp_options_form->get_list_id() );
		}
		return $this;
	}

	/**
	 * Get information about contact lists from Sendinblue
	 *
	 * @return mixed|\WP_REST_Response
	 *
	 * @see https://developers.sendinblue.com/reference/getlists-1
	 */
	public function get_lists() {
		$return = array(
			'success' => false,
		);

		$url  = 'https://api.sendinblue.com/v3/contacts/lists';
		$args = array(
			'method'  => 'GET',
			'headers' => array(
				'api-key' => $this->api_key,
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
	 * Add a new subscriber to Mailchimp
	 *
	 * @param string $email The client email.
	 *
	 * @return Form_Data_Response
	 */
	public function subscribe( $email ) {
		$res       = new Form_Data_Response();
		$url       = 'https://api.sendinblue.com/v3/contacts';
		$form_data = array(
			'email'            => $email,
			'listIds'          => array( (int) $this->list_id ),
			'emailBlacklisted' => false,
			'smsBlacklisted'   => false,
		);
		$args      = array(
			'method'  => 'POST',
			'headers' => array(
				'Accept'       => 'application/json',
				'Content-Type' => 'application/json',
				'api-key'      => $this->api_key,
			),
			'body'    => wp_json_encode( $form_data ),
		);

		$response = wp_remote_post( $url, $args );
		$body     = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( is_wp_error( $response ) || 400 === wp_remote_retrieve_response_code( $response ) || ( ( isset( $body['code'] ) && 'unauthorized' === $body['code'] ) ) ) {

			$res->set_error( ! empty( $body['message'] ) && 'null' !== $body['message'] ? $body['message'] : __( 'The request has been rejected by the provider!', 'otter-blocks' ), 'sendinblue' );

			if ( isset( $body['code'] ) ) {
				$res->set_error( $body['message'], 'sendinblue' )->set_is_credential_error( $this->is_credential_error( $body['code'] ) );
			}
		} else {
			$res->mark_as_success();
		}

		return $res;
	}

	/**
	 * Test the subscription by registering a random generated email.
	 *
	 * @return Form_Data_Response
	 */
	public function test_subscription() {
		return $this->subscribe( Form_Utils::generate_test_email() );
	}

	/**
	 * Set the API Key
	 *
	 * @param string $api_key The API Key of the provider.
	 * @since 2.0.3
	 */
	public function set_api_key( $api_key ) {

		$valid_api_key = $this::validate_api_key( $api_key );

		if ( ! $valid_api_key['valid'] ) {
			return $this;
		}

		$this->api_key = $api_key;

		return $this;
	}

	/**
	 * Validate the given API Key
	 *
	 * @param string $api_key The API Key of the provider.
	 * @return array[
	 *  'validate' => boolean,
	 *  'reason' => string
	 * ]
	 * @since 2.0.3
	 */
	public static function validate_api_key( $api_key ) {
		if ( ! isset( $api_key ) || '' === $api_key ) {
			return array(
				'valid'  => false,
				'reason' => __( 'API Key is missing!', 'otter-blocks' ),
			);
		}

		return array(
			'valid'  => true,
			'reason' => '',
		);
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
	 * Get the data from the provider.
	 *
	 * @param Form_Data_Request $request The request.
	 * @return false[]|mixed
	 * @since 2.0.3
	 */
	public function get_information_from_provider( $request ) {
		if ( $request->is_set( 'action' ) ) {
			if ( $request->get( 'action' ) == 'listId' ) {
				return $this->get_lists();
			}
		}
		return $this->get_lists();
	}

	/**
	 * Check if the response is caused by invalid credential.
	 *
	 * @param string $response_code The response code.
	 * @return bool
	 *
	 * @see https://developers.sendinblue.com/docs/how-it-works#error-codes
	 * @since 2.0.3
	 */
	private function is_credential_error( $response_code ) {
		return in_array( $response_code, array( 'unauthorized', 'reseller_permission_denied', 'not_enough_credits', 'account_under_validation', 'permission_denied' ) );
	}
}
