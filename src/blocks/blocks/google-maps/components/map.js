/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

const Map = ({
	attributes,
	className,
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

	return (
		<Fragment>
			<div
				id={ attributes.id }
				className={ classnames(
					className,
					{ 'is-selecting-marker': isSelectingMarker }
				) }
				style={ {
					height: attributes.height + 'px'
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
