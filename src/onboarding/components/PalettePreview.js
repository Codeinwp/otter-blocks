/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__unstableMotion as motion
} from '@wordpress/components';

import { useReducedMotion } from '@wordpress/compose';

import {
	useEffect,
	useState
} from '@wordpress/element';


const firstFrame = {
	start: {
		scale: 1,
		opacity: 1
	},
	hover: {
		scale: 0,
		opacity: 0
	}
};

const secondFrame = {
	hover: {
		scale: 1,
		opacity: 1
	},
	start: {
		scale: 0,
		opacity: 0
	}
};

const PalettePreview = ({
	title,
	isSelected,
	backgroundColor,
	typographyColor,
	backgroundAltColor,
	primaryColor,
	typography,
	onSelect
}) => {
	const [ typographyStyles, setTypographyStyles ] = useState({});
	const [ isHovered, setIsHovered ] = useState( false );

	const disableMotion = useReducedMotion();

	useEffect( () => {
		const styles = {};

		if ( typography?.fontFamily ) {
			styles.fontFamily = typography.fontFamily;
		}

		setTypographyStyles( styles );
	}, []);

	return (
		<div
			onClick={ onSelect }
			className={ classnames( 'o-palette', {
				'is-selected': isSelected
			}) }
			onMouseEnter={ () => setIsHovered( true ) }
			onMouseLeave={ () => setIsHovered( false ) }
		>
			<motion.div
				className="o-palette__area"
				style={{
					backgroundColor
				}}
				initial="start"
				animate={ ( isHovered && ! disableMotion ) ? 'hover' : 'start' }
			>
				<motion.div
					className="o-palette__preview"
					variants={ firstFrame }
				>
					<div
						className="o-palette__typography"
						style={{
							color: typographyColor,
							...typographyStyles
						}}
					>
						{ __( 'Aa', 'otter-blocks' ) }
					</div>

					<div className="o-palette__colors">
						<div
							className="o-palette__color"
							style={{
								backgroundColor: backgroundAltColor
							}}
						/>

						<div
							className="o-palette__color"
							style={{
								backgroundColor: primaryColor
							}}
						/>
					</div>
				</motion.div>

				<motion.div
					className="o-palette__label"
					variants={ secondFrame }
					style={ {
						color: typographyColor,
						...typographyStyles
					} }
				>
					{ title }
				</motion.div>
			</motion.div>
		</div>
	);
};

export default PalettePreview;
