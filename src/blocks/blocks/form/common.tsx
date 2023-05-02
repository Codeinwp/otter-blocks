// @ts-nocheck
import { __ } from '@wordpress/i18n';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption
} from '@wordpress/components';
import { changeActiveStyle, getActiveStyle } from '../../helpers/helper-functions';

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

export default { FieldInputWidth };
