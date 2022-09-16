import { merge } from 'lodash';
import { Storage } from './models';
import { addUnit } from './utils';

const commonExtractor = ( attrs ): Storage<unknown> => {
	return {
		shared: {
			colors: {
				text: attrs?.style?.color?.text,
				background: attrs?.style?.color?.background,
				backgroundGradient: attrs?.style?.color?.gradient
			},
			type: {
				background: attrs?.style?.color?.gradient ? 'gradient' : undefined
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
		core: {
			textColor: attrs?.textColor,
			backgroundColor: attrs?.backgroundColor,
			gradient: attrs?.gradient
		}
	};
};

const commonApplyer = ( storage: Storage<unknown> ) => {
	return {
		fontSize: storage?.shared?.font?.size,
		style: {
			typography: {
				fontStyle: storage?.shared?.font?.style,
				textTransform: storage?.shared?.font?.transform,
				letterSpacing: storage?.shared?.font?.letterSpacing
			},
			color: {
				text: storage?.shared?.colors?.text,
				background: storage?.shared?.colors?.background,
				gradient: storage?.shared?.colors?.backgroundGradient
			}
		},
		dropCap: storage?.shared?.font?.dropCap,
		textColor: storage?.core?.textColor,
		backgroundColor: storage?.core?.backgroundColor,
		gradient: storage?.core?.gradient
	};
};

export const coreAdaptors = {
	'core/columns': {

		/**
         * https://github.com/WordPress/gutenberg/blob/0d60dbc6e1deb575ceced1b8ecaf50e295d8543a/packages/block-library/src/columns/block.json#L4
         */
		copy( attrs: any ): Storage<unknown> {
			return merge( commonExtractor( attrs ),
				{
				}
			);
		},
		paste( storage: Storage<unknown> ): any {
			return merge( commonApplyer( storage ),
				{
				}
			);
		}
	},
	'core/column': {

		/**
         * https://github.com/WordPress/gutenberg/blob/0d60dbc6e1deb575ceced1b8ecaf50e295d8543a/packages/block-library/src/column/block.json#
         */
		copy( attrs: any ): Storage<unknown> {
			return merge( commonExtractor( attrs ),
				{
					shared: {
						width: {
							desktop: attrs?.width
						}
					}
				}
			);
		},
		paste( storage: Storage<unknown> ): any {
			return merge( commonApplyer( storage ),
				{
					width: storage.shared?.width?.desktop
				}
			);
		}
	},
	'core/group': {

		/**
         *  https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/group/block.json
        */
		copy( attrs: any ): Storage<unknown> {
			return merge( commonExtractor( attrs ),
				{
					shared: {
						layout: attrs?.layout
					}
				}
			);
		},
		paste( storage: Storage<unknown> ): any {
			return merge( commonApplyer( storage ),
				{
					width: storage.shared?.width?.desktop,
					layout: storage.shared?.layout
				}
			);
		}
	},

	'core/paragraph': {

		/**
         *  https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/group/block.json
        */
		copy( attrs: any ): Storage<unknown> {
			return merge( commonExtractor( attrs ),
				{
				}
			);
		},
		paste( storage: Storage<unknown> ): any {
			return merge( commonApplyer( storage ),
				{

				}
			);
		}
	},
	'core/heading': {
		copy( attrs: any ): Storage<unknown> {
			return merge( commonExtractor( attrs ),
				{
					private: {
						level: attrs?.level
					}
				}
			);
		},
		paste( storage: Storage<{}> ): any {
			return merge( commonApplyer( storage ),
				{
					...storage.private
				}
			);
		}
	},
	'core/list': {
		copy( attrs: any ): Storage<unknown> {
			return merge( commonExtractor( attrs ),
				{
				}
			);
		},
		paste( storage: Storage<{}> ): any {
			return merge( commonApplyer( storage ),
				{

				}
			);
		}
	},
	'core/image': {
		copy( attrs: any ): Storage<unknown> {
			return merge( commonExtractor( attrs ),
				{
					shared: {
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
				}
			);
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
			return merge( commonExtractor( attrs ),
				{
					shared: {
						border: {
							radius: {
								desktop: attrs?.style?.border?.radius
							}
						}
					}
				}
			);
		},
		paste( storage: Storage<{}> ): any {
			return merge( commonApplyer( storage ),
				{
					border: {
						radius: storage?.shared?.border?.radius?.desktop
					}
				}
			);
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
			return {
				layout: storage?.shared?.layout
			};
		}
	}
};

export default coreAdaptors;
