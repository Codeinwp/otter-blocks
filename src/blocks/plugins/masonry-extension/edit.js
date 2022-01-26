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
	props,
	children
}) => {

	const macy = useRef( null );
	const observer = useRef( null );

	useEffect( () => {
		initMasonry();
		observer.current = new MutationObserver( mutations => {
			mutations.forEach( mutation => {
				if ( 'childList' === mutation.type ) {
					macy.current?.recalculate( true );
				}
			});
		});
		return () => {
			deleteMasonry();
		};
	}, []);

	useEffect( () => {
		if ( props.attributes.isMasonry ) {
			initMasonry();
		}
	}, [ props.attributes ]);


	const initMasonry = () => {
		if ( props.attributes.isMasonry ) {
			deleteMasonry();

			observer.current?.disconnect();
			const useOldContainer = Boolean( parseInt( window.themeisleGutenberg?.useOldMacyContainer || '0' ) );
			const container = document.querySelector( useOldContainer ? `#block-${ props.clientId } .blocks-gallery-grid` : `#block-${ props.clientId }` );
			observer.current?.observe( container, {childList: true});

			macy.current = window.Macy({
				container: useOldContainer ? `#block-${ props.clientId } .blocks-gallery-grid` : `#block-${ props.clientId }`,
				trueOrder: false,
				waitForImages: false,
				margin: props.attributes.margin !== undefined ? props.attributes.margin : 10,
				columns: props.attributes.columns || 3
			});

			if ( container?.style.height ) {
				container.style.height = '';
			}
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

			{ props.attributes.isMasonry ? <div className="otter-masonry">{ children }</div> : children }
		</Fragment>
	);
};

export default Edit;
