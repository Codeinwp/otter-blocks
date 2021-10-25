/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ButtonGroup,
	Icon
} from '@wordpress/components';

import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import './editor.scss';

import { barcodeIcon } from '../../../../helpers/icons.js';

const BackgroundControl = ({
	label,
	backgroundType,
	changeBackgroundType
}) => {
	const instanceId = useInstanceId( BackgroundControl );

	const id = `inspector-background-control-${ instanceId }`;

	return (
		<div id={ id } className="components-base-control wp-block-themeisle-blocks-advanced-columns-background-control">
			<div className="components-base-control__field">
				<div className="components-base-control__title">
					<label className="components-base-control__label">{ label }</label>
					<ButtonGroup className="linking-controls">
						<Button
							icon={ 'admin-customizer' }
							label={ __( 'Color', 'otter-blocks' ) }
							showTootlip={ true }
							isPrimary={ 'color' === backgroundType }
							onClick={ () => changeBackgroundType( 'color' ) }
						/>

						<Button
							icon={ 'format-image' }
							label={ __( 'Image', 'otter-blocks' ) }
							showTootlip={ true }
							isPrimary={ 'image' === backgroundType }
							onClick={ () => changeBackgroundType( 'image' ) }
						/>

						<Button
							icon={ () => <Icon icon={ barcodeIcon } /> }
							label={ __( 'Gradient', 'otter-blocks' ) }
							showTootlip={ true }
							isPrimary={ 'gradient' === backgroundType }
							onClick={ () => changeBackgroundType( 'gradient' ) }
						/>
					</ButtonGroup>
				</div>
			</div>
		</div>
	);
};

export default BackgroundControl;
