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

const Archive = () => {
	const {
		template,
		library,
		editedEntity,
		selectedTemplate
	} = useSelect( ( select ) => {
		const { getEditedPostId } = select( 'core/edit-site' );

		const {
			getTemplate,
			getLibrary,
			getSelectedTemplate,
			getSourceTemplate
		} = select( 'otter/onboarding' );

		const editedEntity = getEditedPostId();

		const archive = getTemplate({ slug: 'archive' });
		const template = archive?.id && getSourceTemplate( archive );
		const library = getLibrary( 'archive' );
		const selectedTemplate = getSelectedTemplate( 'archive' );

		return {
			template,
			library,
			editedEntity,
			selectedTemplate
		};
	}, []);

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
				label={ __( 'Post Archive - Default', 'otter-blocks' ) }
				isSelected={ 'default' === selectedTemplate }
				onClick={ () => setSelectedTemplate( 'archive', 'default' ) }
			/>

			{ Object.keys( library ).map( item => (
				<TemplateSelector
					key={ item }
					template={ library[ item ] }
					label={ sprintf(

						/* translators: %s: Template name. */
						__( 'Post Archive - %s', 'otter-blocks' ),
						library[ item ]?.title
					) }
					isSelected={ item === selectedTemplate }
					onClick={ () => setSelectedTemplate( 'archive', item ) }
				/>
			) ) }
		</div>
	);
};

export default Archive;
