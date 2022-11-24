/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,

	// @ts-ignore
	__experimentalUnitControl as UnitContol
} from '@wordpress/components';

import {
	dispatch,
	useSelect
} from '@wordpress/data';

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
import { useInspectorSlot } from '../../components/inspector-slot-fill/index.js';
import { setUtm } from '../../helpers/helper-functions.js';
import { BlockProps, OtterBlock } from '../../helpers/blocks.js';

const FILTER_OPTIONS = {
	position: 'o-sticky-pos',
	offset: 'o-sticky-offset',
	scope: 'o-sticky-scope',
	behaviour: 'o-sticky-bhvr',
	usage: 'o-sticky-use',
	float: 'o-sticky-float',
	width: 'o-sticky-width',
	side: 'o-sticky-side',
	sideOffset: 'o-sticky-opt-side-offset',
	bannerMode: 'o-sticky-banner-mode',
	bannerGap: 'o-sticky-banner-gap'
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
						label: __( 'Collapse', 'otter-blocks' ),
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

				// @ts-ignore
				disabled={ true }
				checked={ false }
				onChange={ () => {} }
			/>

			{ ! Boolean( window.themeisleGutenberg?.hasPro ) && (
				<Notice
					notice={<ExternalLink href={setUtm( window.themeisleGutenberg.upgradeLink, 'stickyfeature' )}>{__( 'Get more options with Otter Pro.', 'otter-blocks' )}</ExternalLink>}
					variant="upsell" instructions={undefined}				/>
			) }
		</Fragment>
	);
};

const AlwaysActiveOption = (
	{ className, clientId, addOption, removeOptions }
	: {
		className: string | undefined,
		clientId: string,
		addOption: ( option: string | undefined, filterOption: string ) => void,
		removeOptions: ( filtersOption: string[]) => void
	}
) => {
	const { isRootBlock, activeFloatBlocks } = useSelect( select => {
		const { getBlocks } = select( 'core/block-editor' );

		// @ts-ignore
		const pageBlocks: OtterBlock<unknown>[] = getBlocks();

		return {
			isRootBlock: pageBlocks?.some( ( block ) => block.clientId === clientId ) ?? false,
			activeFloatBlocks: pageBlocks?.filter( ( block ) => block.clientId !== clientId && block?.attributes?.className?.includes( FILTER_OPTIONS.float ) ) ?? []
		};
	}, []);

	const isActive = className?.includes( FILTER_OPTIONS.float );
	const isBanner = className?.includes( FILTER_OPTIONS.bannerMode );

	const [ width, setWidth ] = useState( className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.width ) )?.split( '-' )?.pop() );
	const [ offset, setOffset ] = useState( className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.sideOffset ) )?.split( '-' )?.pop() );
	const [ bannerGap, setBannerGap ] = useState( className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.bannerGap ) )?.split( '-' )?.pop() );

	useEffect( () => {
		if ( className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.width ) )?.split( '-' )?.pop() !== width ) {
			addOption( `o-sticky-width-${width}`, FILTER_OPTIONS.width );
		}
		if ( className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.sideOffset ) )?.split( '-' )?.pop() !== offset ) {
			addOption( `o-sticky-opt-side-offset-${offset}`, FILTER_OPTIONS.sideOffset );
		}
		if ( className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.bannerGap ) )?.split( '-' )?.pop() !== bannerGap ) {
			if ( '' === bannerGap ) {
				removeOptions([ FILTER_OPTIONS.bannerGap ]);
			} else {
				addOption( `${FILTER_OPTIONS.bannerGap}-${bannerGap}`, FILTER_OPTIONS.bannerGap );
			}
		}
	}, [ width, offset, bannerGap ]);

	return (
		<div>
			<Fragment>
				<ToggleControl
					label={ __( 'Float Mode', 'otter-blocks' ) }
					help={ __( 'Make the block to float. This is available only for root blocks.', 'otter-blocks' ) }
					checked={ isActive  }
					onChange={ ( value ) => {
						if ( value && 0 === activeFloatBlocks.length ) {
							addOption( FILTER_OPTIONS.float, FILTER_OPTIONS.float ); // you can activate only if no other block is active
						} else if ( false === value ) {
							removeOptions([ FILTER_OPTIONS.float, FILTER_OPTIONS.width, FILTER_OPTIONS.sideOffset, FILTER_OPTIONS.bannerGap, FILTER_OPTIONS.bannerMode ]);
						}
					} }

					// @ts-ignore
					disabled={ ( 0 < activeFloatBlocks.length || ! isRootBlock ) && ! isActive }
				/>

				{
					0 < activeFloatBlocks?.length && (
						<Fragment>
							<p>
								{ __( 'Only one block can be in float mode.', 'otter-blocks' )}
							</p>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '10px',
									alignItems: 'flex-start'
								}}
							>
								{
									activeFloatBlocks.map( ( activeBlock, idx ) => {
										return (
											<Button
												key={ idx }
												variant='secondary'
												onClick={ () => {
													dispatch( 'core/block-editor' ).selectBlock( activeBlock.clientId );
												}}
											>{ 1 === activeFloatBlocks?.length ? __( 'Go to current active float block', 'otter-blocks' ) : `${__( 'Go to the active float block', 'otter-blocks' )} (${idx})` }</Button>
										);
									})
								}
							</div>

						</Fragment>

					)
				}
				{
					isActive && (
						<Fragment>
							<p>
								{ __( 'The block is now in a floating state. Set the desired width. Please check the result in Preview.', 'otter-blocks' )}
							</p>

							<UnitContol
								label={ __( 'Width', 'otter-blocks' ) }
								value={ width ?? '100%' }
								onChange={ setWidth }
							/>

							<p style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', marginTop: 'calc(8px)' }}>{__( 'Set the width of the block.', 'otter-blocks' )}</p>

							<SelectControl
								label={ __( 'Side to stick', 'otter-blocks' ) }
								value={ className?.split( ' ' )?.find( c => c.includes( FILTER_OPTIONS.side ) ) ?? 'o-sticky-side-left' }
								options={[
									{
										label: __( 'Left', 'otter-blocks' ),
										value: 'o-sticky-side-left'
									},
									{
										label: __( 'Right', 'otter-blocks' ),
										value: 'o-sticky-side-right'
									}
								]}
								onChange={ value => {
									addOption( 'o-sticky-side-left' === value ? undefined : value, FILTER_OPTIONS.side );
								} }
							/>

							<UnitContol
								label={ __( 'Side Offset', 'otter-blocks' ) }
								value={ offset ?? '20px' }
								onChange={ setOffset }
							/>

							<p style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', marginTop: 'calc(8px)' }}>{__( 'Set the distance between the Sticky block and the chosen side.', 'otter-blocks' )}</p>

							{
								className?.includes( 'o-sticky-pos-top' ) && (
									<Fragment>
										<ToggleControl
											label={ __( 'Prevent Header Obstruction', 'otter-blocks' ) }
											help={ __( 'Add an extra space above the Header to fit the Sticky block.', 'otter-blocks' ) }
											checked={ isBanner  }
											onChange={ ( value ) => {
												if ( value ) {
													addOption( FILTER_OPTIONS.bannerMode, FILTER_OPTIONS.bannerMode );
												} else if ( false === value ) {
													removeOptions([ FILTER_OPTIONS.bannerMode, FILTER_OPTIONS.bannerGap ]);
												}
											} }
										/>
										<UnitContol
											label={ __( 'Top to Header Gap', 'otter-blocks' ) }
											value={ bannerGap }
											onChange={ setBannerGap }
										/>
										<p style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', marginTop: 'calc(8px)' }}>{__( 'Set the size of space between the top of your page and the header. If empty, it will automatically configure.', 'otter-blocks' )}</p>
									</Fragment>
								)
							}
						</Fragment>
					)
				}
			</Fragment>

		</div>
	);
};


const Edit = ({
	name,
	attributes,
	setAttributes,
	clientId
}: BlockProps<unknown> ) => {
	const Inspector = useInspectorSlot( name );

	const [ containerOptions, setContainerOptions ] = useState([{
		label: __( 'Screen', 'otter-blocks' ),
		value: 'o-sticky-scope-screen'
	}]);

	/*
		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset--40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-sticky o-sticky-pos-bottom o-sticky-pos-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	const limit = ( attributes?.className?.split( ' ' ) as string[]).filter( c => c.includes( 'o-sticky-scope' ) ).pop() || 'o-sticky-scope-main-area';

	const addOptions = ( options: ( string | undefined )[], filtersOption: string[]) => {

		const classes = new Set( ( attributes?.className?.split( ' ' ) as string[])?.filter(
			c => ! filtersOption.some(
				f => c.includes( f )
			)
		) ?? []);

		for ( const option of options ) {
			if ( option ) {
				classes.add( option );
			}
		}
		setAttributes({ className: Array.from( classes ).filter( x => 'string' === typeof x  && x ).join( ' ' ) });
	};

	const addOption = ( option: string | undefined, filterOption = FILTER_OPTIONS.position ) => {
		addOptions([ option ], [ filterOption ]);
	};

	const removeOptions = ( optionsFilters: string[]) => {
		addOptions([], optionsFilters );
	};

	useEffect( () => {
		if ( clientId ) {
			const block = document.querySelector( `#block-${ clientId }` );
			if ( block ) {
				let parent = block?.parentElement;
				const containers: string[] = [];
				const options: {label: string, value: string}[] = [];
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

					if ( 1 < containers.filter( x => 'section' === x )?.length ) {
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
		<Inspector>
			{/* @ts-ignore */}
			<PanelBody
				title={ __( 'Sticky', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<p>
					{ __( 'Set any block as Sticky, so that it sticks to another element on the page.', 'otter-blocks' ) }
				</p>

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

				<AlwaysActiveOption className={ attributes.className} clientId={ clientId } addOption={ addOption } removeOptions={ removeOptions } />

				{ applyFilters( 'otter.sticky.controls', <ProFeatures />, attributes, FILTER_OPTIONS, addOption ) }

				{/* @ts-ignore */}
				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'sticky' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>
		</Inspector>
	);
};

export default Edit;
