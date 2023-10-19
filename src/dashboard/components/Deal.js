const Deal = ( props ) => {
	return (
		<div className="otter-deal">
			<a href={props.link} target="_blank" rel="external noreferrer noopener">
				<img src={ props.image } alt={ props.alt } />
				<div className="o-urgency">{props.urgencyText}</div>
			</a>
		</div>
	);
};

export default Deal;
