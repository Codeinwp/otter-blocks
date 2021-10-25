/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { max } from 'lodash';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ImageGrid from './../../components/image-grid/index.js';

const Inspector = ({
	attributes,
	setAttributes,
	slider,
	changePerView,
	onSelectImages
}) => {
	const changeGap = value => {
		setAttributes({ gap: Number( value ) });
		slider.update({ gap: Number( value ) });
	};

	const changePeek = value => {
		setAttributes({ peek: Number( value ) });
		slider.update({ peek: Number( value ) });
	};

	const changeHeight = value => {
		setAttributes({ height: Number( value ) });
	};

	const toggleAutoplay = value => {
		setAttributes({ autoplay: value });
	};

	const changeDelay = value => {
		setAttributes({ delay: value });
	};

	const toggleArrows = value => {
		setAttributes({ hideArrows: value });
	};

	const toggleBullets = value => {
		setAttributes({ hideBullets: value });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Images', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ImageGrid
					attributes={ attributes }
					onSelectImages={ onSelectImages }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				{ attributes.images.length && (
					<Fragment>
						<RangeControl
							label={ __( 'Slides Per Page', 'otter-blocks' ) }
							help={ __( 'A number of visible slides.', 'otter-blocks' ) }
							value={ attributes.perView }
							onChange={ changePerView }
							min={ 1 }
							max={ max([ Math.round( attributes.images.length / 2 ), 1 ]) }
						/>

						{ 1 < attributes.perView && (
							<Fragment>
								<RangeControl
									label={ __( 'Gap', 'otter-blocks' ) }
									help={ __( 'A size of the space between slides.', 'otter-blocks' ) }
									value={ attributes.gap }
									onChange={ changeGap }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Peek', 'otter-blocks' ) }
									help={ __( 'The value of the future slides which have to be visible in the current slide.', 'otter-blocks' ) }
									value={ attributes.peek }
									onChange={ changePeek }
									min={ 0 }
									max={ 100 }
								/>
							</Fragment>
						) }

						<RangeControl
							label={ __( 'Height', 'otter-blocks' ) }
							help={ __( 'Slider height in pixels.', 'otter-blocks' ) }
							value={ attributes.height }
							onChange={ changeHeight }
							min={ 100 }
							max={ 1400 }
						/>

						<ToggleControl
							label={ __( 'Autoplay', 'otter-blocks' ) }
							help={ __( 'Autoplay slider in the front.', 'otter-blocks' ) }
							checked={ attributes.autoplay }
							onChange={ toggleAutoplay }
						/>

						{ attributes.autoplay && (
							<RangeControl
								label={ __( 'Delay', 'otter-blocks' ) }
								help={ __( 'Delay in slide change (in seconds).', 'otter-blocks' ) }
								value={ attributes.delay }
								onChange={ changeDelay }
								min={ 1 }
								max={ 10 }
							/>
						) }

						<ToggleControl
							label={ __( 'Hide Arrows', 'otter-blocks' ) }
							help={ __( 'Hide navigation arrows.', 'otter-blocks' ) }
							checked={ attributes.hideArrows }
							onChange={ toggleArrows }
						/>

						<ToggleControl
							label={ __( 'Hide Bullets', 'otter-blocks' ) }
							help={ __( 'Hide navigation bullets.', 'otter-blocks' ) }
							checked={ attributes.hideBullets }
							onChange={ toggleBullets }
						/>
					</Fragment>
				) }
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
