/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Dropdown,
	Icon
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

import { checkIcon } from '../../helpers/icons.js';

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
	});

	const { updateView } = useDispatch( 'themeisle-gutenberg/data' );
	const { __experimentalSetPreviewDeviceType } = useDispatch( 'core/edit-post' ) ? useDispatch( 'core/edit-post' ) : false;

	const setView = __experimentalSetPreviewDeviceType && ! isMobile ? __experimentalSetPreviewDeviceType : updateView;

	const id = `inspector-responsive-control-${ instanceId }`;

	return (
		<div
			id={ id }
			className={ classnames(
				'otter-responsive-control',
				className
			) }
		>
			<div className="components-base-control__field">
				<div className="components-base-control__title">
					<label className="components-base-control__label">{ label }</label>
					<div className="floating-controls">
						<Dropdown
							position="top left"
							renderToggle={ ({ isOpen, onToggle }) => (
								<Button
									icon={ 'Mobile' === getView ? 'smartphone' : getView.toLowerCase() }
									label={ __( 'Responsiveness Settings', 'otter-blocks' ) }
									showTooltip={ true }
									className="is-button"
									onClick={ onToggle }
									aria-expanded={ isOpen }
								/>
							) }
							renderContent={ () => (
								<div className="otter-responsive-control-settings">
									<div className="otter-responsive-control-settings-title">
										{ __( 'View', 'otter-blocks' ) }
									</div>

									<Button
										className={ classnames(
											'otter-responsive-control-settings-item',
											{ 'is-selected': 'Desktop' === getView }
										) }
										onClick={ () => setView( 'Desktop' ) }
									>
										{ 'Desktop' === getView && <Icon icon={ checkIcon } /> }
										<span className="popover-title">
											{ __( 'Desktop', 'otter-blocks' ) }
										</span>
									</Button>

									<Button
										className={ classnames(
											'otter-responsive-control-settings-item',
											{ 'is-selected': 'Tablet' === getView }
										) }
										onClick={ () => setView( 'Tablet' ) }
									>
										{ 'Tablet' === getView && <Icon icon={ checkIcon } /> }
										<span className="popover-title">
											{ __( 'Tablet', 'otter-blocks' ) }
										</span>
									</Button>

									<Button
										className={ classnames(
											'otter-responsive-control-settings-item',
											{ 'is-selected': 'Mobile' === getView }
										) }
										onClick={ () => setView( 'Mobile' ) }
									>
										{ 'Mobile' === getView && <Icon icon={ checkIcon } /> }
										<span className="popover-title">
											{ __( 'Mobile', 'otter-blocks' ) }
										</span>
									</Button>
								</div>
							) }
						/>
					</div>
				</div>
				{ children }
			</div>
		</div>
	);
};

export default ResponsiveControl;
