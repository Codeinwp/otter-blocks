<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

interface FormSubscribeServiceInterface
{
	public function subscribe( $email );
	public function get_information_from_provider( $request );
	public function extract_data_from_integration( $integration );
	public static function validate_api_key( $api_key );
}
