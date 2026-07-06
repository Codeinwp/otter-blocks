/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

import { createBlock } from '@wordpress/blocks';

import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps
} from '@wordpress/block-editor';

import {
	ToolbarButton,
	ToolbarGroup
} from '@wordpress/components';

import { useDispatch, useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import {
	chevronLeft,
	chevronRight,
	plus
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import { ArrowIcon } from './components/icons.js';
import { blockInit } from '../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

const TEMPLATE = [
	[ 'core/group', { layout: { type: 'constrained' }, style: { spacing: { blockGap: '0.5rem' }}}, [
		[ 'core/image', {
			url: 'https://s.w.org/images/core/5.3/Glacial_lakes%2C_Bhutan.jpg',
			alt: __( 'Glacial lakes, Bhutan', 'otter-blocks' ),
			align: 'center',
			sizeSlug: 'large'
		}],
		[ 'core/paragraph', { align: 'center', content: __( 'Compose each slide from any blocks.', 'otter-blocks' ) }]
	]],
	[ 'core/group', { layout: { type: 'constrained' }, style: { spacing: { blockGap: '0.5rem' }}}, [
		[ 'core/image', {
			url: 'https://s.w.org/images/core/5.3/Sediment_off_the_Yucatan_Peninsula.jpg',
			alt: __( 'Sediment off the Yucatan Peninsula', 'otter-blocks' ),
			align: 'center',
			sizeSlug: 'large'
		}],
		[ 'core/paragraph', { align: 'center', content: __( 'Mix images, text, buttons and more.', 'otter-blocks' ) }]
	]],
	[ 'core/group', { layout: { type: 'constrained' }, style: { spacing: { blockGap: '0.5rem' }}}, [
		[ 'core/image', {
			url: 'https://s.w.org/images/core/5.3/MtBlanc1.jpg',
			alt: __( 'Mont Blanc', 'otter-blocks' ),
			align: 'center',
			sizeSlug: 'large'
		}],
		[ 'core/paragraph', { align: 'center', content: __( 'Each group becomes one slide.', 'otter-blocks' ) }]
	]]
];

// Single slide at a time (mode B); the active index is UI-only, never persisted.
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ activeSlide, setActiveSlide ] = useState( 0 );

	const children = useSelect( select => {
		return select( 'core/block-editor' ).getBlock( clientId )?.innerBlocks ?? [];
	}, [ clientId ]);

	const { insertBlock } = useDispatch( 'core/block-editor' );

	const slideCount = children.length;

	// Derived (not synced via effect) so it stays valid as slides are added/removed.
	const current = Math.min( activeSlide, Math.max( 0, slideCount - 1 ) );

	const goToPrev = () => setActiveSlide( 0 < current ? current - 1 : ( attributes.loop ? slideCount - 1 : 0 ) );

	const goToNext = () => setActiveSlide( current < slideCount - 1 ? current + 1 : ( attributes.loop ? 0 : current ) );

	const addSlide = () => {
		const slide = createBlock(
			'core/group',
			{ layout: { type: 'constrained' }},
			[ createBlock( 'core/paragraph', { placeholder: __( 'Add slide content…', 'otter-blocks' ) }) ]
		);
		insertBlock( slide, slideCount, clientId, false );
		setActiveSlide( slideCount );
	};

	const inlineStyles = {
		'--o-per-view': attributes.slidesPerView || 1,
		'--o-gap': `${ attributes.gap ?? 0 }px`,
		'--o-height': attributes.height || undefined,
		'--o-arrow-color': attributes.arrowsColor || undefined,
		'--o-arrow-bg': attributes.arrowsBackgroundColor || undefined,
		'--o-dot-color': attributes.dotsColor || undefined,
		'--o-dot-active-color': attributes.dotsActiveColor || undefined
	};

	const blockProps = useBlockProps({
		className: 'o-content-slider is-editor',
		style: inlineStyles
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'o-content-track'
		},
		{
			template: TEMPLATE,
			renderAppender: false
		}
	);

	return (
		<Fragment>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ chevronLeft }
						label={ __( 'Previous slide', 'otter-blocks' ) }
						onClick={ goToPrev }
						disabled={ 0 === slideCount }
					/>
					<ToolbarButton
						label={ sprintf(
							// translators: %1$d: current slide, %2$d: total slides.
							__( 'Slide %1$d of %2$d', 'otter-blocks' ),
							0 === slideCount ? 0 : current + 1,
							slideCount
						) }
						className="o-content-slider__indicator"
					>
						{ `${ 0 === slideCount ? 0 : current + 1 } / ${ slideCount }` }
					</ToolbarButton>
					<ToolbarButton
						icon={ chevronRight }
						label={ __( 'Next slide', 'otter-blocks' ) }
						onClick={ goToNext }
						disabled={ 0 === slideCount }
					/>
				</ToolbarGroup>
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add slide', 'otter-blocks' ) }
						onClick={ addSlide }
					/>
				</ToolbarGroup>
			</BlockControls>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<style>
					{ `#block-${ clientId } .o-content-track > * { display: none; }
					#block-${ clientId } .o-content-track > *:nth-child(${ current + 1 }) { display: block; }` }
				</style>

				<div { ...innerBlocksProps } />

				{ attributes.showArrows && 1 < slideCount && (
					<div className="o-content-arrows">
						<button
							type="button"
							className="o-content-arrow o-content-arrow--prev"
							aria-label={ __( 'Previous slide', 'otter-blocks' ) }
							onClick={ goToPrev }
						>
							<ArrowIcon />
						</button>
						<button
							type="button"
							className="o-content-arrow o-content-arrow--next"
							aria-label={ __( 'Next slide', 'otter-blocks' ) }
							onClick={ goToNext }
						>
							<ArrowIcon />
						</button>
					</div>
				) }

				{ attributes.showDots && 0 < slideCount && (
					<div className="o-content-dots">
						{ children.map( ( block, index ) => (
							<button
								key={ block.clientId }
								type="button"
								className={ classnames( 'o-content-dot', {
									'o-content-dot--active': index === current
								}) }
								aria-label={ sprintf(
									// translators: %d: slide number.
									__( 'Go to slide %d', 'otter-blocks' ),
									index + 1
								) }
								onClick={ () => setActiveSlide( index ) }
							/>
						) ) }
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
