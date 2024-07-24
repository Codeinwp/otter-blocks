/* global jQuery */

const installPlugin = ( slug ) => {
	return new Promise( ( resolve ) => {
		wp.updates.ajax( 'install-plugin', {
			slug,
			success: () => {
				resolve({ success: true });
			},
			error: ( err ) => {
				resolve({ success: false, code: err.errorCode });
			}
		});
	});
};

const activatePlugin = ( url ) => {
	return new Promise( ( resolve ) => {
		jQuery
			.get( url )
			.done( () => {
				resolve({ success: true });
			})
			.fail( () => {
				resolve({ success: false });
			});
	});
};

export { installPlugin, activatePlugin };
