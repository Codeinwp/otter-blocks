/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { ResizableBox } from '@wordpress/components';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../helpers/block-utility.js';
import Inspector from './inspector.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Progress Bar Block
 * @param {import('./types').ProgressBarProps} props
 * @returns
 */
const ProgressBar = ({
	attributes,
	setAttributes,
	isSelected,
	clientId,
	toggleSelection
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const blockRef = useRef( null );

	const [ showPercentage, setShowPercentage ] = useState( false );

	const [ heightMode, setHeightMode ] = useState({
		isAutomatic: false,
		titleStyle: attributes.titleStyle,
		percentagePosition: attributes.percentagePosition
	});

	const barRef = useRef( null );

	useEffect( () => {
		let timeoutID = null;

		if ( ! barRef.current ) {
			return;
		}

		setShowPercentage( false );

		timeoutID = setTimeout( () => setShowPercentage( true ), attributes.duration * 1000 );

		barRef.current.animate(
			{
				width: `${ attributes.percentage }%`
			},
			{
				duration: attributes.duration * 1000,
				easing: 'linear',
				fill: 'forwards'
			}
		);

		return () => {
			clearTimeout( timeoutID );
		};
	}, [ attributes.percentage, attributes.duration ]);

	const inlineStyles = {
		'--title-color': attributes.titleColor,
		'--percentage-color': attributes.percentageColor,
		'--percentage-color-outer': attributes.percentageColor,
		'--percentage-color-tooltip': attributes.percentageColor,
		'--percentage-color-append': attributes.percentageColor,
		'--background-color': attributes.backgroundColor,
		'--border-radius': attributes.borderRadius !== undefined && ( attributes.borderRadius + 'px' ),
		'--height': attributes.height !== undefined && ( attributes.height + 'px' ),
		'--bar-background': attributes.barBackgroundColor
	};

	const onHeightChange = value => {
		if ( 30 > value ) {
			if ( ! heightMode.isAutomatic ) {
				setHeightMode({
					isAutomatic: true,
					titleStyle: attributes.titleStyle,
					percentagePosition: attributes.percentagePosition
				});
			}

			setAttributes({
				height: value,
				titleStyle: 'outer',
				percentagePosition: 'append' === attributes.percentagePosition || 'default' === attributes.percentagePosition ? 'outer' : attributes.percentagePosition
			});
		} else {
			if ( heightMode.isAutomatic ) {
				setHeightMode({
					isAutomatic: false
				});
			}

			setAttributes({
				titleStyle: heightMode.isAutomatic ? heightMode.titleStyle : attributes.titleStyle,
				percentagePosition: heightMode.isAutomatic ? heightMode.percentagePosition : attributes.percentagePosition,
				height: value
			});
		}
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames({ 'has-tooltip': 'tooltip' === attributes.percentagePosition }),
		style: inlineStyles
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				onHeightChange={ onHeightChange }
				heightMode={ heightMode }
				setHeightMode={ setHeightMode }
			/>

			<div { ...blockProps }>
				{ ( 'outer' === attributes.titleStyle || 'outer' === attributes.percentagePosition ) && (
					<div className="wp-block-themeisle-blocks-progress-bar__outer">
						{ 'outer' === attributes.titleStyle && (
							<RichText
								tagName="span"
								allowedFormats={ [] }
								className="wp-block-themeisle-blocks-progress-bar__outer__title"
								value={ attributes.title }
								onChange={ e => setAttributes({ title: e }) }
							/>
						) }

						{ 'outer' === attributes.percentagePosition && showPercentage && (
							<div className="wp-block-themeisle-blocks-progress-bar__progress wp-block-themeisle-blocks-progress-bar__outer__value">
								{ `${ attributes.percentage }%` }
							</div>
						)}
					</div>
				) }

				<ResizableBox
					size={ {
						height: attributes.height
					} }
					minHeight={ 5 }
					maxHeight={ 100 }
					enable={ {
						top: false,
						right: false,
						bottom: true,
						left: false
					} }
					showHandle={ isSelected }
					onResizeStop={ ( event, direction, elt, delta ) => {
						onHeightChange( parseInt( attributes.height + delta.height, 10 ) );
						toggleSelection( true );
					} }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
				>

					<div
						ref={ blockRef }
						className="wp-block-themeisle-blocks-progress-bar__area"
					>
						{ ( 'default' === attributes.titleStyle || 'highlight' === attributes.titleStyle ) && (
							<div
								className={ classnames(
									'wp-block-themeisle-blocks-progress-bar__area__title',
									{ 'highlight': 'highlight' === attributes.titleStyle }
								) }
							>
								<RichText
									tagName="span"
									allowedFormats={ [] }
									value={ attributes.title }
									onChange={ e => setAttributes({ title: e }) }
								/>
							</div>
						) }

						<div
							className="wp-block-themeisle-blocks-progress-bar__area__bar show"
							ref={ barRef }
						>
							{ 'tooltip' === attributes.percentagePosition && showPercentage && (
								<span className="wp-block-themeisle-blocks-progress-bar__area__tooltip show">
									{ `${ attributes.percentage }%` }
									<span className="wp-block-themeisle-blocks-progress-bar__area__arrow"></span>
								</span>
							)}

							{ 'append' === attributes.percentagePosition && showPercentage && (
								<div className="wp-block-themeisle-blocks-progress-bar__progress__append show">{ `${ attributes.percentage }%` }</div>
							)}
						</div>

						{ 'default' === attributes.percentagePosition && showPercentage && (
							<div className="wp-block-themeisle-blocks-progress-bar__progress">{ `${ attributes.percentage }%` }</div>
						)}
					</div>
				</ResizableBox>
			</div>
		</Fragment>
	);
};

export default ProgressBar;
