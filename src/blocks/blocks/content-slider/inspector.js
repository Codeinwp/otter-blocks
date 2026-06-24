/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ColorDropdownControl } from '../../components/index.js';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<RangeControl
					label={ __( 'Slides per View', 'otter-blocks' ) }
					value={ attributes.slidesPerView }
					onChange={ value => setAttributes({ slidesPerView: Number( value ) }) }
					min={ 1 }
					max={ 6 }
				/>

				<RangeControl
					label={ __( 'Gap (px)', 'otter-blocks' ) }
					value={ attributes.gap }
					onChange={ value => setAttributes({ gap: Number( value ?? 0 ) }) }
					min={ 0 }
					max={ 100 }
				/>

				<TextControl
					label={ __( 'Height', 'otter-blocks' ) }
					help={ __( 'A CSS value, e.g. 400px or auto.', 'otter-blocks' ) }
					value={ attributes.height }
					onChange={ value => setAttributes({ height: value }) }
				/>

				<ToggleControl
					label={ __( 'Loop', 'otter-blocks' ) }
					help={ __( 'Wrap around to the first slide after the last one.', 'otter-blocks' ) }
					checked={ attributes.loop }
					onChange={ value => setAttributes({ loop: value }) }
				/>

				<ToggleControl
					label={ __( 'Autoplay', 'otter-blocks' ) }
					checked={ attributes.autoplay }
					onChange={ value => setAttributes({ autoplay: value }) }
				/>

				{ attributes.autoplay && (
					<RangeControl
						label={ __( 'Delay (seconds)', 'otter-blocks' ) }
						value={ attributes.delay }
						onChange={ value => setAttributes({ delay: Number( value ?? 5 ) }) }
						min={ 1 }
						max={ 30 }
					/>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Navigation', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Show Arrows', 'otter-blocks' ) }
					checked={ attributes.showArrows }
					onChange={ value => setAttributes({ showArrows: value }) }
				/>

				<ToggleControl
					label={ __( 'Show Dots', 'otter-blocks' ) }
					checked={ attributes.showDots }
					onChange={ value => setAttributes({ showDots: value }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Slider Chrome', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<Fragment>
					<ColorDropdownControl
						label={ __( 'Arrow Color', 'otter-blocks' ) }
						colorValue={ attributes.arrowsColor }
						onColorChange={ value => setAttributes({ arrowsColor: value }) }
						className="is-list is-first"
					/>

					<ColorDropdownControl
						label={ __( 'Arrow Background', 'otter-blocks' ) }
						colorValue={ attributes.arrowsBackgroundColor }
						onColorChange={ value => setAttributes({ arrowsBackgroundColor: value }) }
						className="is-list"
					/>

					<ColorDropdownControl
						label={ __( 'Dots Color', 'otter-blocks' ) }
						colorValue={ attributes.dotsColor }
						onColorChange={ value => setAttributes({ dotsColor: value }) }
						className="is-list"
					/>

					<ColorDropdownControl
						label={ __( 'Active Dot Color', 'otter-blocks' ) }
						colorValue={ attributes.dotsActiveColor }
						onColorChange={ value => setAttributes({ dotsActiveColor: value }) }
						className="is-list"
					/>
				</Fragment>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
