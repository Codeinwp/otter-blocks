<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

interface FormSubscribeServiceInterface
{
	public function subscribe( $email );
	public function get_provider_data( $data );
	public function set_api_key( $api_key );
    public function check_credential_status();
	public static function validate_api_key( $api_key );
}
