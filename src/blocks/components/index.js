/**
 * Internal dependencies
 */
import { useInspectorSlot } from './inspector-slot-fill';
import Notice from './notice/index.js';
import SelectProducts from './select-products-control/index.js';
import { CategoriesFieldToken } from '../plugins/conditions/edit.js';

window.otterComponents = {};

window.otterComponents.SelectProducts = SelectProducts;
window.otterComponents.Notice = Notice;
window.otterComponents.useInspectorSlot = useInspectorSlot;
window.otterComponents.CategoriesFieldToken = CategoriesFieldToken;

export { default as BackgroundOverlayControl } from './background-overlay-control/index.js';
export { default as BackgroundSelectorControl } from './background-selector-control/index.js';
export { default as BoxShadowControl } from './box-shadow-control/index.js';
export { default as ButtonDropdownControl } from './button-dropdown-control/index.js';
export { default as ButtonToggleControl } from './button-toggle-control/index.js';
export { default as ClearButton } from './clear-button/index.js';
export { default as ColorDropdownControl } from './color-dropdown-control/index';
export { default as ControlPanelControl } from './control-panel-control/index.js';
export { default as GoogleFontsControl } from './google-fonts-control/index.js';
export { default as HTMLAnchorControl } from './html-anchor-control/index.js';
export { default as IconPickerControl } from './icon-picker-control/index.js';
export { default as ImageGrid } from './image-grid/index.js';
export { default as InspectorHeader } from './inspector-header/index.js';
export {
	InspectorExtensions as InspectorExtensions,
	useInspectorSlot as useInspectorSlot
} from './inspector-slot-fill/index.js';
export { default as LinkControlToolbar } from './link-control/index.js';
export { default as Notice } from './notice/index.js';
export { default as PanelTab } from './panel-tab/index.js';
export { default as ResponsiveControl } from './responsive-control/index.js';
export { default as RichTextEditor } from './rich-text-editor/index.js';
export { default as SelectProducts } from './select-products-control/index.js';
export { default as SizingControl } from './sizing-control/index.js';
export {
	StyleSwitcherInspectorControl as StyleSwitcherInspectorControl,
	StyleSwitcherBlockControl as StyleSwitcherBlockControl
} from './style-switcher-control/index.js';
export { default as SyncColorPanel } from './sync-color-panel/';
export { default as SyncControlDropdown } from './sync-control-dropdown/index';
export { default as ToogleGroupControl } from './toogle-group-control/index.js';

export { default as PrmptPlaceholder } from './prompt';
