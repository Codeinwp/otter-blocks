/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { max } from 'lodash';

import { useBlockProps } from '@wordpress/block-editor';

import { ResizableBox } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Placeholder from './placeholder.js';
import Inspector from './inspector.js';
import Slide from './components/Slide.js';
import SliderControls from './components/slider-controls.js';
import { blockInit } from '../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

const options = {
	root: null,
	rootMargin: '0px',
	threshold: [ 0.0 ]
};

/**
 * Slider component
 * @param {import('./types').SliderProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	isSelected,
	toggleSelection
}) => {

	const initObserver = useRef( null );
	const sliderRef = useRef( null );

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => {
			unsubscribe( attributes.id );
		};
	}, [ attributes.id ]);

	useEffect( () => {

		const container = document.querySelector( `#${ attributes.id }` ) ?? document.querySelector( 'iframe[name^="editor-canvas"]' )?.contentDocument?.querySelector( `#${ attributes.id }` );

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

			if ( null !== sliderRef.current ) {
				sliderRef.current.destroy();

				if ( attributes.id ) {
					initSlider();
				}
			}
		}
	}, [ isSelected, attributes.id, sliderRef.current, attributes.images ]);

	useEffect( () => {
		if ( attributes.images.length && attributes.perView > attributes.images.length ) {
			changePerView( max([ Math.round( attributes.images.length / 2 ), 1 ]) );
		}
	}, [ attributes.images ]);

	const [ selectedImage, setSelectedImage ] = useState( null );

	const initSlider = () => {
		const iframe = document.querySelector( 'iframe[name^="editor-canvas"]' );
		const container = document.querySelector( `#${ attributes.id }` ) ?? iframe?.contentDocument?.querySelector( `#${ attributes.id }` );

		/**
		 * Init the Slider inside the iframe.
		 */
		const initFrame = () => {
			if ( iframe?.contentWindow?.Glide ) {
				sliderRef.current = new iframe.contentWindow.Glide( container, {
					type: 'carousel',
					keyboard: false,
					perView: attributes.perView,
					gap: attributes.gap,
					peek: attributes.peek,
					autoplay: false,
					breakpoints: {
						800: {
							perView: 1,
							peek: 0,
							gap: 0
						}
					}
				}).mount();
			}
		};

		if ( Boolean( iframe ) ) {
			if ( ! Boolean( iframe.contentDocument?.querySelector( '#glidejs-js' ) ) ) {

				// Load the JS file into the iframe.
				const original = document.querySelector( '#glidejs-js' );
				const n = iframe.contentWindow.document.createElement( 'script' );
				n.onload = () => {
					initFrame();
				};
				n.id = original.id;
				n.type = 'text/javascript';
				iframe.contentWindow.document?.head.appendChild( n );
				n.src = original.src;
			} else {
				initFrame();
			}
		} else {
			sliderRef.current = new window.Glide( container, {
				type: 'carousel',
				keyboard: false,
				perView: attributes.perView,
				gap: attributes.gap,
				peek: attributes.peek,
				autoplay: false,
				breakpoints: {
					800: {
						perView: 1,
						peek: 0,
						gap: 0
					}
				}
			}).mount();
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

		if ( null !== sliderRef.current ) {
			sliderRef.current.destroy();
		}

		initSlider();
	};

	const changePerView = value => {
		setAttributes({ perView: Number( value ) });
		sliderRef.current.update({ perView: Number( value ) });
		if ( 1 === value ) {
			setAttributes({
				gap: 0,
				peek: 0
			});

			sliderRef.current.update({
				gap: 0,
				peek: 0
			});
		}
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
				slider={ sliderRef.current }
				changePerView={ changePerView }
				onSelectImages={ onSelectImages }
			/>

			<div { ...blockProps }>
				<ResizableBox
					size={ {
						height: attributes.height
					} }
					enable={ {
						top: false,
						right: false,
						bottom: true,
						left: false
					} }
					minHeight={ 100 }
					maxHeight={ 1400 }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
					onResizeStop={ ( event, direction, elt, delta ) => {
						setAttributes({
							height: parseInt( attributes.height + delta.height, 10 )
						});
						toggleSelection( true );
					} }
					className={ classnames(
						'wp-block-themeisle-blocks-slider-resizer',
						{ 'is-focused': isSelected }
					) }
				>
					<div
						id={ attributes.id }
						className="glide"
					>
						<div className="glide__track" data-glide-el="track">
							<div
								className="glide__slides"
								style={ {
									height: `${ attributes.height }px`
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
				</ResizableBox>

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
