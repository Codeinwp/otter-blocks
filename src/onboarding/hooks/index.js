/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';

const MAX_LOADING_TIME = 10000; // 10 seconds

// This is a copy of the useEditedEntityRecord function from the Gutenberg plugin.
export const useEditedEntityRecord = ( postType, postId ) => {
	const { record, title, description, isLoaded, icon } = useSelect(
		( select ) => {
			const { getEditedPostType, getEditedPostId } =
				select( 'core/edit-site' );
			const { getEditedEntityRecord, hasFinishedResolution } =
				select( 'core' );
			const { __experimentalGetTemplateInfo: getTemplateInfo } =
				select( 'core/editor' );
			const usedPostType = postType ?? getEditedPostType();
			const usedPostId = postId ?? getEditedPostId();
			const _record = getEditedEntityRecord(
				'postType',
				usedPostType,
				usedPostId
			);
			const _isLoaded =
				usedPostId &&
				hasFinishedResolution( 'getEditedEntityRecord', [
					'postType',
					usedPostType,
					usedPostId
				]);
			const templateInfo = getTemplateInfo( _record );

			return {
				record: _record,
				title: templateInfo.title,
				description: templateInfo.description,
				isLoaded: _isLoaded,
				icon: templateInfo.icon
			};
		},
		[ postType, postId ]
	);

	return {
		isLoaded,
		icon,
		record,
		getTitle: () => ( title ? decodeEntities( title ) : null ),
		getDescription: () =>
			description ? decodeEntities( description ) : null
	};
};

// This is a copy of the useIsSiteEditorLoading function from the Gutenberg plugin.
export const useIsSiteEditorLoading = () => {
	const { isLoaded: hasLoadedPost } = useEditedEntityRecord();
	const [ loaded, setLoaded ] = useState( false );
	const inLoadingPause = useSelect(
		( select ) => {
			const hasResolvingSelectors =
				select( 'core' ).hasResolvingSelectors();
			return ! loaded && ! hasResolvingSelectors;
		},
		[ loaded ]
	);

	/*
	 * If the maximum expected loading time has passed, we're marking the
	 * editor as loaded, in order to prevent any failed requests from blocking
	 * the editor canvas from appearing.
	 */
	useEffect( () => {
		let timeout;

		if ( ! loaded ) {
			timeout = setTimeout( () => {
				setLoaded( true );
			}, MAX_LOADING_TIME );
		}

		return () => {
			clearTimeout( timeout );
		};
	}, [ loaded ]);

	useEffect( () => {
		if ( inLoadingPause ) {

			/*
			 * We're using an arbitrary 1s timeout here to catch brief moments
			 * without any resolving selectors that would result in displaying
			 * brief flickers of loading state and loaded state.
			 *
			 * It's worth experimenting with different values, since this also
			 * adds 1s of artificial delay after loading has finished.
			 */
			const timeout = setTimeout( () => {
				setLoaded( true );
			}, 1000 );

			return () => {
				clearTimeout( timeout );
			};
		}
	}, [ inLoadingPause ]);

	return ! loaded || ! hasLoadedPost;
};
