import { CHEMICAL_DATABASE, REACTION_RULES } from '../constants/chemicals';
import useGameStore from '../store/useGameStore'; // To award XP and Badges

/**
 * ReactionEngine
 * Handles combining chemicals, checking rules, and calculating outcomes.
 */

export const processReaction = (chemicalsInChamber) => {
    // chemicalsInChamber is expected to be an array of chemical IDs
    // e.g. ["hydrochloric_acid", "sodium_hydroxide"]

    if (!chemicalsInChamber || chemicalsInChamber.length < 2) {
        return { success: false, message: "Add more chemicals." };
    }

    // Sort to ensure rule matching regardless of insertion order
    const sortedReactants = [...chemicalsInChamber].sort();

    // Find a matching rule
    for (let rule of REACTION_RULES) {
        const sortedRuleReactants = [...rule.reactants].sort();

        // Simple array exact match
        if (JSON.stringify(sortedReactants) === JSON.stringify(sortedRuleReactants)) {
            // Reaction found!
            return applyReactionEffects(rule, chemicalsInChamber);
        }
    }

    // Default Unknown Reaction
    return {
        success: false,
        message: "No visible reaction occurred. A sluggish mixture.",
        resultColor: "#555555",
        visualEffect: "murky_water",
        soundEffect: "slosh"
    };
};

const applyReactionEffects = (rule, reactantsUsed) => {
    // Generate the resulting products
    const products = rule.products.map(id => CHEMICAL_DATABASE[id]);

    // Determine mixed color (simplistic override or blending)
    let finalColor = rule.resultColor || products[0]?.color || "#ffffff";

    return {
        success: true,
        ruleId: rule.id,
        message: rule.description,
        products: products,
        resultColor: finalColor,
        visualEffect: rule.visualEffect,
        soundEffect: rule.soundEffect,
        xpReward: rule.xpReward,
        badgeName: rule.badgeName
    };
};
