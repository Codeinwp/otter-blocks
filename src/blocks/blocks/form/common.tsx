import { omit } from 'lodash';

import { ToggleControl } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';

import { changeActiveStyle, getActiveStyle, getChoice } from '../../helpers/helper-functions';
import { FormInputProps } from './input/types';
import { BlockProps } from '../../helpers/blocks';

export type FieldOption = {
	fieldOptionName: string
	fieldOptionType: string
	options: {
		maxFileSize?: number | string
		allowedFileTypes?: string[]
		saveFiles?: string
		maxFilesNumber?: number
	}
}

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

export const hasFormFieldName = ( name?: string ) => ( name?.startsWith( 'themeisle-blocks/form-input' ) || name?.startsWith( 'themeisle-blocks/form-textarea' ) || name?.startsWith( 'themeisle-blocks/form-multiple-choice' ) );

export const getFormFieldsFromInnerBlock = ( block: any ) : ( any | undefined )[] => {
	return block?.innerBlocks?.map( ( child: any ) => {
		if ( hasFormFieldName( child?.name ) ) {
			return child as string;
		}

		if ( 'themeisle-blocks/form' === child?.name ) {
			return undefined;
		}

		if ( child?.innerBlocks?.length ) {
			return getFormFieldsFromInnerBlock( child )?.flat() as ( string | undefined )[];
		}

		return undefined;
	})?.flat();
};

export const selectAllFieldsFromForm = ( children: any[]) : ({ parentClientId: string, inputField: any })[] => {
	return ( children?.map( ( child: any ) => {

		if ( hasFormFieldName( child?.name ) ) {
			return { parentClientId: child?.clientId, inputField: child.clientId };
		}

		if ( 'themeisle-blocks/form' === child?.name ) {
			return undefined;
		}

		if ( child?.innerBlocks?.length ) {
			return getFormFieldsFromInnerBlock( child )
				.filter( i => i !== undefined )
				.map( ( input: any ) => ({ parentClientId: child?.clientId, inputField: input }) );
		}

		return undefined;
	}).flat().filter( c => c !== undefined ) ?? []) as ({ parentClientId: string, inputField: any })[];
};

export default { switchFormFieldTo, HideFieldLabelToggle };
