/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	startCase,
	toLower
} from 'lodash';

import { __ } from '@wordpress/i18n';

import { useInstanceId } from '@wordpress/compose';

import {
	Button,
	BaseControl,
	Dropdown,
	MenuGroup,
	MenuItem,
	SelectControl,
	TextControl
} from '@wordpress/components';

import {
	useEffect,
	useState
} from '@wordpress/element';

/**
* Internal dependencies
*/
import './editor.scss';

const GoogleFontsControl = ({
	label,
	value,
	valueVariant,
	valueStyle,
	valueTransform,
	isSelect = false,
	onChangeFontFamily,
	onChangeFontVariant,
	onChangeFontStyle,
	onChangeTextTransform
}) => {
	const instanceId = useInstanceId( GoogleFontsControl );

	useEffect( () => {
		fetch( 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyClGdkPJ1BvgLOol5JAkQY4Mv2lkLYu00k' )
			.then( blob => blob.json() )
			.then( data => {
				setFonts( data.items );
				if ( value ) {
					data.items.find( i => {
						if ( value === i.family ) {
							const variants = ( i.variants )
								.filter( o => false === o.includes( 'italic' ) )
								.map( o => {
									return o = {
										'label': startCase( toLower( o ) ),
										'value': o
									};
								});
							return setVariants( variants );
						}
					});
				}
			});
	}, []);

	const [ fonts, setFonts ] = useState( null );
	const [ variants, setVariants ] = useState( null );
	const [ search, setSearch ] = useState( '' );

	const id = `inspector-google-fonts-control-${ instanceId }`;

	return (
		<div className="otter-gfont-control">
			<BaseControl
				label={ label }
				id={ id }
			>
				{ ( null !== fonts ) ? (
					( isSelect ) ? (
						<SelectControl
							value={ value || '' }
							id={ id }
							options={ [
								{
									label: __( 'Default', 'otter-blocks' ),
									value: ''
								},
								...fonts.map( i => {
									return i = {
										label: i.family,
										value: i.family
									};
								})
							] }
							onChange={ e => {
								let variants = [];

								if ( '' === e ) {
									variants = [
										{
											'label': __( 'Regular', 'otter-blocks' ),
											'value': 'regular'
										},
										{
											'label': __( 'Italic', 'otter-blocks' ),
											'value': 'italic'
										}
									];
									onChangeFontFamily( undefined );
									setVariants( variants );
									return;
								}

								onChangeFontFamily( e );

								const font = fonts.find( i => e === i.family );

								variants = ( font.variants )
									.filter( o => false === o.includes( 'italic' ) )
									.map( o => {
										return o = {
											'label': startCase( toLower( o ) ),
											'value': o
										};
									});

								setVariants( variants );
							} }
						/>
					) : (
						<Dropdown
							contentClassName="otter-gfont-popover"
							position="bottom center"
							renderToggle={ ({ isOpen, onToggle }) => (
								<Button
									isLarge
									className="otter-gfont-button"
									id={ id }
									onClick={ onToggle }
									aria-expanded={ isOpen }
								>
									{ value ? value : __( 'Select Font Family', 'otter-blocks' ) }
								</Button>
							) }
							renderContent={ ({ onToggle }) => (
								<MenuGroup label={ __( 'Google Fonts', 'otter-blocks' ) }>
									<TextControl
										value={ search }
										onChange={ e => setSearch( e ) }
									/>

									<div className="components-popover__items">
										<MenuItem
											onClick={ () => {
												onToggle();
												onChangeFontFamily( undefined );
												setVariants([]);
												setSearch( '' );
											}}
										>
											{ __( 'Default', 'otter-blocks' ) }
										</MenuItem>

										{ ( fonts ).map( i => {
											if ( ! search || i.family.toLowerCase().includes( search.toLowerCase() ) ) {
												return (
													<MenuItem
														className={ classnames(
															{ 'is-selected': ( i.family === value ) }
														) }
														onClick={ () => {
															onToggle();
															onChangeFontFamily( i.family );

															const variants = ( i.variants )
																.filter( o => false === o.includes( 'italic' ) )
																.map( o => {
																	return o = {
																		'label': startCase( toLower( o ) ),
																		'value': o
																	};
																});

															setVariants( variants );
															setSearch( '' );
														}}
													>
														{ i.family }
													</MenuItem>
												);
											}
										}) }
									</div>
								</MenuGroup>
							) }
						/>
					)
				) : (
					__( 'Loading…', 'otter-blocks' )
				) }
			</BaseControl>

			{ variants && (
				<SelectControl
					label={ __( 'Font Width', 'otter-blocks' ) }
					value={ valueVariant || 'regular' }
					options={ variants }
					onChange={ onChangeFontVariant }
				/>
			) }

			<SelectControl
				label={ __( 'Font Style', 'otter-blocks' ) }
				value={ valueStyle }
				options={ [
					{
						label: __( 'Regular', 'otter-blocks' ),
						value: 'normal'
					},
					{
						label: __( 'Italic', 'otter-blocks' ),
						value: 'italic'
					}
				] }
				onChange={ onChangeFontStyle }
			/>

			<SelectControl
				label={ __( 'Font Transform', 'otter-blocks' ) }
				value={ valueTransform }
				options={ [
					{
						label: __( 'Default', 'otter-blocks' ),
						value: 'none'
					},
					{
						label: __( 'Uppercase', 'otter-blocks' ),
						value: 'uppercase'
					},
					{
						label: __( 'Lowercase', 'otter-blocks' ),
						value: 'lowercase'
					},
					{
						label: __( 'Capitalize', 'otter-blocks' ),
						value: 'capitalize'
					}
				] }
				onChange={ onChangeTextTransform }
			/>
		</div>
	);
};

export default GoogleFontsControl;
