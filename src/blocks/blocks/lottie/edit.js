/**
 * Wordpress dependencies
 */
import {
	isEmpty,
	pick
} from 'lodash';

import { __ } from '@wordpress/i18n';

import {
	Fragment,
	useEffect,
	useState,
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Placeholder from './placeholder.js';
import Inspector from './inspector.js';
import Controls from './controls.js';
import LottiePlayer from './components/lottie-player.js';
import { blockInit } from '../../helpers/block-utility.js';
import defaultAttributes from './attributes.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	isSelected,
	clientId
}) => {
	const playerRef = useRef( null );
	const [ isEditing, setEditing ] = useState( ! Boolean( attributes.file ) );

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const onChangeFile = value => {
		if ( '' === value || null === value ) {
			return;
		}

		const obj = pick( value, [ 'id', 'url' ]);

		if ( isEmpty( obj ) ) {
			obj.url = value;
		}

		setAttributes({ file: { ...obj } });
		setEditing( false );
	};

	useEffect( () => {
		window.wp.api.loadPromise.then( () => {
			const settings = new window.wp.api.models.Settings();

			settings.fetch().then( response => {
				if ( response.themeisle_allow_json_upload ) {
					setJSONAllowed( response.themeisle_allow_json_upload );
				}
			});
		});
	}, []);

	const [ isJSONAllowed, setJSONAllowed ] = useState( false );

	return (
		<Fragment>
			<Controls
				isEditing={ isEditing }
				setEditing={ setEditing }
			/>

			{ ( isEmpty( attributes.file ) || isEditing ) && (
				<Placeholder
					className={ className }
					value={ attributes.file }
					onChange={ onChangeFile }
					isJSONAllowed={ isJSONAllowed }
					attributes={ attributes }
				/>
			) }

			{ ! ( isEmpty( attributes.file ) || isEditing ) && (
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					playerRef={ playerRef }
				/>
			) }

			{ ! ( isEmpty( attributes.file ) || isEditing ) && (
				<LottiePlayer
					attributes={ attributes }
					className={ className }
					isSelected={ isSelected }
					playerRef={ playerRef }
				/>
			) }
		</Fragment>
	);
};

export default Edit;
