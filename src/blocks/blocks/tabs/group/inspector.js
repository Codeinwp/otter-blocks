/**
 * External dependencies
 */
import { SortableContainer } from 'react-sortable-hoc';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	FontSizePicker,
	PanelBody,
	SelectControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import { useState, useEffect, Fragment } from '@wordpress/element';

import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import { SortableTab } from './components/sortable-tabs.js';
import { InspectorHeader, SyncColorPanel, SyncControlDropdown, ToogleGroupControl } from '../../../components/index.js';
import { alignCenter, alignLeft, alignRight, menu } from '@wordpress/icons';
import { changeActiveStyle, getActiveStyle, isEmptyBox } from '../../../helpers/helper-functions.js';
import AutoDisableSyncAttr from '../../../components/auto-disable-sync-attr/index';
import { makeBox } from '../../../plugins/copy-paste/utils';

const styles = [
	{
		label: __( 'Default', 'otter-blocks' ),
		value: 'default',
		isDefault: true
	},
	{
		label: __( 'Border', 'otter-blocks' ),
		value: 'border'
	},
	{
		label: __( 'Boxed', 'otter-blocks' ),
		value: 'boxed'
	}
];


/**
 *
 * @param {import('./types.js').TabsGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	children,
	deleteTab,
	selectTab,
	addTab,
	moveTab
}) => {
	const [ defaultTab, setDefaultTab ] = useState( children.find( c => true === c.attributes.defaultOpen )?.clientId );
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );
	const { getBlock } = useSelect( select => select( 'core/block-editor' ) );

	useEffect( () => {
		setDefaultTab( children.find( c => true === c.attributes.defaultOpen )?.clientId );
	}, [ children ]);

	const deleteWrapper = ( tabId ) => {
		const tab = getBlock( tabId );

		// fallback to first tab
		if ( true === tab.attributes.defaultOpen ) {
			updateBlockAttributes( children[0].clientId, { defaultOpen: true });
		}

		deleteTab( tabId );
	};

	const TabsList = SortableContainer( ({ items }) => {
		return (
			<div>
				{ items.map( ( tab, index ) => {
					return (
						<SortableTab
							key={ tab.clientId }
							tab={ tab }
							index={ index }
							deleteTab={ deleteWrapper }
							selectTab={ selectTab }
						/>
					);
				}) }
			</div>
		);
	});

	const onSortEnd = ({ oldIndex, newIndex }) => {
		moveTab( children[oldIndex].clientId, newIndex );
	};

	const onTabSelect = tabId => {
		children.forEach( ( child, i ) => {
			updateBlockAttributes( children[i].clientId, { defaultOpen: false });
		});

		updateBlockAttributes( tabId, { defaultOpen: true });
		setDefaultTab( tabId );
	};

	const tabOptions = children.map( ( c, index ) => {
		return { label: `${ index + 1 }. ${ c.attributes.title || __( 'Untitled Tab', 'otter-blocks' ) }`, value: c.clientId };
	});

	const [ tab, setTab ] = useState( 'settings' );


	return (
		<InspectorControls>
			<div>
				<InspectorHeader
					value={ tab }
					options={[
						{
							label: __( 'Settings', 'otter-blocks' ),
							value: 'settings'
						},
						{
							label: __( 'Style', 'otter-blocks' ),
							value: 'style'
						}
					]}
					onChange={ setTab }
				/>

				{
					'settings' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Tabs Settings', 'otter-blocks' ) }
							>
								{/* <BaseControl
									label={ __( 'Tab titles position', 'otter-blocks' ) }
								>
									<ToogleGroupControl
										value={ attributes.tabsPosition ?? 'top' }
										options={[
											{
												label: __( 'Vertical', 'otter-blocks' ),
												value: 'top'
											},
											{
												label: __( 'Horizontal', 'otter-blocks' ),
												value: 'left'
											}
										]}
										onChange={ tabsPosition => setAttributes({ tabsPosition }) }
									/>
								</BaseControl> */}

								{
									'left' !== attributes.tabsPosition && (
										<BaseControl
											label={ __( 'Alignment', 'otter-blocks' ) }
										>
											<ToogleGroupControl
												value={ attributes.titleAlignment ?? 'left' }
												onChange={ titleAlignment => setAttributes({ titleAlignment }) }
												options={[
													{
														icon: alignLeft,
														label: __( 'Left', 'otter-blocks' ),
														value: 'left'
													},
													{
														icon: alignCenter,
														label: __( 'Center', 'otter-blocks' ),
														value: 'center'
													},
													{
														icon: alignRight,
														label: __( 'Right', 'otter-blocks' ),
														value: 'right'
													},
													{
														icon: menu,
														label: __( 'Full', 'otter-blocks' ),
														value: 'full'
													}
												]}
												hasIcon={ true }
											/>
										</BaseControl>
									)
								}

								<SelectControl
									label={ __( 'Tab title HTML tag', 'otter-blocks' ) }
									value={ attributes.titleTag ?? 'div' }
									onChange={ titleTag => setAttributes({ titleTag }) }
									options={[
										{
											label: __( 'H1', 'otter-blocks' ),
											value: 'h1'
										},
										{
											label: __( 'H2', 'otter-blocks' ),
											value: 'h2'
										},
										{
											label: __( 'H3', 'otter-blocks' ),
											value: 'h3'
										},
										{
											label: __( 'H4', 'otter-blocks' ),
											value: 'h4'
										},
										{
											label: __( 'H5', 'otter-blocks' ),
											value: 'h5'
										},
										{
											label: __( 'H6', 'otter-blocks' ),
											value: 'h6'
										},
										{
											label: __( 'Div', 'otter-blocks' ),
											value: 'div'
										},
										{
											label: __( 'Span', 'otter-blocks' ),
											value: 'span'
										}
									]}
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Tabs Management', 'otter-blocks' ) }
							>
								<p>{ __( 'Press and hold to use drag and drop to sort the tabs', 'otter-blocks' ) }</p>

								{ 0 < children?.length && (
									<TabsList
										items={ children }
										onSortEnd={ onSortEnd }
										useDragHandle
										axis="y"
										lockAxis="y"
									/>
								) }

								<Button
									isSecondary
									className="wp-block-themeisle-blocks-tabs-inspector-add-tab"
									onClick={ addTab }
								>
									{ __( 'Add Tab', 'otter-blocks' ) }
								</Button>

								<SelectControl
									label={ __( 'Initial Tab', 'otter-blocks' ) }
									value={ defaultTab }
									options={ tabOptions }
									onChange={ onTabSelect }
								/>
							</PanelBody>
						</Fragment>
					)
				}

				{
					'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Style variations', 'otter-blocks' ) }
							>
								<BaseControl
									label={ __( 'Select a style', 'otter-blocks' ) }
								>
									<ToogleGroupControl
										value={ getActiveStyle( styles, attributes.className ) }
										onChange={ value => {
											const classes = changeActiveStyle( attributes?.className, styles, value ) || undefined;
											setAttributes({ className: classes });
										} }
										options={[
											{
												label: __( 'Default', 'otter-blocks' ),
												value: 'default'
											},
											{
												label: __( 'Border', 'otter-blocks' ),
												value: 'border'
											},
											{
												label: __( 'Boxed', 'otter-blocks' ),
												value: 'boxed'
											}
										]}
										hasIcon={ false }
									/>
								</BaseControl>
							</PanelBody>
							<PanelBody
								title={ __( 'Typography', 'otter-blocks' ) }
							>
								<SyncControlDropdown
									isSynced={attributes.isSynced}
									setAttributes={setAttributes}
									options={[
										{
											label: __( 'Font Size', 'otter-blocks' ),
											value: 'titleFontSize'
										}
									]}
								/>
								<AutoDisableSyncAttr attr='titleFontSize' attributes={attributes}>
									<FontSizePicker
										fontSizes={ [
											{
												name: __( 'Extra Small', 'otter-blocks' ),
												icon: 'small',
												size: '14px'
											},
											{
												name: __( 'Small', 'otter-blocks' ),
												slug: 'small',
												size: '16px'
											},
											{
												name: __( 'Medium', 'otter-blocks' ),
												slug: 'medium',
												size: '18px'
											},
											{
												name: __( 'Large', 'otter-blocks' ),
												slug: 'large',
												size: '24px'
											},
											{
												name: __( 'Extra Large', 'otter-blocks' ),
												slug: 'extra-large',
												size: '28px'
											}
										] }
										value={ attributes.titleFontSize }
										onChange={ titleFontSize => setAttributes({ titleFontSize }) }
									/>
								</AutoDisableSyncAttr>

							</PanelBody>
							<SyncColorPanel
								label={ __( 'Colors', 'otter-blocks' ) }
								isSynced={ attributes.isSynced ?? [] }
								initialOpen={ false }
								setAttributes={ setAttributes }
								options={ [
									{
										value: attributes.titleBackgroundColor,
										label: __( 'Title background', 'otter-blocks' ),
										slug: 'titleBackgroundColor'
									},
									{
										value: attributes.activeTitleBackgroundColor,
										label: __( 'Active title background', 'otter-blocks' ),
										slug: 'activeTitleBackgroundColor'
									},
									{
										value: attributes.titleColor,
										label: __( 'Title color', 'otter-blocks' ),
										slug: 'titleColor'
									},
									{
										value: attributes.activeTitleColor,
										label: __( 'Active title color', 'otter-blocks' ),
										slug: 'activeTitleColor'
									},
									{
										value: attributes.contentTextColor,
										label: __( 'Content text color', 'otter-blocks' ),
										slug: 'contentTextColor'
									},
									{
										value: attributes.tabColor,
										label: __( 'Content background', 'otter-blocks' ),
										slug: 'tabColor'
									},
									{
										value: attributes.borderColor,
										label: __( 'Border', 'otter-blocks' ),
										slug: 'borderColor'
									},
									{
										value: attributes.activeBorderColor,
										label: __( 'Active border', 'otter-blocks' ),
										slug: 'activeBorderColor'
									}
								] }
							/>
							<PanelBody
								title={ __( 'Dimensions(Layout)', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<SyncControlDropdown
									isSynced={attributes.isSynced}
									setAttributes={setAttributes}
									options={[
										{
											label: __( 'Title Padding', 'otter-blocks' ),
											value: 'titlePadding'
										},
										{
											label: __( 'Content Padding', 'otter-blocks' ),
											value: 'contentPadding'
										}
									]}
								/>
								<AutoDisableSyncAttr attr='titlePadding' attributes={attributes}>
									<BoxControl
										label={ __( 'Title Padding', 'otter-blocks' ) }
										values={ attributes.titlePadding ?? makeBox( '16px' )  }
										onChange={ titlePadding => setAttributes({ titlePadding: ! isEmptyBox( titlePadding ) ? titlePadding : undefined }) }
									/>
								</AutoDisableSyncAttr>
								<AutoDisableSyncAttr attr='contentPadding' attributes={attributes}>
									<BoxControl
										label={ __( 'Content Padding', 'otter-blocks' ) }
										values={ attributes.contentPadding ?? makeBox( '16px' )  }
										onChange={ contentPadding => setAttributes({ contentPadding:
											! isEmptyBox( contentPadding ) ? contentPadding : undefined }) }
									/>
								</AutoDisableSyncAttr>

							</PanelBody>
							<PanelBody
								title={ __( 'Border Radius', 'otter-blocks' ) }
								initialOpen={ false }
							>
								{/*

								TODO: Temporary disabled until the first prototype.

								<BoxControl
									label={ __( 'Radius', 'otter-blocks' ) }
									values={ attributes.borderRadius }
									onChange={ borderRadius => setAttributes({ borderRadius }) }
									id="o-border-raduis-box"
								/> */}

								<SyncControlDropdown
									isSynced={attributes.isSynced}
									setAttributes={setAttributes}
									options={[
										{
											label: __( 'Title Border Width', 'otter-blocks' ),
											value: 'titleBorderWidth'
										},
										{
											label: __( 'Content Border Width', 'otter-blocks' ),
											value: 'borderWidth'
										}
									]}
								/>

								<AutoDisableSyncAttr attr='titleBorderWidth' attributes={attributes}>
									<BoxControl
										label={ __( 'Title Border Width', 'otter-blocks' ) }
										values={ attributes.titleBorderWidth ?? attributes.borderWidth ?? makeBox( '3px' ) }
										onChange={ titleBorderWidth => {
											setAttributes({ titleBorderWidth: ! isEmptyBox( titleBorderWidth ) ? titleBorderWidth : undefined });
										} }
									/>
								</AutoDisableSyncAttr>
								<AutoDisableSyncAttr attr='borderWidth' attributes={attributes}>
									<BoxControl
										label={ __( 'Content Border Width', 'otter-blocks' ) }
										values={ attributes.borderWidth ?? makeBox( '3px' ) }
										onChange={ borderWidth => {
											setAttributes({ borderWidth: ! isEmptyBox( borderWidth ) ? borderWidth : undefined });
										} }
									/>
								</AutoDisableSyncAttr>
							</PanelBody>
						</Fragment>
					)
				}
			</div>
		</InspectorControls>
	);
};

export default Inspector;
