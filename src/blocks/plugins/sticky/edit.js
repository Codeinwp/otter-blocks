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

	const position = attributes?.className?.includes( 'o-sticky-pos-bottom' ) ? 'o-sticky-pos-bottom' : 'o-sticky-pos-top';
	const limit = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-scope' ) ).pop() || 'o-sticky-scope-main-area';
	const behaviour = attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-bhvr' ) ).pop() || 'o-sticky-bhvr-keep';
	const useOnMobile = Boolean( attributes?.className?.split( ' ' ).filter( c => c.includes( 'o-sticky-use-mobile' ) ).pop() || false );
	const hasPro = window?.themeisleGutenberg?.hasNeveSupport?.hasNevePro && window?.themeisleGutenberg?.hasNeveSupport?.isBoosterActive;

	const addOption = ( option, filterOption = FILTER_OPTIONS.position ) => {
		const classes = new Set( attributes?.className?.split( ' ' )?.filter( c =>  ! c.includes( filterOption ) ) || []);
		if ( option ) {
			classes.add( option );
		}
		setAttributes({ className: Array.from( classes ).join( ' ' ) });
	};

	const getOffsetValue = () => {
		return parseInt( attributes?.className
			?.split( ' ' )
			?.filter( c => c?.includes( 'o-sticky-offset' ) )
			?.reduce( ( acc, c ) =>{
				return c?.split( '-' )?.pop() || acc ;
			}, 40 ) );
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
				<SelectControl
					label={ __( 'Sticky To', 'otter-blocks' ) }
					help={ __( 'Select the parent element for the sticky block.', 'otter-blocks' ) }
					value={ limit }
					options={ containerOptions }
					onChange={ value => addOption( value, FILTER_OPTIONS.scope ) }
				/>

				{ window?.themeisleGutenberg?.hasNeveSupport?.hasNeve && (
					<Fragment>
						{ ! hasPro && (
							<ExternalLink
								href={ window.themeisleGutenberg.upgradeLink }
								target="_blank"
							>
								{ __( 'Enable more options with Otter Pro.', 'otter-blocks' ) }
							</ExternalLink>
						) }

						<SelectControl
							label={ __( 'Position', 'otter-blocks' ) }
							help={ __( 'Position of the block in relation to the screen.', 'otter-blocks' ) }
							disabled={ ! hasPro }
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
							disabled={ ! hasPro }
							value={ getOffsetValue( ) }
							min={ 0 }
							max={ 500 }
							onChange={ value => addOption( `o-sticky-offset-${ value }`, FILTER_OPTIONS.offset ) }
						/>

						<SelectControl
							label={ __( 'Behaviour', 'otter-blocks' ) }
							help={ __( 'Behaviour when multiple sticky blocks with the same movement limit collide.', 'otter-blocks' ) }
							disabled={ ! hasPro }
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
							disabled={ ! hasPro }
							checked={ useOnMobile }
							onChange={ () => addOption( 'o-sticky-use-mobile', FILTER_OPTIONS.usage ) }
						/>
					</Fragment>
				) }

				{

					// Add link to the documentation about this feature.
				}

				<ExternalLink
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.themeisle.com/article/1478-otter-blocks-documentation"
				>
					{ __( 'Learn more about Sticky', 'otter-blocks' ) }
				</ExternalLink>
			</PanelBody>
		</InspectorControls>
	);
};

export default Edit;
