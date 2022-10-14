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

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { buildResponsiveGetAttributes } from '../../../helpers/helper-functions.js';

const px = value => value ? `${ value }px` : value;

const mightBeUnit = value => isNumber( value ) ? px( value ) : value;

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

	const {
		responsiveGetAttributes
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	return (
		<Fragment>
			<div
				id={ attributes.id }
				className={ classnames(
					'wp-block-themeisle-blocks-google-map-container',
					{ 'is-selecting-marker': isSelectingMarker }
				) }
				style={ {
					height: responsiveGetAttributes([ mightBeUnit( attributes.height ), attributes.heightTablet, attributes.heightMobile ])
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
