import { addFilter } from '@wordpress/hooks';
import { TextControl, SelectControl, ToggleControl } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
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

/**
 * Extract the state name from a Show If / Hide If condition (strips any :value).
 *
 * @param {string} condition Raw condition string.
 * @return {string} The state name.
 */
function conditionName( condition ) {
	const idx = condition.indexOf( ':' );
	return idx === -1 ? condition : condition.substring( 0, idx );
}

/**
 * Whether a block carries any state configuration. Used to flag the State tab.
 *
 * @param {Object} attributes Block attributes.
 * @return {boolean} True when the block triggers or reacts to state.
 */
export function hasStateConfig( attributes = {} ) {
	return !! ( attributes.showIf || attributes.hideIf || attributes.stateTrigger );
}

function StateBadge( { tone, children } ) {
	const tones = {
		trigger: { bg: '#e0e7ff', fg: '#3730a3' },
		default: { bg: '#ede9fe', fg: '#5b21b6' },
		show: { bg: '#dcfce7', fg: '#166534' },
		hide: { bg: '#fef3c7', fg: '#92400e' },
		warn: { bg: '#fee2e2', fg: '#991b1b' },
		muted: { bg: '#f0f0f0', fg: '#555' },
	};
	const palette = tones[ tone ] || tones.muted;

	return (
		<span
			style={ {
				display: 'inline-flex',
				alignItems: 'center',
				gap: '4px',
				background: palette.bg,
				color: palette.fg,
				borderRadius: '3px',
				padding: '2px 8px',
				fontSize: '11px',
				fontWeight: 600,
				lineHeight: 1.6,
			} }
		>
			{ children }
		</span>
	);
}

function StateSummary( { attributes, triggers, reactors } ) {
	const { showIf, hideIf, stateTrigger, stateAction, stateValue, stateDefault } = attributes;

	const badges = [];

	if ( stateTrigger ) {
		const triggerLabel = stateAction === 'set'
			? sprintf(
				// translators: %1$s: state name, %2$s: value assigned.
				__( 'Sets %1$s = %2$s', 'otter-blocks' ),
				stateTrigger,
				stateValue || __( '(empty)', 'otter-blocks' )
			)
			: sprintf(
				// translators: %s: state name.
				__( 'Toggles %s', 'otter-blocks' ),
				stateTrigger
			);
		badges.push( { tone: 'trigger', text: triggerLabel } );

		if ( stateDefault ) {
			badges.push( { tone: 'default', text: __( 'Active on load', 'otter-blocks' ) } );
		}

		const reactorCount = reactors.get( stateTrigger ) || 0;
		badges.push( {
			tone: reactorCount ? 'muted' : 'warn',
			text: reactorCount
				? sprintf(
					// translators: %d: number of blocks that react to this state.
					_n( '%d block reacts', '%d blocks react', reactorCount, 'otter-blocks' ),
					reactorCount
				)
				: __( 'No blocks react yet', 'otter-blocks' ),
		} );
	}

	if ( showIf ) {
		const exists = triggers.has( conditionName( showIf ) );
		badges.push( {
			tone: exists ? 'show' : 'warn',
			text: exists
				? sprintf(
					// translators: %s: condition string.
					__( 'Visible when %s', 'otter-blocks' ),
					showIf
				)
				: sprintf(
					// translators: %s: condition string.
					__( 'Show If %s — no such trigger', 'otter-blocks' ),
					showIf
				),
		} );
	}

	if ( hideIf ) {
		const exists = triggers.has( conditionName( hideIf ) );
		badges.push( {
			tone: exists ? 'hide' : 'warn',
			text: exists
				? sprintf(
					// translators: %s: condition string.
					__( 'Hidden when %s', 'otter-blocks' ),
					hideIf
				)
				: sprintf(
					// translators: %s: condition string.
					__( 'Hide If %s — no such trigger', 'otter-blocks' ),
					hideIf
				),
		} );
	}

	return (
		<div
			style={ {
				marginBottom: '16px',
				padding: '10px',
				borderRadius: '4px',
				background: '#f8f9fa',
				border: '1px solid #e0e0e0',
			} }
		>
			{ badges.length ? (
				<div style={ { display: 'flex', flexWrap: 'wrap', gap: '6px' } }>
					{ badges.map( ( badge, i ) => (
						<StateBadge key={ i } tone={ badge.tone }>
							{ badge.text }
						</StateBadge>
					) ) }
				</div>
			) : (
				<p style={ { margin: 0, fontSize: '12px', color: '#777' } }>
					{ __( 'No state configured. Make this block a trigger, or gate its visibility with Show If / Hide If.', 'otter-blocks' ) }
				</p>
			) }
		</div>
	);
}

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

	const { triggers, reactors } = useMemo( () => {
		const map = new Map();
		const reactorMap = new Map();

		function bumpReactor( condition ) {
			const name = conditionName( condition );
			reactorMap.set( name, ( reactorMap.get( name ) || 0 ) + 1 );
		}

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
				if ( attrs.showIf ) {
					bumpReactor( attrs.showIf );
				}
				if ( attrs.hideIf ) {
					bumpReactor( attrs.hideIf );
				}
				if ( block.innerBlocks?.length ) {
					walk( block.innerBlocks );
				}
			}
		}

		walk( allBlocks );
		return { triggers: map, reactors: reactorMap };
	}, [ allBlocks ] );

	return (
		<div className="aw-ce-tab-content">
			<StateSummary
				attributes={ attributes }
				triggers={ triggers }
				reactors={ reactors }
			/>
			<TextControl
				label={ __( 'Show If', 'otter-blocks' ) }
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
				{ __( 'Show this block when a state is active. Use a name (e.g. tabs) for boolean triggers, or name:value (e.g. tabs:pricing) for set-value triggers.', 'otter-blocks' ) }
			</p>
			<div style={ { marginTop: '16px' } }>
				<TextControl
					label={ __( 'Hide If', 'otter-blocks' ) }
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
					{ __( 'Hide this block when a state is active. Same syntax as Show If.', 'otter-blocks' ) }
				</p>
			</div>
			<TextControl
				label={ __( 'State Trigger', 'otter-blocks' ) }
				value={ stateTrigger || '' }
				onChange={ ( value ) =>
					setAttributes( { stateTrigger: value } )
				}
				help={ __( 'Give this block a state name so clicking it changes state. Other blocks can react via Show If / Hide If.', 'otter-blocks' ) }
			/>
			{ stateTrigger && (
				<>
					<SelectControl
						label={ __( 'Action', 'otter-blocks' ) }
						value={ stateAction || 'toggle' }
						options={ [
							{ label: __( 'Toggle', 'otter-blocks' ), value: 'toggle' },
							{ label: __( 'Set Value', 'otter-blocks' ), value: 'set' },
						] }
						onChange={ ( value ) =>
							setAttributes( { stateAction: value } )
						}
						help={ __( 'Toggle flips a boolean on/off. Set Value assigns a specific value — useful for tab-style interfaces where only one option is active.', 'otter-blocks' ) }
					/>
					{ stateAction === 'set' && (
						<TextControl
							label={ __( 'Value', 'otter-blocks' ) }
							value={ stateValue || '' }
							onChange={ ( value ) =>
								setAttributes( { stateValue: value } )
							}
							help={ __( 'The value to assign when this trigger is clicked.', 'otter-blocks' ) }
						/>
					) }
					<ToggleControl
						label={ __( 'Active by Default', 'otter-blocks' ) }
						checked={ !! stateDefault }
						onChange={ ( value ) =>
							setAttributes( { stateDefault: value } )
						}
						help={ __( 'Turn on to make this trigger\'s state active on page load.', 'otter-blocks' ) }
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
