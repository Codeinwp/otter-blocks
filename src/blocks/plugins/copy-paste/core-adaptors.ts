import { desktop } from '@wordpress/icons/build-types';
import { Storage } from './models';
import { addUnit } from './utils';

export const coreAdaptors = {
	'core/columns': {

		/**
         * https://github.com/WordPress/gutenberg/blob/0d60dbc6e1deb575ceced1b8ecaf50e295d8543a/packages/block-library/src/columns/block.json#L4
         */
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor,
						backgroundGradient: attrs?.gradient
					},
					type: {
						background: attrs?.gradient ? 'gradient' : undefined
					}
				}
			};
		},
		paste( storage: Storage<unknown> ): any {
			return {
				textColor: storage.shared?.colors?.text,
				backgroundColor: storage.shared?.colors?.background,
				gradient: storage.shared?.colors?.backgroundGradient
			};
		}
	},
	'core/column': {

		/**
         * https://github.com/WordPress/gutenberg/blob/0d60dbc6e1deb575ceced1b8ecaf50e295d8543a/packages/block-library/src/column/block.json#
         */
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor,
						backgroundGradient: attrs?.gradient
					},
					width: {
						desktop: attrs?.width
					},
					type: {
						background: attrs?.gradient ? 'gradient' : undefined
					}
				}
			};
		},
		paste( storage: Storage<unknown> ): any {
			return {
				backgroundColor: storage.shared?.colors?.background,
				width: storage.shared?.width?.desktop,
				textColor: storage.shared?.colors?.text,
				gradient: storage.shared?.colors?.backgroundGradient
			};
		}
	},
	'core/group': {

		/**
         *  https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/group/block.json
        */
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.style?.textColor,
						background: attrs?.backgroundColor,
						backgroundGradient: attrs?.gradient
					},
					font: {
						size: attrs?.fontSize
					},
					layout: attrs?.layout,
					type: {
						background: attrs?.gradient ? 'gradient' : undefined
					}
				}
			};
		},
		paste( storage: Storage<unknown> ): any {
			return {
				backgroundColor: storage.shared?.colors?.background,
				width: storage.shared?.width?.desktop,
				textColor: storage.shared?.colors?.text,
				fontSize: storage.shared?.font?.size,
				layout: storage.shared?.layout,
				gradient: storage.shared?.colors?.backgroundGradient
			};
		}
	},

	'core/paragraph': {

		/**
         *  https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/group/block.json
        */
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor
					},
					font: {
						size: attrs?.fontSize,
						style: attrs?.style?.typography?.fontStyle,
						transform: attrs?.style?.typography?.textTransform,
						letterSpacing: attrs?.style?.typography?.letterSpacing,
						dropCap: attrs?.dropCap
					}
				}
			};
		},
		paste( storage: Storage<unknown> ): any {
			const { shared: s } = storage;
			return {
				textColor: s?.colors?.text,
				fontSize: s?.font?.size,
				style: {
					typography: {
						fontStyle: s?.font?.style,
						textTransform: s?.font?.transform,
						letterSpacing: s?.font?.letterSpacing
					}
				},
				backgroundColor: s?.colors?.background,
				dropCap: s?.font?.dropCap
			};
		}
	},
	'core/heading': {
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor
					},
					font: {
						size: attrs?.fontSize,
						style: attrs?.style?.typography?.fontStyle,
						transform: attrs?.style?.typography?.textTransform,
						letterSpacing: attrs?.style?.typography?.letterSpacing,
						dropCap: attrs?.dropCap,
						align: attrs?.textAlign
					}
				},
				private: {
					level: attrs?.level
				}
			};
		},
		paste( storage: Storage<{}> ): any {
			const { shared: s } = storage;
			return {
				...storage.private,
				textColor: s?.colors?.text,
				fontSize: s?.font?.size,
				style: {
					typography: {
						fontStyle: s?.font?.style,
						textTransform: s?.font?.transform,
						letterSpacing: s?.font?.letterSpacing
					}
				},
				backgroundColor: s?.colors?.background,
				dropCap: s?.font?.dropCap,
				textAlign: s?.font?.align
			};
		}
	},
	'core/list': {
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor
					},
					font: {
						size: attrs?.fontSize,
						style: attrs?.style?.typography?.fontStyle,
						transform: attrs?.style?.typography?.textTransform,
						letterSpacing: attrs?.style?.typography?.letterSpacing
					}
				}
			};
		},
		paste( storage: Storage<{}> ): any {
			const { shared: s } = storage;
			return {
				textColor: s?.colors?.text,
				fontSize: s?.font?.size,
				style: {
					typography: {
						fontStyle: s?.font?.style,
						textTransform: s?.font?.transform,
						letterSpacing: s?.font?.letterSpacing
					}
				},
				backgroundColor: s?.colors?.background
			};
		}
	},
	'core/image': {
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor
					},
					font: {
						size: attrs?.fontSize,
						style: attrs?.style?.typography?.fontStyle,
						transform: attrs?.style?.typography?.textTransform,
						letterSpacing: attrs?.style?.typography?.letterSpacing
					},
					width: {
						desktop: addUnit( attrs?.width, 'px' )
					},
					height: {
						desktop: addUnit( attrs?.height, 'px' )
					}
				},
				private: {
					style: attrs?.style,
					sizeSlug: attrs?.sizeSlug
				}
			};
		},
		paste( storage: Storage<{}> ): any {
			const { shared: s } = storage;
			return {
				...storage.private,
				width: parseInt( s?.width?.desktop ),
				height: parseInt( s?.width?.desktop )
			};
		}
	},
	'core/button': {
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.backgroundColor
					},
					font: {
						size: attrs?.fontSize
					},
					border: {
						radius: {
							desktop: attrs?.style?.border?.radius
						}
					}
				}
			};
		},
		paste( storage: Storage<{}> ): any {
			const { shared: s } = storage;
			return {
				textColor: s?.colors?.text,
				fontSize: s?.font?.size,
				style: {
					typography: {
						fontStyle: s?.font?.style
					},
					border: {
						radius: s?.border?.radius?.desktop
					}
				},
				backgroundColor: s?.colors?.background
			};
		}
	},
	'core/buttons': {
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					layout: attrs?.layout
				}
			};
		},
		paste( storage: Storage<{}> ): any {
			const { shared: s } = storage;
			return {
				layout: s?.layout
			};
		}
	}
};

export default coreAdaptors;
