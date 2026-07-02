/**
 * WordPress dependencies
 */
import classnames from 'classnames';

const VARIANT_CLASS = {
	tabs: 'wp-block-themeisle-blocks-tabs-inspector-tab-option__drag',
	posts: 'o-sortable-handle',
	dashboard: 'otter-ai-toolbar-action__drag'
};

const GripIcon = () => (
	<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
		<circle cx="2.5" cy="3" r="1.3" />
		<circle cx="7.5" cy="3" r="1.3" />
		<circle cx="2.5" cy="8" r="1.3" />
		<circle cx="7.5" cy="8" r="1.3" />
		<circle cx="2.5" cy="13" r="1.3" />
		<circle cx="7.5" cy="13" r="1.3" />
	</svg>
);

const SortableDragHandle = ({
	listeners,
	attributes,
	variant = 'tabs',
	className,
	title
}) => {
	return (
		<div
			className={ classnames( VARIANT_CLASS[ variant ] ?? VARIANT_CLASS.tabs, className ) }
			title={ title }
			tabIndex={ 0 }
			{ ...listeners }
			{ ...attributes }
		>
			{ 'dashboard' === variant ? <GripIcon /> : <span></span> }
		</div>
	);
};

export default SortableDragHandle;
