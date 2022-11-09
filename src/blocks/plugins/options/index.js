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

/**
 * Internal dependencies
 */
import './editor.scss';
import GlobalDefaults from './global-defaults/index.js';
import defaultsAttrs from './global-defaults/defaults.js';
import { otterIconColored } from '../../helpers/icons.js';

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
				if ( undefined !== defaultsAttrs[i][k] && filterDefault[i][k] === defaultsAttrs[i][k]) {
					delete filterDefault[i][k];
				} else if ( 'object' === typeof filterDefault[i][k]) {
					if ( isEqual( filterDefault[i][k], defaultsAttrs[i][k]) ) {
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
				<PanelBody className="o-options-general">
					<PanelRow>
						<Button
							isSecondary
							icon={ otterIconColored }
							onClick={ () => showOnboarding( ! isOnboardingVisible ) }
							className="o-onboarding-button"
						>
							{ __( 'Show Onboarding Modal', 'otter-blocks' ) }
						</Button>
					</PanelRow>
				</PanelBody>

				<GlobalDefaults
					isAPILoaded={ isAPILoaded }
					blockDefaults={ blockDefaults }
					changeConfig={ changeConfig }
					resetConfig={ resetConfig }
					saveConfig={ saveConfig }
				/>

				{ applyFilters( 'otter.feedback', '', 'otter-menu-editor', __( 'Help us improve Otter Blocks', 'otter-blocks' ) ) }
			</PluginSidebar>
		</Fragment>
	);
};

export default Options;
