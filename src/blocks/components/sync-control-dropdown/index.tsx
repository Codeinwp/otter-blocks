/**
 * External dependencies
 */
import {
	check,
	moreVertical
} from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	DropdownMenu,
	MenuGroup,
	MenuItem
} from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

/**
  * Internal dependencies.
  */
import './editor.scss';

const noop = () => {};

type SyncControlDropdownProps = {
	isSynced?: string[]
	options: {label: string, value: any, isHidden?: boolean}[]
	setAttributes: ( attrs: any ) => void
}

/**
 * A dropdown that let you select which of the given attrs to sync with global defaults.
 * @param props The props.
 * @returns
 */
const SyncControlDropdown = ({
	isSynced = [],
	options,
	setAttributes
} : SyncControlDropdownProps ) => {
	const { enableComplementaryArea } = useDispatch( 'core/interface' );

	if ( 0 === options.length ) {
		return null;
	}

	const toggleItem = ( field: string ) => {
		let fields: string[] | undefined = [ ...( isSynced || []) ];
		const isActive = isSynced?.includes( field );

		if ( isActive ) {
			const index = fields.indexOf( field );
			if ( -1 !== index ) {
				fields.splice( index, 1 );
			}
		} else {
			fields.push( field );
		}

		if ( 0 === fields.length ) {
			fields = undefined;
		}

		setAttributes({
			isSynced: fields
		});
	};

	const applyAll = () => {
		let fields = [ ...( isSynced || []) ];

		options.forEach( option => {
			if ( ! isSynced?.includes( option.value ) ) {
				fields.push( option.value );
			}
		});

		setAttributes({
			isSynced: fields
		});
	};

	const resetAll = () => {
		let fields: string[] | undefined = [ ...( isSynced || []) ];

		options.forEach( option => {
			if ( isSynced?.includes( option.value ) ) {
				const index = fields?.indexOf( option.value );
				if ( index !== undefined && -1 !== index ) {
					fields?.splice( index, 1 );
				}
			}
		});

		if ( 0 === fields.length ) {
			fields = undefined;
		}

		setAttributes({
			isSynced: fields
		});
	};

	return (
		<HStack className="o-sync-manage-control">
			<Heading>{ __( 'Sync with Global Defaults', 'otter-blocks' ) }</Heading>

			<DropdownMenu
				icon={ moreVertical }
				label={ __( 'View options', 'otter-blocks' ) }
				toggleProps={ { isSmall: true } }
			>
				{ ({ onClose = noop }) => (
					<Fragment>
						<MenuGroup>
							{ options.filter( option => ! option?.isHidden ).map( option => {
								const isSelected = isSynced.includes( option.value );

								return (
									<MenuItem
										key={ option.value }

										/**@ts-ignore */
										icon={ isSelected && check }
										isSelected={ isSelected }
										label={ option.label }
										onClick={ () => toggleItem( option.value ) }
										role="menuitemcheckbox"
									>
										{ option.label }
									</MenuItem>
								);
							}) }
						</MenuGroup>

						<MenuGroup>
							<MenuItem
								onClick={ () => enableComplementaryArea( 'core/edit-post', 'themeisle-blocks/otter-options' ) }
							>
								{ __( 'Manage Global Defaults', 'otter-blocks' ) }
							</MenuItem>

							<MenuItem
								variant={ 'tertiary' }
								onClick={ () => {
									applyAll();
									onClose();
								} }
							>
								{ __( 'Apply all', 'otter-blocks' ) }
							</MenuItem>

							<MenuItem
								variant={ 'tertiary' }
								onClick={ () => {
									resetAll();
									onClose();
								} }
							>
								{ __( 'Reset all', 'otter-blocks' ) }
							</MenuItem>
						</MenuGroup>
					</Fragment>
				) }
			</DropdownMenu>
		</HStack>
	);
};

export default SyncControlDropdown;
