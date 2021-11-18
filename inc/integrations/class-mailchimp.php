<?php
/**
 * Mailchimp server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Class Plugin_Card_Server
 */
class Mailchimp_Integration {

	/**
	 * The API Key of the service.
	 *
	 * @var string
	 */
	protected $api_key = '';

	/**
	 * The server name of the service.
	 *
	 * @var string
	 */
	protected $server_name = '';

	/**
	 * Constructor.
	 *
	 * @access  public
	 * @param string $api_key The API Key.
	 */
	public function __construct( $api_key ) {
		$this->set_api_key( $api_key );
	}

	/**
	 * Get information about contact lists from Mailchimp.
	 *
	 * @return mixed
	 *
	 * @see https://mailchimp.com/developer/marketing/api/list-members/
	 */
	public function get_lists() {
		$return = array(
			'success' => false,
		);

		$url  = 'https://' . $this->server_name . '.api.mailchimp.com/3.0/lists';
		$args = array(
			'method'  => 'GET',
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'user:' . $this->api_key ),
			),
		);

		$response = wp_remote_post( $url, $args );
		$body     = json_decode( wp_remote_retrieve_body( $response ), true );

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
	 * Add a new subscriber to Mailchimp.
	 *
	 * @param string $list_id Contact list id.
	 * @param string $email The client email.
	 * @return \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response
	 */
	public function subscribe( $list_id, $email ) {
		$res         = new Form_Data_Response();
		$user_status = $this->get_new_user_status_mailchimp( $list_id );

		$url       = 'https://' . $this->server_name . '.api.mailchimp.com/3.0/lists/' . $list_id . '/members/' . md5( strtolower( $email ) );
		$form_data = array(
			'email_address' => $email,
			'status'        => $user_status,
		);
		$args      = array(
			'method'  => 'PUT',
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'user:' . $this->api_key ),
			),
			'body'    => wp_json_encode( $form_data ),
		);

		$response = wp_remote_post( $url, $args );
		$body     = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			$res->set_error( ! empty( $body['detail'] ) && 'null' !== $body['detail'] ? $body['detail'] : __( 'The request has been rejected by the provider!', 'otter-blocks' ), 'mailchimp' );
		} else {
			$res->mark_as_succes();
		}

		return $res;
	}

	/**
	 * Set the API Key.
	 *
	 * @param string $api_key The API Key of the provider.
	 */
	public function set_api_key( $api_key ) {
		$valid_api_key = $this::validate_api_key( $api_key );

		if ( ! $valid_api_key['valid'] ) {
			return;
		}

		$this->api_key     = $api_key;
		$key_info          = explode( '-', $api_key );
		$this->server_name = $key_info[1];
	}

	/**
	 * Validate the given API Key.
	 *
	 * @param string $api_key The API Key of the provider.
	 * @return array[
	 *  'validate' => booleand,
	 *  'reason' => string
	 * ]
	 */
	public static function validate_api_key( $api_key ) {
		if ( ! isset( $api_key ) || '' === $api_key ) {
			return array(
				'valid'  => false,
				'reason' => __( 'API Key is missing!', 'otter-blocks' ),
			);
		}

		$key_info = explode( '-', $api_key );
		if ( 2 !== count( $key_info ) || ! isset( $key_info[1] ) ) {
			return array(
				'valid'  => false,
				'reason' => __( 'Invalid API Key format!', 'otter-blocks' ),
			);
		}
		return array(
			'valid'  => true,
			'reason' => '',
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
}
