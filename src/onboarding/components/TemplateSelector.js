/**
 * External dependencies.
 */
import classnames from 'classnames';

import { check } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { parse } from '@wordpress/blocks';

import { BlockPreview } from '@wordpress/block-editor';

import { Icon } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	useRef,
	useMemo
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { resolvePatternBlocks } from '../utils';

const TemplateSelector = ({
	template,
	label,
	isSelected,
	isParsed = false,
	onClick
}) => {
	const ref = useRef();

	const patterns = useSelect( select => {
		const core = select( 'core' );
		return ( 'function' === typeof core?.getBlockPatterns ) ? ( core.getBlockPatterns() ?? []) : [];
	}, []);

	const parsedTemplate = useMemo( () => {
		const blocks = isParsed ? template : ( template?.content?.raw ? parse( template?.content?.raw ) : []);
		return resolvePatternBlocks( blocks, patterns );
	}, [ template, isParsed, patterns ]);

	return (
		<div
			className="o-templates__item"
			onClick={ onClick }
			ref={ ref }
		>
			<div
				className={ classnames( 'o-templates__item__container', {
					'is-selected': isSelected
				}) }
			>
				<BlockPreview
					blocks={ parsedTemplate }
					minHeight={ ref?.current?.offsetHeight }
				/>

				{ isSelected && (
					<div className="o-templates__item__overlay">
						<Icon
							icon={ check }
							size={ 36 }
						/>
					</div>
				) }
			</div>

			<div className="o-templates__item__title">
				{ label }
			</div>
		</div>
	);
};

export default TemplateSelector;
