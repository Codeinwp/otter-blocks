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
	getDefaultValueByField,
	useCSSNode
} from '../../helpers/block-utility.js';
import Layout from './components/layout/index.js';
import {
	_align,
	getCustomPostTypeSlugs
} from '../../helpers/helper-functions.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';

const { attributes: defaultAttributes } = metadata;

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

	const px = value => value ? `${ value }px` : value;

	const inlineStyles = {
		'--img-width': px( attributes.imageWidth ),
		'--img-border-radius': px( attributes.borderRadius ),
		'--img-box-shadow': imageBoxShadow.active && `${ imageBoxShadow.horizontal }px ${ imageBoxShadow.vertical }px ${ imageBoxShadow.blur }px ${ imageBoxShadow.spread }px ${ hexToRgba( imageBoxShadow.color || '#FFFFFF', imageBoxShadow.colorOpacity ) }`,
		'--border-width': px( attributes.borderWidth ),
		'--border-radius': px( attributes.cardBorderRadius ),
		'--box-shadow': boxShadow.active && `${ boxShadow.horizontal }px ${ boxShadow.vertical }px ${ boxShadow.blur }px ${ boxShadow.spread }px ${ hexToRgba( boxShadow.color || '#FFFFFF', boxShadow.colorOpacity ) }`,
		'--vert-align': _align( attributes.verticalAlign ),
		'--text-align': attributes.textAlign,
		'--text-color': getValue( 'textColor' ),
		'--background-color': getValue( 'backgroundColor' ),
		'--border-color': getValue( 'borderColor' )
	};

	const [ cssNodeName, setNodeCSS ] = useCSSNode();
	useEffect( () => {
		setNodeCSS([
			`{
				${ attributes.customTitleFontSize ? `--title-text-size: ${ isNumber( getValue( 'customTitleFontSize' ) ) ? `${ getValue( 'customTitleFontSize' ) }px` : getValue( 'customTitleFontSize' ) };` : '' }
				${ attributes.customDescriptionFontSize ? `--description-text-size: ${ isNumber( getValue( 'customDescriptionFontSize' ) ) ? `${ getValue( 'customDescriptionFontSize' ) }px` : getValue( 'customDescriptionFontSize' ) };` : '' }
				${ attributes.customMetaFontSize ? `--meta-text-size: ${ getValue( 'customMetaFontSize' ) };` : '' }
			}`,
			`{
				${ attributes.customTitleFontSizeTablet && `--title-text-size: ${ isNumber( getValue( 'customTitleFontSizeTablet' ) ) ? `${ getValue( 'customTitleFontSizeTablet' ) }px` : getValue( 'customTitleFontSizeTablet' ) };` }
				${ attributes.customDescriptionFontSizeTablet && `--description-text-size: ${ isNumber( getValue( 'customDescriptionFontSizeTablet' ) ) ? `${ getValue( 'customDescriptionFontSizeTablet' ) }px` : getValue( 'customDescriptionFontSizeTablet' ) };` }
				${ attributes.customMetaFontSizeTablet && `--meta-text-size: ${ getValue( 'customMetaFontSizeTablet' ) };` }
			}`,
			`{
				${ attributes.customTitleFontSizeMobile && `--title-text-size: ${ isNumber( getValue( 'customTitleFontSizeMobile' ) ) ? `${ getValue( 'customTitleFontSizeMobile' ) }px` : getValue( 'customTitleFontSizeMobile' ) };` }
				${ attributes.customDescriptionFontSizeMobile && `--description-text-size: ${ isNumber( getValue( 'customDescriptionFontSizeMobile' ) ) ? `${ getValue( 'customDescriptionFontSizeMobile' ) }px` : getValue( 'customDescriptionFontSizeMobile' ) };` }
				${ attributes.customMetaFontSizeMobile && `--meta-text-size: ${ getValue( 'customMetaFontSizeMobile' ) };` }
			}`
		], [
			'@media ( min-width: 960px )',
			'@media ( min-width: 600px ) and ( max-width: 960px )',
			'@media ( max-width: 600px )'
		]);
	}, [
		attributes.customTitleFontSize, attributes.customDescriptionFontSize, attributes.customMetaFontSize,
		attributes.customTitleFontSizeTablet, attributes.customDescriptionFontSizeTablet, attributes.customMetaFontSizeTablet,
		attributes.customTitleFontSizeMobile, attributes.customDescriptionFontSizeMobile, attributes.customMetaFontSizeMobile
	]);

	const blockProps = useBlockProps({
		className: cssNodeName
	});

	if ( ! posts || ! categoriesList || ! authors ) {
		return (
			<Fragment>
				<div { ...blockProps }>
					<Placeholder>
						<Spinner />
						{ __( 'Loading Posts', 'otter-blocks' ) }
					</Placeholder>
				</div>

				{ ( categoriesList && attributes.offset ) ? (
					<Inspector
						attributes={ attributes }
						setAttributes={ setAttributes }
						categoriesList={ categoriesList }
					/>
				) : null }
			</Fragment>
		);
	}

	if ( 0 === posts.length ) {
		return (
			<Fragment>
				<div { ...blockProps }>
					<Placeholder>
						{ __( 'No Posts', 'otter-blocks' ) }
					</Placeholder>
				</div>

				{ ( categoriesList && attributes.offset || slugs.length ) ? (
					<Inspector
						attributes={ attributes }
						setAttributes={ setAttributes }
						categoriesList={ categoriesList }
					/>
				) : null }
			</Fragment>
		);
	}

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				categoriesList={ categoriesList }
				posts={ posts }
			/>

			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

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
		</Fragment>
	);
};

export default Edit;
