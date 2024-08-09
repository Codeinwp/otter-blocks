/**
 * External dependencies.
 */
import classnames from 'classnames';

import { useInView } from 'react-intersection-observer';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { parse } from '@wordpress/blocks';

import { BlockPreview } from '@wordpress/block-editor';

import {
	Button,
	CheckboxControl
} from '@wordpress/components';

import {
	memo,
	useEffect,
	useMemo,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import {
	heartIcon,
	heartFilledIcon
} from '../../helpers/icons';

const Template = ({
	title,
	content,
	onInsert = () => {},
	isSelected = false,
	isFavorite = false,
	onPreview = () => {},
	onSelect = () => {},
	onFavorite = () => {}
}) => {
	const [ isVisible, setVisible ] = useState( false );

	const { ref, inView } = useInView({
		threshold: 0
	});

	useEffect( ()=>{
		if ( ! isVisible ) {
			setVisible( inView );
		}
	}, [ ! inView ]);

	const blocks = useMemo( () => {
		return parse( content );
	}, [ content ]);

	return (
		<div
			className="o-library__template"
			ref={ ref }
		>
			<div
				className="o-library__template__preview"
				onClick={ onPreview }
			>
				{ isVisible && (
					<BlockPreview
						blocks={ blocks }
						viewportWidth={ 1400 }
					/>
				) }
			</div>

			<div className="o-library__template__actions">
				<CheckboxControl
					checked={ isSelected }
					onChange={ onSelect }
				/>

				<div className="o-library__template__actions__title">
					{ title }
				</div>

				<div className="o-library__template__actions__button">
					<Button
						icon={ isFavorite ? heartFilledIcon : heartIcon }
						label={ isFavorite ? __( 'Remove from favorites', 'otter-blocks' ) : __( 'Add to favorites', 'otter-blocks' ) }
						className={ classnames(
							{
								'is-favorite': isFavorite
							}
						) }
						onClick={ onFavorite }
					/>

					<Button
						variant="primary"
						onClick={ onInsert }
					>
						{ __( 'Insert', 'otter-blocks' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default memo( Template );
