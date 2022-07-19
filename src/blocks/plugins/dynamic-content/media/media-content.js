/**
 * External dependencies.
 */
import classNames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { TextControl } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import {
	getObjectFromQueryString,
	getQueryStringFromObject
} from '../../../helpers/helper-functions.js';

const types = [
	{
		type: 'featuredImage',
		label: __( 'Featured Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/featured.svg'
	},
	{
		type: 'author',
		label: __( 'Author Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/author.svg'
	},
	{
		type: 'loggedInUser',
		label: __( 'User Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/user.svg'
	},
	{
		type: 'logo',
		label: __( 'Website Logo', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/logo.svg'
	},
	{
		type: 'postMeta',
		label: __( 'Post Meta', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/meta.svg',
		isPro: true
	},
	{
		type: 'product',
		label: __( 'Woo Product', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/woo.svg',
		isPro: true
	},
	{
		type: 'acf',
		label: __( 'ACF Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/acf.svg',
		isPro: true
	}
];

const MediaItem = ({
	uid,
	item,
	context,
	isSelected,
	onSelect
}) => {
	const url = window.themeisleGutenberg.restRoot + '/dynamic?type=' + item.type + '&context=' + context + '&uid=' + uid;

	const isDisabled = ( undefined !== item?.isAvailable && ! item?.isAvailable );

	return (
		<li
			tabIndex="0"
			className={ classNames( 'o-media-item', {
				'selected': isSelected,
				'is-disabled': item?.isPro || isDisabled
			}) }
			onClick={ () => isDisabled || item?.isPro ? null : onSelect( url, isSelected ) }
			title={ item.label }
			style={ {
				backgroundImage: `url(' ${ item.icon } ')`
			} }
		>
			<div className="o-media-item-title">{ item.label }</div>

			{ item?.isPro && <span className="o-media-item-label">{ __( 'Pro', 'otter-blocks' ) }</span> }

			{ isDisabled && <span className="o-media-item-label">{ __( 'Plugin not active', 'otter-blocks' ) }</span> }

			{ isSelected && (
				<button
					type="button"
					className="check"
					tabIndex="-1"
					onClick={ () => onSelect( url, true ) }
				>
					<span className="media-modal-icon"></span>
					<span className="screen-reader-text">{ __( 'Deselect', 'otter-blocks' ) }</span>
				</button>
			) }
		</li>
	);
};

const MediaSidebar = ({
	contentTypes,
	attributes,
	changeAttributes
}) => {
	const selected = contentTypes.find( ({ type }) => type === attributes.type );

	return (
		<Fragment>
			<div className="attachment-details">
				{ selected && <h2>{ selected?.label }</h2> }
			</div>

			{ applyFilters( 'otter.dynamicContent.media.controls', '', attributes, changeAttributes ) }

			{ selected && (
				<TextControl
					label={ __( 'Fallback Image', 'otter-blocks' ) }
					value={ attributes.fallback || '' }
					onChange={ fallback => changeAttributes({ fallback }) }
				/>
			) }
		</Fragment>
	);
};

const MediaContent = ({
	state,
	onSelectImage
}) => {
	const selection = state.get( 'selection' );

	const {
		getCurrentPostId,
		getSelectedBlock
	} = useSelect( select => {
		const getCurrentPostId = select( 'core/editor' ) ? select( 'core/editor' ).getCurrentPostId() : 0;
		const getSelectedBlock = select( 'core/block-editor' ).getSelectedBlock();

		return {
			getCurrentPostId: getCurrentPostId || 0,
			getSelectedBlock
		};
	}, []);

	const [ contentTypes, setContentTypes ] = useState([]);

	const [ selected, setSelected ] = useState( selection?._single?.attributes?.url );

	const [ attributes, setAttributes ] = useState({});

	const [ uid, setUid ] = useState( Math.floor( Math.random() * 89999999 + 10000000 ) );

	useEffect( () => {
		const filteredTypes = applyFilters( 'otter.dynamicContent.media.options', types );

		setContentTypes( filteredTypes );

		if ( undefined !== window?.otterCurrentMediaProps?.value && 8 === String( window?.otterCurrentMediaProps?.value ).length ) {
			const blockAttrs = getSelectedBlock.attributes;
			const obj = Object.keys( blockAttrs ).filter( i => 'string' === typeof blockAttrs[ i ] && blockAttrs[ i ]?.includes( 'otter/v1/dynamic' ) );
			const target = obj.find( o => blockAttrs[ o ]?.includes( window.otterCurrentMediaProps.value ) );

			const attrs = getObjectFromQueryString( blockAttrs[ target ] || '' );
			attrs.uid = uid;
			const url = window.themeisleGutenberg.restRoot + '/dynamic?' + getQueryStringFromObject( attrs );
			onSelect( url );
			window.otterCurrentMediaProps = {};
		}
	}, []);

	useEffect( () => {
		const attrs = getObjectFromQueryString( selected || '' );
		setAttributes( attrs );
	}, [ selected ]);

	const changeAttributes = obj => {
		let attrs = { ...attributes };

		Object.keys( obj ).forEach( o => {
			attrs[ o ] = obj[ o ];
		});

		attrs = Object.fromEntries( Object.entries( attrs ).filter( ([ _, v ]) => ( null !== v && '' !== v ) ) );

		const url = window.themeisleGutenberg.restRoot + '/dynamic?' + getQueryStringFromObject( attrs );

		onSelectImage({
			id: uid,
			url
		});

		setAttributes({ ...attrs });
	};

	const onSelect = ( value, reset = false ) => {
		if ( ! reset ) {
			setSelected( value );
		} else {
			setSelected( false );
		}

		return onSelectImage({
			id: uid,
			url: value
		});
	};

	return (
		<Fragment>
			<div className="attachments-browser">
				<ul className="o-media-list">
					{ contentTypes.map( ( item ) => {
						return (
							<MediaItem
								key={ item.type }
								uid={ uid }
								item={ item }
								context={ getCurrentPostId }
								isSelected={ selected ? selected?.includes( `dynamic?type=${ item.type }` ) : false }
								onSelect={ onSelect }
							/>
						);
					}) }
				</ul>
			</div>

			<div className="media-sidebar">
				<MediaSidebar
					contentTypes={ contentTypes }
					attributes={ attributes }
					changeAttributes={ changeAttributes }
				/>
			</div>
		</Fragment>
	);
};

export default MediaContent;
