/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	cloneDeep,
	isEqual,
	merge
} from 'lodash';

import apiFetch from '@wordpress/api-fetch';

import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
	__experimentalUseNavigator as useNavigator,
	Button,
	PanelBody,
	PanelRow,
	Snackbar
} from '@wordpress/components';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import {
	PluginSidebar,
	PluginSidebarMoreMenuItem
} from '@wordpress/edit-post';

import { applyFilters } from '@wordpress/hooks';

import {
	chevronRightSmall,
	chevronLeftSmall
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './editor.scss';
import GlobalDefaults from './global-defaults/index.js';
import defaultsAttrs from './global-defaults/defaults.js';
import Accordion from './global-defaults/controls/accordion.js';
import ButtonBlock from './global-defaults/controls/button.js';
import ButtonGroup from './global-defaults/controls/button-group.js';
import FontAwesomeIcons from './global-defaults/controls/font-awesome-icons.js';
import SectionColumns from './global-defaults/controls/section-columns.js';
import SectionColumn from './global-defaults/controls/section-column.js';
import ReviewControl from './global-defaults/controls/review.js';
import Form from './global-defaults/controls/form.js';
import { otterIconColored } from '../../helpers/icons.js';
import Tabs from './global-defaults/controls/tabs';

export let NavigatorButton = ({
	path,
	isBack = false,
	onClickAction = () => {},
	...props
}) => {
	const navigator = useNavigator();

	return (
		<Button
			onClick={ () => {
				if ( undefined !== navigator.push ) {
					navigator.push( path, { isBack });
				} else {
					navigator.goTo( path, { isBack });
				}
				onClickAction();
			} }
			{ ...props }
		/>
	);
};

const Options = () => {
	const { isOnboardingVisible } = useSelect( select => {
		const { isOnboardingVisible } = select( 'themeisle-gutenberg/data' );
		return {
			isOnboardingVisible: isOnboardingVisible()
		};
	});

	const { createNotice } = useDispatch( 'core/notices' );
	const { showOnboarding } = useDispatch( 'themeisle-gutenberg/data' );

	useEffect( () => {
		let isMounted = true;

		const fetchData = async() => {
			const data = await apiFetch({ path: 'wp/v2/users/me?context=edit' });

			if ( data.capabilities.manage_options && isMounted ) {
				setCanUser( true );

				await window.wp.api.loadPromise.then( () => {
					settingsRef.current = new window.wp.api.models.Settings();
				});

				if ( false === isAPILoaded ) {
					settingsRef.current.fetch().then( response => {
						if ( '' !== response.themeisle_blocks_settings_global_defaults ) {
							let defaults = cloneDeep( defaultsAttrs );
							if ( 'object' === typeof window.themeisleGutenberg.themeDefaults ) {
								defaults = merge( defaults, window.themeisleGutenberg.themeDefaults );
							}
							defaults = merge( defaults, JSON.parse( response.themeisle_blocks_settings_global_defaults ) );
							window.themeisleGutenberg.globalDefaults = JSON.parse( response.themeisle_blocks_settings_global_defaults );
							setBlockDefaults( defaults );
						} else {
							let defaults = cloneDeep( defaultsAttrs );
							if ( 'object' === typeof window.themeisleGutenberg.themeDefaults ) {
								defaults = merge( defaults, window.themeisleGutenberg.themeDefaults );
							}
							window.themeisleGutenberg.globalDefaults = {};
							setBlockDefaults( defaults );
						}
						setAPILoaded( true );
					});
				}
			}
		};

		fetchData();

		return () => {
			isMounted = false;
		};
	}, []);

	const [ canUser, setCanUser ] = useState( false );
	const [ isAPILoaded, setAPILoaded ] = useState( false );
	const [ blockDefaults, setBlockDefaults ] = useState({});
	const [ selectedBlock, setSelectedBlock ] = useState( undefined );
	const [ isLoading, setLoading ] = useState( false );

	const settingsRef = useRef( null );

	const dispatchNotice = value => {
		if ( ! Snackbar ) {
			return;
		}

		createNotice(
			'info',
			value,
			{
				isDismissible: true,
				type: 'snackbar'
			}
		);
	};

	const changeConfig = ( block, object ) => {
		const defaultValues = cloneDeep( blockDefaults );
		for ( const option in object ) {
			defaultValues[ block ][ option ] = object[ option ];
		}
		setBlockDefaults( defaultValues );
	};

	const resetConfig = block => {
		const defaultValues = cloneDeep( blockDefaults );
		const blockConfig = { ...defaultsAttrs[ block ] };
		defaultValues[ block ] = blockConfig;
		setBlockDefaults( defaultValues );
	};

	const saveConfig = async() => {
		const filterDefault = cloneDeep( blockDefaults );

		Object.keys( filterDefault ).forEach( i => {
			Object.keys( filterDefault[i]).forEach( k => {
				if ( undefined !== defaultsAttrs[i]?.[k] && filterDefault[i][k] === defaultsAttrs[i][k]) {
					delete filterDefault[i][k];
				} else if ( 'object' === typeof filterDefault[i]?.[k]) {
					if ( isEqual( filterDefault[i]?.[k], defaultsAttrs[i]?.[k]) ) {
						delete filterDefault[i][k];
					}
				}
			});
		});

		const model = new window.wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			themeisle_blocks_settings_global_defaults: JSON.stringify( filterDefault )
		});

		await model.save().then( () => {
			window.themeisleGutenberg.globalDefaults = filterDefault;
			dispatchNotice( __( 'Option updated.', 'otter-blocks' ) );
		});
	};

	const globalControls = [
		{
			name: 'themeisle-blocks/accordion',
			control: Accordion
		},
		{
			name: 'themeisle-blocks/button-group',
			control: ButtonGroup
		},
		{
			name: 'themeisle-blocks/button',
			control: ButtonBlock
		},
		{
			name: 'themeisle-blocks/font-awesome-icons',
			control: FontAwesomeIcons
		},
		{
			name: 'themeisle-blocks/review',
			control: ReviewControl
		},
		{
			name: 'themeisle-blocks/advanced-columns',
			control: SectionColumns
		},
		{
			name: 'themeisle-blocks/advanced-column',
			control: SectionColumn
		},
		{
			name: 'themeisle-blocks/form',
			control: Form
		},
		{
			name: 'themeisle-blocks/tabs',
			control: Tabs
		}
	];

	let Controls = null;

	if ( selectedBlock ) {
		Controls = globalControls.find( item => item.name === selectedBlock ).control;
	}

	const navigator = useNavigator();

	return (
		<Fragment>
			{ ( canUser ) && (
				<PluginSidebarMoreMenuItem
					target="otter-options"
				>
					{ __( 'Otter Options', 'otter-blocks' ) }
				</PluginSidebarMoreMenuItem>
			) }

			<PluginSidebar
				title={ __( 'Otter Options', 'otter-blocks' ) }
				name="otter-options"
			>
				<NavigatorProvider
					initialPath="/"
				>
					<NavigatorScreen path="/">
						<PanelBody className="o-options-general">
							<PanelRow>
								<Button
									icon={ otterIconColored }
									onClick={ () => showOnboarding( ! isOnboardingVisible ) }
									className="o-onboarding-button"
								>
									{ __( 'Show Onboarding Modal', 'otter-blocks' ) }
								</Button>
							</PanelRow>
						</PanelBody>

						<NavigatorButton
							path="/block-settings"
							icon={ chevronRightSmall }
							className="o-navi-button"
						>
							{ __( 'Block Settings', 'otter-blocks' ) }
						</NavigatorButton>

						{ applyFilters( 'otter.feedback', '', 'otter-menu-editor', __( 'Help us improve Otter Blocks', 'otter-blocks' ) ) }
					</NavigatorScreen>

					<NavigatorScreen
						path="/block-settings"
						className="o-options-global-defaults"
					>
						<NavigatorButton
							path="/"
							icon={ chevronLeftSmall }
							className="o-navi-button o-navi-button-back"
						>
							{ __( 'Settings', 'otter-blocks' ) }
						</NavigatorButton>

						<GlobalDefaults
							isAPILoaded={ isAPILoaded }
							globalControls={ globalControls }
							blockDefaults={ blockDefaults }
							setSelectedBlock={ setSelectedBlock}
						/>
					</NavigatorScreen>

					<NavigatorScreen
						path="/block-settings/global-defaults"
						className="o-options-global-defaults-modal"
					>
						<NavigatorButton
							path="/block-settings"
							icon={ chevronLeftSmall }
							className="o-navi-button o-navi-button-back"
						>
							{ __( 'Blocks', 'otter-blocks' ) }
						</NavigatorButton>

						{ selectedBlock && (
							<Fragment>
								<Controls
									blockName={ selectedBlock }
									defaults={ blockDefaults[ selectedBlock ] }
									changeConfig={ changeConfig }
								/>

								<div className="o-options-global-defaults-actions">
									<Button
										isDestructive
										onClick={ () => resetConfig( selectedBlock ) }
									>
										{ __( 'Reset', 'otter-blocks' ) }
									</Button>

									<Button
										isBusy={ isLoading }
										onClick={ async() => {
											setLoading( true );
											await saveConfig();
											setLoading( false );
										} }
									>
										{ __( 'Save', 'otter-blocks' ) }
									</Button>
								</div>
							</Fragment>
						)}
					</NavigatorScreen>
				</NavigatorProvider>
			</PluginSidebar>
		</Fragment>
	);
};

export default Options;
