/**
 * External dependencies
 */
import fastDeepEqual from 'fast-deep-equal/es6';

import hash from 'object-hash';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import PalettePreview from '../PalettePreview';

const Appearance = () => {
	const {
		globalStyle,
		defaultStyles,
		themeStyles
	} = useSelect( select => {
		const {
			__experimentalGetCurrentGlobalStylesId,
			__experimentalGetCurrentThemeBaseGlobalStyles,
			__experimentalGetCurrentThemeGlobalStylesVariations,
			getEditedEntityRecord
		} = select( 'core' );

		const globalStylesId = __experimentalGetCurrentGlobalStylesId();

		return {
			globalStyle: getEditedEntityRecord(
				'root',
				'globalStyles',
				globalStylesId
			),
			defaultStyles: __experimentalGetCurrentThemeBaseGlobalStyles(),
			themeStyles: __experimentalGetCurrentThemeGlobalStylesVariations()
		};
	}, []);

	const { editEntityRecord } = useDispatch( 'core' );

	const { setChangedData } = useDispatch( 'otter/onboarding' );

	const selectedStyle = useMemo( () => {
		if ( ! Object.keys( globalStyle?.styles ).length && ! Object.keys( globalStyle?.settings ).length ) {
			return 'default';
		}

		const foundStyle = themeStyles?.find( style =>
			fastDeepEqual( globalStyle?.styles, style?.styles || {}) &&
            fastDeepEqual( globalStyle?.settings, style?.settings )
		);

		return foundStyle ? hash( foundStyle ) : false;
	}, [ globalStyle, themeStyles ]);

	const onSelect = style => {
		if ( 'default' === style ) {
			setChangedData({
				// eslint-disable-next-line camelcase
				design_choices: {
					// eslint-disable-next-line camelcase
					palette: 'default'
				}
			});

			editEntityRecord( 'root', 'globalStyles', globalStyle.id, {
				styles: {},
				settings: {}
			});
			return;
		}

		setChangedData({
			// eslint-disable-next-line camelcase
			design_choices: {
				// eslint-disable-next-line camelcase
				palette: style.title
			}
		});

		editEntityRecord( 'root', 'globalStyles', globalStyle.id, {
			styles: style?.styles,
			settings: style?.settings
		});
	};

	return (
		<div className="o-sidebar__controls">
			<div className="o-palettes">
				<PalettePreview
					title={ __( 'Default', 'otter-blocks' ) }
					isSelected={ 'default' === selectedStyle }
					backgroundColor={ defaultStyles.settings.color.palette.theme[0].color }
					typographyColor={ defaultStyles.settings.color.palette.theme[1].color }
					backgroundAltColor={ defaultStyles.settings.color.palette.theme[2].color }
					primaryColor={ defaultStyles.settings.color.palette.theme[4].color }
					typography={ defaultStyles.styles?.typography }
					onSelect={ () => onSelect( 'default' ) }
				/>

				{ themeStyles?.map( ( style, index ) => (
					<PalettePreview
						key={ index }
						title={ style.title }
						isSelected={ hash( style ) === selectedStyle }
						backgroundColor={ style.settings.color.palette.theme[0].color }
						typographyColor={ style.settings.color.palette.theme[1].color }
						backgroundAltColor={ style.settings.color.palette.theme[2].color }
						primaryColor={ style.settings.color.palette.theme[4].color }
						typography={ style?.styles?.typography || defaultStyles.styles?.typography }
						onSelect={ () => onSelect( style ) }
					/>
				) ) }
			</div>
		</div>
	);
};

export default Appearance;
