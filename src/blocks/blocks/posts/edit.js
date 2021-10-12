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
import { StyleSwitcherBlockControl } from '../../components/style-switcher-control/index.js';
import Inspector from './inspector.js';
import Layout from './components/layout/index.js';
import { getCustomPostTypeSlugs } from '../../helpers/helper-functions.js';
import '../../components/store/index.js';

const Edit = ({
	attributes,
	setAttributes,
	className
}) => {

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
			slugs.map( slug =>  select( 'core' ).getEntityRecords( 'postType', slug, latestPostsQuery ) ).flat()
		) : select( 'core' ).getEntityRecords( 'postType', 'post', latestPostsQuery );

		return {
			posts: posts,
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

	if ( ! posts || ! categoriesList || ! authors ) {
		return (
			<Fragment>
				<Placeholder>
					<Spinner/>
					{ __( 'Loading Posts', 'otter-blocks' ) }
				</Placeholder>

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
				<Placeholder>
					{ __( 'No Posts', 'otter-blocks' ) }
				</Placeholder>

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
			/>

			<Disabled>
				<Layout
					className={ className }
					attributes={ attributes }
					posts={ posts }
					categoriesList={ categoriesList }
					authors={ authors }
				/>
			</Disabled>
		</Fragment>
	);
};

export default Edit;
