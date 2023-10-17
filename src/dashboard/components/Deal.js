/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

const Deal = ( props ) => {
	return (
		<div className="otter-deal">
			<a href={props.link}>
				<img src={ props.image } alt={ props.alt } />
				<div className="o-urgency">{props.urgencyText}</div>
			</a>
		</div>
	);
};

export default Deal;
