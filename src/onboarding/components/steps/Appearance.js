/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { useState } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import PalettePreview from '../PalettePreview';

const { defaultStyles, themeStyles } = window.otterObj;

const Appearance = () => {
	const [ palette, setPalette ] = useState( '' );

	return (
		<div className="o-sidebar__controls">
			<div className="o-palettes">
				<PalettePreview
					title={ __( 'Default', 'otter-blocks' ) }
					isSelected={ 'default' === palette }
					backgroundColor={ defaultStyles.settings.settings.color.palette[0].color }
					typographyColor={ defaultStyles.settings.settings.color.palette[1].color }
					backgroundAltColor={ defaultStyles.settings.settings.color.palette[2].color }
					primaryColor={ defaultStyles.settings.settings.color.palette[4].color }
					typography={ defaultStyles.settings.styles?.typography }
					onSelect={ () => setPalette( 'default' ) }
				/>

				{ themeStyles.map( ( style, index ) => (
					<PalettePreview
						key={ index }
						title={ style.title }
						isSelected={ index === palette }
						backgroundColor={ style.settings.color.palette.theme[0].color }
						typographyColor={ style.settings.color.palette.theme[1].color }
						backgroundAltColor={ style.settings.color.palette.theme[2].color }
						primaryColor={ style.settings.color.palette.theme[4].color }
						typography={ style?.styles?.typography || defaultStyles.settings.styles?.typography }
						onSelect={ () => setPalette( index ) }
					/>
				) ) }
			</div>
		</div>
	);
};

export default Appearance;
