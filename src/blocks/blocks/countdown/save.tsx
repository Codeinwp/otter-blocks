/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	insertBetweenItems
} from '../../helpers/helper-functions.js';
import { getIntervalFromUnix, timerSerialization } from './common';
import { isEmpty } from 'lodash';

const DisplayTimeComponent = ({
	name,
	value,
	tag
}) => {
	return (
		<div

			// @ts-ignore . Adding `name` as identifier was not an inspiered choice.
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

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		'data-date': attributes.date,
		'data-bhv': attributes.behaviour ? attributes.behaviour : undefined,
		'data-redirect-link': 'redirectLink' === attributes.behaviour && attributes.redirectLink ? attributes.redirectLink : undefined,
		'data-mode': attributes.mode ? attributes.mode : undefined,
		'data-timer': ! isEmpty( attributes.timer ) ? timerSerialization( attributes.timer ) : undefined
	});

	return (
		<div { ...blockProps }>
			<DisplayTime
				time={ getIntervalFromUnix( 0, { exclude: attributes?.exclude }) }
				hasSeparators={ attributes?.hasSeparators }
			/>
		</div>
	);
};

export default Save;
