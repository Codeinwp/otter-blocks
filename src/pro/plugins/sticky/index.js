/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

const { Notice } = window.otterComponents;

const StickyControls = (
	Controls,
	attributes,
	FILTER_OPTIONS,
	addOption
) => {
	if ( ! Boolean( window.otterPro.isActive ) ) {
		return (
			<Fragment>
				{ Controls }

				<Notice
					notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-blocks' ) }
				/>
			</Fragment>
		);
	}

	const position = attributes?.className?.includes( 'o-sticky-pos-bottom' ) ? 'o-sticky-pos-bottom' : 'o-sticky-pos-top';
	const behaviour = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-bhvr' ) ).pop() || 'o-sticky-bhvr-keep';
	const useOnMobile = Boolean( attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-use-mobile' ) ).pop() || false );

	const getOffsetValue = () => {
		return parseInt( attributes?.className
			?.split( ' ' )
			?.filter( c => c?.includes( 'o-sticky-offset' ) )
			?.reduce( ( acc, c ) =>{
				return c?.split( '-' )?.pop() || acc ;
			}, 40 ) );
	};

	return (
		<Fragment>
			{ Boolean( window.otterPro.isExpired ) && (
				<Notice
					notice={ __( 'Otter Pro license has expired.', 'otter-blocks' ) }
					instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Sticky Extension.', 'otter-blocks' ) }
				/>
			) }

			<SelectControl
				label={ __( 'Position', 'otter-blocks' ) }
				help={ __( 'Position of the block in relation to the screen.', 'otter-blocks' ) }
				value={ position }
				options={ [
					{
						label: __( 'Top', 'otter-blocks' ),
						value: 'o-sticky-pos-top'
					},
					{
						label: __( 'Bottom', 'otter-blocks' ),
						value: 'o-sticky-pos-bottom'
					}
				] }
				onChange={ value => addOption( value, FILTER_OPTIONS.position ) }
			/>

			<RangeControl
				label={ __( 'Offset', 'otter-blocks' ) }
				help={ __( 'Distance from the block to the screen.', 'otter-blocks' ) }
				value={ getOffsetValue() }
				min={ 0 }
				max={ 500 }
				onChange={ value => addOption( `o-sticky-offset-${ value }`, FILTER_OPTIONS.offset ) }
			/>

			<SelectControl
				label={ __( 'Behaviour', 'otter-blocks' ) }
				help={ __( 'Behaviour when multiple sticky blocks with the same movement limit collide.', 'otter-blocks' ) }
				value={ behaviour }
				options={ [
					{
						label: __( 'Collapse', 'otter-blocks' ),
						value: 'o-sticky-bhvr-keep'
					},
					{
						label: __( 'Fade', 'otter-blocks' ),
						value: 'o-sticky-bhvr-hide'
					},
					{
						label: __( 'Stack', 'otter-blocks' ),
						value: 'o-sticky-bhvr-stack'
					}
				] }
				onChange={ value => addOption( value, FILTER_OPTIONS.behaviour ) }
			/>

			{ 'o-sticky-bhvr-stack' === behaviour && (
				<div
					style={ {
						backgroundColor: '#fdf8e6',
						borderRadius: '5px',
						padding: '10px',
						textAlign: 'justify'
					} }
				>
					{ __( 'The block will stack with other sticky elements with the same \'Stick To\' container, and Stack option in Behaviour. It works better with \'Stick to\' as Top Level Block or Screen.', 'otter-blocks' ) }
				</div>
			) }

			<ToggleControl
				label={ __( 'Enable on Mobile', 'otter-blocks' ) }
				help={ __( 'Make the sticky mode active for mobile users.' ) }
				checked={ useOnMobile }
				onChange={ () => addOption( 'o-sticky-use-mobile', FILTER_OPTIONS.usage ) }
			/>
		</Fragment>
	);
};

addFilter( 'otter.sticky.controls', 'themeisle-gutenberg/sticky-controls', StickyControls );
