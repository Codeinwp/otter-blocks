/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import './editor.scss';
import Field from './field.js';

const SizingControl = ({
	label,
	type,
	min,
	max,
	changeType,
	options,
	onChange
}) => {
	const instanceId = useInstanceId( SizingControl );

	const id = `inspector-sizing-control-${ instanceId }`;

	if ( options && 1 > options.length ) {
		return __( 'Please specify more options.', 'otter-blocks' );
	}

	return (
		<div
			id={ id }
			className="otter-sizing-control"
		>
			<div className="components-base-control__field">
				{ label && (
					<label
						className="components-base-control__label"
						htmlFor={ id }
					>
						{ label }
					</label>
				) }

				<div
					className={ classnames(
						'otter-sizing-control-wrapper',
						{ 'linking': type }
					) }
				>
					{ options.map( ( i, n ) => (
						<Field
							id={ instanceId }
							index={ i }
							option={ n }
							min={ min }
							max={ max }
							onChange={ onChange }
						/>
					) ) }

					{ type && (
						<div
							className={ classnames(
								'otter-sizing-control-item',
								'toggle-linking',
								{ 'is-linked': 'linked' === type }
							) }
						>
							<Button
								icon={ 'linked' === type ? 'admin-links' : 'editor-unlink' }
								label={ 'linked' === type ? __( 'Unlink Values', 'otter-blocks' ) : __( 'Link Values', 'otter-blocks' ) }
								showTooltip={ true }
								className="otter-sizing-control-item-input"
								onClick={ () => changeType( 'linked' === type ? 'unlinked' : 'linked' ) }
							/>
						</div>
					) }
				</div>
			</div>
		</div>
	);
};

export default SizingControl;
