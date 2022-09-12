import { pickBy } from 'lodash';
import { SectionAttrs } from '../../blocks/section/columns/types';
import { BoxType } from '../../helpers/blocks';
import { SharedAttrs, Storage } from './models';

const toBoxType = ( n: number ): BoxType => {
	return ! n ? undefined : {
		top: n + 'px',
		left: n + 'px',
		right: n + 'px',
		bottom: n + 'px'
	};
};

export const adaptors = {
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
							desktop: toBoxType( attrs.borderRadius )
						}
					},
					colors: {
						background: attrs.backgroundColor
					}
				},
				private: {
					...pickBy( attrs, ( value, key ) => {
						return key?.includes( 'background' );
					})
				}
			};
		},
		paste( storage: Storage<SectionAttrs> ): SectionAttrs {
			const s = storage.shared;

			return {
				padding: s.padding?.desktop,
				paddingMobile: s.padding?.mobile,
				paddingTablet: s.padding?.tablet,
				margin: s.margin?.desktop,
				marginTablet: s.margin?.tablet,
				marginMobile: s.margin?.mobile,
				borderRadius: s.border?.radius?.desktop?.top ? parseInt( s.border?.radius?.desktop?.top ) : undefined,
				backgroundColor: s.colors?.background,
				...storage.private
			};
		}
	}
};

export const implementedAdaptors = Object.keys( adaptors );
