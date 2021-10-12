/**
 * External dependencies
 */
import scrollIntoView from 'dom-scroll-into-view';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import {
	Placeholder,
	Dashicon,
	TextControl,
	Spinner
} from '@wordpress/components';

import {
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import {
	DOWN,
	ENTER,
	TAB,
	UP
} from '@wordpress/keycodes';

const BlockPlaceholder = ({
	setAttributes,
	hasError,
	setError,
	className
}) => {
	const searchRef = useRef( null );
	let scrollingIntoView = false;
	let suggestionNodes = [];

	const [ isLoading, setLoading ] = useState( false );
	const [ query, setQuery ] = useState( '' );
	const [ results, setResults ] = useState({});
	const [ selectedSuggestion, setSelectedSuggestion ] = useState( null );

	useEffect( () => {
		if ( null !== selectedSuggestion && ! scrollingIntoView ) {
			scrollingIntoView = true;

			scrollIntoView( suggestionNodes[ selectedSuggestion ], searchRef.current, {
				onlyScrollIfNeeded: true
			});

			suggestionNodes[ selectedSuggestion ].focus();

			setTimeout( () => {
				scrollingIntoView = false;
			}, 100 );
		}
	}, [ selectedSuggestion ]);

	const bindSuggestionNode = index => {
		return ( ref ) => {
			suggestionNodes[ index ] = ref;
		};
	};

	const searchPlugins = async query => {
		setAttributes({ slug: '' });
		setLoading( true );
		setError( false );
		let data = await apiFetch({ path: `themeisle-gutenberg-blocks/v1/get_plugins?search=${ encodeURIComponent( query ) }` });
		if ( data.data.errors ) {
			setError( true );
			setLoading( false );
			setSelectedSuggestion( null );
			setResults({});
			return;
		}
		setLoading( false );
		setSelectedSuggestion( null );
		setResults( data.data.plugins );
	};

	const moveUp = event => {
		if ( Object.keys( results ).length ) {
			event.stopPropagation();
			event.preventDefault();
			const previousIndex = ! selectedSuggestion ? Object.keys( results ).length - 1 : selectedSuggestion - 1;
			setSelectedSuggestion( previousIndex );
		}
	};

	const moveDown = event => {
		if ( Object.keys( results ).length ) {
			event.stopPropagation();
			event.preventDefault();
			const nextIndex = null === selectedSuggestion || ( selectedSuggestion === Object.keys( results ).length - 1 ) ? 0 : selectedSuggestion + 1;
			setSelectedSuggestion( nextIndex );
		}
	};

	const searchKeyDown = event => {
		switch ( event.keyCode ) {
		case UP: {
			moveUp( event );
			break;
		}
		case DOWN: {
			moveDown( event );
			break;
		}
		case TAB: {
			if ( Object.keys( results ).length && ! event.shiftKey ) {
				setSelectedSuggestion( 0 );
			}
			break;
		}
		case ENTER: {
			searchPlugins( event.target.value );
			break;
		}
		}
	};

	const listKeyDown = ( event, data ) => {
		switch ( event.keyCode ) {
		case UP: {
			moveUp( event );
			break;
		}
		case DOWN: {
			moveDown( event );
			break;
		}
		case TAB: {
			if ( event.shiftKey ) {
				if ( 0 !== selectedSuggestion ) {
					moveUp( event );
				}

				break;
			}

			if ( selectedSuggestion === Object.keys( results ).length - 1 ) {
				break;
			}

			moveDown( event );
			break;
		}
		case ENTER: {
			selectPlugin( data );
			break;
		}
		}
	};

	const selectPlugin = data => {
		setAttributes({ slug: data.slug });
		setResults({});
	};

	return (
		<Placeholder
			icon="admin-plugins"
			label={ __( 'Plugin Card', 'otter-blocks' ) }
			instructions={ __( 'Search for the plugin you want to display.', 'otter-blocks' ) }
			className={ className }
		>
			<div className="wp-block-themeisle-blocks-plugin-cards-search-field">
				<Dashicon icon="search"/>

				{ isLoading && (
					<Spinner/>
				) }

				<TextControl
					type="text"
					placeholder={ __( 'Search for plugin…', 'otter-blocks' ) }
					value={ query }
					onChange={ setQuery }
					onKeyDown={ searchKeyDown }
					onFocus={ () => setSelectedSuggestion( null ) }
				/>

				{ results && (
					<div
						tabIndex="-1"
						className="wp-block-themeisle-blocks-plugin-cards-search-results"
						ref={ searchRef }
					>
						{ Object.keys( results ).map( i => {
							const pluginData = results[i];
							let icon;
							if ( pluginData.icons.svg ) {
								icon = pluginData.icons.svg;
							} if ( pluginData.icons['2x']) {
								icon = pluginData.icons['2x'];
							} if ( pluginData.icons['1x']) {
								icon = pluginData.icons['1x'];
							} if ( pluginData.icons.default ) {
								icon = pluginData.icons.default;
							}
							return (
								<button
									className="wp-block-themeisle-blocks-plugin-cards-list-item"
									key={ i }
									ref={ bindSuggestionNode( i ) }
									onClick={ e => {
										e.preventDefault();
										selectPlugin( pluginData );
									} }
									onKeyDown={ e => listKeyDown( e, pluginData ) }
								>
									<img src={ icon } />
									<span dangerouslySetInnerHTML={ { __html: _.unescape( pluginData.name ) } }></span>
								</button>
							);
						}) }
					</div>
				) }
			</div>

			{ hasError && (
				<div className="wp-block-themeisle-blocks-plugin-cards-error">
					<span>{ __( 'There seems to be an error. Make sure your internet is working properly.', 'otter-blocks' ) }</span>
				</div>
			) }
		</Placeholder>
	);
};

export default BlockPlaceholder;
