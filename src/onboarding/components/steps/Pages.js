/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { parse } from '@wordpress/blocks';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import TemplateSelector from '../TemplateSelector';

import { findBlock } from '../../utils';

const PreviewWrapper = ({
	template,
	isSelected,
	onClick
}) => {
	const { pageTemplate } = useSelect( select => {
		const { getTemplate } = select( 'otter/onboarding' );

		const pageTemplate = getTemplate({ slug: template.template ?? 'page' });

		return {
			pageTemplate
		};
	}, []);

	const [ blocks, setBlocks ] = useState([]);

	useEffect( () => {
		if ( ! pageTemplate ) {
			return;
		}

		const parsed = parse( pageTemplate.content?.raw ?? []);

		const postContentBlock = findBlock( parsed, 'core/post-content' );

		if ( postContentBlock ) {

			// Post Content doesn't preview innerBlocks so we replace it with a Group block.
			// Kind of hacky, but it works.
			postContentBlock.name = 'core/group';
			postContentBlock.innerBlocks = parse( template?.content?.raw ) ?? [];
		}

		setBlocks( parsed );

	}, [ pageTemplate ]);

	return (
		<TemplateSelector
			template={ blocks }
			label={ template?.title }
			isParsed={ true }
			isSelected={ isSelected }
			onClick={ onClick }
		/>
	);
};

const Pages = () => {
	const {
		library,
		selectedTemplates
	} = useSelect( select => {
		const {
			getLibrary,
			getSelectedTemplate
		} = select( 'otter/onboarding' );

		const library = getLibrary( 'page_templates' );
		const selectedTemplates = getSelectedTemplate( 'pageTemplates' );

		return {
			library,
			selectedTemplates
		};
	}, []);

	const { setSelectedTemplate } = useDispatch( 'otter/onboarding' );

	const onSelect = ( value ) => {
		const isSelected = selectedTemplates.includes( value );

		if ( isSelected ) {
			setSelectedTemplate( 'pageTemplates', selectedTemplates.filter( item => item !== value ) );
		} else {
			setSelectedTemplate( 'pageTemplates', [ ...selectedTemplates, value ]);
		}
	};

	return (
		<div className="o-templates">
			{ Object.keys( library ).map( item => (
				<PreviewWrapper
					key={ item }
					template={ library[ item ] }
					value={ item }
					isSelected={ selectedTemplates?.includes( item ) }
					onClick={ () => onSelect( item ) }
				/>
			) ) }
		</div>
	);
};

export default Pages;
