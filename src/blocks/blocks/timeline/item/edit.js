/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useMemo
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../../helpers/block-utility';
import themeisleIcons from '../../../helpers/themeisle-icons';
import { boxToCSS } from '../../../helpers/helper-functions';
import Inspector from './inspector';

const { attributes: defaultAttributes } = metadata;

/**
 * Timeline Item component.
 *
 * @param {import('../types').TimelineItemProps} param
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const blockProps = useBlockProps();

	const Icon = useMemo( () => {
		return themeisleIcons.icons?.[ attributes.icon ];
	}, [ attributes.icon ]);

	const isURL = useMemo( () => {
		if ( 'image' !== attributes.iconType || ! attributes.icon ) {
			return false;
		}

		try {
			return Boolean( new URL( attributes.icon ) );
		} catch ( _ ) {
			return false;
		}
	}, [ attributes.icon, attributes.iconType ]);

	const inlineStyles = useMemo( () => {
		return Object.fromEntries(
			[
				[ '--o-timeline-cnt-bg', attributes.containerBackgroundColor ],
				[ '--o-timeline-cnt-br-w', boxToCSS( attributes.containerBorder ) ],
				[ '--o-timeline-cnt-br-c', attributes.containerBorderColor ],
				[ '--o-timeline-cnt-br-r', boxToCSS( attributes.containerRadius ) ],
				[ '--o-timeline-i-color', attributes.iconColor ]
			]
				?.filter( pairs => pairs?.[2] ?? pairs?.[1])
		);
	}, [ attributes ]);

	return (
		<Fragment>
			<Inspector attributes={ attributes } setAttributes={ setAttributes } />
			<div { ...blockProps }>
				<div className="o-timeline-container" style={inlineStyles}>
					<div className="o-timeline-icon">
						{
							attributes.hasIcon && (
								'image' === attributes.iconType && isURL ? (
									<img src={ attributes.icon } />
								) : (
									'themeisle-icons' === attributes.iconType && attributes.icon && Icon !== undefined ? (
										<Icon/>
									) : (
										<i
											className={
												`${ attributes.iconPrefix } fa-${ attributes.icon }`
											}
										></i>
									)
								)
							)
						}
					</div>
					<div className="o-timeline-content">
						<InnerBlocks
							template={
								[
									[ 'core/paragraph', { content: __( 'January 15, 2024', 'otter-blocks' ), fontSize: 'small' }],
									[ 'core/heading', { content: __( 'Project Launch', 'otter-blocks' ), level: 3 }],
									[ 'core/paragraph', { content: __( 'Successfully initiated our new product development project, setting the stage for innovation and growth.', 'otter-blocks' ) }]
								]
							}
						/>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
