import { addFilter } from '@wordpress/hooks';
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const ANIMATION_OPTIONS = [
	{ label: __( 'None', 'atomic-wind' ), value: '' },
	{ label: __( 'Fade In', 'atomic-wind' ), value: 'fade-in' },
	{ label: __( 'Slide Up', 'atomic-wind' ), value: 'slide-up' },
	{ label: __( 'Slide Down', 'atomic-wind' ), value: 'slide-down' },
	{ label: __( 'Slide Left', 'atomic-wind' ), value: 'slide-left' },
	{ label: __( 'Slide Right', 'atomic-wind' ), value: 'slide-right' },
	{ label: __( 'Zoom In', 'atomic-wind' ), value: 'zoom-in' },
	{ label: __( 'Count Up', 'atomic-wind' ), value: 'count-up' },
];

const DELAY_OPTIONS = [
	{ label: __( '0ms', 'atomic-wind' ), value: '0' },
	{ label: __( '100ms', 'atomic-wind' ), value: '100' },
	{ label: __( '200ms', 'atomic-wind' ), value: '200' },
	{ label: __( '300ms', 'atomic-wind' ), value: '300' },
	{ label: __( '400ms', 'atomic-wind' ), value: '400' },
	{ label: __( '500ms', 'atomic-wind' ), value: '500' },
];

addFilter(
	'blocks.registerBlockType',
	'atomic-wind/animation-attributes',
	( settings ) => {
		if ( settings.category !== 'atomic-wind' ) {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				animation: {
					type: 'string',
					default: '',
				},
				animationDelay: {
					type: 'string',
					default: '',
				},
			},
		};
	}
);

export function AnimationControls( { attributes, setAttributes } ) {
	const { animation, animationDelay } = attributes;

	return (
		<div className="aw-ce-tab-content">
			<SelectControl
				label={ __( 'Animation Type', 'atomic-wind' ) }
				value={ animation || '' }
				options={ ANIMATION_OPTIONS }
				onChange={ ( value ) =>
					setAttributes( {
						animation: value,
						animationDelay: value ? animationDelay : '',
					} )
				}
				help={ __(
					'Animation is visible on the frontend only.',
					'atomic-wind'
				) }
			/>
			{ animation && (
				<SelectControl
					label={ __( 'Delay', 'atomic-wind' ) }
					value={ animationDelay || '0' }
					options={ DELAY_OPTIONS }
					onChange={ ( value ) =>
						setAttributes( { animationDelay: value } )
					}
				/>
			) }
		</div>
	);
}

addFilter(
	'blocks.getSaveContent.extraProps',
	'atomic-wind/animation-save-props',
	( extraProps, blockType, attributes ) => {
		if ( blockType.category !== 'atomic-wind' ) {
			return extraProps;
		}

		if ( attributes.animation ) {
			extraProps[ 'data-animation' ] = attributes.animation;

			if ( attributes.animationDelay && attributes.animationDelay !== '0' ) {
				extraProps[ 'data-animation-delay' ] = attributes.animationDelay;
			}

		}

		return extraProps;
	}
);
