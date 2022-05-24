<?php
/**
 * Interface for Form Subscribe service.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * An interface for defining Providers that can add the email address to a contact list.
 *
 * @since 2.0.3
 */
interface FormSubscribeServiceInterface {

	/**
	 * Add the email to a contact list.
	 *
	 * @param strring $email The email.
	 * @return mixed
	 * @since 2.0.3
	 */
	public function subscribe( $email );

	/**
	 * Get information (contact list) from the provider.
	 *
	 * @param Form_Data_Request $request The request.
	 * @return mixed
	 * @since 2.0.3
	 */
	public function get_information_from_provider( $request );

	/**
	 * Get the integration data of from the WordPress Options.
	 *
	 * @param array $wp_options_form The forms option.
	 * @return mixed
	 * @since 2.0.3
	 */
	public function extract_data_from_integration( $wp_options_form );

	/**
	 * Validate the API Key through a minimal check on format.
	 *
	 * @param string $api_key The API Key.
	 * @return mixed
	 * @since 2.0.3
	 */
	public static function validate_api_key( $api_key );

	/**
	 * Test if the service is set up by registering a random email address on the contact list.
	 *
	 * @return mixed
	 * @since 2.0.3
	 */
	public function test_subscription();
}
