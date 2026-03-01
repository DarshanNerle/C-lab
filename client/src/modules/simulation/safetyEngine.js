/**
 * SafetyEngine
 * Detects hazardous chemical combinations and provides educational warnings.
 */

export const HAZARDOUS_COMBINATIONS = [
    {
        reactants: ["water", "sulfuric_acid"],
        title: "⚠ EXOTHERMIC DANGER: ACID HYDRATION",
        message: "You are adding Water to Concentrated Sulfuric Acid. This is extremely dangerous!",
        reason: "The hydration of sulfuric acid is highly exothermic. Adding water to acid can cause the mixture to flash-boil and spray concentrated acid out of the container.",
        safetyNote: "ALWAYS add Acid to Water ('A to W'), never the reverse. The large volume of water acts as a heat sink.",
        severity: "critical"
    },
    {
        reactants: ["bleach", "ammonia"], // Ensure these IDs exist in DB
        title: "⚠ TOXIC GAS ALERT: CHLORAMINE",
        message: "Mixing Bleach and Ammonia produces toxic Chloramine gas.",
        reason: "Sodium hypochlorite reacts with ammonia to form NH2Cl and NHCl2 vapors.",
        safetyNote: "Inhalation of these gases causes severe respiratory distress and lung damage. Never mix household cleaners.",
        severity: "critical"
    },
    {
        reactants: ["hydrochloric_acid", "bleach"],
        title: "⚠ TOXIC GAS ALERT: CHLORINE",
        message: "Mixing Acid and Bleach releases Chlorine gas.",
        reason: "Acidification of hypochlorite shift equilibrium to favor Cl2 gas production.",
        safetyNote: "Chlorine gas was used as a chemical weapon. It is highly corrosive to the lungs.",
        severity: "critical"
    },
    {
        reactants: ["sodium", "water"],
        title: "⚠ EXPLOSION RISK: ALKALI METALS",
        message: "Sodium reacts violently with water.",
        reason: "The reaction produces Hydrogen gas and massive heat, often leading to immediate ignition or explosion.",
        safetyNote: "Alkali metals must be handled under mineral oil and only in small quantities with proper shielding.",
        severity: "high"
    }
];

/**
 * Checks if a combination of chemicals is hazardous.
 * @param {Array} currentIds - IDs of chemicals already in container
 * @param {String} newId - ID of chemical being added
 * @returns {Object|null} - Warning object or null if safe
 */
export const checkSafety = (currentIds, newId) => {
    const allIds = [...currentIds, newId];
    
    // Check specific dangerous pairings
    for (const hazard of HAZARDOUS_COMBINATIONS) {
        if (hazard.reactants.every(req => allIds.includes(req))) {
            // Special check for Acid to Water order
            if (hazard.reactants.includes("water") && hazard.reactants.includes("sulfuric_acid")) {
                // If water is being added to existing acid, it's the dangerous "W to A"
                if (newId === "water" && currentIds.includes("sulfuric_acid")) {
                    return hazard;
                }
                // Adding acid to water is "A to W", which is the safe way (though still reacts)
                return null; 
            }
            return hazard;
        }
    }
    
    return null;
};
