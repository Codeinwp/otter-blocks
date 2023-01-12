import {
	startCase,
	toLower,
	mapValues
} from 'lodash';


import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	Dropdown,
	FontSizePicker,
	MenuGroup,
	MenuItem,
	SelectControl,
	TextControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalUnitControl as UnitControl,
	__experimentalHStack as HStack,
	DropdownMenu,
	RangeControl,
	Disabled
} from '@wordpress/components';
import ToogleGroupControl from '../toogle-group-control';
import { check, formatCapitalize, formatLowercase, formatStrikethrough, formatUnderline, formatUppercase, moreVertical, reset } from '@wordpress/icons';
import { Fragment, useEffect, useState } from '@wordpress/element';
import './editor.scss';
import { useInstanceId } from '@wordpress/compose';
import googleFontsLoader from '../../helpers/google-fonts';
import classNames from 'classnames';

const TwoItemOnRow = ({ children }) => {
	return <div className='o-two-column-components'>
		{ children }
	</div>;
};

interface IsEnabled {
	fontFamily: boolean;
	appearance: boolean;
	spacing: boolean;
	decoration: boolean;
	letterCase: boolean;
	lineHeight: boolean;
}

interface ComponentsValue {
	fontSize: string,
	fontFamily: string;
	appearance: string;
	spacing: string;
	decoration: string;
	letterCase: string;
	lineHeight: string | number;
}

type OnChange = ( values: Partial<ComponentsValue> ) => void

const defaultStates = {
	isEnabled: {
		fontFamily: false,
		appearance: false,
		spacing: false,
		decoration: false,
		letterCase: false,
		lineHeight: false
	},
	fontSizes: [
		{
			name: __( '14', 'otter-blocks' ),
			slug: 'extra-small',

			/*@ts-ignore */
			size: '14px'
		},
		{
			name: __( '16', 'otter-blocks' ),
			slug: 'small',

			/*@ts-ignore */
			size: '16px'
		},
		{
			name: __( '18', 'otter-blocks' ),
			slug: 'medium',

			/*@ts-ignore */
			size: '18px'
		},
		{
			name: __( '24', 'otter-blocks' ),
			slug: 'large',

			/*@ts-ignore */
			size: '24px'
		},
		{
			name: __( '28', 'otter-blocks' ),
			slug: 'extra-large',

			/*@ts-ignore */
			size: '28px'
		}
	],
	componentNames: {
		fontSize: __( 'Font Size', 'otter-blocks' ),
		fontFamily: __( 'Font Family', 'otter-blocks' ),
		appearance: __( 'Appearance', 'otter-blocks' ),
		spacing: __( 'Spacing', 'otter-blocks' ),
		decoration: __( 'Decoration', 'otter-blocks' ),
		letterCase: __( 'Letter Case', 'otter-blocks' ),
		lineHeight: __( 'Line Height', 'otter-blocks' )
	}
};

type TypographySelectorControlProps = {
	enableComponents?: Partial<IsEnabled>
	showComponents?: Partial<IsEnabled>
	componentsValue?: Partial<ComponentsValue>
	componentsDefaultValue?: Partial<ComponentsValue>
	onChange?: OnChange
	fontSizes?: ({ name?: string, slug?: string, size?: string | number })[]
	config?: {
		fontFamilyAsSelect?: boolean
	}
}

const TypographySelectorControl = ( props: TypographySelectorControlProps ) => {

	const {
		enableComponents,
		componentsValue,
		componentsDefaultValue,
		showComponents,
		onChange
	} = props;

	const [ showComponent, setShowComponent ] = useState(
		mapValues( componentsValue ?? defaultStates.isEnabled, x => Boolean( x ) )
	);

	const onChangeValue = ( field: keyof ComponentsValue, value: ComponentsValue[keyof ComponentsValue] | undefined ) => {
		onChange?.({ ...( componentsValue ?? {}), [ field ]: value });
	};

	const instanceId = useInstanceId( TypographySelectorControl );
	const id = `inspector-google-fonts-control-${ instanceId }`;

	const [ fonts, setFonts ] = useState<any[]>([]);

	// const [ variants, setVariants ] = useState<{label: string, value: string}[]>([]);
	const [ search, setSearch ] = useState( '' );

	useEffect( () => {
		console.count( 'Font' );
		if ( showComponent?.fontFamily && 0 === fonts.length ) {
			googleFontsLoader.afterLoading().then( ( loader ) => {
				setFonts( loader.fonts );

				// if ( componentsValue?.fontFamily ) {
				// 	setVariants( loader.getVariants( componentsValue?.fontFamily ) );
				// }
			});
		}
	}, [ showComponent?.fontFamily, fonts ]);

	return (
		<div>
			<HStack className="o-typo-header">
				<p>{ __( 'Font Size', 'otter-blocks' ) }</p>

				<DropdownMenu
					icon={ moreVertical }
					label={ __( 'View options', 'otter-blocks' ) }
					toggleProps={ { isSmall: true } }
				>
					{ ({ onClose = noop }) => (
						<Fragment>
							<MenuGroup>
								<Disabled>
									<MenuItem
										key={ 'fontSize' }
										isSelected={ true }
										label={ defaultStates.componentNames?.fontSize }
										icon={  check  }
										onClick={ () => {

										} }
										role="menuitemcheckbox"
									>
										{ defaultStates.componentNames?.fontSize }
									</MenuItem>
								</Disabled>
							</MenuGroup>

							<MenuGroup>
								{
									([
										'fontFamily',
										'appearance',
										'spacing',
										'decoration',
										'letterCase',
										'lineHeight'
									] as ( keyof IsEnabled )[]).map( ( component ) => {
										if ( enableComponents?.[component]) {
											return <MenuItem
												key={ component }
												isSelected={ Boolean( showComponent?.[component]) }
												label={ defaultStates.componentNames?.[component] }
												icon={ Boolean( showComponent?.[component]) ? check : undefined }
												onClick={ () => {
													setShowComponent({
														...showComponent,
														[component]: ! Boolean( showComponent?.[component])
													});

													onChange?.({
														[component]: undefined
													});

												} }
												role="menuitemcheckbox"
											>
												{ defaultStates.componentNames?.[component] }
											</MenuItem>;
										}
										return <Fragment></Fragment>;
									})
								}
							</MenuGroup>

							<MenuGroup>
								<MenuItem
									variant={ 'tertiary' }
									onClick={ () => {
										onChange?.({
											fontFamily: undefined,
											appearance: undefined,
											spacing: undefined,
											decoration: undefined,
											letterCase: undefined,
											lineHeight: undefined
										});
										setShowComponent( defaultStates.isEnabled );
										onClose?.();
									} }
								>
									{ __( 'Reset all', 'otter-blocks' ) }
								</MenuItem>
							</MenuGroup>
						</Fragment>
					) }
				</DropdownMenu>
			</HStack>

			<FontSizePicker

				/*@ts-ignore */
				value={ componentsValue?.fontSize ?? componentsDefaultValue?.fontSize }

				/*@ts-ignore */
				fontSizes={ props.fontSizes ?? defaultStates.fontSizes }
				onChange={ fontSize => onChangeValue( 'fontSize', fontSize?.toString() ) }
			/>


			{
				showComponent?.fontFamily && (
					<div className="o-gfont-control">
						<BaseControl
							label={ 'Font Family' }
							id={ id }
							className="o-no-margin"
						>
							{ ( null !== fonts ) ? (
								( Boolean( props.config?.fontFamilyAsSelect ) ) ? (
									<SelectControl
										value={ componentsValue?.fontFamily ?? componentsDefaultValue?.fontFamily }
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
											if ( '' === e ) {
												onChangeValue( 'fontFamily', undefined );
												return;
											}

											onChangeValue( 'fontFamily', e );
										} }
									/>
								) : (
									<Dropdown
										contentClassName="o-gfont-popover"
										position="bottom center"
										renderToggle={ ({ isOpen, onToggle }) => (
											<Button
												className="o-gfont-button"
												id={ id }
												onClick={ onToggle }
												aria-expanded={ isOpen }
											>
												{ componentsValue?.fontFamily ?? componentsDefaultValue?.fontFamily ?? __( 'Select Font Family', 'otter-blocks' ) }
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
															onChangeValue( 'fontFamily', undefined );
															setSearch( '' );
														}}
													>
														{ __( 'Default', 'otter-blocks' ) }
													</MenuItem>

													{ ( fonts ).map( ( i, index ) => {
														if ( ! search || i.family.toLowerCase().includes( search.toLowerCase() ) ) {
															return (
																<MenuItem
																	key={index}
																	className={ classNames(
																		{ 'is-selected': ( i.family === componentsValue?.fontFamily ) }
																	) }
																	onClick={ () => {
																		onToggle();

																		onChangeValue( 'fontFamily', i.family );
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
					</div>
				)
			}

			<div></div>

			{
				( showComponent?.appearance || showComponent?.spacing ) && (
					<TwoItemOnRow>
						{
							showComponent?.appearance && (
								<SelectControl
									label={ __( 'Appearance', 'otter-blocks' ) }
									value={ componentsValue?.appearance ?? componentsDefaultValue?.appearance }
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
									onChange={ appearance => onChangeValue( 'appearance', appearance ) }
								/>
							)
						}

						{
							showComponent.spacing && (
								<UnitControl
									label="Spacing"
									value={ componentsValue?.spacing ?? componentsDefaultValue?.spacing }
									onChange={ ( spacing: string ) => onChangeValue( 'spacing', spacing ) }
								/>
							)
						}
					</TwoItemOnRow>
				)
			}

			{
				showComponent?.decoration && (
					<BaseControl
						label={ __( 'Decoration', 'otter-blocks' ) }
						id={'1'}
					>
						<ToogleGroupControl
							hasIcon

							/*@ts-ignore */
							value={
								componentsValue?.decoration ?? componentsDefaultValue?.decoration
							}
							options={[
								{
									label: __( 'Reset', 'otter-blocks' ),
									value: 'reset',
									icon: reset
								},
								{
									label: __( 'Underline', 'otter-blocks' ),
									value: 'underline',
									icon: formatUnderline
								},
								{
									label: __( 'Strikethrough', 'otter-blocks' ),
									value: 'strikethrough',
									icon: formatStrikethrough
								}
							]}
							onChange={ decoration => onChangeValue( 'decoration', decoration ) }
						/>
					</BaseControl>
				)
			}

			{
				showComponent?.letterCase && (
					<BaseControl
						label={ __( 'Letter Case', 'otter-blocks' ) }
						id={'1'}
					>
						<ToogleGroupControl
							hasIcon

							/*@ts-ignore */
							value={ componentsValue?.letterCase ?? componentsDefaultValue?.letterCase }
							options={[
								{
									label: __( 'None', 'otter-blocks' ),
									value: 'none',
									icon: reset
								},
								{
									label: __( 'Uppercase', 'otter-blocks' ),
									value: 'uppercase',
									icon: formatUppercase
								},
								{
									label: __( 'Lowercase', 'otter-blocks' ),
									value: 'lowercase',
									icon: formatLowercase
								},
								{
									label: __( 'Capitalize', 'otter-blocks' ),
									value: 'capitalize',
									icon: formatCapitalize
								}
							]}
							onChange={ letterCase => onChangeValue( 'letterCase', letterCase ) }
						/>
					</BaseControl>

				)
			}

			{
				showComponent?.lineHeight && (
					<RangeControl
						label={ __( 'Line Height', 'otter-blocks' ) }

						/*@ts-ignore */
						value={ componentsValue?.lineHeight ?? componentsDefaultValue?.lineHeight }
						onChange={ lineHeight => onChangeValue( 'lineHeight', lineHeight ) }
						step={ 0.1 }
						min={ 0 }
						max={ 3 }
					/>
				)
			}

		</div>
	);
};

export default TypographySelectorControl;
