/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalBoxControl as BoxControl,
	PanelBody
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ResponsiveControl from '../../../../components/responsive-control/index.js';
import { isNullObject } from '../../../../helpers/helper-functions.js';

const SectionColumn = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const getView = useSelect( select => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' );
		return __experimentalGetPreviewDeviceType();
	}, []);

	const getPadding = () => {
		switch ( getView ) {
		case 'Desktop':
			return defaults.padding;
		case 'Tablet':
			return defaults.paddingTablet;
		case 'Mobile':
			return defaults.paddingMobile;
		default:
			return undefined;
		}
	};

	const changePadding = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		switch ( getView ) {
		case 'Desktop':
			return changeConfig( blockName, {
				padding: value
			});
		case 'Tablet':
			return changeConfig( blockName, {
				paddingTablet: value
			});
		case 'Mobile':
			return changeConfig( blockName, {
				paddingMobile: value
			});
		default:
			return undefined;
		}
	};

	const getMargin = () => {
		switch ( getView ) {
		case 'Desktop':
			return defaults.margin;
		case 'Tablet':
			return defaults.marginTablet;
		case 'Mobile':
			return defaults.marginMobile;
		default:
			return undefined;
		}
	};

	const changeMargin = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		switch ( getView ) {
		case 'Desktop':
			return changeConfig( blockName, {
				margin: value
			});
		case 'Tablet':
			return changeConfig( blockName, {
				marginTablet: value
			});
		case 'Mobile':
			return changeConfig( blockName, {
				marginMobile: value
			});
		default:
			return undefined;
		}
	};

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Sizing', 'otter-blocks' ) }
			>
				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
					className="otter-section-padding-responsive-control"
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={ getPadding() }
						inputProps={ {
							min: 0,
							max: 500
						} }
						onChange={ changePadding }
					/>

					<hr/>

					<BoxControl
						label={ __( 'Margin', 'otter-blocks' ) }
						values={ getMargin() }
						inputProps={ {
							min: -500,
							max: 500
						} }
						onChange={ changeMargin }
					/>
				</ResponsiveControl>
			</PanelBody>
		</Fragment>
	);
};

export default SectionColumn;
