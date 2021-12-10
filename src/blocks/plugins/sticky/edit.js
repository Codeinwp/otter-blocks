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
	scope: 'o-sticky-scope'
};

const Edit = ({
	attributes,
	setAttributes,
	name
}) => {

	const position = attributes?.className?.includes( 'o-sticky-pos-bottom' ) ? 'o-sticky-pos-bottom' : 'o-sticky-pos-top';
	const limit = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-scope' ) ).pop() || '';

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
			<Fragment>No support</Fragment>
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
						label={ __( 'Movement Limit', 'otter-blocks' ) }
						value={ limit }
						options={[
							{ label: __( 'None', 'otter-blocks' ), value: '' },
							{ label: __( 'Row', 'otter-blocks' ), value: 'o-sticky-scope-row' },
							{ label: __( 'Section', 'otter-blocks' ), value: 'o-sticky-scope-section' },
							{ label: __( 'Main Area', 'otter-blocks' ), value: 'o-sticky-scope-main-area' }
						]}
						onChange={ value => addOption(  value, FILTER_OPTIONS.scope ) }
					/>

					<SelectControl
						label={ __( 'Position', 'otter-blocks' ) }
						value={ position }
						options={[
							{ label: __( 'Top', 'otter-blocks' ), value: 'o-sticky-pos-top' },
							{ label: __( 'Bottom', 'otter-blocks' ), value: 'o-sticky-pos-bottom' }
						]}
						onChange={ value => addOption(  value, FILTER_OPTIONS.position ) }
					/>

					<RangeControl
						label={ __( 'Distance from screen', 'otter-blocks' ) }
						value={ getOffsetValue( ) }
						min={0}
						max={500}
						onChange={ value => addOption( `o-sticky-offset-${ value }`, FILTER_OPTIONS.offset ) }
					/>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
};

export default Edit;
