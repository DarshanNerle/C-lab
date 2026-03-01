import { chemicalsData } from '../constants/chemicalsData';
import { CHEMISTRY_DATABASE, REACTION_RULES } from '../constants/chemistryData';
import { interpolateRgb } from 'd3-interpolate';
import { color as d3Color } from 'd3-color';

/**
 * Advanced Reaction Engine
 * Handles realistic chemical blending and reaction outcomes.
 */

/**
 * Blends multiple colors based on their volume/quantity.
 * @param {Array} substances - Array of { color, quantity }
 * @returns {string} - Resulting hex/rgba color
 */
export const blendColors = (substances) => {
    if (!substances || substances.length === 0) return "#ffffff00";
    if (substances.length === 1) return substances[0].color;

    let r = 0, g = 0, b = 0, a = 0, totalWeight = 0;

    substances.forEach(sub => {
        const c = d3Color(sub.color);
        if (c) {
            const weight = sub.quantity || 1;
            r += c.r * weight;
            g += c.g * weight;
            b += c.b * weight;
            a += (c.opacity !== undefined ? c.opacity : 1) * weight;
            totalWeight += weight;
        }
    });

    if (totalWeight === 0) return "#ffffff00";

    return `rgba(${Math.round(r / totalWeight)}, ${Math.round(g / totalWeight)}, ${Math.round(b / totalWeight)}, ${a / totalWeight})`;
};

/**
 * Processes the interaction between multiple chemicals.
 * @param {Array} chemicalIds - IDs of chemicals present in the container
 * @returns {Object} - Reaction state update
 */
export const processInteraction = (chemicalIds) => {
    if (!chemicalIds || chemicalIds.length === 0) {
        return { 
            active: false, 
            message: "Empty container.", 
            color: "transparent",
            isBubbling: false,
            hasPrecipitate: false,
            temperature: 25
        };
    }

    const currentSubstances = chemicalIds.map(id => {
        const data = chemicalsData.find(c => c.id === id) || CHEMISTRY_DATABASE[id];
        return {
            id,
            color: data?.originalColor || data?.color || "#ffffff1a",
            quantity: data?.quantity || 50,
            data
        };
    });

    // 1. Check for valid reaction rule
    const sortedIds = [...chemicalIds].sort();
    const reaction = REACTION_RULES.find(rule => {
        const ruleReactants = [...rule.reactants].sort();
        // Check if all rule reactants are present (subset check or exact check)
        // For simplicity, we do an exact match of the main reactants
        return JSON.stringify(sortedIds) === JSON.stringify(ruleReactants);
    });

    // 2. Base Blend (No Reaction)
    const baseColor = blendColors(currentSubstances);

    if (!reaction) {
        return {
            active: false,
            message: chemicalIds.length > 1 ? "Chemicals mixed safely." : "Ready for experiment.",
            color: baseColor,
            transitionTime: 700,
            isBubbling: false,
            hasPrecipitate: false,
            temperature: 25,
            equation: null,
            observation: "No visible change."
        };
    }

    // 3. Reaction Logic
    // Determine the target reaction color
    // If rule has a specific resultColor, use it; otherwise blend reactionColors of participants
    let targetColor = reaction.resultColor;
    if (!targetColor) {
        const reactionSubstances = currentSubstances.map(sub => ({
            ...sub,
            color: sub.data?.reactionColor || sub.color
        }));
        targetColor = blendColors(reactionSubstances);
    }

    // Handle special cases (e.g. Phenolphthalein in Base)
    if (chemicalIds.includes('phenolphthalein')) {
        const hasBase = currentSubstances.some(s => s.data?.type === 'strong_base' || s.data?.type === 'weak_base');
        if (hasBase) {
            const ph = chemicalsData.find(c => c.id === 'phenolphthalein');
            targetColor = ph.reactionColor;
        }
    }

    return {
        active: true,
        reactionId: reaction.id,
        name: reaction.name,
        message: reaction.scientificMechanism || "Reaction occurring!",
        color: targetColor,
        transitionTime: 700,
        isBubbling: reaction.type === "Gas Evolution" || reaction.id === "r1",
        hasPrecipitate: reaction.type === "Precipitation",
        temperature: reaction.energy?.type === "exothermic" ? 45 : 25,
        equation: reaction.equation,
        observation: reaction.name,
        conclusion: reaction.scientificMechanism,
        xp: reaction.xp || 50
    };
};
