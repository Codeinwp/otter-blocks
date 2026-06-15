/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import {
	__,
	_n,
	sprintf
} from '@wordpress/i18n';

import {
	Button,
	Icon
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import {
	chevronDown,
	chevronUp,
	plus,
	trash
} from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import ConditionPicker from './condition-picker.js';

import {
	getConditionIcon,
	getConditionSummary
} from '../utils.js';

const noSettingsTypes = [ 'loggedInUser', 'loggedOutUser' ];

export const Separator = ({ label }) => (
	<div className="o-conditions__separator">
		<span className="o-conditions__separator-line" />
		<span className="o-conditions__separator-label">{ label }</span>
		<span className="o-conditions__separator-line" />
	</div>
);

const ConditionRow = ({
	condition,
	conditions,
	flatConditions,
	isOpen,
	onToggle,
	onRemove,
	onSelectType,
	children
}) => {
	const mainRef = useRef( null );
	const wasEmpty = useRef( ! condition.type );

	/**
	 * When a type is picked on an empty row the picker toggle unmounts,
	 * so move focus to the row header to keep the keyboard flow.
	 */
	useEffect( () => {
		if ( wasEmpty.current && condition.type ) {
			wasEmpty.current = false;
			mainRef.current?.focus();
		}
	}, [ condition.type ]);

	if ( ! condition.type ) {
		return (
			<div className="o-conditions__row">
				<ConditionPicker
					conditions={ conditions }
					onSelect={ onSelectType }
					renderToggle={ ({ isOpen: isPickerOpen, onToggle: onTogglePicker }) => (
						<div className="o-conditions__row-header">
							<button
								type="button"
								className="o-conditions__row-main"
								onClick={ onTogglePicker }
								aria-expanded={ isPickerOpen }
							>
								<span className="o-conditions__row-icon is-empty">
									<Icon icon={ plus } size={ 16 } />
								</span>

								<span className="o-conditions__row-text">
									<span className="o-conditions__row-title">{ __( 'Choose a condition', 'otter-blocks' ) }</span>
									<span className="o-conditions__row-value is-empty">{ __( 'Select a condition from the list', 'otter-blocks' ) }</span>
								</span>
							</button>

							<Button
								className="o-conditions__row-remove"
								icon={ trash }
								label={ __( 'Remove condition', 'otter-blocks' ) }
								showTooltip={ true }
								onClick={ onRemove }
							/>
						</div>
					) }
				/>
			</div>
		);
	}

	const definition = flatConditions.find( item => item.value === condition.type );
	const summary = getConditionSummary( condition );
	const hasSettings = ! noSettingsTypes.includes( condition.type );
	const isExpanded = isOpen && hasSettings;

	return (
		<div className={ classnames( 'o-conditions__row', { 'is-open': isExpanded }) }>
			<div className="o-conditions__row-header">
				<button
					ref={ mainRef }
					type="button"
					className={ classnames( 'o-conditions__row-main', { 'is-static': ! hasSettings }) }
					onClick={ hasSettings ? onToggle : undefined }
					aria-expanded={ hasSettings ? isExpanded : undefined }
				>
					<span className="o-conditions__row-icon">
						<Icon icon={ getConditionIcon( condition.type ) } size={ 16 } />
					</span>

					<span className="o-conditions__row-text">
						<span className="o-conditions__row-title">{ definition?.label ?? condition.type }</span>
						{ Boolean( summary ) && <span className="o-conditions__row-value">{ summary }</span> }
					</span>

					{ hasSettings && <Icon icon={ chevronDown } size={ 20 } className="o-conditions__row-chevron" /> }
				</button>

				<Button
					className="o-conditions__row-remove"
					icon={ trash }
					label={ __( 'Remove condition', 'otter-blocks' ) }
					showTooltip={ true }
					onClick={ onRemove }
				/>
			</div>

			{ isExpanded && <div className="o-conditions__row-editor">{ children }</div> }
		</div>
	);
};

const RuleGroup = ({
	group,
	index,
	conditions,
	flatConditions,
	onDelete,
	onAddCondition,
	onChangeCondition,
	onRemoveCondition,
	renderConditionControls
}) => {
	const [ isOpen, setOpen ] = useState( true );
	const [ openRows, setOpenRows ] = useState( () => new Set() );

	/**
	 * Conditions have no stable IDs, so keep a parallel list of generated row keys.
	 * Keys are spliced on removal so open state stays with the right row.
	 */
	const rowUid = useRef( 0 );
	const rowKeys = useRef([]);

	while ( rowKeys.current.length < group.length ) {
		rowKeys.current.push( ++rowUid.current );
	}
	if ( rowKeys.current.length > group.length ) {
		rowKeys.current = rowKeys.current.slice( 0, group.length );
	}

	const openRow = rowKey => setOpenRows( prev => new Set( prev ).add( rowKey ) );

	const toggleRow = rowKey => setOpenRows( prev => {
		const next = new Set( prev );

		if ( next.has( rowKey ) ) {
			next.delete( rowKey );
		} else {
			next.add( rowKey );
		}

		return next;
	});

	const removeRow = rowIndex => {
		const [ rowKey ] = rowKeys.current.splice( rowIndex, 1 );

		setOpenRows( prev => {
			const next = new Set( prev );
			next.delete( rowKey );
			return next;
		});

		onRemoveCondition( rowIndex );
	};

	const conditionLabels = group
		.filter( condition => condition.type )
		.map( condition => flatConditions.find( item => item.value === condition.type )?.label ?? condition.type );

	let summary;

	if ( ! group.length ) {
		summary = __( 'No conditions yet', 'otter-blocks' );
	} else if ( isOpen ) {

		/* translators: %d: the number of conditions inside the rule group */
		summary = sprintf( _n( '%d condition', '%d conditions', group.length, 'otter-blocks' ), group.length );
	} else {
		summary = conditionLabels.length ? conditionLabels.join( ' · ' ) : __( 'Unfinished condition', 'otter-blocks' );
	}

	return (
		<div className={ classnames( 'o-conditions__group', { 'is-open': isOpen }) }>
			<div className="o-conditions__group-header">
				<button
					type="button"
					className="o-conditions__group-main"
					onClick={ () => setOpen( ! isOpen ) }
					aria-expanded={ isOpen }
				>
					<span className="o-conditions__group-title">
						{
							/* translators: %d: the number of the rule group */
							sprintf( __( 'Rule Group %d', 'otter-blocks' ), index + 1 )
						}
					</span>
					<span className="o-conditions__group-summary">{ summary }</span>
				</button>

				<Button
					className="o-conditions__group-toggle"
					icon={ isOpen ? chevronUp : chevronDown }
					label={ isOpen ? __( 'Collapse rule group', 'otter-blocks' ) : __( 'Expand rule group', 'otter-blocks' ) }
					showTooltip={ true }
					aria-expanded={ isOpen }
					onClick={ () => setOpen( ! isOpen ) }
				/>

				<Button
					className="o-conditions__group-remove"
					icon={ trash }
					label={ __( 'Delete rule group', 'otter-blocks' ) }
					showTooltip={ true }
					onClick={ onDelete }
				/>
			</div>

			{ isOpen && (
				<div className="o-conditions__group-body">
					{ group.map( ( condition, condIdx ) => (
						<Fragment key={ rowKeys.current[ condIdx ] }>
							{ 0 < condIdx && <Separator label={ __( 'AND', 'otter-blocks' ) } /> }

							<ConditionRow
								condition={ condition }
								conditions={ conditions }
								flatConditions={ flatConditions }
								isOpen={ openRows.has( rowKeys.current[ condIdx ] ) }
								onToggle={ () => toggleRow( rowKeys.current[ condIdx ] ) }
								onRemove={ () => removeRow( condIdx ) }
								onSelectType={ value => {
									onChangeCondition( value, condIdx );
									openRow( rowKeys.current[ condIdx ] );
								} }
							>
								{ renderConditionControls( condition, condIdx ) }
							</ConditionRow>
						</Fragment>
					) ) }

					<ConditionPicker
						conditions={ conditions }
						onSelect={ value => {
							const rowKey = ++rowUid.current;
							rowKeys.current.push( rowKey );
							openRow( rowKey );
							onAddCondition( value );
						} }
						renderToggle={ ({ isOpen: isPickerOpen, onToggle: onTogglePicker }) => (
							<Button
								className="o-conditions__add-condition"
								onClick={ onTogglePicker }
								aria-expanded={ isPickerOpen }
							>
								<span className="o-conditions__row-icon is-add">
									<Icon icon={ plus } size={ 14 } />
								</span>
								{ __( 'Add condition', 'otter-blocks' ) }
							</Button>
						) }
					/>
				</div>
			) }
		</div>
	);
};

export default RuleGroup;
