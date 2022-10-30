/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { MediaPlaceholder } from '@wordpress/block-editor';

import { useInstanceId } from '@wordpress/compose';

import {
	Button,
	BaseControl,
	Dropdown,
	MenuGroup,
	MenuItem,
	SelectControl,
	TextControl,
	ToolbarButton,
	ToolbarGroup
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import {
	closeSmall
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './editor.scss';

// @ts-ignore
import data from '../../../../assets/fontawesome/fa-icons.json';
import themeIsleIcons from './../../helpers/themeisle-icons.js';

const FontAwesomeIconsList = ({
	i,
	icon,
	prefix,
	onToggle
}) => {
	return (
		<MenuItem
			label={ i.label }
			className={ classnames(
				{ 'is-selected': ( i.name === icon && i.prefix === prefix ) }
			) }
			onClick={ onToggle }
		>
			<i
				className={ classnames(
					i.prefix,
					`fa-${ i.name }`,
					'fa-fw'
				) }
			>
			</i>
			{ i.name }
		</MenuItem>
	);
};

const IconPickerControl = ({
	label,
	library,
	prefix,
	icon,
	changeLibrary,
	onChange,
	allowImage = false,
	allowThemeisleIcons = true
}) => {
	const instanceId = useInstanceId( IconPickerControl );

	useEffect( () => {
		const icons = [];

		Object.keys( data ).forEach( i => {
			Object.keys( data[i].styles ).forEach( o => {
				let prefix = '';

				switch ( data[i].styles[o]) {
				case 'brands':
					prefix = 'fab';
					break;
				case 'solid':
					prefix = 'fas';
					break;
				case 'regular':
					prefix = 'far';
					break;
				default:
					prefix = 'fas';
				}

				icons.push({
					name: i,
					unicode: data[i].unicode,
					prefix,
					label: data[i].label
				});
			});
		});

		setIcons( icons );
	}, []);

	const [ isURL, setIsUrl ] = useState( false );

	useEffect( () => {
		if ( 'image' === library ) {
			try {
				const imageURL = new URL( icon );

				if (  'http:' === imageURL?.protocol || 'https:' === imageURL?.protocol ) {
					setIsUrl( true );
				}
			} catch ( _ ) {
				setIsUrl( false );
			}
		}
	}, [ library, icon ]);

	const [ search, setSearch ] = useState( '' );
	const [ icons, setIcons ] = useState( null );

	const selectedIcons = 'fontawesome' === library ? icons : themeIsleIcons.iconsList;

	const id = `inspector-icon-picker-control-${ instanceId }`;

	const ThemeIsleIcon = ({ itemIcon = icon }) => {
		const Icon = themeIsleIcons.icons[ itemIcon ];
		return Icon ? (
			<Fragment>
				<Icon />
				{ itemIcon }
			</Fragment>

		) : (
			<Fragment>{ __( 'Select Icon', 'otter-blocks' ) }</Fragment>
		);
	};

	const ThemeIsleIconsList = ({
		i,
		onToggle
	}) => {
		return (
			<MenuItem
				label={ i }
				className={ classnames(
					{ 'is-selected': i === icon }
				) }
				onClick={ () => {
					onToggle();
					onChange( i );
				}}
			>
				<ThemeIsleIcon itemIcon={ i } />
			</MenuItem>
		);
	};

	return (
		<BaseControl
			id={ id }
			className="o-icon-picker-control"
		>
			<Dropdown
				contentClassName="o-icon-picker-popover"
				position="bottom left"
				renderToggle={ ({ isOpen, onToggle }) => (
					<Fragment>
						{ ( allowThemeisleIcons || allowImage ) &&
							<SelectControl
								label={ __( 'Icon Library', 'otter-blocks' ) }
								value={ library }
								options={ [
									{ label: __( 'Font Awesome', 'otter-blocks' ), value: 'fontawesome' },
									...( allowThemeisleIcons ? [{ label: __( 'ThemeIsle Icons', 'otter-blocks' ), value: 'themeisle-icons' }] : []),
									...( allowImage ? [{ label: __( 'Custom Image', 'otter-blocks' ), value: 'image' }] : [])
								] }
								onChange={ changeLibrary }
							/>
						}

						{ 'image' !== library ? (
							<BaseControl label={ label }>
								<Button
									className="o-icon-picker-button"
									onClick={ onToggle }
									aria-expanded={ isOpen }
								>
									{ icon ? (
										<Fragment>
											{ 'fontawesome' === library && (
												prefix ? (
													<Fragment>
														<i
															className={ classnames(
																prefix,
																`fa-${ icon }`,
																'fa-fw'
															) }
														>
														</i>
														{ icon }
													</Fragment>
												) :
													__( 'Select Icon', 'otter-blocks' )
											) }

											{ 'themeisle-icons' === library && <ThemeIsleIcon /> }
										</Fragment>
									) :
										__( 'Select Icon', 'otter-blocks' )
									}
								</Button>
							</BaseControl>
						) : (
							<Fragment>
								{ icon && (
									<BaseControl
										label={ __( 'Image', 'otter-blocks' ) }
										className='o-icon-picker-image-control'
									>
										<div
											style={{
												width: '100%',
												padding: '5px',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'flex-start',
												gap: '5px'
											}}
										>
											{ isURL ? (
												<img src={ icon } width="130px" />
											) : (
												<span>
													{ __( 'Please select an image.', 'otter-blocks' ) }
												</span>
											) }
										</div>
									</BaseControl>
								) }

								<MediaPlaceholder
									labels={ {
										title: __( 'Image', 'otter-blocks' )
									} }
									accept="image/*"
									allowedTypes={ [ 'image' ] }
									value={ icon }
									onSelect={ onChange }
								/>
							</Fragment>
						) }
					</Fragment>
				) }
				renderContent={ ({ onToggle }) => {

					if ( 'image' === library ) {
						return <Fragment></Fragment>;
					}

					return (

						<MenuGroup label={ 'fontawesome' === library ? __( 'Font Awesome Icons', 'otter-blocks' ) : __( 'ThemeIsle Icons', 'otter-blocks' ) } style={{ paddingBottom: '0px' }}>
							<TextControl
								value={ search }
								onChange={ e => setSearch( e ) }
							/>

							<div className="components-popover__items">
								{ selectedIcons.map( ( i, index ) => {
									if ( 'fontawesome' === library && ( ! search || i.name.match( search.toLowerCase() ) || i.label.toLowerCase().match( search.toLowerCase() ) ) ) {
										return (
											<FontAwesomeIconsList
												i={ i }
												key={ index }
												icon={ icon }
												prefix={ prefix }
												onToggle={ () => {
													onToggle();
													onChange({
														name: i.name,
														prefix: i.prefix
													});
												}}
											/>
										);
									}

									if ( 'themeisle-icons' === library && ( ! search || i.toLowerCase().match( search.toLowerCase() ) ) ) {
										return (
											<ThemeIsleIconsList
												i={ i }
												key={ index }
												onToggle={ onToggle }
											/>
										);
									}
								}) }
							</div>
							<div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', top: '11px', right: '5px' }}>
								<Button
									onClick={ onToggle }
									icon={ closeSmall }
								/>
							</div>
						</MenuGroup>
					);
				} }
			/>
		</BaseControl>
	);
};

export const IconPickerToolbarControl = ({
	label,
	classes,
	setAttributes
}) => {
	useEffect( () => {
		const icons = [];

		Object.keys( data ).forEach( i => {
			Object.keys( data[i].styles ).forEach( o => {
				let prefix = '';

				switch ( data[i].styles[o]) {
				case 'brands':
					prefix = 'fab';
					break;
				case 'solid':
					prefix = 'fas';
					break;
				case 'regular':
					prefix = 'far';
					break;
				default:
					prefix = 'fas';
				}

				icons.push({
					name: i,
					unicode: data[i].unicode,
					prefix,
					label: data[i].label
				});
			});
		});

		setIcons( icons );

		if ( classes ) {
			const classList = classes.split( ' ' );
			const prefix =
				classList.find(
					( i ) =>
						i.includes( 'fab' ) ||
						i.includes( 'far' ) ||
						i.includes( 'fas' )
				) || 'fas';
			const icon = classList.find( ( i ) => i.includes( 'fa-' ) );

			if ( icon ) {
				setPrefix( prefix );
				setIcon( icon );
			}
		}
	}, []);

	const [ search, setSearch ] = useState( '' );
	const [ icons, setIcons ] = useState( null );
	const [ prefix, setPrefix ] = useState( '' );
	const [ icon, setIcon ] = useState( '' );

	const onSelectIcon = ( onToggle, i ) => {
		onToggle();
		let classList = classes ? classes.split( ' ' ) : [];
		classList.splice( classList.indexOf( prefix ), 1 );
		classList.splice( classList.indexOf( icon ), 1 );
		classList.push( i.prefix, `fa-${ i.name }` );
		classList = classList.join( ' ' );

		setAttributes({
			className: classList
		});

		setPrefix( i.prefix );
		setIcon( `fa-${ i.name }` );
	};

	const onRemoveIcon = ( onToggle ) => {
		onToggle();
		let classList = classes ? classes.split( ' ' ) : [];
		classList.splice( classList.indexOf( prefix ), 1 );
		classList.splice( classList.indexOf( icon ), 1 );
		classList = classList.join( ' ' );

		setAttributes({
			className: classList
		});

		setPrefix( '' );
		setIcon( '' );
	};

	return (
		<ToolbarGroup>
			<Dropdown
				contentClassName="o-icon-picker-popover"
				position="bottom center"
				renderToggle={ ({ isOpen, onToggle }) => (
					<ToolbarButton
						label={ __( 'Menu Icons', 'otter-blocks' ) }
						className="o-icon-picker-toolbar-button"
						showTooltip
						onClick={ onToggle }
					>
						{ prefix && icon ? (
							<i
								className={ classnames(
									prefix,
									icon,
									'fa-fw'
								) }
							/>
						) : (
							<i className="fas fa-icons fa-fw" />
						) }
					</ToolbarButton>
				) }
				renderContent={ ({ onToggle }) => (
					<MenuGroup label={ label }>
						<TextControl
							value={ search }
							onChange={ e => setSearch( e ) }
						/>

						<div className="components-popover__items">
							{ icon && prefix && ! search && (
								<MenuItem
									label={ __( 'None', 'otter-blocks' ) }
									showTooltip={ true }
									onClick={ () => onRemoveIcon( onToggle ) }
								>
									<i className="fas fa-times fa-fw remove-icon" />

									{ __( 'Remove Icon', 'otter-blocks' ) }
								</MenuItem>
							) }

							{ icons.map( i => {
								if ( ! search || i.name.match( search.toLowerCase() ) || i.label.toLowerCase().match( search.toLowerCase() ) ) {
									return (
										<FontAwesomeIconsList
											i={ i }
											icon={ icon }
											prefix={ prefix }
											onToggle={ () => onSelectIcon( onToggle, i ) }
										/>
									);
								}
							}) }
						</div>
					</MenuGroup>
				) }
			/>
		</ToolbarGroup>
	);
};

export default IconPickerControl;
