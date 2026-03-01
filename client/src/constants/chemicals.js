// Chemical Constants Database
// Each chemical has a unique ID, formula, state, color, and molar mass.
// Colors match the 3D liquid hex values.

export const CHEMICAL_DATABASE = {
    hydrochloric_acid: {
        id: "hydrochloric_acid",
        name: "Hydrochloric Acid",
        formula: "HCl",
        state: "liquid",
        color: "#ffffff", // Clear
        molarMass: 36.46,
        hazard: "high",
        ph: 1
    },
    sodium_hydroxide: {
        id: "sodium_hydroxide",
        name: "Sodium Hydroxide",
        formula: "NaOH",
        state: "liquid", // Aqueous
        color: "#ffffff", // Clear
        molarMass: 39.99,
        hazard: "high",
        ph: 14
    },
    copper_sulfate: {
        id: "copper_sulfate",
        name: "Copper(II) Sulfate",
        formula: "CuSO4",
        state: "liquid", // Aqueous
        color: "#00bfff", // Deep Cyan/Blue
        molarMass: 159.60,
        hazard: "medium",
        ph: 6
    },
    phenolphthalein: {
        id: "phenolphthalein",
        name: "Phenolphthalein Indicator",
        formula: "C20H14O4",
        state: "liquid",
        color: "#ffffff", // Clear
        molarMass: 318.32,
        hazard: "low",
        ph: 7 // Indicator
    },
    water: {
        id: "water",
        name: "Distilled Water",
        formula: "H2O",
        state: "liquid",
        color: "#e0f7fa", // Very light blue tint
        molarMass: 18.015,
        hazard: "none",
        ph: 7
    },
    sodium_chloride: {
        id: "sodium_chloride",
        name: "Sodium Chloride (Aqueous)",
        formula: "NaCl",
        state: "liquid",
        color: "#ffffff",
        molarMass: 58.44,
        hazard: "none",
        ph: 7
    }
};

// Known Reaction Rules
export const REACTION_RULES = [
    {
        id: "acid_base_neutralization",
        reactants: ["hydrochloric_acid", "sodium_hydroxide"],
        products: ["sodium_chloride", "water"],
        reactionType: "neutralization",
        visualEffect: "neutralization_glow", // Triggers specific visual
        soundEffect: "sizzle",
        xpReward: 50,
        badgeName: "First Neutralization",
        description: "An acid and a base combine to form salt and water. Exothermic."
    },
    {
        id: "indicator_test_acid",
        reactants: ["hydrochloric_acid", "phenolphthalein"],
        products: ["hydrochloric_acid", "phenolphthalein"], // Remains same
        reactionType: "indicator",
        visualEffect: "color_clear",
        soundEffect: "bubbles",
        xpReward: 10,
        description: "Phenolphthalein remains colorless in acidic solutions."
    },
    {
        id: "indicator_test_base",
        reactants: ["sodium_hydroxide", "phenolphthalein"],
        products: ["sodium_hydroxide", "phenolphthalein"],
        reactionType: "indicator",
        visualEffect: "color_pink", // Specifically turns neon pink
        resultColor: "#ff007f",
        soundEffect: "bubbles",
        xpReward: 10,
        description: "Phenolphthalein turns a vibrant pink in basic solutions."
    },
    // Adding more combinations easily scales the engine.
];
