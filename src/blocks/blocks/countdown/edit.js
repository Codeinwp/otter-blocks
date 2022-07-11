/**
 * External dependencies.
 */

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

import { useViewportMatch } from '@wordpress/compose';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

import moment from 'moment';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import {
	blockInit,
	useCSSNode
} from '../../helpers/block-utility';
import Inspector from './inspector.js';
import {
	boxValues,
	getIntervalFromUnix,
	getTimezone
} from '../../helpers/helper-functions.js';
import DisplayTime from './components/display-time.js';
import { at, isNumber } from 'lodash';

const { attributes: defaultAttributes } = metadata;

const px = value => isNumber( value ) ? `${ value }px` : value;

/**
 *
 * @param {import('./types').CountdownProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	className
}) => {
	const [ unixTime, setUnixTime ] = useState( 0 );

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	/**
	 * Update the time interval
	 */
	useEffect( () => {
		const interval = setInterval( () => {
			if ( attributes.date ) {
				let date = attributes.date + getTimezone();
				date = moment( date ).unix() * 1000;
				setUnixTime( new Date( date ) - new Date() );
			}
		}, 500 );

		return () => {
			clearInterval( interval );
		};
	}, [ attributes.date ]);

	/**
	 * Determine the platform
	 */
	const {
		isViewportAvailable,
		isPreviewDesktop,
		isPreviewTablet,
		isPreviewMobile
	} = useSelect( select => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return {
			isViewportAvailable: __experimentalGetPreviewDeviceType ? true : false,
			isPreviewDesktop: __experimentalGetPreviewDeviceType ? 'Desktop' === __experimentalGetPreviewDeviceType() : false,
			isPreviewTablet: __experimentalGetPreviewDeviceType ? 'Tablet' === __experimentalGetPreviewDeviceType() : false,
			isPreviewMobile: __experimentalGetPreviewDeviceType ? 'Mobile' === __experimentalGetPreviewDeviceType() : false
		};
	}, []);

	const isLarger = useViewportMatch( 'large', '>=' );

	const isLarge = useViewportMatch( 'large', '<=' );

	const isSmall = useViewportMatch( 'small', '>=' );

	const isSmaller = useViewportMatch( 'small', '<=' );

	let isDesktop = isLarger && ! isLarge && isSmall && ! isSmaller;

	let isTablet = ! isLarger && ! isLarge && isSmall && ! isSmaller;

	let isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	if ( isViewportAvailable && ! isMobile ) {
		isDesktop = isPreviewDesktop;
		isTablet = isPreviewTablet;
		isMobile = isPreviewMobile;
	}


	// Add `border-radius` for all the platforms
	const borderRadius = 'linked' === attributes.borderRadiusType ? attributes.borderRadius + '%' : `${ attributes.borderRadiusTopLeft }% ${ attributes.borderRadiusTopRight }% ${ attributes.borderRadiusBottomRight }% ${ attributes.borderRadiusBottomLeft }%`;

	const inlineStyles = {
		'--backgroundColor': attributes.backgroundColor,
		'--borderColor': attributes.borderColor,
		'--borderRadius': borderRadius,
		'--backgroundColor': attributes.backgroundColor,
		'--borderColor': attributes.borderColor,
		'--borderRadius': borderRadius,
		'--boxWidth': px( attributes.width ), // legacy
		'--boxWidthTablet': px( attributes.widthTablet ), // legacy
		'--boxWidthMobile': px( attributes.widthMobile ), // legacy
		'--width': px( attributes.containerWidth ),
		'--widthTablet': px( attributes.containerWidthTablet ),
		'--widthMobile': px( attributes.containerWidthMobile ),
		'--height': px( attributes.height ),
		'--heightTablet': px( attributes.heightTablet ),
		'--heightMobile': px( attributes.heightMobile ),
		'--borderWidth': px( attributes.borderWidth ),
		'--borderWidthTablet': px( attributes.borderWidthTablet ),
		'--borderWidthMobile': px( attributes.borderWidthMobile ),
		'--gap': px( attributes.gap ),
		'--gapTablet': px( attributes.gapTablet ),
		'--gapMobile': px( attributes.gapMobile ),
		'--valueFontSize': px( attributes.valueFontSize ),
		'--valueFontSizeTablet': px( attributes.valueFontSizeTablet ),
		'--valueFontSizeMobile': px( attributes.valueFontSizeMobile ),
		'--labelFontSize': px( attributes.valueFontSize ),
		'--labelFontSizeTablet': px( attributes.valueFontSizeTablet ),
		'--labelFontSizeMobile': px( attributes.valueFontSizeMobile ),
		'--alignment': attributes.alignment,
		'--padding': boxValues( attributes.padding )
	};

	const [ cssNodeName, setCSS ] = useCSSNode();
	useEffect( ()=>{
		setCSS([
			`.otter-countdown__display-area .otter-countdown__value {
				color: ${ attributes.valueColor };
			}`,
			`.otter-countdown__display-area .otter-countdown__label {
				color: ${ attributes.labelColor };
			}`
		]);
	}, [ attributes.valueColor, attributes.labelColor ]);


	const blockProps = useBlockProps({
		id: attributes.id,
		className: cssNodeName,
		style: inlineStyles
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<DisplayTime
					time={ getIntervalFromUnix( unixTime, { exclude: attributes?.exclude }) }
					hasSeparators={ attributes.hasSeparators }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
