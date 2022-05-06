/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	isEqual,
	isEmpty
} from 'lodash';

import {
	BaseControl,
	Button,
	TextControl,
	PanelBody
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const options = {
	'posts': {
		label: __( 'Posts', 'otter-blocks' ),
		options: [
			{
				label: __( 'Post ID', 'otter-blocks' ),
				value: 'postID'
			},
			{
				label: __( 'Post Title', 'otter-blocks' ),
				value: 'postTitle'
			},
			{
				label: __( 'Post Excerpt', 'otter-blocks' ),
				value: 'postExcerpt'
			}
		]
	}
};

const Fields = ({
	activeAttributes,
	attributes,
	changeAttributes,
	onChange
}) => {
	return (
		<Fragment>
			<PanelBody>
				<BaseControl
					label={ __( 'Data Type', 'otter-blocks' ) }
					id="o-dynamic-select"
				>
					<select
						value={ attributes.type || '' }
						onChange={ e => changeAttributes({
							type: e.target.value
						}) }
						id="o-dynamic-select"
						className="components-select-control__input"
					>
						<option value="none">{ __( 'Select an option', 'otter-blocks' ) }</option>

						{ Object.keys( options ).map( i => {
							return (
								<optgroup key={ i } label={ options[i].label }>
									{ options[i].options.map( o => <option key={ o.value } value={ o.value }>{ o.label }</option> ) }
								</optgroup>
							);
						}) }
					</select>
				</BaseControl>
			</PanelBody>

			{ 'postExcerpt' === attributes.type && (
				<PanelBody
					title={ __( 'Settings', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'Excerpt Length', 'otter-blocks' ) }
						type="number"
						value={ attributes.length || '' }
						onChange={ length => changeAttributes({ length }) }
					/>
				</PanelBody>
			) }

			<PanelBody
				title={ __( 'Advanced', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Before', 'otter-blocks' ) }
					type="text"
					value={ attributes.before || '' }
					onChange={ before => changeAttributes({ before }) }
				/>

				<TextControl
					label={ __( 'After', 'otter-blocks' ) }
					type="text"
					value={ attributes.after || '' }
					onChange={ after => changeAttributes({ after }) }
				/>
			</PanelBody>

			<PanelBody>
				<Button
					isPrimary
					variant="primary"
					disabled={ isEmpty( attributes ) || isEqual( attributes, activeAttributes ) }
					onClick={ onChange }
				>
					{ __( 'Apply', 'otter-blocks' ) }
				</Button>
			</PanelBody>
		</Fragment>
	);
};

export default Fields;
