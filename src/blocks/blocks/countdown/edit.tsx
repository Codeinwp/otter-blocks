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
	_percent,
	_px,
	boxValues,
	getTimezone
} from '../../helpers/helper-functions.js';
import DisplayTime from './components/display-time';
import { fromInterval, toTimer } from './common';
import { CountdownProps } from './types';

const { attributes: defaultAttributes } = metadata;

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
				{ left: _percent( attributes.borderRadius ), right: _percent( attributes.borderRadius ), bottom: _percent( attributes.borderRadius ), top: _percent( attributes.borderRadius ) } :
				{ left: _percent( attributes.borderRadiusBottomLeft ), right: _percent( attributes.borderRadiusTopRight ), bottom: _percent( attributes.borderRadiusBottomRight ), top: _percent( attributes.borderRadiusTopLeft ) }, x => x );

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
		'--height': _px( attributes.height ),
		'--height-tablet': _px( attributes.heightTablet ),
		'--height-mobile': _px( attributes.heightMobile ),
		'--border-width': _px( attributes.borderWidth ),
		'--border-width-tablet': _px( attributes.borderWidthTablet ),
		'--border-width-mobile': _px( attributes.borderWidthMobile ),
		'--gap': _px( attributes.gap ),
		'--gap-tablet': _px( attributes.gapTablet ),
		'--gap-mobile': _px( attributes.gapMobile ),
		'--value-font-size': _px( attributes.valueFontSize ),
		'--value-font-size-tablet': _px( attributes.valueFontSizeTablet ),
		'--value-font-size-mobile': _px( attributes.valueFontSizeMobile ),
		'--label-font-size': _px( attributes.labelFontSize ),
		'--label-font-size-tablet': _px( attributes.labelFontSizeTablet ),
		'--label-font-size-mobile': _px( attributes.labelFontSizeMobile ),
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
