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
	PanelBody,
	Snackbar,
	ToggleControl
} from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

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

/**
 * Internal dependencies
 */
import './editor.scss';
import GlobalDefaults from './global-defaults/index.js';
import defaultsAttrs from './global-defaults/defaults.js';

const Options = () => {
	const { createNotice } = useDispatch( 'core/notices' );

	useEffect( async() => {
		let data = await apiFetch({ path: 'wp/v2/users/me?context=edit' });

		if ( data.capabilities.manage_options ) {
			setCanUser( true );

			await wp.api.loadPromise.then( () => {
				settingsRef.current = new wp.api.models.Settings();
			});

			if ( false === isAPILoaded ) {
				settingsRef.current.fetch().then( response => {
					setDefault( Boolean( response.themeisle_blocks_settings_default_block ) );
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
	}, []);

	const [ canUser, setCanUser ] = useState( false );
	const [ isAPILoaded, setAPILoaded ] = useState( false );
	const [ blockDefaults, setBlockDefaults ] = useState({});
	const [ isDefault, setDefault ] = useState( false );

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

	const changeOptions = () => {
		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			themeisle_blocks_settings_default_block: ! Boolean( isDefault )
		});

		model.save().then( response => {
			setDefault( Boolean( response.themeisle_blocks_settings_default_block ) );
			dispatchNotice( __( 'Option updated.', 'otter-blocks' ) );
		});
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
		const blockConfig = { ...defaultsAttrs[ block ]};
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

		const model = new wp.api.models.Settings({
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
					target="wp-block-themeisle-blocks-options"
				>
					{ __( 'Otter Options', 'otter-blocks' ) }
				</PluginSidebarMoreMenuItem>
			) }

			<PluginSidebar
				title={ __( 'Otter Options', 'otter-blocks' ) }
				name="wp-block-themeisle-blocks-options"
			>
				<PanelBody className="wp-block-themeisle-blocks-options-general">
					<ToggleControl
						label={ __( 'Make Section block your default block for Pages?', 'otter-blocks' ) }
						checked={ isDefault }
						onChange={ changeOptions }
					/>
				</PanelBody>

				<GlobalDefaults
					isAPILoaded={ isAPILoaded }
					blockDefaults={ blockDefaults }
					changeConfig={ changeConfig }
					resetConfig={ resetConfig }
					saveConfig={ saveConfig }
				/>
			</PluginSidebar>
		</Fragment>
	);
};

export default Options;
