/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';

import { hasBlockSupport } from '@wordpress/blocks';

import './editor.scss';

const FILTER_OPTIONS = {
	position: 'o-sticky-pos',
	offset: 'o-sticky-offset',
	scope: 'o-sticky-scope',
	behaviour: 'o-sticky-bhvr'
};

const Edit = ({
	attributes,
	setAttributes,
	name
}) => {

	const position = attributes?.className?.includes( 'o-sticky-pos-bottom' ) ? 'o-sticky-pos-bottom' : 'o-sticky-pos-top';
	const limit = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-scope' ) ).pop() || 'o-sticky-scope-main-area';
	const behaviour = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-bhvr' ) ).pop() || 'o-sticky-bhvr-keep';

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
		TODO: Make the values from the Inspector to be classes
		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset--40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-sticky o-sticky-pos-bottom o-sticky-pos-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	if ( ! hasBlockSupport( name, 'customClassName', true ) ) {
		return (
			<Fragment></Fragment>
		);
	}

	return (
		<Fragment>

			<InspectorControls>
				<PanelBody
					title={ __( 'Sticky', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Sticky to', 'otter-blocks' ) }
						help={ __( 'Stick to another group, column, section block.', 'otter-blocks' ) }
						value={ limit }
						options={[
							{ label: __( 'Default', 'otter-blocks' ), value: 'o-sticky-scope-main-area' },
							{ label: __( 'Parent', 'otter-blocks' ), value: 'o-sticky-scope-parent' },
							{ label: __( 'Section', 'otter-blocks' ), value: 'o-sticky-scope-section' },
							{ label: __( 'Screen', 'otter-blocks' ), value: 'o-sticky-scope-screen' }
						]}
						onChange={ value => addOption(  value, FILTER_OPTIONS.scope ) }
					/>

					<SelectControl
						label={ __( 'Position', 'otter-blocks' ) }
						help={ __( 'Stick the block to the top or the bottom of the screen.', 'otter-blocks' ) }
						value={ position }
						options={[
							{ label: __( 'Top', 'otter-blocks' ), value: 'o-sticky-pos-top' },
							{ label: __( 'Bottom', 'otter-blocks' ), value: 'o-sticky-pos-bottom' }
						]}
						onChange={ value => addOption(  value, FILTER_OPTIONS.position ) }
					/>

					<RangeControl
						label={ __( 'Offset', 'otter-blocks' ) }
						help={ __( 'Set the distance from the screen.', 'otter-blocks' ) }
						value={ getOffsetValue( ) }
						min={0}
						max={500}
						onChange={ value => addOption( `o-sticky-offset-${ value }`, FILTER_OPTIONS.offset ) }
					/>

					<SelectControl
						label={ __( 'Behaviour', 'otter-blocks' ) }
						help={ __( 'Set the action when multiple sticky blocks with the same movement limit collide.' ) }
						value={ behaviour }
						options={[
							{ label: __( 'Default', 'otter-blocks' ), value: 'o-sticky-bhvr-keep' },
							{ label: __( 'Hide', 'otter-blocks' ), value: 'o-sticky-bhvr-hide' }
						]}
						onChange={ value => addOption(  value, FILTER_OPTIONS.behaviour ) }
					/>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
};

export default Edit;
