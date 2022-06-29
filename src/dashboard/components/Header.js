/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

const NAVIGATION_ITEMS = [
	{
		slug: 'dashboard',
		label: __( 'Dashboard', 'otter-blocks' ),
		visibility: true
	},
	{
		slug: 'integrations',
		label: __( 'Integrations', 'otter-blocks' ),
		visibility: true
	},
	{
		slug: 'upsell',
		label: __( 'Free vs PRO', 'otter-blocks' ),
		visibility: ! Boolean( window.otterObj.hasPro )
	}
];

const Headers = ({
	isActive,
	setActive
}) => {
	return (
		<header className="otter-header">
			<div className="otter-container">
				<div className="otter-logo">
					<img
						src={ window.otterObj.assetsPath + 'images/logo.png' }
						title={ __( 'Otter – Page Builder Blocks & Extensions for Gutenberg', 'otter-blocks' ) }
					/>

					<abbr
						title={ sprintf( __( 'Version: %s', 'otter-blocks' ), window.otterObj.version ) }
						className="version"
					>
						{ window.otterObj.version }
					</abbr>
				</div>

				<nav className="otter-navigation">
					{ NAVIGATION_ITEMS.map( item => item.visibility && (
						<button
							className={ classnames(
								{ 'is-active': item.slug === isActive }
							) }
							onClick={ () => setActive( item.slug ) }
							key={ item.slug }
						>
							<span>{ item.label }</span>
						</button>
					) ) }
				</nav>
			</div>
		</header>
	);
};

export default Headers;
