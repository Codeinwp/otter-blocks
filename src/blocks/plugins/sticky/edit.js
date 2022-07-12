/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Notice from '../../components/notice/index.js';

const FILTER_OPTIONS = {
	position: 'o-sticky-pos',
	offset: 'o-sticky-offset',
	scope: 'o-sticky-scope',
	behaviour: 'o-sticky-bhvr',
	usage: 'o-sticky-use'
};

const ProFeatures = () => {
	return (
		<Fragment>
			<SelectControl
				label={ __( 'Position', 'otter-blocks' ) }
				help={ __( 'Position of the block in relation to the screen.', 'otter-blocks' ) }
				value="o-sticky-pos-top"
				options={ [
					{
						label: __( 'Top', 'otter-blocks' ),
						value: 'o-sticky-pos-top'
					},
					{
						label: __( 'Bottom (Pro)', 'otter-blocks' ),
						value: 'o-sticky-pos-bottom',
						disabled: true
					}
				] }
				onChange={ () => {} }
			/>

			<RangeControl
				label={ __( 'Offset', 'otter-blocks' ) }
				help={ __( 'Distance from the block to the screen.', 'otter-blocks' ) }
				disabled={ true }
				value={ 0 }
				min={ 0 }
				max={ 500 }
				onChange={ () => {} }
			/>

			<SelectControl
				label={ __( 'Behaviour', 'otter-blocks' ) }
				help={ __( 'Behaviour when multiple sticky blocks with the same movement limit collide.', 'otter-blocks' ) }
				value="o-sticky-bhvr-keep"
				options={ [
					{
						label: __( 'Collapse (Pro)', 'otter-blocks' ),
						value: 'o-sticky-bhvr-keep'
					},
					{
						label: __( 'Fade (Pro)', 'otter-blocks' ),
						value: 'o-sticky-bhvr-hide',
						disabled: true
					},
					{
						label: __( 'Stack (Pro)', 'otter-blocks' ),
						value: 'o-sticky-bhvr-stack',
						disabled: true
					}
				] }
				onChange={ () => {} }
			/>

			<ToggleControl
				label={ __( 'Enable on Mobile', 'otter-blocks' ) }
				help={ __( 'Make the sticky mode active for mobile users.' ) }
				disabled={ true }
				checked={ false }
				onChange={ () => {} }
			/>

			{ ! Boolean( window.themeisleGutenberg.hasPro ) && (
				<Notice
					notice={ <ExternalLink href={ window.themeisleGutenberg.upgradeLink }>{ __( 'Get more options with Otter Pro.', 'otter-blocks' ) }</ExternalLink> }
					variant="upsell"
				/>
			) }
		</Fragment>
	);
};

const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	const [ containerOptions, setContainerOptions ] = useState([ {
		label: __( 'Screen', 'otter-blocks' ),
		value: 'o-sticky-scope-screen'
	} ]);

	/*
		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset--40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-sticky o-sticky-pos-bottom o-sticky-pos-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	const limit = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-scope' ) ).pop() || 'o-sticky-scope-main-area';

	const addOption = ( option, filterOption = FILTER_OPTIONS.position ) => {
		const classes = new Set( attributes?.className?.split( ' ' )?.filter( c =>  ! c.includes( filterOption ) ) || []);
		if ( option ) {
			classes.add( option );
		}
		setAttributes({ className: Array.from( classes ).join( ' ' ) });
	};

	useEffect( () => {
		if ( clientId ) {
			const block = document.querySelector( `#block-${ clientId }` );
			if ( block ) {
				let parent = block?.parentElement;
				const containers = [];
				const options = [];
				while ( parent && ! parent.classList.contains( 'is-root-container' ) ) {
					if (
						(
							parent.classList.contains( 'wp-block-themeisle-blocks-advanced-column' ) ||
							parent.classList.contains( 'wp-block-group' ) ||
							parent.classList.contains( 'wp-block-column' )
						)
					) {
						containers.push( 'parent' );
					}

					if (
						(
							parent.classList.contains( 'wp-block-themeisle-blocks-advanced-columns' ) ||
							parent.classList.contains( 'wp-block-group' ) ||
							parent.classList.contains( 'wp-block-columns' )
						)
					) {
						containers.push( 'section' );
					}

					parent = parent.parentElement;
				}

				if ( containers.some( x => 'section' === x ) ) {
					options.push({
						label: __( 'Top Level Block', 'otter-blocks' ),
						value: 'o-sticky-scope-main-area'
					});

					if ( 1 < containers.filter( x => 'section' === x ) ) {
						options.push({
							label: __( 'Section', 'otter-blocks' ),
							value: 'o-sticky-scope-section'
						});
					}
				}

				if ( containers.some( x => 'parent' === x ) ) {
					options.push({
						label: __( 'Parent Block', 'otter-blocks' ),
						value: 'o-sticky-scope-parent'
					});
				}

				options.push({
					label: __( 'Screen', 'otter-blocks' ),
					value: 'o-sticky-scope-screen'
				});

				setContainerOptions( options );
			}
		}
	}, [ clientId ]);

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Sticky', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<p>{ __( 'Bind page elements with dynamic data from your website database.', 'otter-blocks' ) }</p>

				<ExternalLink
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.themeisle.com/article/1529-how-to-make-a-block-sticky"
				>
					{ __( 'Learn more about Sticky', 'otter-blocks' ) }
				</ExternalLink>

				<SelectControl
					label={ __( 'Sticky To', 'otter-blocks' ) }
					help={ __( 'Select the parent element for the sticky block.', 'otter-blocks' ) }
					value={ limit }
					options={ containerOptions }
					onChange={ value => addOption( value, FILTER_OPTIONS.scope ) }
				/>

				{ applyFilters( 'otter.sticky.controls', <ProFeatures />, attributes, FILTER_OPTIONS, addOption ) }

				{ applyFilters( 'otter.poweredBy', '' ) }
			</PanelBody>
		</InspectorControls>
	);
};

export default Edit;
