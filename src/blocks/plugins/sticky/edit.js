/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

import './editor.scss';

const Edit = ({
	attributes,
	children
}) => {

	const isContainer = attributes.className.includes( 'o-is-sticky-container' );

	// TODO: add function to add the classes to the block

	/*
		TODO: Make the values from the Inspector to be classes
		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset-top-40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-is-sticky o-sticky-pos-bottom o-sticky-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Sticky', 'otter-blocks' ) }
					initialOpen={ false }
				>
					WIP
				</PanelBody>
			</InspectorControls>
			<div className="o-sticky-highlight">
				<div className="o-sticky-badge">
					{
						isContainer ? __( 'Sticky Container' ) : __( 'Sticky Element' )
					}
				</div>
				{children}
			</div>
		</Fragment>
	);
};

export default Edit;
