/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	assign,
	intersection,
	isEmpty,
	startCase,
	toLower
} from 'lodash';

import {
	BaseControl,
	Button,
	ExternalLink,
	TextControl
} from '@wordpress/components';

import {
	select,
	useSelect
} from '@wordpress/data';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

const { Notice } = window.otterComponents;

const ALLOWED_ACF_TYPES = [
	'text',
	'textarea',
	'range',
	'number',
	'url',
	'email',
	'password',
	'date_picker',
	'date_time_picker',
	'time_picker',
];

const addAttribute = ( props ) => {
	if ( 'themeisle-blocks/posts-grid' === props.name ) {
		props.attributes = assign( props.attributes, {
			customMetas: {
				type: 'array',
				items: {
					type: 'object'
				}
			}
		});
	}

	return props;
};

const AddFields = (
	ProFeatures,
	attributes,
	setAttributes
) => {
	if ( window.acf === undefined ) {
		return (
			<ExternalLink
				href="https://wordpress.org/plugins/advanced-custom-fields/"
				target="_blank"
			>
				{ __( 'Activate Advanced Custom Fields to add more fields.', 'otter-pro' ) }
			</ExternalLink>
		);
	}

	const filterDeadCustomTemplates = () => {
		const validCustomTemplates = intersection(
			attributes.template,
			attributes?.customMetas?.map( ({ id }) => id )
		);

		return {
			template: attributes?.template.filter( t => ! t.startsWith( 'custom_' ) || ( validCustomTemplates.includes( t ) ) ),
			customMetas: attributes.customMetas?.filter( ({ id }) => validCustomTemplates.includes( id ) )
		};
	};

	return (
		<Fragment>
			<Button
				variant="secondary"
				isSecondary
				className="o-conditions__add"
				disabled={ ! Boolean( window.otterPro.isActive ) || Boolean( window.otterPro.isExpired ) }
				onClick={ () => {
					let id = uuidv4().slice( 0, 8 );

					while ( 0 < attributes?.customMetas?.some( ({ otherId }) => otherId === id )  ) {
						id = uuidv4().slice( 0, 8 );
					}

					id = `custom_${ id }`;

					const newMeta = {
						id,
						field: '',
						display: true
					};

					const {
						template,
						customMetas
					} = filterDeadCustomTemplates();

					setAttributes({
						template: [ ...template, id ],
						customMetas: customMetas ? [ ...customMetas, newMeta ] : [ newMeta ]
					});
				} }
			>
				{ __( 'Add Custom Field', 'otter-pro' ) }
			</Button>

			{ Boolean( window.otterPro.isExpired ) && (
				<Notice
					notice={ __( 'Otter Pro license has expired.', 'otter-pro' ) }
					instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Posts Block.', 'otter-pro' ) }
				/>
			) }

			{ ! Boolean( window.otterPro.isActive ) && (
				<Notice
					notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Posts Block.', 'otter-pro' ) }
				/>
			) }
		</Fragment>
	);
};


const PostsCustomMeta = ({ customFieldData }) => {
	const { fields } = useSelect( select => {

		const { fields } = select( 'otter-pro' ).getACFData();

		return {
			fields
		};
	}, []);

	if ( ! customFieldData || ( ! customFieldData.display ) ) {
		return <></>;
	}

	const meta = fields[ customFieldData.field ];

	return (
		<div className="o-posts-custom-field">
			{ ( meta?.prepend || '' ) + ( meta?.value ? meta.value : ( meta?.default_value || '' ) ) + ( meta?.append || '' ) }
		</div>
	);
};

const TemplateLoop = (
	el,
	element,
	attributes
) => {
	if ( ! element?.startsWith( 'custom_' ) ) {
		return el;
	}

	const customFieldData = attributes.customMetas?.filter( ({ id }) => id === element )?.pop();

	return <PostsCustomMeta customFieldData={ customFieldData } />;
};

const Controls = (
	el,
	attributes,
	setAttributes,
	isCustomMeta,
	customMeta,
	setAttributesCustomMeta
) => {
	const {
		groups,
		fields
	} = select( 'otter-pro' ).getACFData();

	if ( ! ( isCustomMeta && customMeta ) ) {
		return el;
	}

	const deleteCustomField = () => {
		setAttributes({
			template: attributes.template?.filter( template => template !== customMeta?.id ),
			customMetas: attributes.customMetas?.filter( currentMeta =>
				currentMeta?.id !== customMeta?.id )
		});
	};

	if ( ! Boolean( window.otterPro.isActive ) ) {
		return (
			<Notice
				notice={ __( 'You need to activate Otter Pro to edit this field.', 'otter-pro' ) }
			/>
		);
	}

	return (
		<Fragment>
			{ ! isEmpty( groups ) && (
				<BaseControl
					label={ __( 'Fields', 'otter-pro' ) }
				>
					<select
						value={ fields[ customMeta.field ] ? customMeta.field : 'none' }
						onChange={ event => setAttributesCustomMeta({ field: event.target.value  }) }
						className="components-select-control__input"
						disabled={ Boolean( window.otterPro.isExpired ) }
					>
						<option value="none">{ __( 'Select a field', 'otter-pro' ) }</option>

						{ groups.map( group => {
							return (
								<optgroup
									key={ group?.data?.key }
									label={ group?.data?.title }
								>
									{ group?.fields
										?.filter( ({ key, label, type }) => key && label &&  ALLOWED_ACF_TYPES.includes( type ) )
										.map( ({ key, label }) => (
											<option
												key={ key }
												value={ key }
											>
												{ label }
											</option>
										) ) }
								</optgroup>
							);
						}) }
					</select>
				</BaseControl>
			) }

			{ ( ! isEmpty( fields ) ) && fields[ customMeta.field ] && (
				<Fragment>
					{ ( fields[ customMeta.field ][ 'default_value' ]) && (
						<TextControl
							label={ __( 'Default Value', 'otter-pro' ) }
							value={ fields[ customMeta.field ][ 'default_value' ]  }
							disabled
						/>
					) }

					{ ( fields[ customMeta.field ].prepend ) && (
						<TextControl
							label={ __( 'Before', 'otter-pro' ) }
							value={ fields[ customMeta.field ].prepend }
							disabled
						/>
					) }

					{ ( fields[ customMeta.field ].append ) && (
						<TextControl
							label={ __( 'After', 'otter-pro' ) }
							value={ fields[ customMeta.field ].append }
							disabled
						/>
					) }
				</Fragment>
			) }

			{ fields[ customMeta.field ]?.urlLocation && (
				<Fragment>
					<ExternalLink
						href={ fields[ customMeta.field ]?.urlLocation }
						target='_blank'
					>
						{ __( 'Edit in ACF', 'otter-pro' ) }
					</ExternalLink>
					<br/>
				</Fragment>
			) }

			{ isEmpty( groups ) ? (
				<ExternalLink
					href={ `${ window.otterPro.rootUrl || '' }/wp-admin/edit.php?post_type=acf-field-group` }
					target='_blank'
				>
					{ __( 'There are no ACF fields. You can use this option after you add some.', 'otter-pro' ) }
				</ExternalLink>
			) : ! fields[ customMeta.field ] &&  (
				__( 'The selected field does not longer exists. Please select another field.', 'otter-pro' )
			) }

			<Button
				onClick={ deleteCustomField }
				variant="secondary"
				isSecondary
				isDestructive
				className="o-conditions__add"
			>
				{ __( 'Delete', 'otter-pro' ) }
			</Button>
		</Fragment>
	);
};

const changeTabLabel = (
	el,
	customMeta
) => {
	const { fields } = useSelect( select => {
		const { fields } = select( 'otter-pro' ).getACFData();

		return {
			fields
		};
	}, []);

	return startCase( toLower( fields[ customMeta.field ]?.label || __( 'Custom Type', 'otter-pro' ) ) );
};

addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/posts-acf-extension-attributes', addAttribute );
addFilter( 'otter.postsBlock.panelLabel', 'themeisle-gutenberg/posts-acf-extension-tab-label', changeTabLabel );
addFilter( 'otter.postsBlock.sortableContainer', 'themeisle-gutenberg/posts-acf-extension-add-button', AddFields );
addFilter( 'otter.postsBlock.controls', 'themeisle-gutenberg/posts-acf-extension-controls', Controls );

if ( Boolean( window.otterPro.isActive ) ) {
	addFilter( 'otter.postsBlock.templateLoop', 'themeisle-gutenberg/posts-acf-extension-template-loop', TemplateLoop );
}
