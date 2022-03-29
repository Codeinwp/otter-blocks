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

import { useSelect } from '@wordpress/data';

const options = {
	root: null,
	rootMargin: '0px',
	threshold: [ 0.0 ]
};

const Edit = ({
	props,
	children
}) => {

	const macy = useRef( null );
	const observer = useRef( null );
	const initObserver = useRef( null );

	// TODO: Remove this when we no longer support WP 5.8
	const useOldContainer = useRef( Boolean( parseInt( window.themeisleGutenberg?.useOldMacyContainer || '0' ) ) );

	const imagesNumber = useSelect( select => {
		const {
			getBlock
		} = select( 'core/block-editor' );
		return getBlock( props.clientId ).innerBlocks?.length;
	});

	useEffect( () => {
		if ( props.attributes.isMasonry && 0 < imagesNumber ) {
			useOldContainer.current = Boolean( parseInt( window.themeisleGutenberg?.useOldMacyContainer || '0' ) );

			observer.current = new MutationObserver( mutations => {
				mutations.forEach( mutation => {
					if ( 'childList' === mutation.type ) {
						macy.current?.recalculate( true, true );
					}
				});
			});

			const targetContainer = useOldContainer.current ? `#block-${ props.clientId } .blocks-gallery-grid` : `#block-${ props.clientId }`;
			const container = document.querySelector( targetContainer );
			initObserver.current = new IntersectionObserver( entries => {
				entries.forEach( entry => {
					if ( entry.isIntersecting && 0 <= entry.intersectionRect.height ) {
						initMasonry();
						initObserver.current?.unobserve( container );
					}
				});
			}, options );

			initObserver.current?.observe( container );
		}
		return () => {
			deleteMasonry();
		};
	}, []);

	useEffect( () => {
		if ( props.attributes.isMasonry && ( 0 < imagesNumber ||  useOldContainer.current )  ) {
			initMasonry();
		}
	}, [ props.attributes.isMasonry, imagesNumber, useOldContainer.current ]);


	const initMasonry = () => {
		if ( props.attributes.isMasonry ) {
			const container = document.querySelector( useOldContainer.current ? `#block-${ props.clientId } .blocks-gallery-grid` : `#block-${ props.clientId }` );
			macy.current?.remove();

			if ( useOldContainer.current && ! props.attributes.images?.length ) {
				return;
			}

			const targetContainer = useOldContainer.current ? `#block-${ props.clientId } .blocks-gallery-grid` : `#block-${ props.clientId }`;

			macy.current = window.Macy({
				container: targetContainer,
				trueOrder: false,
				waitForImages: false,
				margin: props.attributes.margin !== undefined ? props.attributes.margin : 10,
				columns: props.attributes.columns || 3
			});

			// Handle the case when we update with new images.
			setTimeout( () => macy.current?.recalculate( true, true ), 300 );

			observer.current?.disconnect();
			observer.current?.observe( container, {childList: true});

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
