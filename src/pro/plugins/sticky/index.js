/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
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
					notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-pro' ) }
				/>
			</Fragment>
		);
	}

	const isActive = attributes?.className?.includes( FILTER_OPTIONS.float );
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
					notice={ __( 'Otter Pro license has expired.', 'otter-pro' ) }
					instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Sticky Extension.', 'otter-pro' ) }
				/>
			) }

			<SelectControl
				label={ __( 'Position', 'otter-pro' ) }
				help={ __( 'Position of the block in relation to the screen.', 'otter-pro' ) }
				value={ position }
				options={ [
					{
						label: __( 'Top', 'otter-pro' ),
						value: 'o-sticky-pos-top'
					},
					{
						label: __( 'Bottom', 'otter-pro' ),
						value: 'o-sticky-pos-bottom'
					}
				] }
				onChange={ value => addOption( value, FILTER_OPTIONS.position ) }
			/>

			<RangeControl
				label={ __( 'Offset', 'otter-pro' ) }
				help={ __( 'Distance from the block to the screen.', 'otter-pro' ) }
				value={ getOffsetValue() }
				min={ 0 }
				max={ 500 }
				onChange={ value => addOption( `o-sticky-offset-${ value }`, FILTER_OPTIONS.offset ) }
			/>

			<SelectControl
				label={ __( 'Behaviour', 'otter-pro' ) }
				help={ __( 'Behaviour when multiple sticky blocks with the same movement limit collide.', 'otter-pro' ) }
				value={ behaviour }
				options={ [
					{
						label: __( 'Collapse', 'otter-pro' ),
						value: 'o-sticky-bhvr-keep'
					},
					{
						label: __( 'Fade', 'otter-pro' ),
						value: 'o-sticky-bhvr-hide'
					},
					{
						label: __( 'Stack', 'otter-pro' ),
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
					{ __( 'The block will stack with other sticky elements with the same \'Stick To\' container, and Stack option in Behavior. It works better with \'Stick to\' as Top Level Block or Screen.', 'otter-pro' ) }
				</div>
			) }

			<ToggleControl
				label={ __( 'Enable on Mobile', 'otter-pro' ) }
				help={ __( 'Make the sticky mode active for mobile users.', 'otter-pro'  ) }
				checked={ useOnMobile }
				onChange={ ( value ) => addOption( value ? 'o-sticky-use-mobile' : undefined, FILTER_OPTIONS.usage ) }
			/>

			{
				isActive && (
					<BaseControl
						label={ __( 'Closing the Sticky', 'otter-pro' ) }
					>
						<p>
							{ __( 'You can make another block that is inside the sticky element to behave like a closing button by adding the following CSS class.', 'otter-pro'  )}
						</p>
						<code style={{ display: 'block', padding: '10px', marginBottom: '5px' }}>
							{ 'o-sticky-close' }
						</code>
						<p>
							{ __( 'You can transform a Button into a Close button by inserting the following anchor.', 'otter-pro' )}
						</p>
						<code style={{ display: 'block', padding: '10px' }}>
							{ '#o-sticky-close' }
						</code>
					</BaseControl>
				)
			}
		</Fragment>
	);
};

addFilter( 'otter.sticky.controls', 'themeisle-gutenberg/sticky-controls', StickyControls );
