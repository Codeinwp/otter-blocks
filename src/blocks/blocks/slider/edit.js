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
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => {
			unsubscribe( attributes.id );
		};
	}, [ attributes.id ]);

	useEffect( () => {
		if ( attributes.images.length ) {
			initSlider();
		}

		return () => {
			if ( attributes.images.length && null !== sliderRef.current ) {
				sliderRef.current.destroy();
			}
		};
	}, []);

	useEffect( () => {
		if ( attributes.images.length ) {
			setSelectedImage( null );

			if ( null !== sliderRef.current ) {
				sliderRef.current.destroy();
			}

			initSlider();
		}
	}, [ isSelected, attributes.align ]);

	useEffect( () => {
		if ( attributes.images.length && attributes.perView > attributes.images.length ) {
			changePerView( max([ Math.round( attributes.images.length / 2 ), 1 ]) );
		}
	}, [ attributes.images ]);

	const sliderRef = useRef( null );

	const [ selectedImage, setSelectedImage ] = useState( null );

	const initSlider = () => {
		sliderRef.current = new window.Glide( `#${ attributes.id }`, {
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
