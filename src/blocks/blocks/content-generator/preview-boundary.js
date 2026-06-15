/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { Component } from '@wordpress/element';

import { Notice } from '@wordpress/components';

/**
 * Error boundary for the generated block preview.
 *
 * The generation pipeline can emit arbitrary block trees, and a single
 * unrenderable block must not take down the whole editor. This catches render
 * errors from the previewed inner blocks and surfaces them instead.
 */
class PreviewBoundary extends Component {
	constructor( props ) {
		super( props );
		this.state = { error: null };
	}

	static getDerivedStateFromError( error ) {
		return { error };
	}

	componentDidCatch( error, info ) {
		// Logged so the failing block can be identified during development.
		// eslint-disable-next-line no-console
		console.error( 'AI Block preview failed to render:', error, info?.componentStack );
	}

	render() {
		if ( this.state.error ) {
			return (
				<Notice status="error" isDismissible={ false }>
					{ __( 'The generated content could not be previewed. Try regenerating with a simpler prompt.', 'otter-blocks' ) }
				</Notice>
			);
		}

		return this.props.children;
	}
}

export default PreviewBoundary;
