import { CHEMISTRY_DATABASE, REACTION_RULES } from '../constants/chemistryData';
import { chemicalsData } from '../constants/chemicalsData';
import { interpolateRgb } from 'd3-interpolate';
import { color as d3Color } from 'd3-color';
import { getMixtureVisualProfile, profileToColor } from '../utils/chemicalColorSystem';

/**
 * Universal Engine for C-Lab 6.0
 * Handles chemical mixing, stoichiometry, and realistic reaction visuals.
 */

export const blendColors = (substances) => {
    if (!substances || substances.length === 0) return "rgba(255, 255, 255, 0)";
    
    let r = 0, g = 0, b = 0, a = 0, totalWeight = 0;

    substances.forEach(sub => {
        const c = d3Color(sub.color);
        if (c) {
            const weight = sub.volume || 1;
            r += c.r * weight;
            g += c.g * weight;
            b += c.b * weight;
            a += (c.opacity !== undefined ? c.opacity : 1) * weight;
            totalWeight += weight;
        }
    });

    if (totalWeight === 0) return "rgba(255, 255, 255, 0)";
    return `rgba(${Math.round(r / totalWeight)}, ${Math.round(g / totalWeight)}, ${Math.round(b / totalWeight)}, ${a / totalWeight})`;
};

export const mixUniversal = (currentMixture, addChemId, addVolmL, addTempC = 25) => {
    const chemical = chemicalsData.find(c => c.id === addChemId) || CHEMISTRY_DATABASE[addChemId];
    if (!chemical) return currentMixture;

    const newVolume = currentMixture.volume + addVolmL;
    const newComponents = [...currentMixture.components];
    const existing = newComponents.find(c => c.id === addChemId);
    if (existing) {
        existing.volume += addVolmL;
    } else {
        newComponents.push({ id: addChemId, volume: addVolmL });
    }

    // Thermal calculation
    const addedHC = addVolmL * (chemical.specificHeat || 4.18);
    const currentHC = currentMixture.components.reduce((acc, c) => {
        const data = CHEMISTRY_DATABASE[c.id];
        return acc + (c.volume * (data?.specificHeat || 4.18));
    }, 0);
    const newTemp = (currentHC * currentMixture.temp + addedHC * addTempC) / (currentHC + addedHC || 1);

    // pH calculation
    const avgPh = newComponents.reduce((acc, c) => {
        const data = CHEMISTRY_DATABASE[c.id];
        return acc + ((data?.ph || 7.0) * (c.volume / newVolume));
    }, 0);

    // Color Blending (Original Colors)
    const substances = newComponents.map(c => ({
        volume: c.volume,
        color: (chemicalsData.find(cd => cd.id === c.id) || CHEMISTRY_DATABASE[c.id])?.originalColor || "rgba(255,255,255,0.1)"
    }));
    
    const visualProfile = getMixtureVisualProfile(newComponents.map((component) => ({
        volume: component.volume,
        data: CHEMISTRY_DATABASE[component.id]
    })));
    let finalColor = profileToColor(visualProfile, 0.68);

    // Indicator Logic
    const indicator = newComponents.find(c => c.id === 'phenolphthalein');
    if (indicator && avgPh > 8.5) {
        finalColor = chemicalsData.find(c => c.id === 'phenolphthalein')?.reactionColor || "rgba(255, 0, 128, 0.6)";
    }

    return {
        ...currentMixture,
        volume: newVolume,
        temp: newTemp,
        ph: avgPh,
        color: finalColor,
        components: newComponents
    };
};

export const processUniversalReaction = (mixture) => {
    if (!mixture.components || mixture.components.length < 2) return { mixture, reaction: null };

    const componentIds = mixture.components.map(c => c.id);
    const matchedRule = REACTION_RULES.find(rule =>
        rule.reactants.every(req => componentIds.includes(req))
    );

    if (!matchedRule) return { mixture, reaction: null };

    // Simple Stoichiometry
    let minReactionScale = Infinity;
    matchedRule.reactants.forEach(reactantId => {
        const reqRatio = matchedRule.stoichiometry[reactantId];
        const currentVol = mixture.components.find(c => c.id === reactantId).volume;
        const scale = currentVol / reqRatio;
        if (scale < minReactionScale) minReactionScale = scale;
    });

    const finalComponents = [];
    mixture.components.forEach(c => {
        if (matchedRule.reactants.includes(c.id)) {
            const consumed = minReactionScale * matchedRule.stoichiometry[c.id];
            if (c.volume - consumed > 0.1) finalComponents.push({ id: c.id, volume: c.volume - consumed });
        } else {
            finalComponents.push({ ...c });
        }
    });

    matchedRule.products.forEach(p => {
        const produced = minReactionScale * p.molarRatio;
        const existing = finalComponents.find(c => c.id === p.id);
        if (existing) existing.volume += produced;
        else finalComponents.push({ id: p.id, volume: produced });
    });

    const newVolume = finalComponents.reduce((acc, c) => acc + c.volume, 0);
    const avgPh = finalComponents.reduce((acc, c) => {
        const data = CHEMISTRY_DATABASE[c.id];
        return acc + ((data?.ph || 7.0) * (c.volume / newVolume));
    }, 0);

    // Color Calculation (Reaction Colors)
    const substances = finalComponents.map(c => ({
        volume: c.volume,
        color: (chemicalsData.find(cd => cd.id === c.id) || CHEMISTRY_DATABASE[c.id])?.reactionColor || "rgba(255,255,255,0.1)"
    }));
    
    const reactionProfile = getMixtureVisualProfile(finalComponents.map((component) => ({
        volume: component.volume,
        data: CHEMISTRY_DATABASE[component.id]
    })), matchedRule.type);
    let finalColor = profileToColor(reactionProfile, 0.72);
    
    // Phenolphthalein override
    if (finalComponents.some(c => c.id === 'phenolphthalein') && avgPh > 8.5) {
        finalColor = chemicalsData.find(c => c.id === 'phenolphthalein')?.reactionColor || "rgba(255, 0, 128, 0.6)";
    }

    const tempDelta = (matchedRule.energy?.deltaH || 0) * -0.1; // Simulated heat

    return {
        mixture: {
            ...mixture,
            volume: newVolume,
            components: finalComponents,
            temp: mixture.temp + tempDelta,
            ph: avgPh,
            color: finalColor
        },
        reaction: {
            ...matchedRule,
            isBubbling: matchedRule.type === "Gas Evolution" || matchedRule.id === "r1",
            hasPrecipitate: matchedRule.type === "Precipitation"
        }
    };
};
