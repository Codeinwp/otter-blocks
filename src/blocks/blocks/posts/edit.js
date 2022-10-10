/**
 * External dependencies.
 */
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	isNumber,
	isUndefined,
	pickBy
} from 'lodash';

import {
	Disabled,
	Placeholder,
	Spinner
} from '@wordpress/components';

import { useBlockProps } from '@wordpress/block-editor';

import {
	useSelect,
	dispatch
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import {
	blockInit,
	getDefaultValueByField
} from '../../helpers/block-utility.js';
import Layout from './components/layout/index.js';
import {
	_align,
	buildResponsiveGetAttributes,
	getCustomPostTypeSlugs
} from '../../helpers/helper-functions.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';

const { attributes: defaultAttributes } = metadata;

const px = value => value ? `${ value }px` : value;

const mightBeUnit = value => isNumber( value ) ? px( value ) : value;

/**
 * Posts component
 * @param {import('./types').PostProps} param0
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ slugs, setSlugs ] = useState([]);

	const {
		posts,
		categoriesList,
		authors
	} = useSelect( select => {
		const catIds = attributes.categories && 0 < attributes.categories.length ? attributes.categories.map( ( cat ) => cat.id ) : [];

		const latestPostsQuery = pickBy({
			categories: catIds,
			order: attributes.order,
			orderby: attributes.orderBy,
			per_page: attributes.postsToShow, // eslint-disable-line camelcase
			offset: attributes.offset,
			context: 'view'
		}, ( value ) => ! isUndefined( value ) );

		const slugs = attributes.postTypes;
		const posts = ( 0 < slugs.length ) ? (
			slugs.map( slug => select( 'core' ).getEntityRecords( 'postType', slug, latestPostsQuery ) ).flat()
		) : select( 'core' ).getEntityRecords( 'postType', 'post', latestPostsQuery );

		return {
			posts,
			// eslint-disable-next-line camelcase
			categoriesList: select( 'core' ).getEntityRecords( 'taxonomy', 'category', { per_page: 100, context: 'view' }),
			authors: select( 'core' ).getUsers({ who: 'authors', context: 'view' })
		};
	}, [ attributes.categories, attributes.order, attributes.orderBy, attributes.postsToShow, attributes.offset, attributes.postTypes ]);

	const {
		responsiveGetAttributes
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	useEffect( () => {
		const fetch = async() => {
			setSlugs( await getCustomPostTypeSlugs() );
		};
		fetch();
	}, []);

	useEffect( () => {
		dispatch( 'otter-store' ).setPostsSlugs( slugs );
	}, [ slugs ]);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const imageBoxShadow = getValue( 'imageBoxShadow' );
	const boxShadow = getValue( 'boxShadow' );

	const inlineStyles = {
		'--img-border-radius': mightBeUnit( attributes.borderRadius ),
		'--img-box-shadow': imageBoxShadow.active && `${ imageBoxShadow.horizontal }px ${ imageBoxShadow.vertical }px ${ imageBoxShadow.blur }px ${ imageBoxShadow.spread }px ${ hexToRgba( imageBoxShadow.color || '#FFFFFF', imageBoxShadow.colorOpacity ) }`,
		'--border-width': mightBeUnit( attributes.borderWidth ),
		'--border-radius': mightBeUnit( attributes.cardBorderRadius ),
		'--box-shadow': boxShadow.active && `${ boxShadow.horizontal }px ${ boxShadow.vertical }px ${ boxShadow.blur }px ${ boxShadow.spread }px ${ hexToRgba( boxShadow.color || '#FFFFFF', boxShadow.colorOpacity ) }`,
		'--vert-align': _align( attributes.verticalAlign ),
		'--text-align': attributes.textAlign,
		'--text-color': attributes.textColor,
		'--background-color': attributes.backgroundColor,
		'--border-color': attributes.borderColor,
		'--content-gap': attributes.contentGap,
		'--img-width': responsiveGetAttributes([ mightBeUnit( attributes.imageWidth ), attributes.imageWidthTablet, attributes.imageWidthMobile ]),
		'--img-width-tablet': attributes.imageWidthTablet,
		'--img-width-mobile': attributes.imageWidthMobile,
		'--title-text-size': responsiveGetAttributes([ mightBeUnit( attributes.customTitleFontSize ), mightBeUnit( attributes.customTitleFontSizeTablet ), mightBeUnit( attributes.customTitleFontSizeTablet ) ]),
		'--title-text-size-tablet': mightBeUnit( attributes.customTitleFontSizeTablet ),
		'--title-text-size-mobile': mightBeUnit( attributes.customTitleFontSizeMobile ),
		'--description-text-size': responsiveGetAttributes([ mightBeUnit( attributes.customDescriptionFontSize ), mightBeUnit( attributes.customDescriptionFontSizeTablet ), mightBeUnit( attributes.customDescriptionFontSizeMobile ) ]),
		'--description-text-size-tablet': mightBeUnit( attributes.customDescriptionFontSizeTablet ),
		'--description-text-size-mobile': mightBeUnit( attributes.customDescriptionFontSizeMobile ),
		'--meta-text-size': responsiveGetAttributes([ attributes.customMetaFontSize, attributes.customMetaFontSizeTablet, attributes.customMetaFontSizeMobile ]),
		'--meta-text-size-tablet': attributes.customMetaFontSizeTablet,
		'--meta-text-size-mobile': attributes.customMetaFontSizeMobile,
		'--column-gap': responsiveGetAttributes([ attributes.columnGap, attributes.columnGapTablet, attributes.columnGapMobile ]),
		'--column-gap-tablet': attributes.columnGapTablet,
		'--column-gap-mobile': attributes.columnGapMobile,
		'--row-gap': responsiveGetAttributes([ attributes.rowGap, attributes.rowGapTablet, attributes.rowGapMobile ]),
		'--row-gap-tablet': attributes.rowGapTablet,
		'--row-gap-mobile': attributes.rowGapMobile,
		'--content-padding': responsiveGetAttributes([ attributes.padding, attributes.paddingTablet, attributes.paddingMobile ]),
		'--content-padding-tablet': attributes.paddingTablet,
		'--content-padding-mobile': attributes.paddingMobile
	};

	const blockProps = useBlockProps();

	const Preview = ({
		posts,
		categoriesList,
		authors,
		blockProps,
		inlineStyles,
		attributes
	}) => {
		if ( ! posts || ! categoriesList || ! authors ) {
			return (
				<div { ...blockProps }>
					<Placeholder>
						<Spinner />
						{ __( 'Loading Posts', 'otter-blocks' ) }
					</Placeholder>
				</div>
			);
		}

		if ( 0 === posts.length ) {
			return (
				<div { ...blockProps }>
					<Placeholder>
						{ __( 'No Posts', 'otter-blocks' ) }
					</Placeholder>
				</div>
			);
		}

		return (
			<div { ...blockProps } style={ inlineStyles }>
				<Disabled>
					{ attributes.enableFeaturedPost && (
						<FeaturedPost
							attributes={ attributes }
							post={ posts?.[0] }
							category={ categoriesList[0] }
							categoriesList={ categoriesList }
							author={ authors[0] }
						/>
					) }

					<Layout
						attributes={ attributes }
						posts={ posts }
						categoriesList={ categoriesList }
						authors={ authors }
					/>
				</Disabled>
			</div>
		);
	};

	return (
		<Fragment>
			{ categoriesList && (
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					categoriesList={ categoriesList }
				/>
			) }

			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Preview
				posts={ posts }
				categoriesList={ categoriesList }
				authors={ authors }
				blockProps={ blockProps }
				inlineStyles={ inlineStyles }
				attributes={ attributes }
			/>
		</Fragment>
	);
};

export default Edit;
