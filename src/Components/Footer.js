/**
 * WordPress dependencies.
 */
const { __ } = wp.i18n;

const Footer = () => {
	return (
		<footer className="otter-footer">
			<div className="otter-container">
				{ __( 'No otters were harmed during the making of this plugin.','otter-blocks' ) }
			</div>
		</footer>
	);
};

export default Footer;
