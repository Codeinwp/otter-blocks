/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import { InspectorControls } from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	CheckboxControl,
	DateTimePicker,
	Dropdown,
	FormTokenField,
	PanelBody,
	SelectControl,
	TextControl
} from '@wordpress/components';


import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

// BUG: Find out why is not working
// TODO: Make this as a wrapper
const Edit = ({
	attributes
}) => {
	<div className="o-sticky-highlight">
		<div className="o-sticky-badge">
			Sticky
		</div>
	</div>;
};

export default Edit;
