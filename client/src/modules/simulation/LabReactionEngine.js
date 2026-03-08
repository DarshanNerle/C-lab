import { LAB_CHEMICAL_DATABASE, COLOR_SYSTEM_RULES, mapChemicalNameToId } from '../../constants/labChemicals';
import { LAB_REACTION_DATABASE } from '../../constants/labReactions';
import { simulateProfessionalMix } from './professionalChemistryEngine';

const SPEED_TO_FACTOR = {
    instant: 1,
    fast: 0.85,
    medium: 0.55,
    slow: 0.3
};

const asSet = (arr = []) => new Set((Array.isArray(arr) ? arr : []).filter(Boolean));

const rgbFromHex = (hex = '#ffffff') => {
    const value = String(hex).replace('#', '').trim();
    if (value.length !== 6) return [255, 255, 255];
    return [
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16)
    ];
};

const blendHex = (colors = []) => {
    if (!colors.length) return '#b9d8ff';
    if (colors.length === 1) return colors[0];
    const rgb = colors.map((item) => rgbFromHex(item));
    const out = [0, 1, 2].map((idx) => Math.round(rgb.reduce((acc, cur) => acc + cur[idx], 0) / rgb.length));
    return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

const includesAll = (source = [], expected = []) => {
    const sourceSet = asSet(source);
    return expected.every((item) => sourceSet.has(item));
};

const getColorRule = (chemicalIds = []) => COLOR_SYSTEM_RULES.find((rule) => includesAll(chemicalIds, rule.reactants));

const getBaseColor = (chemicalIds = []) => blendHex(
    chemicalIds.map((id) => LAB_CHEMICAL_DATABASE[id]?.color).filter(Boolean)
);

export const resolveChemicalIds = (chemicals = []) => chemicals
    .map((item) => mapChemicalNameToId(item) || item)
    .map((id) => String(id || '').trim().toLowerCase())
    .filter(Boolean);

export const detectReaction = (chemicalIds = []) => LAB_REACTION_DATABASE.find((rule) => includesAll(chemicalIds, rule.reactants)) || null;
export const getReactionSpeedFactor = (speed = 'medium') => SPEED_TO_FACTOR[speed] || SPEED_TO_FACTOR.medium;

export const simulateLabMixing = ({ chemicals = [], temperatureC = 25, heatingIntensity = 0, mixingStrength = 0.5 }) => {
    const professionalResult = simulateProfessionalMix({
        chemicals,
        temperatureC,
        heatingIntensity,
        mixingStrength,
        beginnerMode: true
    });
    if (professionalResult?.reaction || professionalResult?.aiMistakeWarning) {
        return {
            ...professionalResult,
            gas: professionalResult.gasProduced || null,
            reaction: professionalResult.reaction
                ? {
                    ...professionalResult.reaction,
                    reactionName: professionalResult.reaction.reactionName,
                    equation: professionalResult.reaction.reactionEquation,
                    gas: professionalResult.reaction.gasProduced || null,
                    speed: professionalResult.reaction.reactionSpeed
                }
                : null
        };
    }

    const chemicalIds = resolveChemicalIds(chemicals);
    const reaction = detectReaction(chemicalIds);
    const colorRule = getColorRule(chemicalIds);

    const baseColor = getBaseColor(chemicalIds);
    const finalColor = colorRule?.finalColor || (reaction?.colorChange && reaction.colorChange !== 'none' ? '#dbeafe' : baseColor);

    if (!reaction) {
        return {
            hasReaction: false,
            reaction: null,
            resultColor: finalColor,
            temperatureC,
            gas: null,
            precipitate: null,
            reactionSpeed: 'none',
            autoObservation: 'No visible reaction.',
            aiExplanation: 'No compatible reaction was detected for the selected chemicals under current conditions.',
            visualProfile: {
                bubbleIntensity: 0,
                precipitateIntensity: 0,
                diffusionIntensity: Math.max(0.2, mixingStrength),
                shimmerIntensity: Math.max(0, heatingIntensity * 0.6)
            }
        };
    }

    const speedFactor = getReactionSpeedFactor(reaction.speed);
    const heatBoost = heatingIntensity * 8;
    const delta = Number(reaction.baseTemperatureDelta || 0) * speedFactor + heatBoost;
    const nextTemp = Math.max(20, Math.min(120, temperatureC + delta));

    return {
        hasReaction: true,
        reaction,
        resultColor: finalColor,
        temperatureC: nextTemp,
        gas: reaction.gas,
        precipitate: reaction.precipitate,
        reactionSpeed: reaction.speed,
        autoObservation: reaction.observation,
        aiExplanation: `${reaction.reactionName}: ${reaction.equation}. ${reaction.observation}`,
        visualProfile: {
            bubbleIntensity: reaction.gas ? Math.min(1, 0.45 + speedFactor * 0.5 + heatingIntensity * 0.25) : 0,
            precipitateIntensity: reaction.precipitate ? Math.min(1, 0.55 + (1 - speedFactor) * 0.35 + mixingStrength * 0.2) : 0,
            diffusionIntensity: Math.max(0.35, speedFactor),
            shimmerIntensity: Math.max(0.15, heatingIntensity + (reaction.energy === 'Exothermic' ? 0.25 : 0))
        }
    };
};
