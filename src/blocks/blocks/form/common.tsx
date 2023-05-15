import { __ } from '@wordpress/i18n';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	ToggleControl
} from '@wordpress/components';
import { omit } from 'lodash';
import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';

import { BlockProps } from '../../helpers/blocks';
import { changeActiveStyle, getActiveStyle, getChoice } from '../../helpers/helper-functions';

export const FieldInputWidth = ( props ) => {

	const options = props?.options ?? [
		{ value: 'full', label: __( '100%', 'otter-blocks' ), isDefault: true },
		{ value: 'o-c-three-quarters', label: __( '75%', 'otter-blocks' ) },
		{ value: 'o-c-two-thirds', label: __( '66%', 'otter-blocks' ) },
		{ value: 'o-c-half', label: __( '50%', 'otter-blocks' ) },
		{ value: 'o-c-one-third', label: __( '33%', 'otter-blocks' ) },
		{ value: 'o-c-one-quarter', label: __( '25%', 'otter-blocks' ) }
	];

	const value = props?.value ?? getActiveStyle( options, props?.attributes?.className );

	const onChange = props?.onChange ?? ( ( value: string ) => {
		let newStyle = value;
		if ( 'full' === value ) {
			newStyle = undefined;
		}

		const classes = changeActiveStyle( props?.attributes?.className, options, newStyle );
		props?.setAttributes({ className: classes });
	});

	return (
		<ToggleGroupControl
			label={ props.label ?? __( 'Width', 'otter-blocks' ) }
			value={ value  }
			onChange={ onChange }
			isBlock
		>
			{
				options.map( ( option ) => {
					return (
						<ToggleGroupControlOption
							key={ option.value }
							value={ option.value }
							label={ option.label }
						/>
					);
				})
			}
		</ToggleGroupControl>
	);
};

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

export const fieldTypesOptions = () => ([
	{
		label: __( 'Checkbox', 'otter-blocks' ),
		value: 'checkbox'
	},
	{
		label: __( 'Date', 'otter-blocks' ),
		value: 'date'
	},
	{
		label: __( 'Email', 'otter-blocks' ),
		value: 'email'
	},
	{
		label: ( Boolean( window.otterPro?.isActive ) && ! Boolean( window.otterPro?.isExpired ) ) ? __( 'File', 'otter-blocks' ) : __( 'File (Pro)', 'otter-blocks' ),
		value: 'file'
	},
	{
		label: __( 'Number', 'otter-blocks' ),
		value: 'number'
	},
	{
		label: __( 'Radio', 'otter-blocks' ),
		value: 'radio'
	},
	{
		label: __( 'Select', 'otter-blocks' ),
		value: 'select'
	},
	{
		label: __( 'Text', 'otter-blocks' ),
		value: 'text'
	},
	{
		label: __( 'Textarea', 'otter-blocks' ),
		value: 'textarea'
	},
	{
		label: __( 'Url', 'otter-blocks' ),
		value: 'url'
	}
]);

export const switchFormFieldTo = ( type?: string, clientId ?:string, attributes?: any ) => {

	if ( ! type || ! clientId || ! attributes ) {
		return;
	}

	const { replaceBlock } = dispatch( 'core/block-editor' );

	const blockName = getChoice([
		[ 'textarea' === type, 'form-textarea' ],
		[ 'select' === type || 'checkbox' === type || 'radio' === type, 'form-multiple-choice' ],
		[ 'file' === type, 'form-file' ],
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

export const hasFormFieldName = ( name?: string ) => ( name?.startsWith( 'themeisle-blocks/form-input' ) || name?.startsWith( 'themeisle-blocks/form-textarea' ) || name?.startsWith( 'themeisle-blocks/form-multiple-choice' ) || name?.startsWith( 'themeisle-blocks/form-file' ) );

export const getFormFieldsFromInnerBlock = ( block: any ) : ( any | undefined )[] => {
	return block?.innerBlocks?.map( ( child: any ) => {
		if ( hasFormFieldName( child?.name ) ) {
			return child;
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
			return { parentClientId: child?.clientId, inputField: child };
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

export default { switchFormFieldTo, HideFieldLabelToggle, FieldInputWidth };
