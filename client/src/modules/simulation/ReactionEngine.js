import { CHEMISTRY_DATABASE, REACTION_RULES } from '../../constants/chemistryData';

/**
 * ReactionEngine
 * Pure logic for calculating chemical outcomes.
 */
export class ReactionEngine {
    /**
     * @param {Array} reactants - List of {id, volume, concentration}
     * @param {Number} temperature - Current temperature in Celsius
     */
    static calculateOutcome(reactants, temperature) {
        if (!reactants || reactants.length < 2) return null;

        const reactantIds = reactants.map(r => r.id);

        // Find matching reaction
        const match = REACTION_RULES.find(rule =>
            rule.reactants.every(id => reactantIds.includes(id))
        );

        if (!match) return null;

        // Limiting Reagent Logic
        // Moles = Volume(L) * Concentration(M)
        const moles = reactants.map(r => ({
            id: r.id,
            moles: (r.volume / 1000) * (r.concentration || 1.0)
        }));

        let limitingFactor = Infinity;
        let limitingReagentId = null;

        match.reactants.forEach(id => {
            const reactantMoles = moles.find(m => m.id === id).moles;
            const stoichiometry = match.stoichiometry[id];
            const factor = reactantMoles / stoichiometry;
            if (factor < limitingFactor) {
                limitingFactor = factor;
                limitingReagentId = id;
            }
        });

        const reactionScale = limitingFactor;

        // Calculate Products
        const productsProduced = match.products.map(p => ({
            id: p.id,
            moles: reactionScale * (p.molarRatio || 1),
            state: p.state || 'liquid'
        }));

        // Calculate Heat Change
        const enthalpy = match.energy?.deltaH || 0;
        const heatProduced = -enthalpy * reactionScale; // Simplified Q = -dH * n

        // Completion Status
        const status = reactionScale > 0 ? 'complete' : 'inhibited';

        return {
            type: match.type,
            reactants: reactants.map(r => ({
                id: r.id,
                consumed: reactionScale * match.stoichiometry[r.id]
            })),
            products: productsProduced,
            limitingReagent: limitingReagentId,
            temperatureChange: heatProduced / 10, // Scaled for sim drama
            completionStatus: status,
            equation: match.equation,
            xp: match.xp || 10
        };
    }

    static blendColors(colors) {
        // Basic RGB average for simulation
        // In a real engine, use d3-interpolate or similar for volume-weighted blending
        return 'rgba(200, 200, 200, 0.5)';
    }
}
