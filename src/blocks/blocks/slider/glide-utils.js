export const safeGlideDestroy = ( glideInstance ) => {
	if ( ! glideInstance || 'function' !== typeof glideInstance.destroy ) {
		return;
	}

	try {
		glideInstance.destroy();
	} catch {
		// When a block gets duplicated (or otherwise removed), React may detach the
		// slider DOM before effect cleanups run. Glide may throw during `destroy()`
		// in that case (ex: NotFoundError: removeChild). Cleanup errors should
		// never break the editor, so we intentionally swallow them.
	}
};
