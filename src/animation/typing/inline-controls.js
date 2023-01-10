/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalHeading as Heading,
	Popover,
	SelectControl
} from '@wordpress/components';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	useEffect,
	useState
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

import { useAnchorRef } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import {
	delayList,
	speedList
} from '../data.js';

import { format as settings } from './index.js';

import { updateAnimConfig } from '../editor.js';

const InlineControls = ({
	value,
	contentRef
}) => {
	useEffect( () => {
		let classes;

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );

			const typingDelayClass = Array.from( delayList ).find( ( i ) => {
				return classes.find( ( o ) => o === `o-typing-${ i.value }` );
			});

			const typingSpeedClass = Array.from( speedList ).find( ( i ) => {
				return classes.find( ( o ) => o === `o-typing-${ i.value }` );
			});

			setTypingDelay( typingDelayClass ? typingDelayClass.value : 'none' );
			setTypingSpeed( typingSpeedClass ? typingSpeedClass.value : 'none' );
		}

	}, []);

	const {
		clientId,
		attributes
	} = useSelect( select => {
		const { getSelectedBlock } = select( 'core/block-editor' );

		const currentBlock = getSelectedBlock();

		return {
			clientId: currentBlock?.clientId,
			attributes: currentBlock?.attributes
		};
	}, []);

	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const setAttributes = attributes => updateBlockAttributes( clientId, attributes );

	const [ typingDelay, setTypingDelay ] = useState( 'none' );
	const [ typingSpeed, setTypingSpeed ] = useState( 'none' );

	const anchorRef = useAnchorRef({ ref: contentRef, value, settings });

	return (
		<Popover
			position="bottom center right"
			placement="bottom"
			noArrow={ false }
			anchor={ anchorRef }
			anchorRef={ anchorRef }
			focusOnMount={ false }
			className="o-animation-popover"
		>
			<Heading level={ 4 }>{ __( 'Typing Animation', 'otter-blocks' ) }</Heading>

			<SelectControl
				label={ __( 'Delay', 'otter-blocks' ) }
				value={ typingDelay || 'none' }
				options={ delayList }
				onChange={ value => updateAnimConfig( 'typing', typingDelay, value, () => setTypingDelay( value ), attributes, setAttributes ) }
			/>

			<SelectControl
				label={ __( 'Speed', 'otter-blocks' ) }
				value={ typingSpeed || 'none' }
				options={ speedList }
				onChange={ value => updateAnimConfig( 'typing', typingSpeed, value, () => setTypingSpeed( value ), attributes, setAttributes ) }
			/>

			{ applyFilters( 'otter.poweredBy', '' ) }
		</Popover>
	);
};

export default InlineControls;
