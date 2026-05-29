/**
 * WordPress dependencies
 */
import classnames from 'classnames';

const VARIANT_CLASS = {
	tabs: 'wp-block-themeisle-blocks-tabs-inspector-tab-option__drag',
	posts: 'o-sortable-handle'
};

const SortableDragHandle = ({
	listeners,
	attributes,
	variant = 'tabs',
	className
}) => {
	return (
		<div
			className={ classnames( VARIANT_CLASS[ variant ] ?? VARIANT_CLASS.tabs, className ) }
			tabIndex={ 0 }
			{ ...listeners }
			{ ...attributes }
		>
			<span></span>
		</div>
	);
};

export default SortableDragHandle;
