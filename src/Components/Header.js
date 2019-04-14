/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
const { __ } = wp.i18n;

const { Component } = wp.element;

class Headers extends Component {
	constructor() {
		super( ...arguments );
	}

	render() {
		return (
			<header className="otter-header">
				<div
					className={ classnames(
						'otter-container',
						'otter-step-one'
					) }
				>
					<div className="otter-logo">
						<img
							src={ otterObj.assetsPath + 'images/logo.png' }
							title={ __( 'Gutenberg Blocks and Template Library by Otter' ) }
						/>

						<abbr
							title={ `Version: ${ otterObj.version }` }
							className="version"
						>
							{ otterObj.version }
						</abbr>
					</div>
				</div>
			</header>
		);
	}
}

export default Headers;
