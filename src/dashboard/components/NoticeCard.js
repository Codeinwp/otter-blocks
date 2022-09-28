/**
 * WordPress dependencies.
 */
import { Button, PanelBody } from '@wordpress/components';
import { Icon, closeSmall } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import classnames from 'classnames';

const NoticeCard = ({
	slug,
	className,
	children
}) => {
	const storageKey = `otter-${slug}-dismissed`;
	const [ dismissed, setDismissed ] = useState( localStorage.getItem( storageKey ) );

	const dismissNotice = () => {
		localStorage.setItem( storageKey, 'true' );
		setDismissed( 'true' );
	};

	if ( dismissed ) {
		return null;
	}

	return (
		<PanelBody className={ classnames( 'notice-card', className ) }>
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
