import { CHEMICAL_DATA_2D } from './LiquidPhysics';

/**
 * 2D Reaction Engine Rules Database
 * Supports precise volume ratios, temperature changes, and specific animation triggers.
 */
export const REACTION_RULES_2D = [
    {
        id: "acid_base_hcl_naoh",
        type: "Acid-Base Neutralization",
        reactants: ["hcl", "naoh"],
        // Ideally 1:1 molar ratio, but for sim we use roughly equal volumes
        ratio: [1, 1],
        temperatureChange: "+5°C", // Exothermic
        gasFormed: false,
        precipitateColor: null,
        colorChange: null, // Stays clear unless indicator is present
        animationType: "temperature_rise",
        xp: 50,
        equation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)"
    },
    {
        id: "precipitation_agno3_nacl",
        type: "Precipitation",
        reactants: ["agno3", "nacl"],
        ratio: [1, 1],
        temperatureChange: "0°C",
        gasFormed: false,
        precipitateColor: "rgba(255,255,255, 0.9)", // White solid
        colorChange: "rgba(255,255,255, 0.4)", // Cloudy before settling
        animationType: "precipitate_settle",
        xp: 75,
        equation: "AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)"
    },
    {
        id: "redox_fe_cuso4",
        type: "Redox Reaction",
        reactants: ["fe", "cuso4"],
        ratio: [1, 1], // Solid mass to liquid volume ratio check
        temperatureChange: "+2°C",
        gasFormed: false,
        precipitateColor: "rgba(139,69,19, 0.9)", // Brownish solid (Copper)
        colorChange: "rgba(144,238,144, 0.3)", // Turns pale green (FeSO4)
        animationType: "color_fade_and_solid",
        xp: 100,
        equation: "Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)↓"
    },
    {
        id: "gas_evolution_hcl_zn",
        type: "Gas Evolution",
        reactants: ["hcl", "zn"],
        ratio: [2, 1],
        temperatureChange: "+4°C", // Exothermic
        gasFormed: true, // H2 gas
        precipitateColor: null,
        colorChange: "rgba(255,255,255, 0.1)", // Zinc dissolves, remains mostly clear
        animationType: "vigorous_bubbles",
        xp: 80,
        equation: "Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑"
    }
];

export const processReaction2D = (mixture) => {
    // mixture expects { components: [{id, volume}] }

    if (!mixture.components || mixture.components.length < 2) return null;

    // Extract chemical IDs
    const presentIds = mixture.components.map(c => c.id).sort();

    // Special Check for Indicators (e.g., phenolphthalein + base)
    const hasPhenol = mixture.components.find(c => c.id === "phenolphthalein");
    let indicatorVFX = null;

    // Determine aggregate pH roughly based on highest volume component for the sim
    let baseVol = 0;
    let acidVol = 0;

    mixture.components.forEach(c => {
        const data = CHEMICAL_DATA_2D[c.id];
        if (data.type === 'base') baseVol += c.volume;
        if (data.type === 'acid') acidVol += c.volume;
    });

    if (hasPhenol) {
        if (baseVol > acidVol * 1.1) {
            // Highly basic equivalence point or above
            indicatorVFX = {
                type: 'Titration',
                colorChange: "rgba(255, 0, 127, 0.8)", // Bright Pink
                animationType: "endpoint_flash",
                message: "Indicator turned pink! (Basic)"
            };
        } else if (baseVol > acidVol * 0.95 && baseVol <= acidVol * 1.1) {
            // Very near equivalence point
            indicatorVFX = {
                type: 'Titration',
                colorChange: "rgba(255, 182, 193, 0.4)", // Faint Pink
                animationType: "swirl_color",
                message: "Approaching endpoint..."
            };
        } else {
            indicatorVFX = {
                colorChange: "rgba(255,255,255, 0.1)", // Clear
            };
        }
    }

    // Match Standard Rules
    for (let rule of REACTION_RULES_2D) {
        const reqSorted = [...rule.reactants].sort();

        // Simple subset matching: if all required reactants are in the mixture
        const isMatch = reqSorted.every(reqId => presentIds.includes(reqId));

        if (isMatch) {
            // Return combined result
            return {
                ...rule,
                indicatorOverride: indicatorVFX,
                success: true
            };
        }
    }

    // If only indicator matched
    if (indicatorVFX) {
        return {
            type: "Indicator Change",
            indicatorOverride: indicatorVFX,
            success: true
        }
    }

    return null; // No reaction
};
