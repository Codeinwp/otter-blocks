import { pickBy } from 'lodash';
import { SectionAttrs } from '../../blocks/section/columns/types';
import {  Storage } from './models';
import { coreAdaptors } from './core-adaptors';
import { ColumnAttrs } from '../../blocks/section/column/types';
import { ButtonGroupAttrs } from '../../blocks/button-group/group/types';
import { ButtonAttrs } from '../../blocks/button-group/button/types';
import { addUnit, getInt, makeBox } from './utils';
import { IconAttrs } from '../../blocks/font-awesome-icons/types';
import { IconListAttrs } from '../../blocks/icon-list/types';
import { IconListItemAttrs } from '../../blocks/icon-list/item/types';


export const adaptors = {
	...coreAdaptors,
	'themeisle-blocks/advanced-columns': {
		copy( attrs: SectionAttrs ): Storage<SectionAttrs> {
			return {
				shared: {
					padding: {
						desktop: attrs.padding,
						tablet: attrs.paddingTablet,
						mobile: attrs.paddingMobile
					},
					margin: {
						desktop: attrs.margin,
						tablet: attrs.marginTablet,
						mobile: attrs.marginMobile
					},
					border: {
						radius: {
							desktop: attrs.borderRadius
						}
					},
					colors: {
						background: attrs.backgroundColor,
						backgroundGradient: attrs.backgroundGradient
					},
					type: {
						background: attrs.backgroundType
					}
				},
				private: {
					...pickBy( attrs, ( value, key ) => {
						return key?.includes( 'background' ) ||  key?.includes( 'boxShadow' );
					})
				}
			};
		},
		paste( storage: Storage<SectionAttrs> ): SectionAttrs {
			const s = storage.shared;

			return {
				...storage.private,
				padding: s?.padding?.desktop,
				paddingMobile: s?.padding?.mobile,
				paddingTablet: s?.padding?.tablet,
				margin: s?.margin?.desktop,
				marginTablet: s?.margin?.tablet,
				marginMobile: s?.margin?.mobile,
				borderRadius: s?.border?.radius?.desktop,
				backgroundColor: s?.colors?.background,
				backgroundGradient: s?.colors?.backgroundGradient,
				backgroundType: s?.type?.background

			};
		}
	},
	'themeisle-blocks/advanced-column': {
		copy( attrs: ColumnAttrs ): Storage<ColumnAttrs> {
			return {
				shared: {
					padding: {
						desktop: attrs.padding,
						tablet: attrs.paddingTablet,
						mobile: attrs.paddingMobile
					},
					margin: {
						desktop: attrs.margin,
						tablet: attrs.marginTablet,
						mobile: attrs.marginMobile
					},
					border: {
						radius: {
							desktop: attrs?.borderRadius
						},
						width: attrs?.border?.top
					},
					colors: {
						background: attrs?.backgroundColor,
						backgroundGradient: attrs.backgroundGradient
					},
					type: {
						background: attrs.backgroundType
					}
				},
				private: {
					...pickBy( attrs, ( value, key ) => {
						return key?.includes( 'background' );
					})
				}
			};
		},
		paste( storage: Storage<ColumnAttrs> ): ColumnAttrs {
			const s = storage.shared;

			return {
				padding: s.padding?.desktop,
				paddingMobile: s.padding?.mobile,
				paddingTablet: s.padding?.tablet,
				margin: s.margin?.desktop,
				marginTablet: s.margin?.tablet,
				marginMobile: s.margin?.mobile,
				backgroundColor: s.colors?.background,
				borderRadius: s.border?.radius?.desktop,
				border: {
					top: s?.border?.width,
					bottom: s?.border?.width,
					left: s?.border?.width,
					right: s?.border?.width
				},
				backgroundGradient: s?.colors?.backgroundGradient,
				backgroundType: s?.type?.background,
				...storage.private
			};
		}
	},
	'themeisle-blocks/button-group': {
		copy( attrs: ButtonGroupAttrs ): Storage<ButtonGroupAttrs> {
			return {
				shared: {
					padding: {
						desktop: {
							top: addUnit( attrs.paddingTopBottom, 'px' ),
							bottom: addUnit( attrs.paddingTopBottom, 'px' ),
							left: addUnit( attrs.paddingLeftRight, 'px' ),
							right: addUnit( attrs.paddingLeftRight, 'px' )
						}
					},
					font: {
						size: addUnit( attrs.fontSize, 'px' ),
						family: attrs.fontFamily,
						variant: attrs.fontVariant,
						transform: attrs.textTransform,
						style: attrs.fontStyle,
						lineHeight: attrs.lineHeight
					}
				},
				private: {
					align: attrs.align,
					spacing: attrs.spacing,
					collapse: attrs.collapse
				}
			};
		},
		paste( storage: Storage<ButtonGroupAttrs> ): ButtonGroupAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				paddingTopBottom: getInt( s?.padding?.desktop?.top ),
				paddingLeftRight: getInt( s?.padding?.desktop?.left ),
				fontSize: getInt( s?.font?.size ),
				fontFamily: s?.font?.family,
				fontVariant: s?.font?.variant,
				fontStyle: s?.font?.style,
				textTransform: s?.font?.transform,
				lineHeight: s?.font?.lineHeight
			};
		}
	},
	'themeisle-blocks/button': {
		copy( attrs: ButtonAttrs ): Storage<ButtonAttrs> {
			return {
				shared: {
					colors: {
						border: attrs.border,
						text: attrs.color
					},
					border: {
						width: addUnit( attrs.borderSize, 'px' ),
						radius: {
							desktop: makeBox( addUnit( attrs.borderRadius, 'px' ) )
						}
					}
				},
				private: {
					...pickBy( attrs, ( value, key ) => {
						return key?.includes( 'hover' ) || key?.includes( 'background' );
					})
				}
			};
		},
		paste( storage: Storage<ButtonAttrs> ): ButtonAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				border: s?.colors?.border,
				color: s?.colors?.text,
				borderSize: getInt( s?.border?.width ),
				borderRadius: getInt( s?.border?.radius?.desktop?.top )
			};
		}
	},
	'themeisle-blocks/font-awesome-icons': {
		copy( attrs: IconAttrs ): Storage<IconAttrs> {
			return {
				shared: {
					colors: {
						border: attrs.borderColor,
						text: attrs.textColor,
						background: attrs.backgroundColor
					},
					border: {
						width: addUnit( attrs.borderSize, 'px' ),
						radius: {
							desktop: makeBox( addUnit( attrs.borderRadius, 'px' ) )
						}
					},
					padding: {
						desktop: makeBox( addUnit( attrs.padding, 'px' ) )
					},
					margin: {
						desktop: makeBox( addUnit( attrs.margin, 'px' ) )
					},
					font: {
						size: addUnit( attrs.fontSize, 'px' )
					}
				},
				private: {
					...pickBy( attrs, ( value, key ) => {
						return key?.includes( 'Hover' );
					}),
					align: attrs?.align
				}
			};
		},
		paste( storage: Storage<IconAttrs> ): IconAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				borderColor: s?.colors?.border,
				textColor: s?.colors?.text,
				borderSize: getInt( s?.border?.width ),
				borderRadius: getInt( s?.border?.radius?.desktop?.top ),
				margin: getInt( s?.margin?.desktop?.top ),
				padding: getInt( s?.padding?.desktop?.top ),
				fontSize: getInt( s?.font?.size )
			};
		}
	},
	'themeisle-blocks/icon-list': {
		copy( attrs: IconListAttrs ): Storage<IconListAttrs> {
			return {
				shared: {
					colors: {
						text: attrs.defaultContentColor
					},
					font: {
						size: addUnit( attrs.defaultSize, 'px' )
					}
				},
				private: {
					gap: attrs?.gap,
					defaultIconColor: attrs?.defaultIconColor
				}
			};
		},
		paste( storage: Storage<IconListAttrs> ): IconListAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				defaultContentColor: s?.colors?.text,
				defaultSize: getInt( s?.font?.size )
			};
		}
	},
	'themeisle-blocks/icon-list-item': {
		copy( attrs: IconListItemAttrs ): Storage<IconListItemAttrs> {
			return {
				shared: {
					colors: {
						text: attrs.contentColor
					}
				},
				private: {
					iconColor: attrs?.iconColor
				}
			};
		},
		paste( storage: Storage<IconListItemAttrs> ): IconListItemAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				contentColor: s?.colors?.text
			};
		}
	}
};

export const implementedAdaptors = Object.keys( adaptors );
