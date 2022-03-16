/**
 * External dependencies
 */
import { SortableContainer } from 'react-sortable-hoc';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { useState } from '@wordpress/element';

import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import { SortableTab } from './components/sortable-tabs.js';

const Inspector = ({
	attributes,
	setAttributes,
	children,
	deleteTab,
	selectTab,
	addTab,
	moveTab
}) => {

	const [ defaultTab, setDefaultTab ] = useState( children.find( c => true === c.attributes?.defaultOpen )?.clientId );
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );
	const { getBlock } = useSelect( 'core/block-editor' );

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

	const onTabColorChange = value => {
		setAttributes({ tabColor: value });
	};

	const onBorderColorChange = value => {
		setAttributes({ borderColor: value });
	};

	const onBorderWidthChange = value => {
		setAttributes({ borderWidth: Number( value ) });
	};

	const onActiveTitleColorChange = value => {
		setAttributes({ activeTitleColor: value });
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

	return (
		<InspectorControls>
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

			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					value={ attributes.borderWidth }
					onChange={ onBorderWidthChange }
					min={ 0 }
					max={ 5 }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.activeTitleColor,
						onChange: onActiveTitleColorChange,
						label: __( 'Active Title Color', 'otter-blocks' )
					},
					{
						value: attributes.tabColor,
						onChange: onTabColorChange,
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: attributes.borderColor,
						onChange: onBorderColorChange,
						label: __( 'Border Color', 'otter-blocks' )
					}
				] }
			>
				<ContrastChecker
					{ ...{
						textColor: attributes.activeTitleColor,
						backgroundColor: attributes.tabColor
					} }
				/>
			</PanelColorSettings>
		</InspectorControls>
	);
};

export default Inspector;
