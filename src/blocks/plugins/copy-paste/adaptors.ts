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
import { getChoice } from '../../helpers/helper-functions';
import { AccordionGroupAttrs } from '../../blocks/accordion/group/types';
import { ProgressAttrs } from '../../blocks/progress-bar/types';
import { TabsGroupAttrs } from '../../blocks/tabs/group/types';
import { FlipAttrs } from '../../blocks/flip/types';
import { FormAttrs } from '../../blocks/form/type';


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
				backgroundType: getChoice([
					[ s?.colors?.backgroundGradient, 'gradient' ],
					[ s?.colors?.background, 'color' ],
					[ undefined ]
				])
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
	},
	'themeisle-blocks/accordion': {
		copy( attrs: AccordionGroupAttrs ): Storage<AccordionGroupAttrs> {
			return {
				shared: {
					colors: {
						background: attrs.contentBackground,
						border: attrs.borderColor
					}
				},
				private: {
					titleColor: attrs?.titleColor,
					titleBackground: attrs?.titleBackground
				}
			};
		},
		paste( storage: Storage<AccordionGroupAttrs> ): AccordionGroupAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				contentBackground: s?.colors?.background,
				borderColor: s?.colors?.border
			};
		}
	},
	'themeisle-blocks/progress-bar': {
		copy( attrs: ProgressAttrs ): Storage<ProgressAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.titleColor,
						background: attrs?.backgroundColor
					},
					height: {
						desktop: addUnit( attrs?.height, 'px' )
					},
					border: {
						radius: {
							desktop: makeBox( addUnit( attrs?.borderRadius, 'px' ) )
						}
					},
					font: {
						size: attrs?.titleFontSize
					}
				},
				private: {
					barBackgroundColor: attrs?.barBackgroundColor,
					percentageColor: attrs?.percentageColor,
					percentagePosition: attrs?.percentagePosition
				}
			};
		},
		paste( storage: Storage<ProgressAttrs> ): ProgressAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				titleColor: s?.colors?.text,
				backgroundColor: s?.colors?.background,
				height: getInt( s?.height?.desktop ),
				borderRadius: getInt( s?.border?.radius?.desktop?.top ),
				titleFontSize: s?.font?.size
			};
		}
	},
	'themeisle-blocks/tabs': {
		copy( attrs: TabsGroupAttrs ): Storage<TabsGroupAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.activeTitleColor,
						background: attrs?.tabColor,
						border: attrs?.borderColor
					},
					border: {
						width: addUnit( attrs?.borderWidth, 'px' )
					}
				},
				private: {

				}
			};
		},
		paste( storage: Storage<TabsGroupAttrs> ): TabsGroupAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				activeTitleColor: s?.colors?.text,
				tabColor: s?.colors?.background,
				borderColor: s?.colors?.border,
				borderWidth: getInt( s?.border?.width )
			};
		}
	},
	'themeisle-blocks/flip': {
		copy( attrs: FlipAttrs ): Storage<FlipAttrs> {
			return {
				shared: {
					colors: {
						background: attrs?.frontBackgroundColor,
						border: attrs?.borderColor
					},
					border: {
						width: addUnit( attrs?.borderWidth, 'px' ),
						radius: {
							desktop: makeBox( addUnit( attrs?.borderRadius, 'px' ) )
						}
					},
					width: {
						desktop: addUnit( attrs?.width, 'px' )
					},
					height: {
						desktop: addUnit( attrs?.height, 'px' )
					},
					padding: {
						desktop: makeBox( addUnit( attrs?.padding, 'px' ) )
					},
					font: {
						size: addUnit( attrs?.titleFontSize, 'px' )
					}
				},
				private: {
					...( pickBy( attrs, ( value, key ) => {
						return key?.includes( 'boxShadow' )  || key?.includes( 'front' ) || key?.includes( 'back' ) || key?.includes( 'Color' );
					}) ?? {})
				}
			};
		},
		paste( storage: Storage<FlipAttrs> ): FlipAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				frontBackgroundColor: s?.colors?.background,
				borderColor: s?.colors?.border,
				borderWidth: getInt( s?.border?.width ),
				borderRadius: getInt( s?.border?.radius?.desktop?.top ),
				width: getInt( s?.width?.desktop ),
				height: getInt( s?.height?.desktop ),
				padding: getInt( s?.padding?.desktop?.top ),
				titleFontSize: getInt( s?.font?.size )
			};
		}
	},
	'themeisle-blocks/form': {
		copy( attrs: FormAttrs ): Storage<FormAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.labelColor,
						border: attrs?.inputBorderColor
					},
					font: {
						size: addUnit( attrs?.labelFontSize, 'px' )
					},
					border: {
						width: addUnit( attrs?.inputBorderWidth, 'px' ),
						radius: {
							desktop: makeBox( addUnit( attrs?.inputBorderRadius, 'px' ) )
						}
					}
				},
				private: {
					...( pickBy( attrs, ( value, key ) => {
						return key?.includes( 'FontSize' )  || key?.includes( 'Color' ) || key?.includes( 'Width' ) || key?.includes( 'Gap' );
					}) ?? {})
				}
			};
		},
		paste( storage: Storage<FormAttrs> ): FormAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				labelColor: s?.colors?.text,
				labelFontSize: getInt( s?.font?.size ),
				inputBorderColor: s?.colors?.border,
				inputBorderRadius: getInt( s?.border?.radius?.desktop?.top ),
				inputBorderWidth: getInt( s?.border?.width )
			};
		}
	}
};

export const implementedAdaptors = Object.keys( adaptors );
