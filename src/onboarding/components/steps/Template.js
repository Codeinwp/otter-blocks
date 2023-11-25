/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import TemplateSelector from '../TemplateSelector';

const Template = ({
	type,
	label
}) => {
	const {
		template,
		library,
		editedEntity,
		selectedTemplate,
		isDefault
	} = useSelect( ( select ) => {
		const { getEditedPostId } = select( 'core/edit-site' );

		const {
			getTemplate,
			getLibrary,
			getSelectedTemplate,
			getSourceTemplate
		} = select( 'otter/onboarding' );

		const editedEntity = getEditedPostId();

		const currentTemplate = getTemplate({ slug: type });
		const template = currentTemplate?.id && getSourceTemplate( currentTemplate );
		const library = getLibrary( type );
		const selectedTemplate = getSelectedTemplate( type );
		const isDefault = 'theme' === currentTemplate?.source;

		return {
			template,
			library,
			editedEntity,
			selectedTemplate,
			isDefault
		};
	}, [ type ]);

	const { setEditedEntity } = useDispatch( 'core/edit-site' );
	const { setSelectedTemplate } = useDispatch( 'otter/onboarding' );

	useEffect( () => {
		if ( template?.id && template.id !== editedEntity ) {
			setEditedEntity( 'wp_template', template.id, 'edit' );
		}
	}, [ editedEntity, template ]);

	return (
		<div className="o-templates">
			<TemplateSelector
				template={ template }
				label={
					sprintf(

						/* translators: %s: Template type. */
						__( '%s - Default', 'otter-blocks' ),
						label
					)
				}
				isSelected={ 'default' === selectedTemplate || ( '' === selectedTemplate && isDefault ) }
				onClick={ () => setSelectedTemplate( type, 'default' ) }
			/>

			{ Object.keys( library ).map( item => (
				<TemplateSelector
					key={ item }
					template={ library[ item ] }
					label={ `${ label } - ${ library[ item ]?.title }` }
					isSelected={ item === selectedTemplate }
					onClick={ () => setSelectedTemplate( type, item ) }
				/>
			) ) }
		</div>
	);
};

export default Template;
