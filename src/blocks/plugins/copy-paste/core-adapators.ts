import { Storage } from './models';

export const coreAdaptors = {
	'core/columns': {

		/**
         * https://github.com/WordPress/gutenberg/blob/0d60dbc6e1deb575ceced1b8ecaf50e295d8543a/packages/block-library/src/columns/block.json#L4
         */
		copy( attrs: any ): Storage<unknown> {
			return {
				shared: {
					colors: {
						background: attrs?.backgroundColor
					}
				}
			};
		},
		paste( storage: Storage<unknown> ): any {
			return {
				backgroundColor: storage.shared.colors.background
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
						text: attrs?.style?.color?.text,
						background: attrs?.backgroundColor
					},
					width: {
						desktop: attrs?.width
					}
				}
			};
		},
		paste( storage: Storage<unknown> ): any {
			return {
				backgroundColor: storage.shared?.colors?.background,
				width: storage.shared?.width?.desktop,
				style: {
					color: {
						text: storage.shared?.colors?.text
					}
				}
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
						background: attrs?.backgroundColor
					},
					font: {
						size: attrs?.fontSize
					},
					layout: attrs?.layout
				}
			};
		},
		paste( storage: Storage<unknown> ): any {
			return {
				backgroundColor: storage.shared?.colors?.background,
				width: storage.shared?.width?.desktop,
				textColor: storage.shared?.colors?.text,
				fontSize: storage.shared?.font?.size,
				layout: storage.shared?.layout
			};
		}
	},

	// <!-- wp:paragraph {"dropCap":true,"style":{"color":{"background":"#38c13f"},"typography":{"fontStyle":"normal","fontWeight":"500","textTransform":"uppercase","letterSpacing":"5px"}},"textColor":"neve-link-hover-color","fontSize":"x-large"} -->
	'core/paragraph': {

		/**
         *  https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/group/block.json
        */
		copy( attrs: any ): Storage<unknown> {
			const x = {
				'dropCap': true,
				'style': {
					'color': {
						'background': '#38c13f'
					},
					'typography': {
						'fontStyle': 'normal', 'fontWeight': '500', 'textTransform': 'uppercase', 'letterSpacing': '5px' }
				},
				'textColor': 'neve-link-hover-color',
				'fontSize': 'x-large' };

			return {
				shared: {
					colors: {
						text: attrs?.textColor,
						background: attrs?.style?.color?.background
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
						textTransfrom: s?.font?.transform,
						letterSpacing: s?.font?.letterSpacing
					},
					color: {
						background: s?.colors?.background
					}
				},
				dropCap: s?.font?.dropCap
			};
		}
	}
};

export default coreAdaptors;
