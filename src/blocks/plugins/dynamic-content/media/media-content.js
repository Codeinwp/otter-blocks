/**
 * External dependencies.
 */
import classNames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

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
	const url = themeisleGutenberg.restRoot + '/dynamic?type=' + type + '&context=' + context;
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

			<div className="media-sidebar"></div>
		</Fragment>
	);
};

export default MediaContent;
