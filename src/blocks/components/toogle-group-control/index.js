import './editor.scss';
import {
	useState
} from '@wordpress/element';
import classNames from 'classnames';


const ToogleGroupControl = props => {

	const {
		value,
		options,
		onChange
	} = props;

	return (
		<div className='o-toggle-group-control'>
			{
				options?.map( option => {
					return (
						<div
							className={ classNames( 'o-toggle-option', { 'selected': value == option?.value }) }
						>
							<button
								onClick={ () => onChange( option?.value )}
							>
								{  option?.icon }
							</button>
							<p>{ option?.label || '' }</p>
						</div>
					);
				})
			}
		</div>
	);
};

export default ToogleGroupControl;
