/**
 * WordPress dependencies.
 */
import { Button, PanelBody } from '@wordpress/components';
import { Icon, closeSmall } from '@wordpress/icons';

const NoticeCard = ({
	children
}) => {
	const dismissNotice = () => {

		// todo
	};

	return (
		<PanelBody className="notice-card">
			<Button
				className="dismiss"
				onClick={ dismissNotice }
			>
				<Icon icon={ closeSmall } />
			</Button>
			{ children }
		</PanelBody>
	);
};

export default NoticeCard;
