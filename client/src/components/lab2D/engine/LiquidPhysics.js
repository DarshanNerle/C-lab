import { interpolateRgb } from 'd3-interpolate';
import { rgb } from 'd3-color';

/**
 * Advanced 2D Chemical Database (Includes realistic colors, states, density, specific heat)
 */
export const CHEMICAL_DATA_2D = {
    // Acids
    hcl: { id: "hcl", name: "Hydrochloric Acid", formula: "HCl", color: "rgba(255,255,255, 0.1)", type: "acid", ph: 1, density: 1.18, specificHeat: 4.18 },
    h2so4: { id: "h2so4", name: "Sulfuric Acid", formula: "H₂SO₄", color: "rgba(255,255,255, 0.15)", type: "acid", ph: 0.5, density: 1.84, specificHeat: 1.4 },
    // Bases
    naoh: { id: "naoh", name: "Sodium Hydroxide", formula: "NaOH", color: "rgba(255,255,255, 0.1)", type: "base", ph: 14, density: 1.53, specificHeat: 3.2 },
    // Indicators
    phenolphthalein: { id: "phenolphthalein", name: "Phenolphthalein", formula: "C₂₀H₁₄O₄", color: "rgba(255,255,255, 0.05)", type: "indicator", ph: 7, density: 0.8, specificHeat: 2.0 },
    // Salts/Metals
    cuso4: { id: "cuso4", name: "Copper(II) Sulfate", formula: "CuSO₄", color: "rgba(0,191,255, 0.8)", type: "salt", ph: 6, density: 1.05, specificHeat: 4.0 },
    agno3: { id: "agno3", name: "Silver Nitrate", formula: "AgNO₃", color: "rgba(255,255,255, 0.1)", type: "salt", ph: 7, density: 1.1, specificHeat: 4.1 },
    nacl: { id: "nacl", name: "Sodium Chloride", formula: "NaCl", color: "rgba(255,255,255, 0.1)", type: "salt", ph: 7, density: 1.02, specificHeat: 4.1 },
    fe: { id: "fe", name: "Iron Filings", formula: "Fe", color: "rgba(100,100,100, 1)", type: "solid", density: 7.87, specificHeat: 0.45 },
    zn: { id: "zn", name: "Zinc Granules", formula: "Zn", color: "rgba(200,200,200, 1)", type: "solid", density: 7.14, specificHeat: 0.39 },
    // Water
    water: { id: "water", name: "Water", formula: "H₂O", color: "rgba(200,240,255, 0.1)", type: "neutral", ph: 7, density: 1.0, specificHeat: 4.18 },
};

/**
 * Engine for calculating realistic mixtures of liquids
 */
export const mixLiquids = (currentMix, addChemical, addVol, addTemp) => {
    // currentMix: { volume, temp, color, components: [{id, volume}] }

    const newVol = currentMix.volume + addVol;
    if (newVol === 0) return currentMix;

    // Simplified Specific Heat / Temp blending (Weighted Average)
    const totalCurrentHeat = currentMix.volume * currentMix.temp;
    const addedHeat = addVol * addTemp;
    let newTemp = (totalCurrentHeat + addedHeat) / newVol;

    // Color Blending using d3-interpolate (RGB + Alpha)
    let newColor = currentMix.color;
    if (addVol > 0) {
        const ratio = addVol / newVol;
        // interpolateRgb takes two color strings and returns a function
        const blendFn = interpolateRgb(currentMix.color, addChemical.color);
        newColor = blendFn(ratio);
    }

    // Component tracking
    const newComponents = [...currentMix.components];
    const existing = newComponents.find(c => c.id === addChemical.id);
    if (existing) {
        existing.volume += addVol;
    } else {
        newComponents.push({ id: addChemical.id, volume: addVol });
    }

    return {
        volume: newVol,
        temp: newTemp,
        color: newColor,
        components: newComponents
    };
};
