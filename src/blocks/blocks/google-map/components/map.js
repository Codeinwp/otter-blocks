/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { isNumber } from 'lodash';

import { Button } from '@wordpress/components';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useResponsiveAttributes } from '../../../helpers/utility-hooks.js';
import { _px } from '../../../helpers/helper-functions.js';

const Map = ({
	attributes,
	initMap,
	displayMap,
	isMapLoaded,
	selectMarker,
	isSelectingMarker
}) => {
	useEffect( () => {
		if ( displayMap ) {
			initMap();
		}
	}, [ displayMap ]);

	const { responsiveGetAttributes } = useResponsiveAttributes();

	return (
		<Fragment>
			<div
				id={ attributes.id }
				className={ classnames(
					'wp-block-themeisle-blocks-google-map-container',
					{ 'is-selecting-marker': isSelectingMarker }
				) }
				style={ {
					height: responsiveGetAttributes([ _px( attributes.height ), attributes.heightTablet, attributes.heightMobile ])
				} }
			>
			</div>

			{ isMapLoaded && (
				<Button
					className="wp-block-themeisle-blocks-google-map-marker-button"
					title={ __( 'Add Button', 'otter-blocks' ) }
					onClick={ selectMarker }
				>
					<span className="dashicons dashicons-sticky"></span>
				</Button>
			) }
		</Fragment>
	);
};

export default Map;
