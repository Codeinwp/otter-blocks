/**
 * WordPress dependencies.
 */
import { Tooltip } from '@wordpress/components';
import { info } from '@wordpress/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './editor.scss';

const Notice = ({
	notice,
	variant = 'default',
	instructions,
	outsidePanel = false
}) => {
	return (
		<div className={classNames( 'o-notice', `is-${ variant }`, { 'is-outside-panel': outsidePanel })}>
			{ notice }

			{ instructions && (
				<Tooltip
					text={ instructions }
					position="bottom center"
				>
					{ info }
				</Tooltip>
			) }
		</div>
	);
};

export default Notice;
