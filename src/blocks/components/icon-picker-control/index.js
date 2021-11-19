/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

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

/**
 * Internal dependencies
 */
import './editor.scss';
import data from '../../helpers/fa-icons.json';
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
	onChange
}) => {
	const instanceId = useInstanceId( IconPickerControl );

	useEffect( () => {
		const icons = [];

		Object.keys( data ).forEach( i => {
			Object.keys( data[i].styles ).forEach( o => {
				let prefix = '';
				let terms = data[i].search.terms;

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

				terms.push(
					i,
					data[i].label
				);

				icons.push({
					name: i,
					unicode: data[i].unicode,
					prefix,
					label: data[i].label,
					search: terms
				});
			});
		});

		setIcons( icons );
	}, []);

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
			<Fragment></Fragment>
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
			className="otter-icon-picker-control"
		>
			<Dropdown
				contentClassName="otter-icon-picker-popover"
				position="bottom center"
				renderToggle={ ({ isOpen, onToggle }) => (
					<Fragment>
						<SelectControl
							label={ __( 'Icon Library', 'otter-blocks' ) }
							value={ library }
							options={ [
								{ label: __( 'Font Awesome', 'otter-blocks' ), value: 'fontawesome' },
								{ label: __( 'ThemeIsle Icons', 'otter-blocks' ), value: 'themeisle-icons' }
							] }
							onChange={ changeLibrary }
						/>

						<BaseControl
							label={ label }
						>
							<Button

								className="otter-icon-picker-button"
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
					</Fragment>
				) }
				renderContent={ ({ onToggle }) => (
					<MenuGroup label={ 'fontawesome' === library ? __( 'Font Awesome Icons', 'otter-blocks' ) : __( 'ThemeIsle Icons', 'otter-blocks' ) }>
						<TextControl
							value={ search }
							onChange={ e => setSearch( e ) }
						/>

						<div className="components-popover__items">
							{ selectedIcons.map( i => {
								if ( 'fontawesome' === library && ( ! search || i.search.some( ( o ) => o.toLowerCase().match( search.toLowerCase() ) ) ) ) {
									return (
										<FontAwesomeIconsList
											i={ i }
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
											onToggle={ onToggle }
										/>
									);
								}
							}) }
						</div>
					</MenuGroup>
				) }
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
				let terms = data[i].search.terms;

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

				terms.push(
					i,
					data[i].label
				);

				icons.push({
					name: i,
					unicode: data[i].unicode,
					prefix,
					label: data[i].label,
					search: terms
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
				contentClassName="otter-icon-picker-popover"
				position="bottom center"
				renderToggle={ ({ isOpen, onToggle }) => (
					<ToolbarButton
						label={ __( 'Menu Icons', 'otter-blocks' ) }
						className="otter-icon-picker-toolbar-button"
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
								if ( ! search || i.search.some( ( o ) => o.toLowerCase().match( search.toLowerCase() ) ) ) {
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
