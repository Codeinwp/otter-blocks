/**
 * Wordpress dependencies
 */
import {
	isEmpty,
	pick
} from 'lodash';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useState,
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Placeholder from './placeholder.js';
import Inspector from './inspector.js';
import Controls from './controls.js';
import LottiePlayer from './components/lottie-player.js';
import { blockInit } from '../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Lottie component
 * @param {import('./types').LottieProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
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

	const blockProps = useBlockProps();

	return (
		<Fragment>
			{ ( ( ! isEmpty( attributes.file ) && isEditing ) || ! isEditing ) && (
				<Controls
					isEditing={ isEditing }
					setEditing={ setEditing }
				/>
			) }

			{ ! ( isEmpty( attributes.file ) || isEditing ) && (
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					playerRef={ playerRef }
				/>
			) }

			<div { ...blockProps }>
				{ ( isEmpty( attributes.file ) || isEditing ) && (
					<Placeholder
						value={ attributes.file }
						onChange={ onChangeFile }
						attributes={ attributes }
					/>
				) }

				{ ! ( isEmpty( attributes.file ) || isEditing ) && (
					<LottiePlayer
						attributes={ attributes }
						isSelected={ isSelected }
						playerRef={ playerRef }
					/>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
