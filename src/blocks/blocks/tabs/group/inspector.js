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
	RangeControl
} from '@wordpress/components';

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
	const TabsList = SortableContainer( ({ items }) => {
		return (
			<div>
				{ items.map( ( tab, index ) => {
					return (
						<SortableTab
							key={ tab.id }
							tab={ tab }
							index={ index }
							deleteTab={ deleteTab }
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

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Tabs Management', 'otter-blocks' ) }
				initialOpen={ true }
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
					isLarge
					className="wp-block-themeisle-blocks-tabs-inspector-add-tab"
					onClick={ addTab }
				>
					{ __( 'Add Tab', 'otter-blocks' ) }
				</Button>
			</PanelBody>

			<PanelBody
				title={__( 'Settings', 'otter-blocks' ) }
				initialOpen={ true }
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
