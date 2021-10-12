/**
 * Wordpress dependencies
 */
import {
	isEmpty,
	pick
} from 'lodash';

import {
	Fragment,
	useEffect,
	useRef
} from '@wordpress/element';

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
	};

	if ( isEmpty( attributes.file ) ) {
		return (
			<Placeholder
				className={ className }
				value={ attributes.file }
				onChange={ onChangeFile }
			/>
		);
	}

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				playerRef={ playerRef }
			/>

			<LottiePlayer
				attributes={ attributes }
				className={ className }
				isSelected={ isSelected }
				playerRef={ playerRef }
			/>
		</Fragment>
	);
};

export default Edit;
