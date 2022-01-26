/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	Button
} from '@wordpress/components';

const FILTER_OPTIONS = {
	position: 'o-sticky-pos',
	offset: 'o-sticky-offset',
	scope: 'o-sticky-scope',
	behaviour: 'o-sticky-bhvr',
	usage: 'o-sticky-use'
};

const Edit = ({
	attributes,
	setAttributes,
	name
}) => {

	const position = attributes?.className?.includes( 'o-sticky-pos-bottom' ) ? 'o-sticky-pos-bottom' : 'o-sticky-pos-top';
	const limit = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-scope' ) ).pop() || 'o-sticky-scope-main-area';
	const behaviour = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-bhvr' ) ).pop() || 'o-sticky-bhvr-keep';
	const useOnMobile = Boolean( attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-use-mobile' ) ).pop() || false );

	const addOption = ( option, filterOption = FILTER_OPTIONS.position ) => {
		const classes = new Set( attributes?.className?.split( ' ' )?.filter( c =>  ! c.includes( filterOption ) ) || []);
		if ( option ) {
			classes.add( option );
		}
		setAttributes({ className: Array.from( classes ).join( ' ' ), hasCustomCSS: true });
	};

	const getOffsetValue = () => {
		return parseInt( attributes?.className
			?.split( ' ' )
			?.filter( c => c?.includes( 'o-sticky-offset' ) )
			?.reduce( ( acc, c ) =>{
				return c?.split( '-' )?.pop() || acc ;
			}, 40 ) );
	};

	/*
s		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset--40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-sticky o-sticky-pos-bottom o-sticky-pos-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Sticky', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Sticky To', 'otter-blocks' ) }
					help={ __( 'Stick to a group, columns, section block, or screen to limit the movement. The limit will differ from block to block, except for the blocks with the same parent.', 'otter-blocks' ) }
					value={ limit }
					options={ [
						{
							label: __( 'Top Level Block', 'otter-blocks' ),
							value: 'o-sticky-scope-main-area'
						},
						{
							label: __( 'Parent Block', 'otter-blocks' ),
							value: 'o-sticky-scope-parent'
						},
						{
							label: __( 'Section', 'otter-blocks' ),
							value: 'o-sticky-scope-section'
						},
						{
							label: __( 'Screen', 'otter-blocks' ),
							value: 'o-sticky-scope-screen'
						}
					] }
					onChange={ value => addOption( value, FILTER_OPTIONS.scope ) }
				/>

				<SelectControl
					label={ __( 'Position', 'otter-blocks' ) }
					help={ __( 'Stick the block to the top or the bottom of the screen. When using \'Bottom\', make sure that the element is closer or lower than the bottom of the screen when scroll is on the start position; use Preview to check.', 'otter-blocks' ) }
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
					onChange={ value => addOption(  value, FILTER_OPTIONS.position ) }
				/>

				<RangeControl
					label={ __( 'Offset', 'otter-blocks' ) }
					help={ __( 'Set the distance from the block to the screen when sticky mode is active. ', 'otter-blocks' ) }
					value={ getOffsetValue( ) }
					min={ 0 }
					max={ 500 }
					onChange={ value => addOption( `o-sticky-offset-${ value }`, FILTER_OPTIONS.offset ) }
				/>

				<SelectControl
					label={ __( 'Behaviour', 'otter-blocks' ) }
					help={ __( 'Set the action when multiple sticky blocks with the same movement limit collide. Check the \'Stick to\' since it can differ from block to block.', 'otter-blocks' ) }
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
					onChange={ value => addOption(  value, FILTER_OPTIONS.behaviour ) }
				/>

				{ 'o-sticky-bhvr-stack'  === behaviour && (
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
					help={ __( 'Make the sticky mode active for mobile users. Please check the functionality in Preview mode, some elements might not work properly' ) }
					checked={ useOnMobile }
					onChange={ () => addOption( 'o-sticky-use-mobile', FILTER_OPTIONS.usage ) }
				/>

				{

					// Add link to the documentation about this feature.
				}

				<Button
					isLink
					target='_blank'
					rel='noopener noreferrer'
					href="https://docs.themeisle.com/article/1478-otter-blocks-documentation"
				>
					{ __( 'Learn more about sticky', 'otter-blocks' ) }
				</Button>
			</PanelBody>
		</InspectorControls>
	);
};

export default Edit;
