/**
 * External dependencies.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { range } from 'lodash';

import { ResizableBox } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState,
	useRef
} from '@wordpress/element';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import CircularProgressBar from './components/circular-progress-bar.js';
import { blockInit } from '../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

const px = value => value ? `${ value }px` : value;

/**
 *
 * @param {import('./types').CircleCounterPros} param0
 * @returns
 */
const CircularProgressBarBlock = ({
	clientId,
	attributes,
	setAttributes,
	isSelected,
	toggleSelection
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const progressRef = useRef( null );
	const valueRef = useRef( null );
	const [ interval, changeInterval ] = useState({});

	const center = attributes.height / 2;
	const radius = center - attributes.strokeWidth / 2;
	const circumference = 2 * Math.PI * radius;

	useEffect( () => {
		if ( ! progressRef.current || ! progressRef.current || 0 === attributes.duration ) {
			return;
		}

		const step = 20; // miliseconds
		const ratio =  attributes.percentage / ( attributes.duration * 1000 ) ;
		const percentageValues = range( 0, attributes.duration * 1000 + step, step ).map( x => x * ratio ).reverse();

		if ( interval ) {
			clearInterval( interval );
		}

		progressRef.current.style.strokeDashoffset = circumference;
		valueRef.current.innerText = '0%';

		const interv = setInterval( () => {

			if ( ! progressRef.current ) {
				clearInterval( interv );
				return;
			}

			const percentage = Math.round( percentageValues.pop() );

			progressRef.current.style.strokeDashoffset = ( ( 100 - percentage ) / 100 ) * circumference;
			valueRef.current.innerHTML = percentage + '%';

			if ( 0 === percentageValues.length ) {
				clearInterval( interv );
			}
		}, step );

		changeInterval( interv );

		return () => {
			clearInterval( interv );
		};
	}, [ attributes.duration ]);

	useEffect( () => {
		if ( ! progressRef.current || ! progressRef.current ) {
			return;
		}

		progressRef.current.style.strokeDashoffset = ( ( 100 - attributes.percentage ) / 100 ) * circumference;
		valueRef.current.innerHTML = attributes.percentage + '%';

		clearInterval( interval );
		return () => {
			clearInterval( interval );
		};
	}, [ attributes.percentage, attributes.height ]);


	const onTitleChange = value => {
		setAttributes({ title: value });
	};


	const inlineStyles = {
		'--font-size-title': px( attributes.fontSizeTitle )
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{ ( 'default' === attributes.titleStyle ) && (
					<div className="wp-block-themeisle-blocks-circle-counter-title__area">
						<RichText
							tagName="span"
							allowedFormats={ [] }
							className="wp-block-themeisle-blocks-circle-counter-title__value"
							placeholder={ isSelected ? __( 'Write caption…', 'otter-blocks' ) : null }
							value={ attributes.title }
							onChange={ title => setAttributes({ title }) }
							multiline={ false }
							style={ {
								color: attributes.titleColor
							} }
						/>
					</div>
				) }

				<ResizableBox
					size={ {
						height: attributes.height,
						width: attributes.height
					} }
					minHeight={ 0 }
					maxHeight={ 240 }
					enable={ {
						top: false,
						right: false,
						bottom: true,
						left: false
					} }
					showHandle={ isSelected }
					onResizeStop={ ( event, direction, elt, delta ) => {
						setAttributes({ height: parseInt( attributes.height + delta.height, 10 ) });
						toggleSelection( true );
					} }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
				>
					<CircularProgressBar
						attributes={ attributes }
						progressRef={ progressRef }
						valueRef={ valueRef }
					/>
				</ResizableBox>

				{ ( 'bottom' === attributes.titleStyle ) && (
					<div className="wp-block-themeisle-blocks-circle-counter-title__area">
						<RichText
							tagName="span"
							allowedFormats={ [] }
							className="wp-block-themeisle-blocks-circle-counter-title__value"
							placeholder={ isSelected ? __( 'Write caption…', 'otter-blocks' ) : null }
							value={ attributes.title }
							onChange={ title => setAttributes({ title }) }
							multiline={ false }
							style={ {
								color: attributes.titleColor
							} }
						/>
					</div>
				) }
			</div>
		</Fragment>

	);
};

export default CircularProgressBarBlock;
