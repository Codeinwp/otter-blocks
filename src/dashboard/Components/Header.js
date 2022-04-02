/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

const NAVIGATION_ITEMS = [
	{
		slug: 'dashboard',
		label: __( 'Dashboard', 'otter-blocks' )
	},
	{
		slug: 'integrations',
		label: __( 'Integrations', 'otter-blocks' )
	},
	{
		slug: 'upsells',
		label: __( 'Free vs PRO', 'otter-blocks' )
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
						title={ __( 'Gutenberg Blocks and Template Library by Otter', 'otter-blocks' ) }
					/>

					<abbr
						title={ `Version: ${ window.otterObj.version }` }
						className="version"
					>
						{ window.otterObj.version }
					</abbr>
				</div>

				<nav className="otter-navigation">
					{ NAVIGATION_ITEMS.map( item => (
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
