<?php
/**
 * Form_File_Block
 *
 * @package ThemeIsle\OtterPro\Render
 */

namespace ThemeIsle\OtterPro\Render;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Form_File_Block
 */
class Form_File_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	public function render( $attributes ) {

		if ( ! License::has_active_license() ) {
			return '';
		}

		$class_names        = 'wp-block-themeisle-blocks-form-file ' . ( isset( $attributes['className'] ) ? $attributes['className'] : '' );
		$id                 = isset( $attributes['id'] ) ? $attributes['id'] : '';
		$label              = isset( $attributes['label'] ) ? $attributes['label'] : __( 'Select option', 'otter-blocks' );
		$help_text          = isset( $attributes['helpText'] ) ? $attributes['helpText'] : '';
		$is_required        = isset( $attributes['isRequired'] ) && boolval( $attributes['isRequired'] );
		$has_multiple_files = isset( $attributes['multipleFiles'] ) && boolval( $attributes['multipleFiles'] ) && ( ! isset( $attributes['maxFilesNumber'] ) || intval( $attributes['maxFilesNumber'] ) > 1 );
		$allowed_files      = isset( $attributes['allowedFileTypes'] ) ? implode( ',', $attributes['allowedFileTypes'] ) : '';

		$output = '<div class="' . $class_names . '" id="' . $id . '">';

		$output .= '<label class="otter-form-input-label" for="field-' . $id . '" >' . $label . $this->render_required_sign( $is_required ) . '</label>';

		$output .= '<input type="file" class="otter-form-input" name="field-'
		. $id . '" '
		. ( $is_required ? 'required ' : '' ) . ' '
		. ( $has_multiple_files ? 'multiple ' : '' )
		. ( isset( $attributes['allowedFileTypes'] ) ? ( ' accept="' . $allowed_files ) . '"' : '' )
		. ( isset( $attributes['maxFileSize'] ) ? ( ' data-max-file-size="' . $attributes['maxFileSize'] . '"' ) : '' )
		. ( isset( $attributes['fieldOptionName'] ) ? ( ' data-field-option-name="' . $attributes['fieldOptionName'] . '"' ) : '' )
		. ( ( isset( $attributes['multipleFiles'] ) && isset( $attributes['maxFilesNumber'] ) ) ? ( ' data-max-files-number="' . $attributes['maxFilesNumber'] . '"' ) : '' )
		. ' />';

		$output .= '<span class="o-form-help">'
		. $help_text
		. '</span>';

		$output .= '</div>';
		return $output;
	}

	/**
	 * Render the required sign.
	 *
	 * @param bool $is_required The required status of the field.
	 * @return string
	 */
	public function render_required_sign( $is_required ) {
		return $is_required ? '<span class="required">*</span>' : '';
	}
}
