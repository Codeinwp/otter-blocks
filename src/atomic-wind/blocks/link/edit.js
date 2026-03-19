import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	InspectorControls,
	__experimentalLinkControl as LinkControl,
	BlockControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToolbarButton,
	ToolbarGroup,
	Popover,
} from '@wordpress/components';
import { link as linkIcon, button as buttonIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

export default function Edit( { attributes, setAttributes } ) {
	const { url, text, opensInNewTab, rel, mode } = attributes;
	const [ isLinkOpen, setIsLinkOpen ] = useState( false );
	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<>
			<BlockControls>
				<ToolbarButton
					icon={ linkIcon }
					label={ __( 'Edit Link', 'atomic-wind' ) }
					onClick={ () => setIsLinkOpen( ! isLinkOpen ) }
					isActive={ !! url }
				/>
				<ToolbarGroup>
					<ToolbarButton
						icon={ buttonIcon }
						label={ __( 'Switch to inner blocks mode', 'atomic-wind' ) }
						onClick={ () =>
							setAttributes( {
								mode: mode === 'inner-blocks' ? 'text' : 'inner-blocks',
							} )
						}
						isActive={ mode === 'inner-blocks' }
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Link Settings', 'atomic-wind' ) }>
					<p>
						{ __( 'URL: ', 'atomic-wind' ) }
						{ url || __( 'Not set', 'atomic-wind' ) }
					</p>
				</PanelBody>
			</InspectorControls>
			{ mode === 'inner-blocks' ? (
				<a { ...innerBlocksProps } />
			) : (
				<RichText
					{ ...blockProps }
					tagName="a"
					value={ text }
					onChange={ ( value ) =>
						setAttributes( { text: value } )
					}
					placeholder={ __( 'Link text…', 'atomic-wind' ) }
				/>
			) }
			{ isLinkOpen && (
				<Popover
					position="bottom center"
					onClose={ () => setIsLinkOpen( false ) }
				>
					<LinkControl
						value={ {
							url,
							opensInNewTab,
						} }
						onChange={ ( nextValue ) => {
							setAttributes( {
								url: nextValue.url,
								opensInNewTab:
									nextValue.opensInNewTab,
							} );
						} }
					/>
				</Popover>
			) }
		</>
	);
}
