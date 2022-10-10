/**
 * Internal dependencies
 */
import { useInspectorSlot } from './inspector-slot-fill/index.js';
import Notice from './notice/index.js';
import { useOtterControlTools } from './otter-tools/index';
import SelectProducts from './select-products-control/index.js';

window.otterComponents = {};

window.otterComponents.SelectProducts = SelectProducts;
window.otterComponents.Notice = Notice;
window.otterComponents.useInspectorSlot = useInspectorSlot;
window.otterComponents.useOtterControlTools = useOtterControlTools;
