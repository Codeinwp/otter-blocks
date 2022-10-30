/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { insertBetweenItems } from '../../../helpers/helper-functions.js';
import { getIntervalFromUnix } from '../common';

const DisplayTimeComponent = ({
	name,
	value,
	tag
}: {
	name: string,
	value: string,
	tag: string
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
			<div
				className="otter-countdown__value"
			>
				{ value }
			</div>
			<div
				className="otter-countdown__label"
			>
				{ name }
			</div>
		</div>
	);
};

const DisplayTime = ({
	time,
	settings,
	hasSeparators
}: {
	time?: number,
	settings?: { exclude?: string[]},
	hasSeparators?: boolean
}) => {

	const timesComponents = 4 === settings?.exclude?.length ? getIntervalFromUnix( time ?? 0, {}) : getIntervalFromUnix( time ?? 0, { exclude: settings?.exclude });


	const elemToDisplay = hasSeparators ?
		insertBetweenItems( timesComponents, {
			name: 'sep',
			value: ':',
			tag: 'separator'
		}) :
		timesComponents;

	const renderElem = elemToDisplay?.map( ( elem, key ) => (
		<DisplayTimeComponent { ...elem } key={ key } />
	) );

	return (
		<div className="otter-countdown__container">
			{
				time !== undefined && (
					<div className="otter-countdown__display">{ renderElem }</div>
				)
			}
		</div>
	);

};

export default DisplayTime;
