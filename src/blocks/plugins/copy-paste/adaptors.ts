import { omit, pick, pickBy, isNumber, isObjectLike } from 'lodash';
import type { SectionAttrs } from '../../blocks/section/columns/types';
import type {  Storage } from './models';
import type { ColumnAttrs } from '../../blocks/section/column/types';
import type { ButtonGroupAttrs } from '../../blocks/button-group/group/types';
import type { ButtonAttrs } from '../../blocks/button-group/button/types';
import { addUnit, getInt, makeBox, getSingleValueFromBox } from './utils';
import type { IconAttrs } from '../../blocks/font-awesome-icons/types';
import type { IconListAttrs } from '../../blocks/icon-list/types';
import type { IconListItemAttrs } from '../../blocks/icon-list/item/types';
import { getChoice, objectOrNumberAsBox, _px } from '../../helpers/helper-functions';
import type { AccordionGroupAttrs } from '../../blocks/accordion/group/types';
import type { ProgressAttrs } from '../../blocks/progress-bar/types';
import type { TabsGroupAttrs } from '../../blocks/tabs/group/types';
import type { FlipAttrs } from '../../blocks/flip/types';
import type { FormAttrs } from '../../blocks/form/type';
import type { CircleCounterAttrs } from '../../blocks/circle-counter/types';
import type { ReviewAttrs } from '../../blocks/review/type';
import type { AdvancedHeadingAttrs } from '../../blocks/advanced-heading/types';
import type { CountdownAttrs } from '../../blocks/countdown/types';
import type { WooComparisonAttrs } from '../../../pro/blocks/woo-comparison/types';
import type { BusinessHoursItemAttrs } from '../../../pro/blocks/business-hours/item/types';
import type { BusinessHoursAttrs } from '../../../pro/blocks/business-hours/types';
import type { SharingIconsAttrs } from '../../blocks/sharing-icons/types';
import type { BoxType } from '../../helpers/blocks';

export const adaptors = {

	// ...coreAdaptors, // TODO: research if we still need this since Core has it now. Look on how we can integrate it with the new system.
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
						},
						width: attrs?.border
					},
					colors: {
						background: attrs.backgroundColor,
						backgroundGradient: attrs.backgroundGradient,
						border: attrs?.borderColor
					},
					type: {
						background: attrs.backgroundType
					},
					layout: {
						verticalAlignment: attrs?.verticalAlign
					}
				},
				private: {
					...pickBy( attrs, ( _value, key ) => {
						return key?.includes( 'background' ) ||  key?.includes( 'boxShadow' ) ||  key?.includes( 'divider' ) ||  key?.includes( 'columnsHeight' ) ||  key?.includes( 'columnsWidth' ) ||  key?.includes( 'reverseColumnsTablet' ) ||  key?.includes( 'layout' ) ;
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
					[ 'gradient' === s?.type?.background, 'gradient' ],
					[ 'color' ]
				]),
				borderColor: s?.colors?.border,
				border: s?.border?.width,
				verticalAlign: s?.layout?.verticalAlignment
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
						width: attrs?.border
					},
					colors: {
						background: attrs?.backgroundColor,
						backgroundGradient: attrs.backgroundGradient,
						border: attrs?.borderColor
					},
					type: {
						background: attrs.backgroundType
					}
				},
				private: {
					...pickBy( attrs, ( _value, key ) => {
						return key?.includes( 'background' );
					})
				}
			};
		},
		paste( storage: Storage<ColumnAttrs> ): ColumnAttrs {
			const s = storage.shared;

			return {
				...storage.private,
				padding: s?.padding?.desktop,
				paddingMobile: s?.padding?.mobile,
				paddingTablet: s?.padding?.tablet,
				margin: s?.margin?.desktop,
				marginTablet: s?.margin?.tablet,
				marginMobile: s?.margin?.mobile,
				backgroundColor: s?.colors?.background,
				borderRadius: s?.border?.radius?.desktop,
				border: s?.border?.width,
				backgroundGradient: s?.colors?.backgroundGradient,
				backgroundType: s?.type?.background,
				borderColor: s?.colors?.border
			};
		}
	},
	'themeisle-blocks/button-group': {
		copy( attrs: ButtonGroupAttrs ): Storage<ButtonGroupAttrs> {
			return {
				shared: {
					padding: {
						desktop: {
							top: _px( attrs.paddingTopBottom ),
							bottom: _px( attrs.paddingTopBottom ),
							left: _px( attrs.paddingLeftRight ),
							right: _px( attrs.paddingLeftRight )
						},
						tablet: attrs.paddingTablet,
						mobile: attrs.paddingMobile
					},
					font: {
						size: _px( attrs.fontSize ),
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
				paddingTopBottom: s?.padding?.desktop?.top,
				paddingLeftRight: s?.padding?.desktop?.left,
				paddingTablet: s?.padding?.tablet,
				paddingMobile: s?.padding?.mobile,
				fontSize: s?.font?.size,
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
						width: objectOrNumberAsBox( attrs.borderSize ),
						radius: {
							desktop: objectOrNumberAsBox( attrs.borderRadius )
						}
					}
				},
				private: {
					...pickBy( attrs, ( _value, key ) => {
						return key?.includes( 'hover' ) || key?.includes( 'background' ) || key?.includes( 'boxShadow' );
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
				borderSize: s?.border?.width,
				borderRadius: s?.border?.radius?.desktop
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
						width: makeBox( addUnit( attrs.borderSize, 'px' ) ),
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
					...pickBy( attrs, ( _value, key ) => {
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
				borderSize: getInt( getSingleValueFromBox( s?.border?.width ) ),
				borderRadius: getInt( s?.border?.radius?.desktop?.top ),
				margin: getInt( s?.margin?.desktop?.top ),
				padding: getInt( s?.padding?.desktop?.top ),
				fontSize: getInt( s?.font?.size ),
				backgroundColor: s?.colors?.background
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
						size: ! isNaN( attrs.defaultSize as number ) ? addUnit( attrs.defaultSize as number, 'px' ) : attrs.defaultSize as string | undefined
					}
				},
				private: {
					gap: attrs?.gap,
					defaultIconColor: attrs?.defaultIconColor,
					horizontalAlign: attrs?.horizontalAlign,
					alignmentTablet: attrs?.alignmentTablet,
					alignmentMobile: attrs?.alignmentMobile,
					hasDivider: attrs?.hasDivider,
					dividerColor: attrs?.dividerColor,
					dividerLength: attrs?.dividerLength,
					dividerWidth: attrs?.dividerWidth,
					gapIconLabel: attrs?.gapIconLabel
				}
			};
		},
		paste( storage: Storage<IconListAttrs> ): IconListAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				defaultContentColor: s?.colors?.text,
				defaultSize: s?.font?.size
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
					percentagePosition: attrs?.percentagePosition,
					titleStyle: attrs?.titleStyle
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
						width: attrs?.borderWidth as BoxType // TODO: update after #1431 is merged
					},
					padding: {
						desktop: attrs?.contentPadding
					}
				},
				private: {
					...( pickBy( attrs ?? {}, ( _value, key ) => {
						return key?.includes( 'boxShadow' ) || key?.includes( 'Color' ) || key?.includes( 'Size' ) || key?.includes( 'Padding' ) || key?.includes( 'Width' );
					}) ?? {})
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
				borderWidth: s?.border?.width,
				contentPadding: s?.padding?.desktop
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
						width: makeBox( addUnit( attrs?.borderWidth, 'px' ) ),
						radius: {
							desktop: isNumber(  attrs?.borderRadius ) ? makeBox( addUnit( attrs?.borderRadius, 'px' ) ) : attrs?.borderRadius
						}
					},
					width: {
						desktop: isNumber(  attrs?.width ) ? addUnit( attrs?.width as number | undefined, 'px' ) : attrs?.width as string | undefined
					},
					height: {
						desktop: isNumber(  attrs?.height ) ?  addUnit( attrs?.height, 'px' ) : attrs?.height as string | undefined
					},
					padding: {
						desktop: isNumber(  attrs?.padding ) ?  makeBox( addUnit( attrs?.padding, 'px' ) ) : attrs?.padding
					},
					font: {
						size: addUnit( attrs?.titleFontSize, 'px' )
					}
				},
				private: {
					...( omit( pickBy( attrs, ( _value, key ) => {
						return key?.includes( 'boxShadow' )  || key?.includes( 'front' ) || key?.includes( 'back' ) || key?.includes( 'Color' ) || key?.includes( 'FontSize' );
					}) ?? {}, [ 'frontMedia' ]) ),
					animType: attrs.animType
				}
			};
		},
		paste( storage: Storage<FlipAttrs> ): FlipAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				frontBackgroundColor: s?.colors?.background,
				borderColor: s?.colors?.border,
				borderWidth: getInt( getSingleValueFromBox( s?.border?.width ) ),
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
						size: _px( attrs?.labelFontSize )
					},
					border: {
						width: objectOrNumberAsBox( attrs?.inputBorderWidth ),
						radius: {
							desktop: objectOrNumberAsBox( attrs?.inputBorderRadius )
						}
					},
					padding: {
						desktop: attrs?.inputPadding,
						tablet: attrs?.inputPaddingTablet,
						mobile: attrs?.inputPaddingMobile
					}
				},
				private: {
					...( pickBy( attrs, ( _value, key ) => {
						return key?.includes( 'FontSize' )  || key?.includes( 'Color' ) || key?.includes( 'Width' ) || key?.includes( 'Gap' ) || key?.includes( 'Style' );
					}) ?? {})
				}
			};
		},
		paste( storage: Storage<FormAttrs> ): FormAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				labelColor: s?.colors?.text,
				labelFontSize: s?.font?.size,
				inputBorderColor: s?.colors?.border,
				inputBorderRadius: s?.border?.radius?.desktop,
				inputBorderWidth: s?.border?.width,
				inputPadding: s?.padding?.desktop,
				inputPaddingTablet: s?.padding?.tablet,
				inputPaddingMobile: s?.padding?.mobile
			};
		}
	},
	'themeisle-blocks/circle-counter': {
		copy( attrs: CircleCounterAttrs ): Storage<CircleCounterAttrs> {
			return {
				shared: {
					height: {
						desktop: addUnit( attrs?.height, 'px' )
					},
					font: {
						size: addUnit( attrs?.fontSizeTitle, 'px' )
					},
					colors: {
						text: attrs?.titleColor,
						background: attrs?.backgroundColor
					}
				},
				private: {
					...pick( attrs, [ 'titleStyle', 'fontSizePercent', 'strokeWidth', 'progressColor', 'titleStyle' ] as ( keyof CircleCounterAttrs )[]) // by doing this type adnotation you can enable autocomplete in the array. Using the pick, you can reduce the number of lines.
				}
			};
		},
		paste( storage: Storage<CircleCounterAttrs> ): CircleCounterAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				height: getInt( s?.height?.desktop, 100 ), // with undefined, the block will break. We need to pass the default value.
				fontSizeTitle: getInt( s?.font?.size ),
				titleColor: s?.colors?.text,
				backgroundColor: s?.colors?.background
			};
		}
	},
	'themeisle-blocks/review': {
		copy( attrs: ReviewAttrs ): Storage<ReviewAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor
					},
					padding: {
						desktop: attrs?.padding,
						tablet: attrs?.paddingMobile,
						mobile: attrs?.paddingTablet
					},
					border: {
						width: makeBox( addUnit( attrs?.borderWidth, 'px' ) ),
						radius: {
							desktop: makeBox( addUnit( attrs?.borderRadius, 'px' ) )
						}
					}
				},
				private: {
					primaryColor: attrs?.primaryColor,
					buttonTextColor: attrs?.buttonTextColor,
					boxShadow: attrs?.boxShadow,
					...( pickBy( attrs, ( _value, key ) => {
						return key?.includes( 'Color' )  || key?.includes( 'Font' );
					}) ?? {})
				}
			};
		},
		paste( storage: Storage<ReviewAttrs> ): ReviewAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				textColor: s?.colors?.text,
				backgroundColor: s?.colors?.background,
				borderWidth: getInt( getSingleValueFromBox ( s?.border?.width ) ),
				borderRadius: getInt( getSingleValueFromBox ( s?.border?.radius?.desktop ) ),
				padding: s?.padding?.desktop,
				paddingTablet: s?.padding?.tablet,
				paddingMobile: s?.padding?.mobile
			};
		}
	},
	'themeisle-blocks/advanced-heading': {
		copy( attrs: AdvancedHeadingAttrs ): Storage<AdvancedHeadingAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.headingColor
					},
					font: {
						size: isNumber( attrs?.fontSize ) ? addUnit( attrs?.fontSize, 'px' ) : attrs?.fontSize,
						family: attrs?.fontFamily,
						variant: attrs?.fontVariant,
						style: attrs?.fontStyle,
						letterSpacing: isNumber( attrs?.letterSpacing ) ? addUnit( attrs?.letterSpacing, 'px' ) : attrs?.letterSpacing,
						lineHeight: attrs?.lineHeight,
						align: attrs?.align,
						transform: attrs?.textTransform
					},
					padding: {
						desktop: isObjectLike( attrs?.padding ) ? attrs?.padding as BoxType | undefined : {
							top: addUnit( 'unlinked' === attrs?.paddingType ? attrs?.paddingTop : attrs?.padding as number | undefined, 'px' ),
							bottom: addUnit( 'unlinked' === attrs?.paddingType ? attrs?.paddingBottom : attrs?.padding as number | undefined, 'px' ),
							right: addUnit( 'unlinked' === attrs?.paddingType ? attrs?.paddingRight : attrs?.padding as number | undefined, 'px' ),
							left: addUnit( 'unlinked' === attrs?.paddingType ? attrs?.paddingLeft : attrs?.padding as number | undefined, 'px' )
						},
						tablet: isObjectLike( attrs?.paddingTablet ) ? attrs?.paddingTablet as BoxType | undefined : {
							top: addUnit( 'unlinked' === attrs?.paddingTypeTablet ? attrs?.paddingTopTablet : attrs?.paddingTablet as number | undefined, 'px' ),
							bottom: addUnit( 'unlinked' === attrs?.paddingTypeTablet ? attrs?.paddingBottomTablet : attrs?.paddingTablet as number | undefined, 'px' ),
							right: addUnit( 'unlinked' === attrs?.paddingTypeTablet ? attrs?.paddingRightTablet : attrs?.paddingTablet as number | undefined, 'px' ),
							left: addUnit( 'unlinked' === attrs?.paddingTypeTablet ? attrs?.paddingLeftTablet : attrs?.paddingTablet as number | undefined, 'px' )
						},
						mobile: isObjectLike( attrs?.paddingMobile ) ? attrs?.paddingMobile as BoxType | undefined : {
							top: addUnit( 'unlinked' === attrs?.paddingTypeMobile ? attrs?.paddingTopMobile : attrs?.paddingTablet as number | undefined, 'px' ),
							bottom: addUnit( 'unlinked' === attrs?.paddingTypeMobile ? attrs?.paddingBottomMobile : attrs?.paddingMobile as number | undefined, 'px' ),
							right: addUnit( 'unlinked' === attrs?.paddingTypeMobile ? attrs?.paddingRightMobile : attrs?.paddingMobile as number | undefined, 'px' ),
							left: addUnit( 'unlinked' === attrs?.paddingTypeMobile ? attrs?.paddingLeftMobile : attrs?.paddingMobile as number | undefined, 'px' )
						}
					},
					margin: {
						desktop: isObjectLike( attrs?.margin ) ? attrs?.margin as BoxType | undefined : {
							top: addUnit( 'unlinked' === attrs?.marginType ? attrs?.marginTop : attrs?.margin as number | undefined, 'px' ),
							bottom: addUnit( 'unlinked' === attrs?.marginType ?  attrs?.marginBottom : attrs?.margin as number | undefined, 'px' )
						},
						tablet: isObjectLike( attrs?.marginTablet ) ? attrs?.marginTablet as BoxType | undefined : {
							top: addUnit( 'unlinked' === attrs?.marginTypeTablet ? attrs?.marginTopTablet : attrs?.marginTablet as number | undefined, 'px' ),
							bottom: addUnit( 'unlinked' === attrs?.marginTypeTablet ? attrs?.marginBottomTablet : attrs?.marginTablet as number | undefined, 'px' )
						},
						mobile: isObjectLike( attrs?.marginTablet ) ? attrs?.marginTablet as BoxType | undefined : {
							top: addUnit( 'unlinked' === attrs?.marginTypeMobile ? attrs?.marginTopMobile : attrs?.marginTablet as number | undefined, 'px' ),
							bottom: addUnit( 'unlinked' === attrs?.marginTypeMobile ? attrs?.marginBottomMobile : attrs?.marginMobile as number | undefined, 'px' )
						}
					}
				},
				private: {
					...pick( attrs, [ 'marginType', 'paddingType' ] as ( keyof AdvancedHeadingAttrs )[]),
					...( pickBy( attrs, ( _value, key ) => {
						return key?.includes( 'highlight' )  || key?.includes( 'Tablet' ) || key?.includes( 'Width' ) || key?.includes( 'Mobile' ) || key?.includes( 'textShadow' );
					}) ?? {})
				}
			};
		},
		paste( storage: Storage<AdvancedHeadingAttrs> ): AdvancedHeadingAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				padding: getInt( s?.padding?.desktop?.top ),
				paddingTop: getInt( s?.padding?.desktop?.top ),
				paddingBottom: getInt( s?.padding?.desktop?.bottom ),
				paddingRight: getInt( s?.padding?.desktop?.right ),
				paddingLeft: getInt( s?.padding?.desktop?.left ),
				paddingTopTablet: getInt( s?.padding?.tablet?.top ),
				paddingBottomTablet: getInt( s?.padding?.tablet?.bottom ),
				paddingRightTablet: getInt( s?.padding?.tablet?.right ),
				paddingLeftTablet: getInt( s?.padding?.tablet?.left ),
				paddingTopMobile: getInt( s?.padding?.mobile?.top ),
				paddingBottomMobile: getInt( s?.padding?.mobile?.bottom ),
				paddingRightMobile: getInt( s?.padding?.mobile?.right ),
				paddingLeftMobile: getInt( s?.padding?.mobile?.left ),
				margin: getInt( s?.margin?.desktop?.top ),
				marginTop: getInt( s?.margin?.desktop?.top ),
				marginBottom: getInt( s?.margin?.desktop?.bottom ),
				marginTopTablet: getInt( s?.margin?.tablet?.top ),
				marginBottomTablet: getInt( s?.margin?.tablet?.bottom ),
				marginTopMobile: getInt( s?.margin?.mobile?.top ),
				marginBottomMobile: getInt( s?.margin?.mobile?.bottom ),
				fontSize: getInt( s?.font?.size ),
				fontFamily: s?.font?.family,
				fontVariant: s?.font?.variant,
				fontStyle: s?.font?.style,
				letterSpacing: getInt( s?.font?.letterSpacing ),
				lineHeight: getInt( s?.font?.lineHeight as string ),
				headingColor: s?.colors?.text,
				align: s?.font?.align,
				textTransform: s?.font?.transform
			};
		}
	},
	'themeisle-blocks/countdown': {
		copy( attrs: CountdownAttrs ): Storage<CountdownAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.labelColor,
						background: attrs?.backgroundColor,
						border: attrs?.borderColor
					},
					height: {
						desktop: addUnit( attrs?.height, 'px' ),
						tablet: addUnit( attrs?.heightTablet, 'px' ),
						mobile: addUnit( attrs?.heightMobile, 'px' )
					},
					width: {
						desktop: attrs?.containerWidth,
						tablet: attrs?.containerWidthTablet,
						mobile: attrs?.containerWidthMobile
					},
					border: {
						radius: {
							desktop: attrs?.borderRadiusBox
						},
						width: makeBox( addUnit( attrs?.borderWidth ) ),
						style: attrs?.borderStyle
					},
					font: {
						size: addUnit( attrs?.labelFontSize, 'px' ),
						style: attrs?.labelFontWeight
					},
					padding: {
						desktop: attrs?.padding,
						tablet: attrs?.paddingMobile,
						mobile: attrs?.paddingTablet
					}
				},
				private: {
					...pickBy( attrs, ( _value, key ) => {
						return key.includes( 'Tablet' ) ||
						key.includes( 'Mobile' ) ||
						key.includes( 'gap' ) ||
						key.includes( 'Color' ) ||
						key.includes( 'Distance' ) ||
						key.includes( 'Font' );
					}),
					alignment: attrs?.alignment
				}
			};
		},
		paste( storage: Storage<CountdownAttrs> ): CountdownAttrs {
			const { shared: s } = storage;
			return {
				...storage.private,
				labelColor: s?.colors?.text,
				backgroundColor: s?.colors?.background,
				borderColor: s?.colors?.border,
				borderStyle: s?.border?.style,
				height: getInt( s?.height?.desktop ),
				heightTablet: getInt( s?.height?.tablet ),
				heightMobile: getInt( s?.height?.mobile ),
				containerWidth: s?.width?.desktop,
				containerWidthTablet: s?.width?.tablet,
				containerWidthMobile: s?.width?.mobile,
				borderRadiusBox: s?.border?.radius?.desktop,
				labelFontSize: getInt( s?.font?.size ),
				padding: s?.padding?.desktop,
				paddingTablet: s?.padding?.tablet,
				paddingMobile: s?.padding?.mobile
			};
		}
	},
	'themeisle-blocks/woo-comparison': {
		copy( attrs: WooComparisonAttrs ): Storage<WooComparisonAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						border: attrs?.borderColor
					}
				},
				private: {
					...pick( attrs, [ 'altRow', 'rowColor', 'headerColor', 'altRowColor' ])
				}
			};
		},
		paste( storage: Storage<WooComparisonAttrs> ): WooComparisonAttrs {
			return {
				...storage.private,
				textColor: storage?.shared?.colors?.text,
				borderColor: storage?.shared?.colors?.border
			};
		}
	},
	'themeisle-blocks/business-hours-item': {
		copy( attrs: BusinessHoursItemAttrs ): Storage<BusinessHoursItemAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.labelColor,
						background: attrs?.backgroundColor
					}
				},
				private: {
					timeColor: attrs?.timeColor
				}
			};
		},
		paste( storage: Storage<BusinessHoursItemAttrs> ): BusinessHoursItemAttrs {
			return {
				...storage.private,
				labelColor: storage?.shared?.colors?.text,
				backgroundColor: storage?.shared?.colors?.background
			};
		}
	},
	'themeisle-blocks/business-hours': {
		copy( attrs: BusinessHoursAttrs ): Storage<BusinessHoursAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.titleColor,
						background: attrs?.backgroundColor,
						border: attrs?.borderColor
					},
					border: {
						width: makeBox( addUnit( attrs?.borderWidth, 'px' ) ),
						radius: {
							desktop: makeBox( addUnit( attrs?.borderRadius, 'px' ) )
						}
					},
					font: {
						size: addUnit( attrs?.titleFontSize, 'px' ),
						align: attrs?.titleAlignment
					}
				},
				private: {
					...pick( attrs, [ 'gap', 'itemsFontSize' ] as ( keyof BusinessHoursAttrs )[])
				}
			};
		},
		paste( storage: Storage<BusinessHoursAttrs> ): BusinessHoursAttrs {
			return {
				...storage.private,
				backgroundColor: storage?.shared?.colors?.background,
				titleColor: storage.shared?.colors?.text,
				titleAlignment: storage.shared?.font?.align,
				borderColor: storage.shared?.colors?.border,
				borderWidth: getInt( getSingleValueFromBox( storage.shared?.border?.width ) ),
				borderRadius: getInt( getSingleValueFromBox( storage.shared?.border?.radius?.desktop ) )
			};
		}
	},
	'themeisle-blocks/sharing-icons': {
		copy( attrs: SharingIconsAttrs ): Storage<SharingIconsAttrs> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor
					},
					border: {
						radius: {
							desktop: makeBox( addUnit( attrs?.borderRadius, 'px' ) )
						}
					}
				},
				private: {
					...pick( attrs, [ 'gap', 'textDeco', 'facebook', 'twitter', 'linkedin', 'pinterest', 'tumblr', 'reddit' ] as ( keyof SharingIconsAttrs )[])
				}
			};
		},
		paste( storage: Storage<SharingIconsAttrs> ): SharingIconsAttrs {
			return {
				...storage.private,
				backgroundColor: storage?.shared?.colors?.background,
				textColor: storage.shared?.colors?.text,
				borderRadius: getInt( getSingleValueFromBox( storage?.shared?.border?.radius?.desktop ) )
			};
		}
	}
};

export const implementedAdaptors = Object.keys( adaptors );
