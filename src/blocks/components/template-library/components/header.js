/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	startCase,
	toLower
} from 'lodash';

import { __ } from '@wordpress/i18n';

import {
	Button,
	Dashicon,
	Icon,
	TextControl,
	Tooltip,
	SelectControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { otterIcon } from '../../../helpers/icons.js';

const Header = ({
	preview,
	tab,
	blocksCategories,
	templateCategories,
	selectedCategory,
	selectedTemplate,
	search,
	setPreview,
	changeTab,
	close,
	importTemplate,
	selectCategory,
	changeSearch
}) => {
	const getOptions = () => {
		let categories = {};

		categories = ( 'block' === tab ? blocksCategories : templateCategories ).map( i => {
			return i = {
				label: startCase( toLower( i ) ),
				value: i
			};
		});

		const options = [
			{ label: __( 'All Categories', 'otter-blocks' ), value: 'all' },
			...categories
		];

		return options;
	};

	const options = getOptions();

	return (
		<div className="library-modal-control-panel">
			<div className="library-modal-header">
				<div className="library-modal-header-logo">
					{ preview ? (
						<Button
							className="library-modal-header-tabs-button back-to-library"
							aria-label={ __( 'Back to Library', 'otter-blocks' ) }
							onClick={ () => setPreview( false ) }
						>
							<Dashicon icon="arrow-left-alt" /> { __( 'Back to Library', 'otter-blocks' ) }
						</Button>
					) :
						<div className="library-modal-header-tabs-button">
							<Icon icon={ otterIcon } />
						</div>
					}
				</div>

				{ ! preview && (
					<div className="library-modal-header-tabs">
						<Button
							className={ classnames(
								'library-modal-header-tabs-button',
								{ 'is-selected': 'block' === tab }
							) }
							onClick={ () => changeTab( 'block' ) }
						>
							<Dashicon icon="screenoptions" />
							{ __( 'Blocks', 'otter-blocks' ) }
						</Button>

						<Button
							className={ classnames(
								'library-modal-header-tabs-button',
								{ 'is-selected': 'template' === tab }
							) }
							onClick={ () => changeTab( 'template' ) }
						>
							<Dashicon icon="editor-table" />
							{ __( 'Templates', 'otter-blocks' ) }
						</Button>
					</div>
				) }

				<div className="library-modal-header-actions">
					{ preview && (
						<Button
							className="library-modal-header-tabs-button insert-button"
							onClick={ () => importTemplate( selectedTemplate.template_url ) }
							tabindex="0"
						>
							<Dashicon icon="arrow-down-alt" size={ 16 } />
							{ __( 'Insert', 'otter-blocks' ) }
						</Button>
					) }

					<Tooltip text={ __( 'Close', 'otter-blocks' ) }>
						<Button
							className="library-modal-header-tabs-button"
							aria-label={ __( 'Close settings', 'otter-blocks' ) }
							onClick={ close }
						>
							<Dashicon icon="no-alt" />
						</Button>
					</Tooltip>
				</div>
			</div>

			{ ! preview && (
				<div className="library-modal-actions">
					<SelectControl
						className="library-modal-category-control"
						value={ 'all' === selectedCategory ? 'all' : selectedCategory }
						onChange={ selectCategory }
						options={ options }
					/>

					<TextControl
						type="text"
						value={ search || '' }
						placeholder={ __( 'Search', 'otter-blocks' ) }
						className="library-modal-search-control"
						onChange={ changeSearch }
					/>
				</div>
			) }
		</div>
	);
};

export default Header;
