/**
 * External dependencies.
 */

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

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
import { isEmpty, isNumber, max, pickBy } from 'lodash';
import classNames from 'classnames';

const { attributes: defaultAttributes } = metadata;

const optionalUnit = ( value, unit = 'px' ) => isNumber( value ) ? `${ value }${unit}` : value;

/**
 *
 * @param {import('./types').CountdownProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	const [ unixTime, setUnixTime ] = useState( 0 );

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	useEffect( () => {

		/**
		 * Migration to new attributes.
		 */
		if (
			attributes.borderRadiusBox === undefined &&
			( attributes.borderRadius || attributes.borderRadiusBottomLeft || attributes.borderRadiusTopRight || attributes.borderRadiusTopLeft || attributes.borderRadiusBottomRight )
		) {

			const borderRadiusBox = pickBy( 'linked' === attributes?.borderRadiusType ?
				{ left: optionalUnit( attributes.borderRadius, '%' ), right: optionalUnit( attributes.borderRadius, '%' ), bottom: optionalUnit( attributes.borderRadius, '%' ), top: optionalUnit( attributes.borderRadius, '%' ) } :
				{ left: optionalUnit( attributes.borderRadiusBottomLeft, '%' ), right: optionalUnit( attributes.borderRadiusTopRight, '%' ), bottom: optionalUnit( attributes.borderRadiusBottomRight, '%' ), top: optionalUnit( attributes.borderRadiusTopLeft, '%' ) }, x => x );

			if ( ! isEmpty( borderRadiusBox ) ) {
				setAttributes({ borderRadiusBox, borderRadius: undefined, borderRadiusBottomLeft: undefined, borderRadiusTopRight: undefined, borderRadiusBottomRight: undefined, borderRadiusTopLeft: undefined, borderRadiusType: undefined });
			}
		}
	}, []);

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

	const inlineStyles = {
		'--border-radius': boxValues( attributes.borderRadiusBox ),
		'--border-style': attributes.borderStyle,
		'--background-color': attributes.backgroundColor,
		'--border-color': attributes.borderColor,
		'--container-width': attributes.containerWidth,
		'--container-width-tablet': attributes.containerWidthTablet,
		'--container-width-mobile': attributes.containerWidthMobile,
		'--height': optionalUnit( attributes.height ),
		'--height-tablet': optionalUnit( attributes.heightTablet ),
		'--height-mobile': optionalUnit( attributes.heightMobile ),
		'--border-width': optionalUnit( attributes.borderWidth ),
		'--border-width-tablet': optionalUnit( attributes.borderWidthTablet ),
		'--border-width-mobile': optionalUnit( attributes.borderWidthMobile ),
		'--gap': optionalUnit( attributes.gap ),
		'--gap-tablet': optionalUnit( attributes.gapTablet ),
		'--gap-mobile': optionalUnit( attributes.gapMobile ),
		'--value-font-size': optionalUnit( attributes.valueFontSize ),
		'--value-font-size-tablet': optionalUnit( attributes.valueFontSizeTablet ),
		'--value-font-size-mobile': optionalUnit( attributes.valueFontSizeMobile ),
		'--label-font-size': optionalUnit( attributes.labelFontSize ),
		'--label-font-size-tablet': optionalUnit( attributes.labelFontSizeTablet ),
		'--label-font-size-mobile': optionalUnit( attributes.labelFontSizeMobile ),
		'--alignment': attributes.alignment,
		'--padding': boxValues( attributes.padding ),
		'--padding-tablet': boxValues( attributes.paddingTablet ),
		'--padding-mobile': boxValues( attributes.paddingMobile ),
		'--value-font-weight': attributes.valueFontWeight,
		'--label-font-weight': attributes.labelFontWeight
	};

	const [ cssNodeName, setCSS ] = useCSSNode();
	useEffect( ()=>{
		setCSS([
			`.otter-countdown__display-area .otter-countdown__value {
				color: ${ attributes.valueColor };
			}`,
			`.otter-countdown__display-area .otter-countdown__label {
				color: ${ attributes.labelColor };
			}`,
			`.otter-countdown__display-area[name="separator"] .otter-countdown__value {
				color: ${ attributes.separatorColor };
			}`
		]);
	}, [ attributes.valueColor, attributes.labelColor, attributes.separatorColor ]);


	const blockProps = useBlockProps({
		id: attributes.id,
		className: classNames( cssNodeName, 'ready' ),
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
