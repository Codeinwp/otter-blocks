/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Dashicon,
	Icon,
	Path,
	Placeholder,
	Rect,
	SVG,
	Tooltip
} from '@wordpress/components';

import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';

import { columnsIcon } from '../../../../helpers/icons.js';
import Library from '../../../../components/template-library/index.js';

const Onboarding = ({
	clientId,
	setupColumns
}) => {
	const [ isLibraryOpen, setIsLibraryOpen ] = useState( false );

	return (
		<Placeholder
			label={ __( 'Select Layout', 'otter-blocks' ) }
			instructions={ __( 'Select a layout to start with, or make one yourself.', 'otter-blocks' ) }
			icon={ <Icon icon={ columnsIcon } /> }
			isColumnLayout={ true }
			className="wp-block-themeisle-onboarding-component"
		>
			<div className="wp-block-themeisle-layout-picker">
				<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
					<Button
						isLarge
						className="wp-block-themeisle-blocks-advanced-column-layout"
						onClick={ () => setupColumns( 2, 'equal' ) }
					>
						<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
							<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"></Path>
							<Rect x="22.9" y="13" width="2.2" height="22"/>
						</SVG>
					</Button>
				</Tooltip>

				<Tooltip text={ __( '1:2', 'otter-blocks' ) } >
					<Button
						isLarge
						className="wp-block-themeisle-blocks-advanced-column-layout"
						onClick={ () => setupColumns( 2, 'oneTwo' ) }
					>
						<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
							<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
							<Rect x="16.9" y="13" width="2.2" height="22"/>
						</SVG>
					</Button>
				</Tooltip>

				<Tooltip text={ __( '2:1', 'otter-blocks' ) } >
					<Button
						isLarge
						className="wp-block-themeisle-blocks-advanced-column-layout"
						onClick={ () => setupColumns( 2, 'twoOne' ) }
					>
						<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
							<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
							<Rect x="28.9" y="13" width="2.2" height="22"/>
						</SVG>
					</Button>
				</Tooltip>

				<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
					<Button
						isLarge
						className="wp-block-themeisle-blocks-advanced-column-layout"
						onClick={ () => setupColumns( 3, 'equal' ) }
					>
						<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
							<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
							<Rect x="28.9" y="13" width="2.2" height="22"/>
							<Rect x="16.9" y="13" width="2.2" height="22"/>
						</SVG>
					</Button>
				</Tooltip>

				<Tooltip text={ __( '1:1:2', 'otter-blocks' ) } >
					<Button
						isLarge
						className="wp-block-themeisle-blocks-advanced-column-layout"
						onClick={ () => setupColumns( 3, 'oneOneTwo' ) }
					>
						<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
							<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
							<Rect x="22.9" y="13" width="2.2" height="22"/>
							<Rect x="12.9" y="13" width="2.2" height="22"/>
						</SVG>
					</Button>
				</Tooltip>

				<Tooltip text={ __( '2:1:1', 'otter-blocks' ) } >
					<Button
						isLarge
						className="wp-block-themeisle-blocks-advanced-column-layout"
						onClick={ () => setupColumns( 3, 'twoOneOne' ) }
					>
						<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
							<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
							<Rect x="22.9" y="13" width="2.2" height="22"/>
							<Rect x="32.9" y="13" width="2.2" height="22"/>
						</SVG>
					</Button>
				</Tooltip>

				<Tooltip text={ __( 'Equal', 'otter-blocks' ) } >
					<Button
						isLarge
						className="wp-block-themeisle-blocks-advanced-column-layout"
						onClick={ () => setupColumns( 4, 'equal' ) }
					>
						<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
							<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
							<Rect x="13.9" y="13" width="2.2" height="22"/>
							<Rect x="32.9" y="13" width="2.2" height="22"/>
							<Rect x="22.9" y="13" width="2.2" height="22"/>
						</SVG>
					</Button>
				</Tooltip>
			</div>

			<Tooltip text={ __( 'Open Template Library', 'otter-blocks' ) } >
				<Button
					isPrimary
					isLarge
					className="wp-block-themeisle-template-library"
					onClick={ () => setIsLibraryOpen( true ) }
				>
					<Dashicon icon="category"/>
					{ __( 'Template Library', 'otter-blocks' ) }
				</Button>

				{ isLibraryOpen && (
					<Library
						clientId={ clientId }
						close={ () => setIsLibraryOpen( false ) }
					/>
				) }
			</Tooltip>

			<div className="wp-block-themeisle-layout-skipper">
				<Button
					isLink
					onClick={ () => setupColumns( 1, 'equal' ) }
				>
					{ __( 'Skip', 'otter-blocks' ) }
				</Button>
			</div>
		</Placeholder>
	);
};

export default Onboarding;
