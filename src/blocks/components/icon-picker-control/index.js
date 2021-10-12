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
	TextControl
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
import data from './icons.json';
import themeIsleIcons from './../../helpers/themeisle-icons';

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
		let icons = [];

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
					prefix: prefix,
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
		return  Icon ? (
			<Fragment>
				<Icon/>
				{ itemIcon }
			</Fragment>

		) : (
			<Fragment></Fragment>
		);
	};

	const FontAwesomeIconsList = ({
		i,
		onToggle
	}) => {
		return (
			<MenuItem
				label={ i.label }
				className={ classnames(
					{ 'is-selected': ( i.name === icon && i.prefix === prefix ) }
				) }
				onClick={ () => {
					onToggle();
					onChange({
						name: i.name,
						prefix: i.prefix
					});
				}}
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
				<ThemeIsleIcon itemIcon={ i} />
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
								isLarge
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

										{ 'themeisle-icons' === library && <ThemeIsleIcon/> }
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
								if ( 'fontawesome' === library && ( ! search || i.search.some( o => o.toLowerCase().match( search.toLowerCase() ) )  ) ) {
									return (
										<FontAwesomeIconsList
											i={ i }
											onToggle={ onToggle }
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

export default IconPickerControl;
