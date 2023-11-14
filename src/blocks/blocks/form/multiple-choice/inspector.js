/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	PanelBody,
	SelectControl,
	TextareaControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';
import { Fragment, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getActiveStyle, changeActiveStyle, buildResponsiveSetAttributes } from '../../../helpers/helper-functions.js';
import {
	fieldTypesOptions,
	HideFieldLabelToggle,
	mappedNameInfo, SortableChoiceItem,
	SortableChoiceList,
	switchFormFieldTo
} from '../common';
import { FormContext } from '../edit.js';
import { HTMLAnchorControl } from '../../../components';
import { debounce, isString } from 'lodash';
import { SortableContainer } from 'react-sortable-hoc';
import arrayMove from 'array-move';

const styles = [
	{
		label: __( 'Inline List', 'otter-blocks' ),
		value: 'inline-list'
	}
];

/**
 *
 * @param {import('./types').FormMultipleChoiceInputInspectorProps} props
 * @returns {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId
}) => {

	const {
		selectForm
	} = useContext( FormContext );

	const options = ( isString( attributes.options ) ? attributes.options?.split( '\n' )?.map( x => ({ isDefault: false, content: x }) ) : attributes.options ) ?? [];

	// Without debouncing, the RichText will lose focus on every keypress.
	const debouncedSet = debounce( setAttributes, 800 );

	const ChoiceList = SortableContainer( ( props ) => {
		return (
			<div>
				{
					props.options?.map(
						( tab, index ) => (
							<SortableChoiceItem
								key={tab?.content}
								index={index}
								tab={tab}
								setAsDefault={() => {
									const updatedOptions = options.map( ( item, i ) => {
										let updatedItem = { ...item };
										if (
											( 'select' === attributes.type || 'radio' === attributes.type ) &&
											i !== index
										) {
											updatedItem.isDefault = false;
										}
										if ( i === index ) {
											updatedItem.isDefault = ! Boolean( item.isDefault );
										}
										return updatedItem;
									});

									setAttributes({ options: updatedOptions });
								}}
								deleteTab={() => {
									const o = [ ...options ];
									o.splice( index, 1 );
									setAttributes({ options: o });
								}}
								onLabelChange={( value ) => {
									const o = [ ...options ];
									o[index] = { ...o[index], content: value };
									debouncedSet({ options: o });
								}}
								useRadio={'select' === attributes.type || 'radio' === attributes.type}
							/>
						) )
				}
			</div>
		);
	});

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Field Settings', 'otter-blocks' ) }
				>
					<Button
						isSecondary
						variant="secondary"
						onClick={ () => selectForm?.() }
					>
						{ __( 'Back to the Form', 'otter-blocks' ) }
					</Button>

					<SelectControl
						label={ __( 'Field Type', 'otter-blocks' ) }
						value={ attributes.type }
						options={ fieldTypesOptions() }
						onChange={ type => {
							if ( 'radio' === type || 'checkbox' === type || 'select' === type ) {


								if ( 'checkbox' === attributes.type ) {

									// Remove all the default values.
									const o = options?.map( item => ({ ...item, isDefault: false }) );
									setAttributes({ type, options: o });
								} else {
									setAttributes({ type });
								}

								return;
							}
							switchFormFieldTo( type, clientId, attributes );
						}}
					/>

					<TextControl
						label={ __( 'Label', 'otter-blocks' ) }
						value={ attributes.label }
						onChange={ label => setAttributes({ label }) }
					/>

					<HideFieldLabelToggle attributes={ attributes } setAttributes={ setAttributes } />

					<BaseControl
						id="otter-form-multiple-choice-options"
						label={ __( 'Options', 'otter-blocks' ) }
					>
						<ChoiceList
							options={ options }
							useDragHandle
							axis="y"
							lockAxis="y"
							onSortEnd={ ({ oldIndex, newIndex }) => {
								let o = [ ...options ];
								o = arrayMove( o, oldIndex, newIndex );
								setAttributes({ options: o });
							} }
						/>
						<Button
							isSecondary
							className="wp-block-themeisle-blocks-tabs-inspector-add-tab"
							onClick={ () => {
								const o = [ ...options ];
								o.push({ isDefault: false, content: '' });
								setAttributes({ options: o });
								setTimeout( () => {
									document.querySelector( '.wp-block-themeisle-blocks-tabs-inspector-tab-option:last-child .wp-block-themeisle-blocks-tabs-inspector-tab-option__name' )?.focus();
								}, 300 );
							} }
						>
							{ __( 'Add Option', 'otter-blocks' ) }
						</Button>
					</BaseControl>


					<TextControl
						label={ __( 'Help Text', 'otter-blocks' ) }
						value={ attributes.helpText }
						onChange={ helpText => setAttributes({ helpText }) }
					/>

					{
						'select' !== attributes?.type && (
							<ToggleControl
								label={ __( 'Inline list', 'otter-blocks' ) }
								checked={ Boolean( getActiveStyle( styles, attributes.className ) ) }
								onChange={ value => {
									const classes = changeActiveStyle( attributes.className, styles, value ? 'inline-list' : undefined );
									setAttributes({ className: classes });
								} }
							/>
						)
					}

					{
						'select' === attributes?.type && (
							<ToggleControl
								label={ __( 'Multiple selection', 'otter-blocks' ) }
								checked={ attributes.multipleSelection }
								onChange={ multipleSelection => setAttributes({ multipleSelection }) }
							/>
						)
					}

					<ToggleControl
						label={ __( 'Required', 'otter-blocks' ) }
						help={ __( 'If enabled, the input field must be filled out before submitting the form.', 'otter-blocks' ) }
						checked={ attributes.isRequired }
						onChange={ isRequired => setAttributes({ isRequired }) }
					/>

					<TextControl
						label={ __( 'Mapped Name', 'otter-blocks' ) }
						help={ mappedNameInfo }
						value={ attributes.mappedName }
						onChange={ mappedName => setAttributes({ mappedName }) }
						placeholder={ __( 'car_type', 'otter-blocks' ) }
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Color', 'otter-blocks' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: attributes.labelColor,
							onChange: () => {},
							label: __( 'Label Color', 'otter-blocks' )
						}
					] }
				/>
			</InspectorControls>
			<HTMLAnchorControl
				value={ attributes.id }
				onChange={ value => setAttributes({ id: value }) }
			/>
		</Fragment>
	);
};

export default Inspector;
