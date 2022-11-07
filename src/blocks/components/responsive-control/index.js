/**
 * External dependencies
 */
import classnames from 'classnames';

import {
	desktop,
	mobile,
	tablet
} from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ButtonGroup
} from '@wordpress/components';

import {
	useInstanceId,
	useViewportMatch
} from '@wordpress/compose';

import {
	useSelect,
	useDispatch
} from '@wordpress/data';

/**
 * Internal dependencies
 */
import './editor.scss';

const ResponsiveControl = ({
	label,
	className,
	children
}) => {
	const instanceId = useInstanceId( ResponsiveControl );

	const isLarger = useViewportMatch( 'large', '>=' );

	const isLarge = useViewportMatch( 'large', '<=' );

	const isSmall = useViewportMatch( 'small', '>=' );

	const isSmaller = useViewportMatch( 'small', '<=' );

	const isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	const getView = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType && ! isMobile ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	const { updateView } = useDispatch( 'themeisle-gutenberg/data' );
	const { __experimentalSetPreviewDeviceType } = useDispatch( 'core/edit-post' ) ? useDispatch( 'core/edit-post' ) : false;

	const setView = __experimentalSetPreviewDeviceType && ! isMobile ? __experimentalSetPreviewDeviceType : updateView;

	const id = `inspector-responsive-control-${ instanceId }`;

	return (
		<div
			id={ id }
			className={ classnames(
				'o-responsive-control',
				className
			) }
		>
			<div className="components-base-control__field">
				<div className="components-base-control__title">
					<label className="components-base-control__label">{ label }</label>
					<div className="o-responsive-buttons">
						<ButtonGroup>
							<Button
								icon={ desktop }
								label={ __( 'Desktop' ) }
								onClick={ () => setView( 'Desktop' ) }
								className={ classnames({
									'is-selected': 'Desktop' === getView
								}) }
							/>
							<Button
								icon={ tablet }
								label={ __( 'Tablet' ) }
								onClick={ () => setView( 'Tablet' ) }
								className={ classnames({
									'is-selected': 'Tablet' === getView
								}) }
							/>
							<Button
								icon={ mobile }
								label={ __( 'Mobile' ) }
								onClick={ () => setView( 'Mobile' ) }
								className={ classnames({
									'is-selected': 'Mobile' === getView
								}) }
							/>
						</ButtonGroup>
					</div>
				</div>
				{ children }
			</div>
		</div>
	);
};

export default ResponsiveControl;
