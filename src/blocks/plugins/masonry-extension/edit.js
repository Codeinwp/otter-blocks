/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import { InspectorControls } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useRef
} from '@wordpress/element';

const Edit = ({
	BlockEdit,
	props
}) => {
	useEffect( () => {
		initMasonry();

		return () => {
			deleteMasonry();
		};
	}, []);

	useEffect( () => {
		if ( props.attributes.isMasonry ) {
			initMasonry();
		}
	}, [ props.attributes ]);

	const macy = useRef( null );

	const initMasonry = () => {
		if ( props.attributes.isMasonry ) {
			deleteMasonry();

			macy.current = Macy({
				container: `#block-${ props.clientId } .blocks-gallery-grid`,
				trueOrder: false,
				waitForImages: false,
				margin: props.attributes.margin || 0,
				columns: props.attributes.columns || 3
			});
		}
	};

	const deleteMasonry = () => {
		if ( macy.current && macy.current.remove ) {
			macy.current.remove();
		}
	};

	const toggleMasonry = () => {
		const isMasonry = ! props.attributes.isMasonry;
		props.setAttributes({ isMasonry });

		if ( isMasonry ) {
			initMasonry();
		} else {
			deleteMasonry();
		}
	};

	const changeMargin = value => {
		props.setAttributes({ margin: value });
		initMasonry();
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Masonry', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Masonry Layout', 'otter-blocks' ) }
						help={ __( 'Toggle on to transform your boring gallery to an exciting masonry layout.', 'otter-blocks' ) }
						checked={ props.attributes.isMasonry }
						onChange={ toggleMasonry }
					/>

					{ props.attributes.isMasonry && (
						<RangeControl
							label={ __( 'Margin', 'otter-blocks' ) }
							value={ props.attributes.margin }
							onChange={ changeMargin }
							min={ 0 }
							max={ 20 }
						/>
					)}
				</PanelBody>
			</InspectorControls>

			{ props.attributes.isMasonry ? (
				<div class="otter-masonry">
					<BlockEdit { ...props } />
				</div>
			) : (
				<BlockEdit { ...props } />
			) }
		</Fragment>
	);
};

export default Edit;
