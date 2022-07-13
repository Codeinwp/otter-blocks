/**
 * External dependencies
 */
import classnames from 'classnames';
import { useBlockProps } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import {
	getIntervalFromUnix,
	insertBetweenItems
} from '../../helpers/helper-functions.js';
import { omit } from 'lodash';

const { attributes } = metadata;

const deprecated = [ {
	attributes: {
		...attributes,
		'borderRadiusTopRight': {
			'type': 'number'
		},
		'borderRadiusTopLeft': {
			'type': 'number'
		},
		'borderRadiusBottomRight': {
			'type': 'number'
		},
		'borderRadiusBottomLeft': {
			'type': 'number'
		},
		'borderRadiusType': {
			'type': 'string',
			'default': 'linked'
		}
	},

	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},

	migrate: oldAttributes => {

		const optionalUnit = x => isNumber( x ) ? x + '%' : x;

		const borderRadius = 'linked' === attributes.borderRadiusType ?
			{ left: optionalUnit( attributes.borderRadius ), right: optionalUnit( attributes.borderRadius ), bottom: optionalUnit( attributes.borderRadius ), top: optionalUnit( attributes.borderRadius ) } :
			{ left: optionalUnit( attributes.borderRadiusBottomLeft ), right: optionalUnit( attributes.borderRadiusTopRight ), bottom: optionalUnit( attributes.borderRadiusBottomRight ), top: optionalUnit( attributes.borderRadiusTopLeft ) };
		oldAttributes.borderRadius = borderRadius;

		return omit( oldAttributes, [ 'borderRadiusBottomLeft', 'borderRadiusTopRight', 'borderRadiusBottomRight', 'borderRadiusTopLeft', 'borderRadiusType' ]);
	},

	isEligible: ({ borderRadius }) => borderRadius && 'number' === typeof borderRadius,

	save: ({ attributes }) => {
		const DisplayTimeComponent = ({
			name,
			value,
			tag
		}) => {
			return (
				<div
					name={ tag }
					className={ classnames(
						'otter-countdown__display-area',
						{
							'is-main-component': 'separator' !== tag
						}
					) }
				>
					<div className="otter-countdown__value">{ value }</div>
					<div className="otter-countdown__label">{ name }</div>
				</div>
			);
		};

		const DisplayTime = ({
			time,
			hasSeparators
		}) => {
			const elemToDisplay = hasSeparators ? insertBetweenItems( time, { name: 'sep', value: ':', tag: 'separator' }) : time;

			const renderElem = elemToDisplay?.map( ( elem, key ) => <DisplayTimeComponent { ...elem } key={ key } /> );

			return time !== undefined ? (
				<div className="otter-countdown__container">
					<div className="otter-countdown__display">
						{ renderElem }
					</div>
				</div>
			) : (
				<Fragment></Fragment>
			);
		};

		const blockProps = useBlockProps.save({
			id: attributes.id,
			'data-date': attributes.date
		});

		return (
			<div { ...blockProps }>
				<DisplayTime
					time={ getIntervalFromUnix( 0, { exclude: attributes?.exclude }) }
					hasSeparators={ attributes?.hasSeparators }
				/>
			</div>
		);
	}
} ];

export default deprecated;
