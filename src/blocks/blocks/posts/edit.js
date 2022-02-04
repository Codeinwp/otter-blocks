/**
 * WordPress dependencies
 */
import {
	isUndefined,
	pickBy
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
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { StyleSwitcherBlockControl } from '../../components/style-switcher-control/index.js';
import Inspector from './inspector.js';
import Layout from './components/layout/index.js';
import { getCustomPostTypeSlugs } from '../../helpers/helper-functions.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';
import { blockInit } from '../../helpers/block-utility.js';
import defaultAttributes from './attributes.js';

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
	const blockRef = useRef( null );

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

		// TODO: find why is not working
		if ( blockRef.current ) {
			blockRef.current.style.setProperty( '--o-posts-title-text-size', attributes.customTitleFontSize );
			blockRef.current.style.setProperty( '--o-posts-title-text-size-tablet', attributes.customTitleFontSizeTablet );
			blockRef.current.style.setProperty( '--o-posts-title-text-size-mobile', attributes.customTitleFontSizeMobile );
			blockRef.current.style.setProperty( '--o-posts-description-text-size', attributes.customDescriptionFontSize );
			blockRef.current.style.setProperty( '--o-posts-description-text-size-tablet', attributes.customDescriptionFontSizeTablet );
			blockRef.current.style.setProperty( '--o-posts-description-text-size-mobile', attributes.customDescriptionFontSizeMobile );
		}
	}, [ blockRef.current, attributes ]);

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

			<div ref={blockRef} { ...blockProps }>
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


			</div>
		</Fragment>
	);
};

export default Edit;
