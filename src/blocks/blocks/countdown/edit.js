/**
 * WordPress dependencies
 */
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
import { blockInit } from '../../helpers/block-utility';
import defaultAttributes from './attributes.js';
import Inspector from './inspector.js';
import {
	getIntervalFromUnix,
	getTimezone
} from '../../helpers/helper-functions.js';
import DisplayTime from './components/display-time.js';

const px = value => value ? `${ value }px` : value;

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId
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

	/**
	 * Compute the components style based on the platform
	 */
	let styles;

	if ( isTablet ) {
		styles = {
			value: {
				color: attributes.valueColor,
				fontSize: px( attributes?.valueFontSizeTablet )
			},
			label: {
				color: attributes.labelColor,
				fontSize: px( attributes?.labelFontSizeTablet )
			},
			display: {
				gap: px( attributes.gapTablet )
			},
			allComponents: {
				height: px( attributes?.heightTablet )
			},
			mainComponents: {
				backgroundColor: attributes.backgroundColor,
				width: px( attributes?.widthTablet ),
				borderWidth: px( attributes.borderWidthTablet ),
				borderColor: attributes.borderColor
			}
		};
	} else if ( isMobile ) {
		styles = {
			value: {
				color: attributes.valueColor,
				fontSize: px( attributes.valueFontSizeMobile )
			},
			label: {
				color: attributes.labelColor,
				fontSize: px( attributes.labelFontSizeMobile )
			},
			display: {
				gap: px( attributes.gapMobile )
			},
			allComponents: {
				height: px( attributes?.heightMobile )
			},
			mainComponents: {
				backgroundColor: attributes.backgroundColor,
				width: px( attributes?.widthMobile ),
				borderWidth: px ( attributes.borderWidthMobile ),
				borderColor: attributes.borderColor
			}
		};
	} else if ( isDesktop ) {
		styles = {
			value: {
				color: attributes.valueColor,
				fontSize: px( attributes.valueFontSize )
			},
			label: {
				color: attributes.labelColor,
				fontSize: px(  attributes.labelFontSize )
			},
			display: {
				gap: px( attributes.gap )
			},
			allComponents: {
				height: px( attributes.height )
			},
			mainComponents: {
				backgroundColor: attributes.backgroundColor,
				width: px( attributes.width ),
				borderWidth: px( attributes.borderWidth ),
				borderColor: attributes.borderColor
			}
		};
	}

	// Add `border-radius` for all the platforms
	styles.mainComponents.borderRadius = 'linked' === attributes.borderRadiusType ? attributes.borderRadius + '%' : `${ attributes.borderRadiusTopLeft }% ${ attributes.borderRadiusTopRight }% ${ attributes.borderRadiusBottomRight }% ${ attributes.borderRadiusBottomLeft }%`;

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				id={ attributes.id }
				className={ className }
			>
				<DisplayTime
					time={ getIntervalFromUnix( unixTime, { exclude: attributes?.exclude }) }
					styles={ styles }
					hasSeparators={ attributes.hasSeparators }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
