/**
 * External dependencies.
 */
import classNames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Fragment } from '@wordpress/element';

const MediaItem = ({
	url,
	value,
	onSelectImage
}) => {
	const isSelected = url === value;
	console.log( url, value );

	return (
		<li
			tabIndex="0"
			className={ classNames( 'o-media-item', {
				'selected': url === value
			}) }
			onClick={ () => onSelectImage( url ) }
		>
			{ isSelected && (
				<button type="button" className="check" tabIndex="-1"><span className="media-modal-icon"></span><span className="screen-reader-text">{ __( 'Deselect', 'otter-blocks' ) }</span></button>
			) }
		</li>
	);
};

const MediaContent = ({
	value,
	onSelectImage
}) => {
	return (
		<Fragment>
			<div className="attachments-browser">
				<ul className="o-media-list">
					<MediaItem
						url={ 'http://www2.cnrs.fr/sites/communique/image/mona_unvarnish_web_image.jpg' }
						value={ value() }
						onSelectImage={ onSelectImage }
					/>

					<MediaItem
						url={ 'http://www2.cnrs.fr/sites/communique/image/mona_unvarnish_web_image1.jpg' }
						value={ value() }
						onSelectImage={ onSelectImage }
					/>

					<MediaItem
						url={ 'http://www2.cnrs.fr/sites/communique/image/mona_unvarnish_web_image2.jpg' }
						value={ value() }
						onSelectImage={ onSelectImage }
					/>
				</ul>
			</div>

			<div className="media-sidebar"></div>
		</Fragment>
	);
};

export default MediaContent;
