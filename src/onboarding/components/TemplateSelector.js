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

import {
	useRef,
	useMemo
} from '@wordpress/element';

const TemplateSelector = ({
	template,
	label,
	isSelected,
	isParsed = false,
	onClick
}) => {
	const ref = useRef();

	const parsedTemplate = useMemo( () => {
		return isParsed ? template : ( template?.content?.raw ? parse( template?.content?.raw ) : []);
	}, [ template, isParsed ]);

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
