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

/**
 * Internal dependencies.
 */
import {
	getObjectFromQueryString,
	getQueryStringFromObject
} from '../../../helpers/helper-functions.js';
import SelectProducts from '../../../components/select-products-control/index.js';

const contentTypes = [
	{
		type: 'featuredImage',
		label: __( 'Featured Image', 'otter-blocks' )
	},
	{
		type: 'authorImage',
		label: __( 'Author Image', 'otter-blocks' )
	},
	{
		type: 'loggedInUserImage',
		label: __( 'Logged-in User Avatar', 'otter-blocks' )
	},
	{
		type: 'productImage',
		label: __( 'WooCommerce Product Image', 'otter-blocks' )
	},
	{
		type: 'postMetaImage',
		label: __( 'Post Meta', 'otter-blocks' )
	}
];

const MediaItem = ({
	label,
	type,
	context,
	selected,
	onSelect
}) => {
	const url = window.themeisleGutenberg.restRoot + '/dynamic?type=' + type + '&context=' + context;
	const isSelected = url === selected;

	return (
		<li
			tabIndex="0"
			className={ classNames( 'o-media-item', {
				'selected': isSelected
			}) }
			onClick={ () => onSelect( url ) }
			title={ label }
		>
			{ isSelected && (
				<button
					type="button"
					className="check"
					tabIndex="-1"
					onClick={ () => onSelect( url ) }
				>
					<span className="media-modal-icon"></span>
					<span className="screen-reader-text">{ __( 'Deselect', 'otter-blocks' ) }</span>
				</button>
			) }
		</li>
	);
};

const MediaSidebar = ({
	attributes,
	changeAttributes
}) => {
	const selected = contentTypes.find( ({ type }) => type === attributes.type );

	return (
		<Fragment>
			<div className="attachment-details">
				{ selected && <h2>{ selected?.label }</h2> }
			</div>

			{ 'productImage' === selected?.type && (
				<SelectProducts
					label={ __( 'Select Product', 'otter-blocks' ) }
					value={ attributes.id || '' }
					onChange={ product => changeAttributes({ id: 0 === product ? undefined : product }) }
				/>
			) }

			{ 'postMetaImage' === selected?.type && (
				<TextControl
					label={ __( 'Meta Key', 'otter-blocks' ) }
					value={ attributes.meta || '' }
					onChange={ meta => changeAttributes({ meta }) }
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

	const { getCurrentPostId } = useSelect( select => {
		const getCurrentPostId = select( 'core/editor' ).getCurrentPostId();

		return {
			getCurrentPostId
		};
	}, []);

	const [ selected, setSelected ] = useState( selection?._single?.attributes?.url );

	const [ attributes, setAttributes ] = useState({});

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

		onSelectImage( url );

		setAttributes({ ...attrs });
	};

	const onSelect = value => {
		if ( selected !== value ) {
			setSelected( value );
		} else {
			setSelected( false );
		}

		return onSelectImage( value );
	};

	return (
		<Fragment>
			<div className="attachments-browser">
				<ul className="o-media-list">
					{ contentTypes.map( ({ type, label }) => {
						return (
							<MediaItem
								key={ type }
								label={ label }
								type={ type }
								context={ getCurrentPostId }
								selected={ selected }
								onSelect={ onSelect }
							/>
						);
					}) }
				</ul>
			</div>

			<div className="media-sidebar">
				<MediaSidebar
					attributes={ attributes }
					changeAttributes={ changeAttributes }
				/>
			</div>
		</Fragment>
	);
};

export default MediaContent;
