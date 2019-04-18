/**
 * WordPress dependencies.
 */
const { __ } = wp.i18n;

const { Component } = wp.element;

class Footer extends Component {
	constructor() {
		super( ...arguments );
	}

	render() {
		return (
			<footer className="otter-footer">
				<div className="otter-container">
					{ __( 'No otters were harmed during the making of this plugin.' ) }
				</div>
			</footer>
		);
	}
}

export default Footer;
