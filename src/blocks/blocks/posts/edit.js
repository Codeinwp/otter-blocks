/** @jsx jsx */
/**
 * WordPress dependencies
 */
import {
	isUndefined,
	pickBy,
	union
} from 'lodash';

import { __ } from '@wordpress/i18n';

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
	useState,
	createContext
} from '@wordpress/element';

import {
	css,
	jsx
} from '@emotion/react';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { blockInit, useMeta } from '../../helpers/block-utility.js';
import Layout from './components/layout/index.js';
import { _align, getCustomPostTypeSlugs } from '../../helpers/helper-functions.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';
import { StyleSwitcherBlockControl } from '../../components/style-switcher-control/index.js';

const { attributes: defaultAttributes } = metadata;

export const CustomMetasContext = createContext({});

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
	const [ featured, setFeatured ] = useState( '' );

	const [ customMetaFields, setCustomMetaFields ] = useState([]);
	const [ registeredMetaValues ] = useMeta();
	const [ acfMetaData, setACFMetaData ] = useState({});


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
			offset: attributes.offset
		}, ( value ) => ! isUndefined( value ) );

		const slugs = attributes.postTypes;
		const posts = ( 0 < slugs.length ) ? (
			slugs.map( slug => select( 'core' ).getEntityRecords( 'postType', slug, latestPostsQuery ) ).flat()
		) : select( 'core' ).getEntityRecords( 'postType', 'post', latestPostsQuery );

		return {
			posts,
			// eslint-disable-next-line camelcase
			categoriesList: select( 'core' ).getEntityRecords( 'taxonomy', 'category', { per_page: 100 }),
			authors: select( 'core' ).getAuthors()
		};
	}, [ attributes.categories, attributes.order, attributes.orderBy, attributes.postsToShow, attributes.offset, attributes.postTypes ]);

	const changeStyle = value => {
		setAttributes({ style: value });
	};

	useEffect( () => {
		const fetch = async() => {
			setSlugs( await getCustomPostTypeSlugs() );
		};
		fetch();
	}, []);

	useEffect( () => {
		dispatch( 'otter-store' ).setPostsSlugs( slugs );
	}, [ slugs ]);

	useEffect( () => {
		if ( 0 < posts?.length && attributes.enableFeaturedPost  ) {
			if ( 'latest' === attributes.featuredPost ) {
				setFeatured(
					posts
						.map( post => ({
							...post,
							date: new Date( post.date )
						}) )
						.sort( ( a, b ) => {
							return a.date - b.date;
						})
						.pop()
				);
			} else if ( attributes.featuredPost ) {
				setFeatured( posts?.find( post => post.id.toString() == attributes.featuredPost ) );
			} else {
				setFeatured( '' );
			}
		}
	}, [ posts, attributes.enableFeaturedPost, attributes.featuredPost ]);

	useEffect( () => {
		const acfFieldsName = acf?.getFields()?.map( ({ data }) => data.name ) || [];
		const registeredMetaFieldsName = Object.keys( registeredMetaValues ).filter( x => ! x.startsWith( 'meta_post' ) || ! x.startsWith( 'neve_' ) );

		setCustomMetaFields( union(  registeredMetaFieldsName, acfFieldsName ) );
		setACFMetaData( acf?.getFields()?.reduce( ( acc, { data }) => {
			if ( data.name ) {
				acc[data.name] = data.key;
			}
			console.log( 'ACC', acc );
			return acc;
		}, {}) );
	}, [ registeredMetaValues ]);

	const fontSizeStyle = css`
		${ attributes.imageWidth && `--img-width: ${ attributes.imageWidth }px;` }
		--vert-align: ${_align( attributes.verticalAlign )};

		@media ( min-width: 960px ) {
			${ attributes.customTitleFontSize && `--title-text-size: ${ attributes.customTitleFontSize }px;` }
			${ attributes.customDescriptionFontSize && `--description-text-size: ${ attributes.customDescriptionFontSize }px;` }
		}

		@media ( min-width: 600px ) and ( max-width: 960px ) {
			${ attributes.customTitleFontSizeTablet && `--title-text-size: ${ attributes.customTitleFontSizeTablet }px;` }
			${ attributes.customDescriptionFontSizeTablet && `--description-text-size: ${ attributes.customDescriptionFontSizeTablet }px;` }
		}

		@media ( max-width: 600px ) {
			${ attributes.customTitleFontSizeMobile && `--title-text-size: ${ attributes.customTitleFontSizeMobile }px;` }
			${ attributes.customDescriptionFontSizeMobile && `--description-text-size: ${ attributes.customDescriptionFontSizeMobile }px;` }
		}
	`;

	const blockProps = useBlockProps();

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
						changeStyle={ changeStyle }
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
						changeStyle={ changeStyle }
						categoriesList={ categoriesList }
					/>
				) : null }
			</Fragment>
		);
	}

	return (
		<Fragment>
			<CustomMetasContext.Provider value={{customMetaFields, acfMetaData, registeredCustomMeta: registeredMetaValues}}>
				<StyleSwitcherBlockControl
					label={ __( 'Block Styles', 'otter-blocks' ) }
					value={ attributes.style }
					options={ [
						{
							label: __( 'Grid', 'otter-blocks' ),
							value: 'grid',
							image: window.themeisleGutenberg.assetsPath + '/icons/posts-grid.jpg'
						},
						{
							label: __( 'List', 'otter-blocks' ),
							value: 'list',
							image: window.themeisleGutenberg.assetsPath + '/icons/posts-list.jpg'
						}
					] }
					onChange={ changeStyle }
				/>

				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					changeStyle={ changeStyle }
					categoriesList={ categoriesList }
					posts={posts}
				/>

				<Controls
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>

				<div { ...blockProps } css={fontSizeStyle}>
					<Disabled>

						{
							attributes.enableFeaturedPost && (
								<FeaturedPost
									attributes={ attributes }
									post={ featured }
									category={ categoriesList[0] }
									author={ authors[0] }
								/>
							)
						}
						<Layout
							attributes={ attributes }
							posts={ posts }
							categoriesList={ categoriesList }
							authors={ authors }
						/>

					</Disabled>
				</div>
			</CustomMetasContext.Provider>
		</Fragment>
	);
};

export default Edit;
