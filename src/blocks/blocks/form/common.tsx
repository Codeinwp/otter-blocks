import { omit } from 'lodash';

import { ToggleControl } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';

import { changeActiveStyle, getActiveStyle, getChoice } from '../../helpers/helper-functions';
import { FormInputProps } from './input/types';
import { BlockProps } from '../../helpers/blocks';

export type FormInputCommonProps = {
	id: string
	label: string
	placeholder: string
	isRequired: boolean
	mappedName: string
	labelColor: string
	helpText: string
}

export const switchFormFieldTo = ( type?: string, clientId ?:string, attributes?: any ) => {

	if ( ! type || ! clientId || ! attributes ) {
		return;
	}

	const { replaceBlock } = dispatch( 'core/block-editor' );

	const blockName = getChoice([
		[ 'textarea' === type, 'form-textarea' ],
		[ 'select' === type || 'checkbox' === type || 'radio' === type, 'form-multiple-choice' ],
		[ 'form-input' ]
	]);


	const newBlock = createBlock( `themeisle-blocks/${ blockName }`,
		omit({ ...attributes, type: type }, 'form-textarea' === blockName ? [ 'multipleSelection', 'options', 'type' ] : [ 'multipleSelection', 'options' ])
	);

	replaceBlock( clientId, newBlock );
};

const stylesHide = [
	{
		label: '',
		value: 'hidden-label'
	}
];

export const HideFieldLabelToggle = ( props: Partial<BlockProps<FormInputCommonProps>> ) => {

	const { attributes, setAttributes } = props;

	return (

		// @ts-ignore
		<ToggleControl
			label={ __( 'Hide Label', 'otter-blocks' ) }
			checked={ Boolean( getActiveStyle( stylesHide, attributes?.className ) ) }
			onChange={ value => {
				const classes = changeActiveStyle( attributes?.className, stylesHide, value ? 'hidden-label' : undefined );
				setAttributes?.({ className: classes });
			} }
		/>
	);
};

export default { switchFormFieldTo, HideFieldLabelToggle };
