/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
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
import {blockInit, useCSSNode} from '../../helpers/block-utility.js';
import Layout from './components/layout/index.js';
import { _align, getCustomPostTypeSlugs } from '../../helpers/helper-functions.js';
import '../../components/store/index.js';
import FeaturedPost from './components/layout/featured.js';
import { StyleSwitcherBlockControl } from '../../components/style-switcher-control/index.js';

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

	const inlineStyles = {
		'--imgWidth': `${ attributes.imageWidth }px`,
		'--imgBorderRadius': attributes.borderRadius && `${ attributes.borderRadius }px;`,
		'--vertAlign': _align( attributes.verticalAlign ),
		'--textAlign': attributes.textAlign
	};

	const [ cssNodeName, setNodeCSS ] = useCSSNode();
	useEffect( () => {
		setNodeCSS([
			`{
				${ attributes.customTitleFontSize && `--titleTextSize: ${ attributes.customTitleFontSize }px;` }
				${ attributes.customDescriptionFontSize && `--descriptionTextSize: ${ attributes.customDescriptionFontSize }px;` }
			}`,
			`{
				${ attributes.customTitleFontSizeTablet && `--titleTextSize: ${ attributes.customTitleFontSizeTablet }px;` }
				${ attributes.customDescriptionFontSizeTablet && `--descriptionTextSize: ${ attributes.customDescriptionFontSizeTablet }px;` }
			}`,
			`{
				${ attributes.customTitleFontSizeMobile && `--titleTextSize: ${ attributes.customTitleFontSizeMobile }px;` }
				${ attributes.customDescriptionFontSizeMobile && `--descriptionTextSize: ${ attributes.customDescriptionFontSizeMobile }px;` }
			}`
		], [
			'@media ( min-width: 960px )',
			'@media ( min-width: 600px ) and ( max-width: 960px )',
			'@media ( max-width: 600px )'
		]);
	}, [
		attributes.customTitleFontSize, attributes.customTitleFontSize,
		attributes.customDescriptionFontSize, attributes.customDescriptionFontSize,
		attributes.customTitleFontSizeTablet, attributes.customTitleFontSizeTablet,
		attributes.customDescriptionFontSizeTablet, attributes.customDescriptionFontSizeTablet,
		attributes.customTitleFontSizeMobile, attributes.customTitleFontSizeMobile,
		attributes.customDescriptionFontSizeMobile, attributes.customDescriptionFontSizeMobile
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
