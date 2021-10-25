const attributes = {
	prefix: {
		type: 'string',
		default: 'fab'
	},
	icon: {
		type: 'string',
		default: 'themeisle'
	},
	fontSize: {
		type: 'number',
		default: 16
	},
	padding: {
		type: 'number',
		default: 5
	},
	margin: {
		type: 'number',
		default: 5
	},
	backgroundColor: {
		type: 'string'
	},
	textColor: {
		type: 'string'
	},
	borderColor: {
		type: 'string'
	},
	borderSize: {
		type: 'number',
		default: 0
	},
	borderRadius: {
		type: 'number',
		default: 0
	}
};

const deprecated = [ {
	attributes,

	supports: {
		align: [ 'left', 'center', 'right' ]
	},

	migrate: oldAttributes => {
		let align = 'center';

		if ( oldAttributes.className.includes( 'alignleft' ) ) {
			align = 'left';
		}

		if ( oldAttributes.className.includes( 'aligncenter' ) ) {
			align = 'center';
		}

		if ( oldAttributes.className.includes( 'alignright' ) ) {
			align = 'right';
		}

		return {
			...oldAttributes,
			align,
			className: ''
		};
	},

	save: ({
		attributes,
		className
	}) => {
		const iconStyle = {
			borderRadius: attributes.borderRadius + '%',
			fontSize: attributes.fontSize + 'px',
			padding: attributes.padding + 'px'
		};

		const containerStyle = {
			color: attributes.textColor,
			backgroundColor: attributes.backgroundColor,
			borderColor: attributes.borderColor,
			borderRadius: attributes.borderRadius + '%',
			borderStyle: 'solid',
			borderWidth: attributes.borderSize + 'px',
			display: 'inline-block',
			margin: attributes.margin + 'px'
		};

		return (
			<p
				className={ className }
				style={ { textAlign: attributes.align } }
			>
				<span
					className={ `${ className }-container` }
					style={ containerStyle }
				>
					<i
						className={ `${ attributes.prefix } fa-${ attributes.icon }` }
						style={ iconStyle }
					>
					</i>
				</span>
			</p>
		);
	}
}, {
	attributes: {
		...attributes,
		align: {
			type: 'string'
		}
	},

	save: ({
		attributes,
		className
	}) => {
		const iconStyle = {
			borderRadius: attributes.borderRadius + '%',
			fontSize: attributes.fontSize + 'px',
			padding: attributes.padding + 'px'
		};

		const containerStyle = {
			color: attributes.textColor,
			backgroundColor: attributes.backgroundColor,
			borderColor: attributes.borderColor,
			borderRadius: attributes.borderRadius + '%',
			borderStyle: 'solid',
			borderWidth: attributes.borderSize + 'px',
			display: 'inline-block',
			margin: attributes.margin + 'px'
		};

		return (
			<p
				className={ className }
				style={ { textAlign: attributes.align } }
			>
				<span
					className="undefined-container"
					style={ containerStyle }
				>
					<i
						className={ `${ attributes.prefix } fa-${ attributes.icon }` }
						style={ iconStyle }
					>
					</i>
				</span>
			</p>
		);
	}
}, {
	attributes: {
		...attributes,
		id: {
			type: 'string'
		},
		align: {
			type: 'string'
		},
		link: {
			type: 'string'
		},
		newTab: {
			type: 'boolean',
			default: false
		},
		backgroundColorHover: {
			type: 'string'
		},
		textColorHover: {
			type: 'string'
		},
		borderColorHover: {
			type: 'string'
		}
	},

	save: ({
		attributes,
		className
	}) => {
		const containerStyle = {
			borderRadius: attributes.borderRadius + '%',
			borderStyle: 'solid',
			borderWidth: attributes.borderSize + 'px',
			display: 'inline-block',
			margin: attributes.margin + 'px'
		};

		const iconStyle = {
			borderRadius: attributes.borderRadius + '%',
			fontSize: attributes.fontSize + 'px',
			padding: attributes.padding + 'px'
		};

		const IconElement = () => {
			return (
				<i
					className={ `${ attributes.prefix } fa-${ attributes.icon }` }
					style={ iconStyle }
				>
				</i>
			);
		};

		return (
			<p
				className={ className }
				id={ attributes.id }
				style={ { textAlign: attributes.align } }
			>
				<span
					className="wp-block-themeisle-blocks-font-awesome-icons-container"
					style={ containerStyle }
				>
					{ ( attributes.link ) ? (
						<a
							href={ attributes.link }
							target={ attributes.newTab ? '_blank' : '_self' }
							style={ {
								color: attributes.textColor
							} }
							rel="noopener noreferrer"
						>
							<IconElement />
						</a>
					) : (
						<IconElement />
					) }
				</span>
			</p>
		);
	}
} ];

export default deprecated;
