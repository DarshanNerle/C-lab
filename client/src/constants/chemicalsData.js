/**
 * C-Lab Chemical Configuration
 * Updated with originalColor and reactionColor for realistic transitions.
 */
export const chemicalsData = [
    {
        id: "hydrochloric_acid",
        name: "Hydrochloric Acid",
        formula: "HCl",
        molarity: "0.1 M",
        quantity: 100,
        originalColor: "#f0f0f033", // colorless/slight gray
        reactionColor: "#ff96964d", // light red in reaction
        state: "liquid",
        type: "strong_acid",
        hazardLevel: "high"
    },
    {
        id: "sodium_hydroxide",
        name: "Sodium Hydroxide",
        formula: "NaOH",
        molarity: "0.1 M",
        quantity: 100,
        originalColor: "#ffffff4d", // colorless/slight white
        reactionColor: "#c8c8ff4d", // light blue in reaction
        state: "liquid",
        type: "strong_base",
        hazardLevel: "high"
    },
    {
        id: "phenolphthalein",
        name: "Phenolphthalein",
        formula: "C20H14O4",
        molarity: "1% solution",
        quantity: 5,
        originalColor: "#ffffff00", // transparent
        reactionColor: "#ff32c8cc", // bright pink in base
        state: "liquid",
        type: "indicator",
        hazardLevel: "low"
    },
    {
        id: "copper_sulfate",
        name: "Copper(II) Sulfate",
        formula: "CuSO4",
        molarity: "0.5 M",
        quantity: 50,
        originalColor: "#0064ffcc", // blue
        reactionColor: "#003296e6", // deep blue
        state: "liquid",
        type: "oxidizing_salt",
        hazardLevel: "medium"
    },
    {
        id: "silver_nitrate",
        name: "Silver Nitrate",
        formula: "AgNO3",
        molarity: "0.1 M",
        quantity: 50,
        originalColor: "#ffffff33", // colorless
        reactionColor: "#ffffffcc", // white precipitate
        state: "liquid",
        type: "oxidizing_salt",
        hazardLevel: "medium"
    },
    {
        id: "potassium_iodide",
        name: "Potassium Iodide",
        formula: "KI",
        molarity: "0.1 M",
        quantity: 50,
        originalColor: "#ffffff1a", // colorless
        reactionColor: "#ffd700cc", // yellow precipitate (with lead)
        state: "liquid",
        type: "salt",
        hazardLevel: "low"
    },
    {
        id: "lead_nitrate",
        name: "Lead(II) Nitrate",
        formula: "Pb(NO3)2",
        molarity: "0.1 M",
        quantity: 50,
        originalColor: "#ffffffe1", // colorless
        reactionColor: "#ffd700d9", // golden rain
        state: "liquid",
        type: "heavy_metal_salt",
        hazardLevel: "high"
    },
    {
        id: "potassium_permanganate",
        name: "Potassium Permanganate",
        formula: "KMnO4",
        molarity: "0.02 M",
        quantity: 50,
        originalColor: "#9600c8e6", // purple
        reactionColor: "#500064e6", // deep purple
        state: "liquid",
        type: "strong_oxidizer",
        hazardLevel: "medium"
    }
];

export const getChemData = (id) => chemicalsData.find(c => c.id === id) || null;
