import { addFilter } from '@wordpress/hooks';
import { TextControl, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';

addFilter(
	'blocks.registerBlockType',
	'atomic-wind/state-attributes',
	( settings ) => {
		if ( settings.category !== 'atomic-wind' ) {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				showIf: {
					type: 'string',
					default: '',
				},
				hideIf: {
					type: 'string',
					default: '',
				},
				stateTrigger: {
					type: 'string',
					default: '',
				},
				stateAction: {
					type: 'string',
					default: 'toggle',
				},
				stateValue: {
					type: 'string',
					default: '',
				},
				stateDefault: {
					type: 'boolean',
					default: false,
				},
			},
		};
	}
);

function SuggestionChips( { triggers, onSelect } ) {
	if ( ! triggers.size ) {
		return null;
	}

	return (
		<div style={ { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' } }>
			{ [ ...triggers.entries() ].map( ( [ name, info ] ) => {
				const chips = [];
				if ( info.action === 'set' && info.values.size ) {
					for ( const val of info.values ) {
						chips.push(
							<button
								key={ `${ name }:${ val }` }
								type="button"
								onClick={ () => onSelect( `${ name }:${ val }` ) }
								style={ {
									background: '#f0f0f0',
									border: '1px solid #ddd',
									borderRadius: '2px',
									padding: '0 6px',
									fontSize: '11px',
									cursor: 'pointer',
									lineHeight: '1.8',
								} }
							>
								{ name }:{ val }
							</button>
						);
					}
				} else {
					chips.push(
						<button
							key={ name }
							type="button"
							onClick={ () => onSelect( name ) }
							style={ {
								background: '#f0f0f0',
								border: '1px solid #ddd',
								borderRadius: '2px',
								padding: '0 6px',
								fontSize: '11px',
								cursor: 'pointer',
								lineHeight: '1.8',
							} }
						>
							{ name }
						</button>
					);
				}
				return chips;
			} ) }
		</div>
	);
}

export function StateControls( { attributes, setAttributes } ) {
	const { showIf, hideIf, stateTrigger, stateAction, stateValue, stateDefault } = attributes;

	const allBlocks = useSelect( ( select ) => select( 'core/block-editor' ).getBlocks(), [] );

	const triggers = useMemo( () => {
		const map = new Map();

		function walk( list ) {
			for ( const block of list ) {
				const attrs = block.attributes || {};
				if ( attrs.stateTrigger ) {
					if ( ! map.has( attrs.stateTrigger ) ) {
						map.set( attrs.stateTrigger, { action: attrs.stateAction || 'toggle', values: new Set(), hasDefault: false } );
					}
					const entry = map.get( attrs.stateTrigger );
					if ( attrs.stateAction === 'set' && attrs.stateValue ) {
						entry.values.add( attrs.stateValue );
					}
					if ( attrs.stateDefault ) {
						entry.hasDefault = true;
					}
				}
				if ( block.innerBlocks?.length ) {
					walk( block.innerBlocks );
				}
			}
		}

		walk( allBlocks );
		return map;
	}, [ allBlocks ] );

	return (
		<div className="aw-ce-tab-content">
			<TextControl
				label={ __( 'Show If', 'atomic-wind' ) }
				value={ showIf || '' }
				onChange={ ( value ) =>
					setAttributes( { showIf: value } )
				}
			/>
			<SuggestionChips
				triggers={ triggers }
				onSelect={ ( value ) => setAttributes( { showIf: value } ) }
			/>
			<p className="components-base-control__help">
				{ __( 'Show this block when a state is active. Use a name (e.g. tabs) for boolean triggers, or name:value (e.g. tabs:pricing) for set-value triggers.', 'atomic-wind' ) }
			</p>
			<div style={ { marginTop: '16px' } }>
				<TextControl
					label={ __( 'Hide If', 'atomic-wind' ) }
					value={ hideIf || '' }
					onChange={ ( value ) =>
						setAttributes( { hideIf: value } )
					}
				/>
				<SuggestionChips
					triggers={ triggers }
					onSelect={ ( value ) => setAttributes( { hideIf: value } ) }
				/>
				<p className="components-base-control__help">
					{ __( 'Hide this block when a state is active. Same syntax as Show If.', 'atomic-wind' ) }
				</p>
			</div>
			<TextControl
				label={ __( 'State Trigger', 'atomic-wind' ) }
				value={ stateTrigger || '' }
				onChange={ ( value ) =>
					setAttributes( { stateTrigger: value } )
				}
				help={ __( 'Give this block a state name so clicking it changes state. Other blocks can react via Show If / Hide If.', 'atomic-wind' ) }
			/>
			{ stateTrigger && (
				<>
					<SelectControl
						label={ __( 'Action', 'atomic-wind' ) }
						value={ stateAction || 'toggle' }
						options={ [
							{ label: __( 'Toggle', 'atomic-wind' ), value: 'toggle' },
							{ label: __( 'Set Value', 'atomic-wind' ), value: 'set' },
						] }
						onChange={ ( value ) =>
							setAttributes( { stateAction: value } )
						}
						help={ __( 'Toggle flips a boolean on/off. Set Value assigns a specific value — useful for tab-style interfaces where only one option is active.', 'atomic-wind' ) }
					/>
					{ stateAction === 'set' && (
						<TextControl
							label={ __( 'Value', 'atomic-wind' ) }
							value={ stateValue || '' }
							onChange={ ( value ) =>
								setAttributes( { stateValue: value } )
							}
							help={ __( 'The value to assign when this trigger is clicked.', 'atomic-wind' ) }
						/>
					) }
					<ToggleControl
						label={ __( 'Active by Default', 'atomic-wind' ) }
						checked={ !! stateDefault }
						onChange={ ( value ) =>
							setAttributes( { stateDefault: value } )
						}
						help={ __( 'Turn on to make this trigger\'s state active on page load.', 'atomic-wind' ) }
					/>
				</>
			) }
		</div>
	);
}

addFilter(
	'blocks.getSaveContent.extraProps',
	'atomic-wind/state-save-props',
	( extraProps, blockType, attributes ) => {
		if ( blockType.category !== 'atomic-wind' ) {
			return extraProps;
		}

		if ( attributes.showIf ) {
			extraProps[ 'data-show-if' ] = attributes.showIf;
		}

		if ( attributes.hideIf ) {
			extraProps[ 'data-hide-if' ] = attributes.hideIf;
		}

		if ( attributes.stateTrigger ) {
			extraProps[ 'data-state-trigger' ] = attributes.stateTrigger;
			extraProps[ 'data-state-action' ] = attributes.stateAction;

			if ( attributes.stateAction === 'set' && attributes.stateValue ) {
				extraProps[ 'data-state-value' ] = attributes.stateValue;
			}

			if ( attributes.stateDefault ) {
				extraProps[ 'data-state-default' ] = '';
			}
		}

		return extraProps;
	}
);
