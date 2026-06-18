/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { Icon, Spinner } from '@wordpress/components';

import { check, warning } from '@wordpress/icons';

/**
 * Render the mission, design direction and per-section progress of an AI block
 * generation, so the user can follow the page being built section by section.
 *
 * @param {Object}                                                             props
 * @param {import('../../plugins/ai-content/block-generation').GenerationPlan} [props.plan]   The generation plan.
 * @param {{title: string, status: 'pending'|'building'|'done'|'failed'}[]}    props.sections Per-section progress.
 */
const GenerationPlanView = ({ plan, sections = [] }) => {
	if ( ! plan ) {
		return null;
	}

	const design = plan.design ?? {};
	const palette = Array.isArray( design.palette ) ? design.palette : [];

	const statusIcon = ( status ) => {
		if ( 'building' === status ) {
			return <Spinner />;
		}
		if ( 'done' === status ) {
			return <Icon icon={ check } />;
		}
		if ( 'failed' === status ) {
			return <Icon icon={ warning } />;
		}
		return <span className="o-ai-plan__dot" aria-hidden="true" />;
	};

	return (
		<div className="o-ai-plan">
			{
				plan.mission && (
					<div className="o-ai-plan__mission">
						<span className="o-ai-plan__label">{ __( 'Mission', 'otter-blocks' ) }</span>
						<p>{ plan.mission }</p>
					</div>
				)
			}

			{
				palette.length > 0 && (
					<div className="o-ai-plan__design">
						<span className="o-ai-plan__label">{ __( 'Palette', 'otter-blocks' ) }</span>
						<div className="o-ai-plan__palette">
							{ palette.map( ( color, index ) => (
								<span
									key={ index }
									className="o-ai-plan__swatch"
									style={{ backgroundColor: color }}
									title={ color }
								/>
							) ) }
						</div>
					</div>
				)
			}

			{
				sections.length > 0 && (
					<ul className="o-ai-plan__outline">
						{ sections.map( ( section, index ) => (
							<li key={ index } className={ `o-ai-plan__section is-${ section.status }` }>
								<span className="o-ai-plan__section-icon">{ statusIcon( section.status ) }</span>
								<span className="o-ai-plan__section-title">{ section.title }</span>
							</li>
						) ) }
					</ul>
				)
			}
		</div>
	);
};

export default GenerationPlanView;
