/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { BaseControl } from '@wordpress/components';

import { useInstanceId } from '@wordpress/compose';

import {
	useEffect,
	useRef
} from '@wordpress/element';

const MarkerEditor = ({
	value,
	onChange
}) => {
	const instanceId = useInstanceId( MarkerEditor );

	useEffect( () => {
		const settings = {
			classic_block_editor: true, // eslint-disable-line camelcase
			plugins: 'lists,media,paste,tabfocus,wordpress,wpautoresize,wpeditimage,wpgallery,wplink,wpdialogs,wptextpattern,wpview',
			toolbar1: 'formatselect,bold,italic,bullist,numlist,alignleft,aligncenter,alignright,link,unlink,spellchecker,wp_add_media'
		};

		window.wp.oldEditor.initialize( editorRef.current.id, {
			tinymce: { ...settings }
		});

		const editor = window.tinymce.get( editorRef.current.id );

		editor.on( 'change', () => onChange( editor.getContent() ) );

		return () => window.wp.oldEditor.remove( editorRef.current.id );
	}, []);

	const id = `inspector-textarea-control-${ instanceId }`;

	const editorRef = useRef( null );

	const onChangeValue = e => onChange( e.target.value );

	return (
		<BaseControl
			id={ id }
			label={ __( 'Description', 'otter-blocks' ) }
		>
			<textarea
				id={ id }
				className="components-textarea-control__input"
				rows={ 4 }
				value={ value }
				onChange={ onChangeValue }
				ref={ editorRef }
			/>
		</BaseControl>
	);
};

export default MarkerEditor;
