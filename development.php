<?php
/**
 * Development Helpers.
 *
 * @package ThemeIsle
 */

define( 'ENABLE_OTTER_PRO_DEV', true );

if ( ENABLE_OTTER_PRO_DEV && class_exists( '\ThemeIsle\Otter_Pro\Main' ) ) {
	\ThemeIsle\Otter_Pro\Main::instance();
}
