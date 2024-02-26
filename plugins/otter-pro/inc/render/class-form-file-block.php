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

		$id                 = isset( $attributes['id'] ) ? esc_attr( $attributes['id'] ) : '';
		$label              = isset( $attributes['label'] ) ? esc_html( $attributes['label'] ) : __( 'Select option', 'otter-blocks' );
		$help_text          = isset( $attributes['helpText'] ) ? esc_html( $attributes['helpText'] ) : '';
		$is_required        = isset( $attributes['isRequired'] ) && boolval( $attributes['isRequired'] );
		$has_multiple_files = isset( $attributes['multipleFiles'] ) && boolval( $attributes['multipleFiles'] ) && ( ! isset( $attributes['maxFilesNumber'] ) || intval( $attributes['maxFilesNumber'] ) > 1 );
		$allowed_files      = isset( $attributes['allowedFileTypes'] ) ? implode( ',', $attributes['allowedFileTypes'] ) : '';

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id' => $id,
			)
		);

		$output      = '<div ' . $wrapper_attributes . '>';
		$mapped_name = isset( $attributes['mappedName'] ) ? esc_attr( $attributes['mappedName'] ) : 'field-' . $id;

		$output .= '<label class="otter-form-input-label" for="' . $mapped_name . '" >' . $label . $this->render_required_sign( $is_required ) . '</label>';

		$output .= '<input type="file" class="otter-form-input" name="'
		. $mapped_name . '" '
		. ( $is_required ? 'required ' : '' ) . ' '
		. ( $has_multiple_files ? 'multiple ' : '' )
		. ( isset( $attributes['allowedFileTypes'] ) ? ( ' accept="' . esc_attr( $allowed_files ) ) . '"' : '' )
		. ( isset( $attributes['maxFileSize'] ) ? ( ' data-max-file-size="' . esc_attr( $attributes['maxFileSize'] ) . '"' ) : '' )
		. ( isset( $attributes['fieldOptionName'] ) ? ( ' data-field-option-name="' . esc_attr( $attributes['fieldOptionName'] ) . '"' ) : '' )
		. ( ( isset( $attributes['multipleFiles'] ) && isset( $attributes['maxFilesNumber'] ) ) ? ( ' data-max-files-number="' . esc_attr( $attributes['maxFilesNumber'] ) . '"' ) : '' )
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
