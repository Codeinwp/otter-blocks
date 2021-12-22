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
	Tooltip
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import ResponsiveControl from '../../../../components/responsive-control/index.js';
import { cols112, cols12, cols121, cols131, cols21, cols211, cols2Equal, cols2Grid, cols3Equal, cols3Grid, cols4Equal, cols5Equal, cols6Equal, colsCollapsed, colsFull, rowsCollapsed } from '../../../../helpers/icons';

const LayoutControl = ({
	label,
	onClick,
	layout,
	layoutTablet,
	layoutMobile,
	columns
}) => {
	const getView = useSelect( ( select ) => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' );
		return __experimentalGetPreviewDeviceType();
	}, []);

	let value;

	if ( 'Desktop' === getView ) {
		value = layout;
	} else if ( 'Tablet' === getView ) {
		value = layoutTablet;
	} else if ( 'Mobile' === getView ) {
		value = layoutMobile;
	}

	return (
		<ResponsiveControl
			label={ label }
			className="wp-block-themeisle-blocks-advanced-columns-layout-control"
		>
			{ 1 === columns && (
				<Tooltip text={ __( 'Single Row', 'otter-blocks' ) } >
					<Button
						className={ classnames(
							'wp-block-themeisle-blocks-advanced-column-layout',
							{ 'selected': 'equal' === value }
						) }
						onClick={ () => onClick( 'equal' ) }
					>
						{ colsFull() }
					</Button>
				</Tooltip>
			) || 2 === columns && (
				<Fragment>
					<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'equal' === value }
							) }
							onClick={ () => onClick( 'equal' ) }
						>
							{ cols2Equal() }
						</Button>
					</Tooltip>

					<Tooltip text={ __( '1:2', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'oneTwo' === value }
							) }
							onClick={ () => onClick( 'oneTwo' ) }
						>
							{ cols12() }
						</Button>
					</Tooltip>

					<Tooltip text={ __( '2:1', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'twoOne' === value }
							) }
							onClick={ () => onClick( 'twoOne' ) }
						>
							{ cols21() }
						</Button>
					</Tooltip>

					{ ( 'Mobile' == getView || 'Tablet' == getView ) && (
						<Tooltip text={ __( 'Collapsed Rows', 'otter-blocks' ) } >
							<Button
								className={ classnames(
									'wp-block-themeisle-blocks-advanced-column-layout',
									{ 'selected': 'collapsedRows' === value }
								) }
								onClick={ () => onClick( 'collapsedRows' ) }
							>
								{ rowsCollapsed() }
							</Button>
						</Tooltip>
					) }
				</Fragment>
			) || 3 === columns && (
				<Fragment>
					<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'equal' === value }
							) }
							onClick={ () => onClick( 'equal' ) }
						>
							{ cols3Equal() }
						</Button>
					</Tooltip>

					<Tooltip text={ __( '1:1:2', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'oneOneTwo' === value }
							) }
							onClick={ () => onClick( 'oneOneTwo' ) }
						>
							{ cols112() }
						</Button>
					</Tooltip>

					<Tooltip text={ __( '2:1:1', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'twoOneOne' === value }
							) }
							onClick={ () => onClick( 'twoOneOne' ) }
						>
							{ cols211() }
						</Button>
					</Tooltip>

					<Tooltip text={ __( '1:2:1', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'oneTwoOne' === value }
							) }
							onClick={ () => onClick( 'oneTwoOne' ) }
						>
							{ cols121() }
						</Button>
					</Tooltip>

					<Tooltip text={ __( '1:3:1', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'oneThreeOne' === value }
							) }
							onClick={ () => onClick( 'oneThreeOne' ) }
						>
							{ cols131() }
						</Button>
					</Tooltip>

					{ ( 'Mobile' == getView || 'Tablet' == getView ) && (
						<Tooltip text={ __( 'Collapsed Rows', 'otter-blocks' ) } >
							<Button
								className={ classnames(
									'wp-block-themeisle-blocks-advanced-column-layout',
									{ 'selected': 'collapsedRows' === value }
								) }
								onClick={ () => onClick( 'collapsedRows' ) }
							>
								{ rowsCollapsed() }
							</Button>
						</Tooltip>
					) }
				</Fragment>
			) || 4 === columns && (
				<Fragment>
					<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'equal' === value }
							) }
							onClick={ () => onClick( 'equal' ) }
						>
							{ cols4Equal() }
						</Button>
					</Tooltip>

					{ ( 'Mobile' == getView || 'Tablet' == getView ) && (
						<Fragment>
							<Tooltip text={ __( 'Two Column Grid', 'otter-blocks' ) } >
								<Button
									className={ classnames(
										'wp-block-themeisle-blocks-advanced-column-layout',
										{ 'selected': 'twoColumnGrid' === value }
									) }
									onClick={ () => onClick( 'twoColumnGrid' ) }
								>
									{ colsCollapsed() }
								</Button>
							</Tooltip>

							<Tooltip text={ __( 'Collapsed Rows', 'otter-blocks' ) } >
								<Button
									className={ classnames(
										'wp-block-themeisle-blocks-advanced-column-layout',
										{ 'selected': 'collapsedRows' === value }
									) }
									onClick={ () => onClick( 'collapsedRows' ) }
								>
									{ rowsCollapsed() }
								</Button>
							</Tooltip>
						</Fragment>
					) }
				</Fragment>
			) || 5 === columns && (
				<Fragment>
					<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'equal' === value }
							) }
							onClick={ () => onClick( 'equal' ) }
						>
							{ cols5Equal() }
						</Button>
					</Tooltip>

					{ ( 'Mobile' == getView || 'Tablet' == getView ) && (
						<Tooltip text={ __( 'Collapsed Rows', 'otter-blocks' ) } >
							<Button
								className={ classnames(
									'wp-block-themeisle-blocks-advanced-column-layout',
									{ 'selected': 'collapsedRows' === value }
								) }
								onClick={ () => onClick( 'collapsedRows' ) }
							>
								{ rowsCollapsed() }
							</Button>
						</Tooltip>
					) }
				</Fragment>
			) || 6 === columns && (
				<Fragment>
					<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
						<Button
							className={ classnames(
								'wp-block-themeisle-blocks-advanced-column-layout',
								{ 'selected': 'equal' === value }
							) }
							onClick={ () => onClick( 'equal' ) }
						>
							{ cols6Equal() }
						</Button>
					</Tooltip>

					{ ( 'Mobile' == getView || 'Tablet' == getView ) && (
						<Fragment>
							<Tooltip text={ __( 'Two Column Grid', 'otter-blocks' ) } >
								<Button
									className={ classnames(
										'wp-block-themeisle-blocks-advanced-column-layout',
										{ 'selected': 'twoColumnGrid' === value }
									) }
									onClick={ () => onClick( 'twoColumnGrid' ) }
								>
									{ cols2Grid() }
								</Button>
							</Tooltip>

							<Tooltip text={ __( 'Three Column Grid', 'otter-blocks' ) } >
								<Button
									className={ classnames(
										'wp-block-themeisle-blocks-advanced-column-layout',
										{ 'selected': 'threeColumnGrid' === value }
									) }
									onClick={ () => onClick( 'threeColumnGrid' ) }
								>
									{ cols3Grid() }
								</Button>
							</Tooltip>

							<Tooltip text={ __( 'Collapsed Rows', 'otter-blocks' ) } >
								<Button
									className={ classnames(
										'wp-block-themeisle-blocks-advanced-column-layout',
										{ 'selected': 'collapsedRows' === value }
									) }
									onClick={ () => onClick( 'collapsedRows' ) }
								>
									{ rowsCollapsed() }
								</Button>
							</Tooltip>
						</Fragment>
					) }
				</Fragment>
			) }
		</ResponsiveControl>
	);
};

export default LayoutControl;
