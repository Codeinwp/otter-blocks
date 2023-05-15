/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	max
} from 'lodash';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import {
	select
} from '@wordpress/data';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Placeholder from './placeholder.js';
import Inspector from './inspector.js';
import Slide from './components/Slide.js';
import SliderControls from './components/slider-controls.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import {
	blockInit,
	copyScriptAssetToIframe,
	getEditorIframe
} from '../../helpers/block-utility.js';
import { _px } from '../../helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

const options = {
	root: null,
	rootMargin: '0px',
	threshold: [ 0.0 ]
};

/**
 * Get the maximum number of allowed slides per view.
 *
 * @param {Number} imagesLength The number of images in the slider.
 * @returns {Number} The maximum number of slides per view.
 */
export const getMaxPerView = ( imagesLength ) => max([ Math.round( ( imagesLength ?? 0 ) / 2 ), 1 ]);

/**
 * Slider component
 * @param {import('./types').SliderProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	isSelected
}) => {

	const initObserver = useRef( null );
	const sliderRef = useRef( null );

	useEffect( () => {
		try {
			if ( attributes.width === undefined  ) {
				const parents = select( 'core/block-editor' )?.getBlockParentsByBlockName?.( clientId, 'themeisle-blocks/advanced-columns', true ) ?? [];
				if ( 0 < parents.length ) {
					setAttributes({ width: '650px' });
				}
			}
		} catch ( e ) {
			console.error( e );
		}
	}, []);

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => {
			unsubscribe( attributes.id );
		};
	}, [ attributes.id ]);

	useEffect( () => {

		const container = document.querySelector( `#${ attributes.id }` ) ?? getEditorIframe()?.contentDocument?.querySelector( `#${ attributes.id }` );

		if ( container ) {
			initObserver.current = new IntersectionObserver( ( entries ) => {
				entries.forEach( entry => {
					if ( entry.isIntersecting && 0 <= entry.intersectionRect.height ) {
						if ( attributes.images.length ) {
							initSlider();
							initObserver.current?.unobserve( container );
						}
					}
				});
			}, options );

			initObserver.current?.observe( container );
		}

		return () => {
			if ( attributes?.images?.length ) {
				sliderRef?.current?.destroy();
			}
		};
	}, [ attributes.id ]);

	useEffect( () => {
		if ( attributes.images.length ) {
			setSelectedImage( null );

			if ( null !== sliderRef.current && attributes.id ) {
				initSlider();
			}
		}
	}, [ isSelected, attributes.id, sliderRef.current, attributes.images, attributes.width ]);

	useEffect( () => {
		if ( attributes.images.length && attributes.perView > attributes.images.length ) {
			changePerView( getMaxPerView( attributes?.images?.length ) );
		}
	}, [ attributes.images ]);

	const { responsiveGetAttributes } = useResponsiveAttributes();

	const [ selectedImage, setSelectedImage ] = useState( null );

	const initSlider = () => {

		// Clean up old references.
		if ( null !== sliderRef.current ) {
			sliderRef.current?.destroy?.();
		}

		const iframe = getEditorIframe();
		const container = document?.querySelector( `#${ attributes.id }` ) ?? iframe?.contentDocument?.querySelector( `#${ attributes.id }` );

		const config = {
			type: 'carousel',
			keyboard: false,
			perView: attributes.perView,
			gap: attributes.gap,
			peek: attributes.peek,
			autoplay: false,
			animationTimingFunc: attributes.transition || 'ease',
			direction: window.themeisleGutenberg.isRTL ? 'rtl' : 'ltr',
			breakpoints: {
				800: {
					perView: 1,
					peek: 0,
					gap: 0
				}
			}
		};

		/**
		 * Init the Slider inside the iframe.
		 */
		if ( Boolean( iframe ) ) {
			const initFrame = () => {
				if ( iframe?.contentWindow?.Glide ) {
					sliderRef.current = new iframe.contentWindow.Glide( container, config ).mount();
				}
			};

			if ( ! Boolean( iframe.contentDocument?.querySelector( '#glidejs-js' ) ) ) {

				// Load the JS file into the iframe.
				copyScriptAssetToIframe( '#glidejs-js', initFrame );
			} else {
				initFrame();
			}
		} else {
			sliderRef.current = new window.Glide( container, config ).mount();
		}
	};

	const onSelectImages = images => {
		setAttributes({
			images: images.map( image => ({
				id: image.id,
				url: image.url,
				alt: image.alt,
				caption: image.caption
			}) )
		});

		initSlider();
	};

	const changePerView = value => {
		setAttributes({
			perView: Number( value ),
			gap: 1 === value ? 0 : attributes.gap,
			peek: 1 === value ? 0 : attributes.peek
		});
	};

	useEffect( () => {
		if ( Boolean( sliderRef?.current?.update ) ) {
			sliderRef.current.update({
				perView: attributes.perView ?? 1,
				gap: attributes.gap ?? 0,
				peek: attributes.peek ?? 0,
				animationTimingFunc: attributes.transition ?? 'ease'
			});
		}
	}, [ sliderRef.current, attributes.gap, attributes.peek, attributes.transition, attributes.perView ]);

	const inlineStyles = {
		'--arrows-color': attributes.arrowsColor,
		'--arrows-background-color': attributes.arrowsBackgroundColor,
		'--pagination-color': attributes.paginationColor,
		'--pagination-active-color': attributes.paginationActiveColor,
		'--border-color': attributes.borderColor,
		'--border-width': attributes.borderWidth,
		'--border-radius': attributes.borderRadius,
		'--width': attributes.width
	};

	const blockProps = useBlockProps();

	if ( Array.isArray( attributes.images ) && ! attributes.images.length ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					labels={ {
						title: __( 'Slider', 'otter-blocks' ),
						instructions: __( 'Drag images, upload new ones or select files from your library.', 'otter-blocks' )
					} }
					icon="images-alt2"
					onSelectImages={ onSelectImages }
				/>
			</div>
		);
	}

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				onSelectImages={ onSelectImages }
				changePerView={ changePerView }
			/>

			<div { ...blockProps }>
				<div
					id={ attributes.id }
					className="glide"
					style={ inlineStyles }
				>
					<div className="glide__track" data-glide-el="track">
						<div
							className="glide__slides"
							style={ {
								height: responsiveGetAttributes([ _px( attributes.height ), attributes.heightTablet, attributes.heightMobile ])
							} }
						>
							{ attributes.images.map( ( image, index ) => (
								<Slide
									key={ image.url }
									images={ attributes.images }
									image={ image }
									index={ index }
									isFirstItem={ 0 === index }
									isLastItem={ ( index + 1 ) === attributes.images.length }
									isSelected={ isSelected && image.id === selectedImage }
									setAttributes={ setAttributes }
									setSelectedImage={ setSelectedImage }
								/>
							) ) }
						</div>

						<SliderControls attributes={ attributes } />
					</div>
				</div>

				{ isSelected && (
					<Placeholder
						labels={ {
							title: '',
							instructions: ''
						} }
						icon={ null }
						onSelectImages={ onSelectImages }
						isAppender={ true }
						value={ attributes.images }
					/>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
