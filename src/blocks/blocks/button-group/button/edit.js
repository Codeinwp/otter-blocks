
/**
 * External dependencies
 */

import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import themeIsleIcons from './../../../helpers/themeisle-icons';
import {
	blockInit,
	buildGetSyncValue
} from '../../../helpers/block-utility.js';
import { boxToCSS, objectOrNumberAsBox, _cssBlock, _px } from '../../../helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

/**
 * Button component
 * @param {import('./types').ButtonGroupButtonProps} props
 * @returns
 */
const Edit = ( props ) => {

	const {
		attributes,
		setAttributes,
		isSelected,
		clientId,
		name
	} = props;

	const getSyncValue = buildGetSyncValue( name, attributes, defaultAttributes );

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames( 'wp-block-button' )
	});

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

			<div { ...blockProps }>
				<style>
					{
						`.wp-block-themeisle-blocks-button-group #block-${clientId}.wp-block-button div.wp-block-button__link` + _cssBlock([
							[ 'background', getSyncValue( 'background' ) ],
							[ 'background', getSyncValue( 'backgroundGradient' ) ],
							[ 'border-width', boxToCSS( objectOrNumberAsBox( getSyncValue( 'borderSize' ) ) ), Boolean( getSyncValue( 'borderSize' ) ) ],
							[ 'border-color', getSyncValue( 'border' ) ],
							[ 'border-radius', boxToCSS( objectOrNumberAsBox( getSyncValue( 'borderRadius' ) ) ), Boolean( getSyncValue( 'borderRadius' ) ) ],
							[ 'box-shadow', `${ getSyncValue( 'boxShadowHorizontal' ) }px ${ getSyncValue( 'boxShadowVertical' ) }px ${ getSyncValue( 'boxShadowBlur' ) }px ${ getSyncValue( 'boxShadowSpread' ) }px ${ hexToRgba( ( getSyncValue( 'boxShadowColor' ) ? getSyncValue( 'boxShadowColor' ) : '#000000' ), getSyncValue( 'boxShadowColorOpacity' ) ) }`, Boolean(  getSyncValue( 'boxShadow' ) ) ]
						])
					}
					{
						`.wp-block-themeisle-blocks-button-group #block-${clientId}.wp-block-button .wp-block-button__link:hover` + _cssBlock([
							[ 'background', getSyncValue( 'hoverBackground' ) ],
							[ 'background', getSyncValue( 'hoverBackgroundGradient' ) ],
							[ 'border-color', getSyncValue( 'hoverBorder' ) ],
							[ 'box-shadow', `${ getSyncValue( 'hoverBoxShadowHorizontal' ) }px ${ getSyncValue( 'hoverBoxShadowVertical' ) }px ${ getSyncValue( 'hoverBoxShadowBlur' ) }px ${ getSyncValue( 'hoverBoxShadowSpread' ) }px ${ hexToRgba( ( getSyncValue( 'hoverBoxShadowColor' ) ? getSyncValue( 'hoverBoxShadowColor' ) : '#000000' ), Boolean( getSyncValue( 'hoverBoxShadowColorOpacity' ) ) ) }`, Boolean( getSyncValue( 'boxShadow' ) ) ]
						])
					}
					{
						`.wp-block-themeisle-blocks-button-group #block-${clientId}.wp-block-button .wp-block-button__link :is(svg, i, div)` + _cssBlock([
							[ 'color', getSyncValue( 'color' ) ],
							[ 'fill', getSyncValue( 'color' ) ]
						])
					}
					{
						`.wp-block-themeisle-blocks-button-group #block-${clientId}.wp-block-button .wp-block-button__link:hover :is(svg, i, div)` + _cssBlock([
							[ 'fill', getSyncValue( 'hoverColor' ) ],
							[ 'color', getSyncValue( 'hoverColor' ) ]
						])
					}
				</style>
				{ 'none' !== attributes.iconType ? (
					<div
						className="wp-block-button__link"
					>
						{ ( 'left' === attributes.iconType || 'only' === attributes.iconType ) && (
							'themeisle-icons' === attributes.library && attributes.icon ? (
								<Icon
									className={ classnames(
										{ 'margin-right': 'left' === attributes.iconType }
									) }
								/>
							) : (
								<i
									className={ classnames(
										attributes.prefix,
										'fa-fw',
										`fa-${ attributes.icon }`,
										{ 'margin-right': 'left' === attributes.iconType }
									) }
								>
								</i>
							)
						) }

						{ 'only' !== attributes.iconType && (
							<RichText
								placeholder={ __( 'Add text…', 'otter-blocks' ) }
								value={ attributes.text }
								onChange={ value => setAttributes({ text: value }) }
								tagName="div"
								withoutInteractiveFormatting
							/>
						) }

						{ 'right' === attributes.iconType && (
							'themeisle-icons' === attributes.library && attributes.icon ? (
								<Icon
									className="margin-left"
								/>
							) : (
								<i className={ `${ attributes.prefix } fa-fw fa-${ attributes.icon } margin-left` }></i>
							)
						) }
					</div>
				) : (
					<RichText
						placeholder={ __( 'Add text…', 'otter-blocks' ) }
						value={ attributes.text }
						onChange={ value => setAttributes({ text: value }) }
						tagName="div"
						withoutInteractiveFormatting
						className="wp-block-button__link"
					/>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
