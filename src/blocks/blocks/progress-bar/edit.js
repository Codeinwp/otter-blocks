/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { ResizableBox } from '@wordpress/components';

import { RichText } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';
import { blockInit } from '../../helpers/block-utility.js';
import Inspector from './inspector.js';

const ProgressBar = ({
	attributes,
	setAttributes,
	className,
	isSelected,
	clientId,
	toggleSelection
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ showPercentage, setShowPercentage ] = useState( false );

	const [ heightMode, setHeightMode ] = useState({
		isAutomatic: false,
		titleStyle: attributes.titleStyle,
		percentagePosition: attributes.percentagePosition
	});

	const barRef = useRef( null );

	useEffect( () => {
		if ( ! barRef.current ) {
			return;
		}

		setShowPercentage( false );

		setTimeout( () => setShowPercentage( true ),  attributes.duration * 1000 );

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
	}, [ attributes.percentage, attributes.duration ]);

	const fontRatio = 0.65;

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

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				onHeightChange={ onHeightChange }
				heightMode={ heightMode }
				setHeightMode={ setHeightMode }
			/>

			<div
				className={ classnames( className, {'has-tooltip': 'tooltip' === attributes.percentagePosition }) }
				id={ attributes.id }
			>
				{ ( 'outer' === attributes.titleStyle || 'outer' === attributes.percentagePosition ) && (
					<div className="wp-block-themeisle-blocks-progress-bar__outer">
						{ 'outer' === attributes.titleStyle && (
							<RichText
								tagName="span"
								allowedFormats={ [] }
								className="wp-block-themeisle-blocks-progress-bar__outer__title"
								value={ attributes.title }
								style={ { color: attributes.titleColor } }
								onChange={ e => setAttributes({ title: e }) }
							/>
						) }

						{ 'outer' === attributes.percentagePosition && showPercentage && (
							<div
								className="wp-block-themeisle-blocks-progress-bar__progress wp-block-themeisle-blocks-progress-bar__outer__value"
								style={ { color: attributes.percentageColor } }
							>
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
						className="wp-block-themeisle-blocks-progress-bar__area"
						style={ {
							background: attributes.backgroundColor,
							borderRadius: `${ attributes.borderRadius }px`,
							height: `${ attributes.height }px`
						} }
					>
						{ ( 'default' === attributes.titleStyle || 'highlight' === attributes.titleStyle ) && (
							<div
								className={ classnames(
									'wp-block-themeisle-blocks-progress-bar__area__title',
									{ 'highlight': 'highlight' === attributes.titleStyle }
								) }
								style={ {
									fontSize: `${ attributes.height * fontRatio }px`,
									background: 'highlight' === attributes.titleStyle && attributes.barBackgroundColor,
									borderRadius: `${ attributes.borderRadius }px 0px 0px ${ attributes.borderRadius }px`,
									height: `${ attributes.height }px`
								} }
							>
								<RichText
									tagName="span"
									allowedFormats={ [] }
									value={ attributes.title }
									style={ {
										height: `${ attributes.height }px`,
										color: attributes.titleColor,
										borderRadius: `${ attributes.borderRadius }px 0px 0px ${ attributes.borderRadius }px`
									} }
									onChange={ e => setAttributes({ title: e }) }
								/>
							</div>
						) }

						<div
							className="wp-block-themeisle-blocks-progress-bar__area__bar show"
							ref={ barRef }
							style={ {
								background: attributes.barBackgroundColor,
								borderRadius: `${ attributes.borderRadius }px`,
								height: `${ attributes.height }px`
							} }
						>
							{ 'tooltip' === attributes.percentagePosition && showPercentage && (
								<span
									className="wp-block-themeisle-blocks-progress-bar__area__tooltip show"
									style={ { color: attributes.percentageColor } }
								>
									{ `${ attributes.percentage }%` }
									<span className="wp-block-themeisle-blocks-progress-bar__area__arrow"></span>
								</span>
							)}

							{ 'append' === attributes.percentagePosition && showPercentage && (
								<div
									className="wp-block-themeisle-blocks-progress-bar__progress__append show"
									style={ {
										fontSize: `${ attributes.height * fontRatio }px`,
										height: `${ attributes.height }px`,
										color: attributes.percentageColor
									} }
								>
									{ `${ attributes.percentage }%` }
								</div>
							)}
						</div>

						{ 'default' === attributes.percentagePosition && showPercentage && (
							<div
								className="wp-block-themeisle-blocks-progress-bar__progress"
								style={ {
									fontSize: `${ attributes.height * fontRatio }px`,
									height: `${ attributes.height }px`,
									color: attributes.percentageColor
								} }
							>
								{ `${ attributes.percentage }%` }
							</div>
						)}
					</div>
				</ResizableBox>
			</div>
		</Fragment>
	);
};

export default ProgressBar;
