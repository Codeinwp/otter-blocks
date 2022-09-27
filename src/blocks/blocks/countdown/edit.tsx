/**
 * External dependencies.
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	isEmpty,
	isNumber,
	pickBy
} from 'lodash';

import moment from 'moment';

import { useBlockProps } from '@wordpress/block-editor';

import { Notice } from '@wordpress/components';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';


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
	getTimezone
} from '../../helpers/helper-functions.js';
import DisplayTime from './components/display-time';
import { fromInterval, toTimer } from './common';
import { CountdownProps } from './types';

const { attributes: defaultAttributes } = metadata;

const optionalUnit = ( value: unknown, unit = 'px' ) => isNumber( value ) ? `${ value }${unit}` : value;

const Edit = ({
	attributes,
	setAttributes,
	clientId
}: CountdownProps ) => {
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
		let interval: ReturnType<typeof setInterval>;
		if ( 'timer' !== attributes.mode ) {
			interval = setInterval( () => {
				if ( attributes.date ) {
					const date = moment( attributes.date + getTimezone() ).unix() * 1000;
					setUnixTime( date - Date.now() );
				}
			}, 500 );
		}

		return () => {
			clearInterval( interval );
		};
	}, [ attributes.date, attributes.mode ]);

	const getTime = () => {
		switch ( attributes.mode ) {
		case 'timer':
			return toTimer( attributes.timer );
		case 'interval':
			return fromInterval( attributes.startInterval, attributes.endInterval );
		default:
			return unixTime;
		}
	};


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
			}`,
			'center' === attributes.separatorAlignment ? `
			.otter-countdown__display-area[name="separator"] .otter-countdown__label {
				display: none;
			}
			` : ''
		]);
	}, [ attributes.valueColor, attributes.labelColor, attributes.separatorColor, attributes.separatorAlignment ]);


	const blockProps = useBlockProps({

		// @ts-ignore
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
			{/* @ts-ignore */}
			<div { ...blockProps }>
				<DisplayTime
					time={ getTime() }
					settings={ { exclude: attributes?.exclude } }
					hasSeparators={ attributes.hasSeparators }
				/>

				{ 4 === attributes?.exclude?.length && (
					<Fragment>
						<br/>
						<Notice isDismissible={ false } status="info">
							{ __( 'The Countdown will be hidden in page', 'otter-blocks' ) }
						</Notice>
					</Fragment>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
