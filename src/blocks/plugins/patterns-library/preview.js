/**
 * External dependencies.
 */
import classnames from 'classnames';

import { useInView } from 'react-intersection-observer';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	useEffect,
	useRef
} from '@wordpress/element';

import {
	close,
	Icon,
	lock,
	plus
} from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import {
	heartIcon,
	heartFilledIcon
} from '../../helpers/icons';

import {
	AsyncPreview,
	ParsedPreview,
	ProThumb,
	QueuedPreview,
	Skeleton
} from './template';

import { previewAccent } from './accent';

import { useAtomicCss } from './atomic';

const SimilarCard = ({
	pattern,
	accent,
	onClick
}) => {
	// Defer each card's BlockPreview until it nears the viewport, so opening the
	// dialog doesn't mount every preview at once and stall the first paint.
	const { ref, inView } = useInView({
		threshold: 0,
		rootMargin: '200px',
		triggerOnce: true
	});

	const thumb = pattern.isPro
		? <ProThumb pattern={ pattern } />
		: <QueuedPreview pattern={ pattern } accent={ accent } />;

	return (
		<button className="o-library__similar-card" onClick={ onClick } ref={ ref }>
			<span className="o-library__similar-thumb">
				{ inView ? thumb : <Skeleton /> }
			</span>

			<span className="o-library__similar-name">{ pattern.title }</span>
		</button>
	);
};

const Preview = ({
	pattern,
	categoryLabel,
	isPage = false,
	isFavorite = false,
	accent = null,
	similar = [],
	onFavorite,
	onClose,
	onInsert,
	onPreviewOther
}) => {
	const isPro = Boolean( pattern.isPro );
	const { pattern: derived, css: accentCss } = previewAccent( pattern, accent );
	const { css: atomicCss, isReady: hasAtomicCss } = useAtomicCss( derived );

	// Jumping between patterns via "More like this" keeps the modal mounted —
	// start each pattern at the top of its preview.
	const bodyRef = useRef( null );

	useEffect( () => {
		bodyRef.current?.scrollTo( 0, 0 );
	}, [ pattern.name ]);

	return (
		<div className="o-library__pv-scrim" role="presentation" onClick={ onClose }>
			<div
				className="o-library__pv"
				role="dialog"
				aria-modal="true"
				aria-label={ pattern.title }
				onClick={ event => event.stopPropagation() }
			>
				<div className="o-library__pv-head">
					<div>
						<div className="o-library__pv-title">{ pattern.title }</div>
						{ Boolean( categoryLabel ) && <div className="o-library__pv-cat">{ categoryLabel }</div> }
					</div>

					<div className="o-library__pv-actions">
						<button
							className={ classnames( 'o-library__iconbtn', { 'is-fav': isFavorite }) }
							title={ isFavorite ? __( 'Remove from favorites', 'otter-blocks' ) : __( 'Add to favorites', 'otter-blocks' ) }
							onClick={ onFavorite }
						>
							{ ( isFavorite ? heartFilledIcon : heartIcon )({ width: 20, height: 20 }) }
						</button>

						<button className="o-library__btn is-primary is-large" onClick={ onInsert }>
							<Icon icon={ isPro ? lock : plus } size={ 20 } />
							{ isPro ? __( 'Get with Otter Pro', 'otter-blocks' ) : __( 'Insert template', 'otter-blocks' ) }
						</button>

						<button
							className="o-library__iconbtn"
							title={ __( 'Close preview', 'otter-blocks' ) }
							onClick={ onClose }
						>
							<Icon icon={ close } size={ 20 } />
						</button>
					</div>
				</div>

				<div className="o-library__pv-body" ref={ bodyRef }>
					<div className={ classnames( 'o-library__pv-frame', { 'is-page': isPage, 'is-pro': isPro }) }>
						{ /* Pro patterns ship no content — show the screenshot. */ }
						{ isPro ? (
							<ProThumb pattern={ pattern } />
						) : /* Keyed per pattern: swapping blocks inside a live BlockPreview
						     re-renders its iframe in place, flashing the whole frame white.
						     Remounting through the async queue shows the skeleton instead. */
							hasAtomicCss ? (
								<AsyncPreview
									key={ derived.name }
									placeholder={ <div className="o-library__pv-skeleton" /> }
								>
									<ParsedPreview
										pattern={ derived }
										css={ [ atomicCss, accentCss ] }
										placeholder={ <div className="o-library__pv-skeleton" /> }
									/>
								</AsyncPreview>
							) : <div className="o-library__pv-skeleton" /> }
					</div>

					{ Boolean( similar.length ) && (
						<div className="o-library__similar">
							<div className="o-library__similar-head">{ __( 'More like this', 'otter-blocks' ) }</div>

							<div className="o-library__similar-row">
								{ similar.map( item => (
									<SimilarCard
										key={ item.name }
										pattern={ item }
										accent={ accent }
										onClick={ () => onPreviewOther( item ) }
									/>
								) ) }
							</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
};

export default Preview;
