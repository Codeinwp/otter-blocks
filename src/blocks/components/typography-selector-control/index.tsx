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
	__experimentalHeading as Heading,
	DropdownMenu
} from '@wordpress/components';
import ToogleGroupControl from '../toogle-group-control';
import { formatCapitalize, formatLowercase, formatStrikethrough, formatUnderline, formatUppercase, moreVertical, reset } from '@wordpress/icons';
import { Fragment } from '@wordpress/element';

const TwoItemOnRow = ({ children }) => {
	return <div className='o-two-column-components'>
		{ children }
	</div>;
};

const TypographySelectorControl = () => {
	return (
		<Fragment>
			<HStack className="o-sync-manage-control">
				<p>{ __( 'Font Size', 'otter-blocks' ) }</p>

				<DropdownMenu
					icon={ moreVertical }
					label={ __( 'View options', 'otter-blocks' ) }
					toggleProps={ { isSmall: true } }
				>
					{ ({ onClose = noop }) => (
						<Fragment>
							<MenuGroup>
								{/* { options.filter( option => ! option?.isHidden ).map( option => {
									const isSelected = isSynced.includes( option.value );

									return (
										<MenuItem
											key={ option.value }
											icon={ isSelected && check }
											isSelected={ isSelected }
											label={ option.label }
											onClick={ () => toggleItem( option.value ) }
											role="menuitemcheckbox"
										>
											{ option.label }
										</MenuItem>
									);
								}) } */}
							</MenuGroup>

							<MenuGroup>
								<MenuItem
									onClick={ () => {} }
								>
									{ __( 'Test', 'otter-blocks' ) }
								</MenuItem>

								<MenuItem
									variant={ 'tertiary' }
									onClick={ () => {

										// resetAll();
										// onClose();
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
				value={ undefined }
				fontSizes={ [
					{
						name: __( 'Extra Small', 'otter-blocks' ),
						slug: 'extra-small',
						size: 14
					},
					{
						name: __( 'Small', 'otter-blocks' ),
						slug: 'small',
						size: 16
					},
					{
						name: __( 'Medium', 'otter-blocks' ),
						slug: 'medium',
						size: 18
					},
					{
						name: __( 'Large', 'otter-blocks' ),
						slug: 'large',
						size: 24
					},
					{
						name: __( 'Extra Large', 'otter-blocks' ),
						slug: 'extra-large',
						size: 28
					}
				] }
				onChange={ fontSize => {} }
			/>

			<BaseControl
				label={ 'Font Family' }
				id={'o-no-margin'}
				className="o-no-margin"
			>
				{ ( null !== true ) ? (
					( true ) ? (
						<SelectControl
							value={ '' }
							id={ '1' }
							options={ [
								{
									label: __( 'Default', 'otter-blocks' ),
									value: ''
								}

								// ...fonts.map( i => {
								// 	return i = {
								// 		label: i.family,
								// 		value: i.family
								// 	};
								// })
							] }
							onChange={ e => {

								// let variants = [];
								// loadFontToPage( e, 'regular', fonts );

								// if ( '' === e ) {
								// 	variants = [
								// 		{
								// 			'label': __( 'Regular', 'otter-blocks' ),
								// 			'value': 'regular'
								// 		},
								// 		{
								// 			'label': __( 'Italic', 'otter-blocks' ),
								// 			'value': 'italic'
								// 		}
								// 	];
								// 	onChangeFontFamily( undefined );
								// 	setVariants( variants );
								// 	return;
								// }

								// onChangeFontFamily( e );

								// const font = fonts.find( i => e === i.family );

								// variants = ( font.variants )
								// 	.filter( o => false === o.includes( 'italic' ) )
								// 	.map( o => {
								// 		return o = {
								// 			'label': startCase( toLower( o ) ),
								// 			'value': o
								// 		};
								// 	});

								// setVariants( variants );
							} }
						/>
					) : (
						<Dropdown
							contentClassName="o-gfont-popover"
							position="bottom center"
							renderToggle={ ({ isOpen, onToggle }) => (
								<Button
									className="o-gfont-button"

									// id={ id }
									onClick={ onToggle }
									aria-expanded={ isOpen }
								>
									{/* { value ? value : __( 'Select Font Family', 'otter-blocks' ) } */}
								</Button>
							) }
							renderContent={ ({ onToggle }) => (
								<MenuGroup label={ __( 'Google Fonts', 'otter-blocks' ) }>
									<TextControl
										value={ undefined }
										onChange={ e => {} }
									/>

									<div className="components-popover__items">
										<MenuItem
											onClick={ () => {

												// onToggle();
												// onChangeFontFamily( undefined );
												// setVariants([]);
												// setSearch( '' );
											}}
										>
											{ __( 'Default', 'otter-blocks' ) }
										</MenuItem>

										{/* { ( fonts ).map( ( i, index ) => {
												if ( ! search || i.family.toLowerCase().includes( search.toLowerCase() ) ) {
													return (
														<MenuItem
															key={index}
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
                                            */}
									</div>
								</MenuGroup>
							) }
						/>
					)
				) : (
					__( 'Loading…', 'otter-blocks' )
				) }
			</BaseControl>

			<TwoItemOnRow>
				<SelectControl
					label={ __( 'Appearance', 'otter-blocks' ) }
					value={ 'normal' }
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
					onChange={ () => {} }
				/>

				<UnitControl
					label="Spacing"
					value={ undefined }
					onChange={ ( next ) => {} }
				/>
			</TwoItemOnRow>


			<BaseControl
				label={ __( 'Decoration', 'otter-blocks' ) }
				id={'1'}
			>
				<ToogleGroupControl
					hasIcon
					value={
						undefined
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
					onChange={ value => {

					} }
				/>
			</BaseControl>

			<BaseControl
				label={ __( 'Letter Case', 'otter-blocks' ) }
				id={'1'}
			>
				<ToogleGroupControl
					hasIcon
					value={ undefined }
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
					onChange={ value => {

					} }
				/>
			</BaseControl>
		</Fragment>
	);
};

export default TypographySelectorControl;
