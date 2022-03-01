/** @jsx jsx */
/**
 * External dependencies
 */
import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	isUndefined,
	pickBy,
	pick
} from 'lodash';

import apiFetch from '@wordpress/api-fetch';

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

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { blockInit } from '../../helpers/block-utility.js';
import Layout from './components/layout/index.js';
import { _align, getCustomPostTypeSlugs } from '../../helpers/helper-functions.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';
import { StyleSwitcherBlockControl } from '../../components/style-switcher-control/index.js';

const { attributes: defaultAttributes } = metadata;

export const CustomMetasContext = createContext({});

const ALLOWED_ACF_TYPES = [
	'text',
	'textarea',
	'range',
	'number',
	'url',
	'email',
	'password'
];

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

	const [ acfData, setAcfData ] = useState([]);
	const [ acfFieldDict, setAcfFieldDict ] = useState({});

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
			authors: select( 'core' ).getUsers({ who: 'authors' })
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
		if ( ! window.acf ) {
			return;
		}
		apiFetch({ path: 'otter/v1/acf-fields' }).then( resp => {
			if ( resp?.success ) {
				setAcfData( resp?.groups );
				setAcfFieldDict(
					resp?.groups
						?.map( ({ fields, data }) => {
							return fields.map( field => {
								field.urlLocation = `${ window.themeisleGutenberg?.rootUrl || '' }/wp-admin/post.php?post=${ data.ID }&action=edit`;
								return field;
							});
						})
						.flat()
						.reduce( ( acc, field ) => {
							if ( field.key && field.label ) {
								acc[ field.key ] = pick( field, [ 'label', 'type', 'prepend', 'append', 'default_value', 'value', 'urlLocation' ]);
							}
							return acc;
						}, {})
				);
			}
		});
	}, []);

	const fontSizeStyle = css`
		${ attributes.imageWidth && `--imgWidth: ${ attributes.imageWidth }px;` }
		${ attributes.imageWidth && `--imgBorderRadius: ${ attributes.borderRadius }px;` }
		--vertAlign: ${_align( attributes.verticalAlign )};
		--textAlign: ${ attributes.textAlign };

		@media ( min-width: 960px ) {
			${ attributes.customTitleFontSize && `--titleTextSize: ${ attributes.customTitleFontSize }px;` }
			${ attributes.customDescriptionFontSize && `--descriptionTextSize: ${ attributes.customDescriptionFontSize }px;` }
		}

		@media ( min-width: 600px ) and ( max-width: 960px ) {
			${ attributes.customTitleFontSizeTablet && `--titleTextSize: ${ attributes.customTitleFontSizeTablet }px;` }
			${ attributes.customDescriptionFontSizeTablet && `--descriptionTextSize: ${ attributes.customDescriptionFontSizeTablet }px;` }
		}

		@media ( max-width: 600px ) {
			${ attributes.customTitleFontSizeMobile && `--titleTextSize: ${ attributes.customTitleFontSizeMobile }px;` }
			${ attributes.customDescriptionFontSizeMobile && `--descriptionTextSize: ${ attributes.customDescriptionFontSizeMobile }px;` }
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
			<CustomMetasContext.Provider value={{ acfData, acfFieldDict, ALLOWED_ACF_TYPES }}>
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

				<div { ...blockProps } css={ fontSizeStyle }>
					<Disabled>
						{ attributes.enableFeaturedPost && (
							<FeaturedPost
								attributes={ attributes }
								post={ posts?.[0] }
								category={ categoriesList[0] }
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
			</CustomMetasContext.Provider>
		</Fragment>
	);
};

export default Edit;
