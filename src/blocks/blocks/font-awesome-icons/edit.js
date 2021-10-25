/**
 * WordPress dependencies...
 */
import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import themeIsleIcons from './../../helpers/themeisle-icons';
import { blockInit } from '../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	isSelected,
	clientId
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	let iconStyle = {
		borderRadius: attributes.borderRadius + '%',
		fontSize: attributes.fontSize + 'px',
		padding: attributes.padding + 'px'
	};

	if ( 'themeisle-icons' === attributes.library ) {
		iconStyle = {
			fill: attributes.textColor,
			padding: attributes.padding + 'px',
			width: attributes.fontSize + attributes.padding * 2 + attributes.borderSize * 2
		};
	}

	const containerStyle = {
		color: attributes.textColor,
		backgroundColor: attributes.backgroundColor,
		borderColor: attributes.borderColor,
		borderRadius: attributes.borderRadius + '%',
		borderStyle: 'solid',
		borderWidth: attributes.borderSize + 'px',
		margin: attributes.margin + 'px',
		width: attributes.fontSize + attributes.padding * 2 + attributes.borderSize * 2
	};

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				isSelected={ isSelected }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<style>
				{
					`#${ attributes.id } .${ className }-container:hover {
						color: ${ attributes.textColorHover ? attributes.textColorHover : attributes.textColor } !important;
						background: ${ attributes.backgroundColorHover ? attributes.backgroundColorHover : attributes.backgroundColor } !important;
						border-color: ${ attributes.borderColorHover ? attributes.borderColorHover : attributes.borderColor } !important;
					}

					#${ attributes.id } .${ className }-container:hover svg {
						fill: ${ attributes.textColorHover ? attributes.textColorHover : attributes.textColor } !important;
					}`
				}
			</style>

			<p
				className={ className }
				id={ attributes.id }
				style={ { textAlign: attributes.align } }
			>
				<span
					className="wp-block-themeisle-blocks-font-awesome-icons-container"
					style={ containerStyle }
				>
					{ 'themeisle-icons' === attributes.library ?
						<Icon style={ iconStyle } /> :
						<i
							className={ `${ attributes.prefix } fa-${ attributes.icon }` }
							style={ iconStyle }
						>
						</i>
					}
				</span>
			</p>
		</Fragment>
	);
};

export default Edit;
