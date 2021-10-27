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

import {
	Dashicon,
	Button,
	Toolbar,
	Tooltip
} from '@wordpress/components';

import { BlockControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import Placeholder from './placeholder.js';
import Inspector from './inspector.js';
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
	const [ editMode, setEditMode ] = useState( ! Boolean( attributes.file ) );

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

		console.log( obj );
		setAttributes({ file: { ...obj } });
		setEditMode( false );
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

			{
				attributes.file && (
					<Inspector
						attributes={ attributes }
						setAttributes={ setAttributes }
						playerRef={ playerRef }
						editMode={ editMode }
						setEditMode={ setEditMode }
					/>
				)
			}

			<BlockControls>
				<Toolbar>
					<Tooltip text={ __( 'Edit', 'otter-blocks' ) }>
						<Button

							//className="components-icon-button components-toolbar__control wp-block-themeisle-blocks-plugin-cards-edit-plugin-card"
							onClick={ () => setEditMode( ! editMode ) }
						>
							<Dashicon icon="edit" />
						</Button>
					</Tooltip>
				</Toolbar>
			</BlockControls>

			{
				( isEmpty( attributes.file ) || editMode ) && (
					<Placeholder
						className={ className }
						value={ attributes.file }
						onChange={ onChangeFile }
						isJSONAllowed={ isJSONAllowed }
					/>
				)
			}

			{
				! ( isEmpty( attributes.file ) || editMode ) && (
					<LottiePlayer
						attributes={ attributes }
						className={ className }
						isSelected={ isSelected }
						playerRef={ playerRef }
					/>
				)
			}
		</Fragment>
	);
};

export default Edit;
