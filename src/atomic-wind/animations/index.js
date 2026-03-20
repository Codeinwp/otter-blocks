import { addFilter } from '@wordpress/hooks';
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const ANIMATION_OPTIONS = [
	{ label: __( 'None', 'otter-blocks' ), value: '' },
	{ label: __( 'Fade In', 'otter-blocks' ), value: 'fade-in' },
	{ label: __( 'Slide Up', 'otter-blocks' ), value: 'slide-up' },
	{ label: __( 'Slide Down', 'otter-blocks' ), value: 'slide-down' },
	{ label: __( 'Slide Left', 'otter-blocks' ), value: 'slide-left' },
	{ label: __( 'Slide Right', 'otter-blocks' ), value: 'slide-right' },
	{ label: __( 'Zoom In', 'otter-blocks' ), value: 'zoom-in' },
	{ label: __( 'Count Up', 'otter-blocks' ), value: 'count-up' },
];

const DELAY_OPTIONS = [
	{ label: __( '0ms', 'otter-blocks' ), value: '0' },
	{ label: __( '100ms', 'otter-blocks' ), value: '100' },
	{ label: __( '200ms', 'otter-blocks' ), value: '200' },
	{ label: __( '300ms', 'otter-blocks' ), value: '300' },
	{ label: __( '400ms', 'otter-blocks' ), value: '400' },
	{ label: __( '500ms', 'otter-blocks' ), value: '500' },
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
				label={ __( 'Animation Type', 'otter-blocks' ) }
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
					'otter-blocks'
				) }
			/>
			{ animation && (
				<SelectControl
					label={ __( 'Delay', 'otter-blocks' ) }
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
