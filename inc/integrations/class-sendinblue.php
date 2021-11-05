<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Class Plugin_Card_Server
 */
class Sendinblue_Integration {

	/**
	 * The API Key of the service.
	 *
	 * @var string
	 */
	protected $api_key = '';

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

		$url      = 'https://api.sendinblue.com/v3/contacts/lists';
			$args = array(
				'method'  => 'GET',
				'headers' => array(
					'api-key' => $this->api_key,
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
	 * Add a new subscriber to Mailchimp
	 *
	 * @param string $list_id Contact list id.
	 * @param string $email The client email.
	 *
	 * @return \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response
	 */
	public function subscribe( $list_id, $email ) {
		$res       = new Form_Data_Response();
		$url       = 'https://api.sendinblue.com/v3/contacts';
		$form_data = array(
			'email'            => $email,
			'listIds'          => array( (int) $list_id ),
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

			if ( isset( $body['code'] ) && 'unauthorized' === $body['code'] ) {
				$res->set_error( $body['message'], 'sendinblue' );
			}
		} else {
			$res->mark_as_succes();
		}

		return $res;
	}

	/**
	 * Set the API Key
	 *
	 * @param string $api_key The API Key of the provider.
	 */
	public function set_api_key( $api_key ) {

		$valid_api_key = $this::validate_api_key( $api_key );

		if ( ! $valid_api_key['valid'] ) {
			return;
		}

		$this->api_key = $api_key;
	}

	/**
	 * Validate the given API Key
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

		return array(
			'valid'  => true,
			'reason' => '',
		);
	}
}
