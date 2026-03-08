import { LAB_CHEMICAL_DATABASE, mapChemicalNameToId } from '../../constants/labChemicals';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const rgbFromHex = (hex = '#ffffff') => {
    const normalized = String(hex || '').replace('#', '').trim();
    if (normalized.length !== 6) return [255, 255, 255];
    return [
        parseInt(normalized.slice(0, 2), 16),
        parseInt(normalized.slice(2, 4), 16),
        parseInt(normalized.slice(4, 6), 16)
    ];
};

const hexFromRgb = (rgb = [255, 255, 255]) => `#${rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`;

const blendHexColors = (colors = []) => {
    const valid = colors.filter(Boolean);
    if (!valid.length) return '#b9d8ff';
    const vectors = valid.map((c) => rgbFromHex(c));
    const out = [0, 1, 2].map((i) => vectors.reduce((acc, item) => acc + item[i], 0) / vectors.length);
    return hexFromRgb(out);
};

const includesAll = (source = [], expected = []) => {
    const set = new Set((source || []).map((item) => String(item || '').trim()).filter(Boolean));
    return (expected || []).every((item) => set.has(item));
};

const normalizeId = (input = '') => {
    const id = mapChemicalNameToId(input) || String(input || '').toLowerCase().trim().replace(/\s+/g, '_');
    return id;
};

const CHEMICAL_COLOR_OVERRIDES = {
    hydrochloric_acid: '#f8fbff',
    sodium_hydroxide: '#fbfdff',
    copper_sulfate: '#2f6fe5',
    potassium_permanganate: '#6f1d9b',
    potassium_dichromate: '#f08c00',
    ferric_chloride: '#a1662f',
    iodine: '#7a3e00',
    phenolphthalein: '#ffffff',
    silver_nitrate: '#fbfbff',
    sodium_chloride: '#fdfdfd'
};

const getChemicalColor = (id = '') => {
    return CHEMICAL_COLOR_OVERRIDES[id] || LAB_CHEMICAL_DATABASE[id]?.color || '#c6ddff';
};

export const PROFESSIONAL_REACTION_LIBRARY = [
    {
        id: 'rxn_zinc_hcl',
        reactionName: 'Zinc + Hydrochloric Acid',
        reactants: ['zinc', 'hydrochloric_acid'],
        products: ['zinc_chloride', 'hydrogen_gas'],
        reactionEquation: 'Zn + 2HCl -> ZnCl2 + H2',
        temperatureEffect: 'slight heat',
        gasProduced: 'Hydrogen',
        precipitate: null,
        colorChange: 'none',
        reactionSpeed: 'fast',
        energyChange: 'exothermic',
        observation: 'Bubbles of hydrogen gas evolve rapidly from the zinc surface.',
        visualEffects: { bubbles: 0.88, precipitate: 0, diffusion: 0.78, heatGlow: 0.52, foam: 0.22 }
    },
    {
        id: 'rxn_agno3_nacl',
        reactionName: 'Silver Nitrate + Sodium Chloride',
        reactants: ['silver_nitrate', 'sodium_chloride'],
        products: ['silver_chloride', 'sodium_nitrate'],
        reactionEquation: 'AgNO3 + NaCl -> AgCl(s) + NaNO3',
        temperatureEffect: 'no major change',
        gasProduced: null,
        precipitate: 'White silver chloride',
        colorChange: 'colorless to cloudy white',
        reactionSpeed: 'medium',
        energyChange: 'near neutral',
        observation: 'A white precipitate appears and gradually settles at the bottom.',
        visualEffects: { bubbles: 0.05, precipitate: 0.92, diffusion: 0.72, heatGlow: 0.08, foam: 0.03 }
    },
    {
        id: 'rxn_hcl_naoh',
        reactionName: 'Hydrochloric Acid + Sodium Hydroxide',
        reactants: ['hydrochloric_acid', 'sodium_hydroxide'],
        products: ['sodium_chloride', 'water'],
        reactionEquation: 'HCl + NaOH -> NaCl + H2O',
        temperatureEffect: 'temperature rises',
        gasProduced: null,
        precipitate: null,
        colorChange: 'none',
        reactionSpeed: 'fast',
        energyChange: 'exothermic',
        observation: 'Neutralization occurs and the solution becomes warm.',
        visualEffects: { bubbles: 0.05, precipitate: 0, diffusion: 0.86, heatGlow: 0.55, foam: 0.04 }
    },
    {
        id: 'rxn_phph_base',
        reactionName: 'Phenolphthalein in Basic Medium',
        reactants: ['phenolphthalein', 'sodium_hydroxide'],
        products: ['pink_indicator_complex'],
        reactionEquation: 'Phenolphthalein + OH- -> Pink indicator form',
        temperatureEffect: 'no major change',
        gasProduced: null,
        precipitate: null,
        colorChange: 'colorless to pink',
        reactionSpeed: 'instant',
        energyChange: 'near neutral',
        observation: 'The indicator turns pink, indicating alkaline conditions.',
        visualEffects: { bubbles: 0, precipitate: 0, diffusion: 0.75, heatGlow: 0.05, foam: 0 }
    },
    {
        id: 'rxn_na2co3_hcl',
        reactionName: 'Sodium Carbonate + Hydrochloric Acid',
        reactants: ['sodium_carbonate', 'hydrochloric_acid'],
        products: ['sodium_chloride', 'water', 'carbon_dioxide'],
        reactionEquation: 'Na2CO3 + 2HCl -> 2NaCl + H2O + CO2',
        temperatureEffect: 'mild heat',
        gasProduced: 'Carbon dioxide',
        precipitate: null,
        colorChange: 'none',
        reactionSpeed: 'fast',
        energyChange: 'slightly exothermic',
        observation: 'Effervescence occurs due to carbon dioxide evolution.',
        visualEffects: { bubbles: 0.8, precipitate: 0, diffusion: 0.8, heatGlow: 0.25, foam: 0.32 }
    },
    {
        id: 'rxn_fe_cuso4',
        reactionName: 'Iron + Copper Sulfate',
        reactants: ['iron', 'copper_sulfate'],
        products: ['iron_ii_sulfate', 'copper'],
        reactionEquation: 'Fe + CuSO4 -> FeSO4 + Cu',
        temperatureEffect: 'slight warming',
        gasProduced: null,
        precipitate: 'Copper deposit',
        colorChange: 'blue to pale green',
        reactionSpeed: 'medium',
        energyChange: 'exothermic',
        observation: 'Copper deposits and the blue solution gradually fades.',
        visualEffects: { bubbles: 0.04, precipitate: 0.72, diffusion: 0.7, heatGlow: 0.2, foam: 0 }
    }
];

const NO_REACTION_MESSAGE = 'No visible reaction occurs.';

export const normalizeChemicalList = (chemicalIds = []) => {
    return (chemicalIds || []).map((item) => normalizeId(item)).filter(Boolean);
};

export const detectProfessionalReaction = (chemicalIds = []) => {
    const normalized = normalizeChemicalList(chemicalIds);
    return PROFESSIONAL_REACTION_LIBRARY.find((rule) => includesAll(normalized, rule.reactants)) || null;
};

const getMixtureColor = ({ chemicals = [], reaction = null }) => {
    const normalized = normalizeChemicalList(chemicals);
    const baseColor = blendHexColors(normalized.map((id) => getChemicalColor(id)));
    if (!reaction) return baseColor;
    if (reaction.id === 'rxn_phph_base') return '#ff4db8';
    if (String(reaction.colorChange || '').includes('cloudy white')) return '#e9edf4';
    if (String(reaction.colorChange || '').includes('pale green')) return '#b7d9b8';
    return baseColor;
};

const reactionSpeedFactor = (speed = 'medium') => {
    const map = { instant: 1.2, fast: 1, medium: 0.72, slow: 0.45 };
    return map[String(speed || '').toLowerCase()] || 0.72;
};

const temperatureDeltaFromReaction = (reaction, heatingIntensity = 0) => {
    if (!reaction) return heatingIntensity * 4;
    const base = String(reaction.energyChange || '').includes('exo') ? 5 : 0.8;
    return base * reactionSpeedFactor(reaction.reactionSpeed) + heatingIntensity * 8;
};

export const getAIMistakeWarning = ({ chemicals = [], reaction = null, beginnerMode = true }) => {
    if (!beginnerMode || reaction || chemicals.length < 2) return null;
    return 'No compatible reaction detected. Re-check reagent pair and order of addition.';
};

export const getSafetyWarning = ({ chemicals = [] }) => {
    const ids = normalizeChemicalList(chemicals);
    if (ids.includes('hydrochloric_acid') && ids.includes('bleach')) {
        return 'Safety warning: Acid with bleach can release toxic chlorine gas.';
    }
    if (ids.includes('sulfuric_acid') && ids.includes('water')) {
        return 'Safety reminder: Always add acid to water, never water to acid.';
    }
    return null;
};

export const getInstructorMessage = ({ reaction, beginnerMode = true, heatingIntensity = 0 }) => {
    if (!reaction) {
        return beginnerMode
            ? 'Next step: add a second compatible reagent, then mix gently and observe color or gas changes.'
            : 'No reaction matched. Try a different reagent set.';
    }

    if (beginnerMode) {
        return `Theory: ${reaction.reactionName}. Observation: ${reaction.observation} Next step: ${heatingIntensity > 0.5 ? 'maintain controlled heating and log temperature.' : 'add reagent slowly and record visual changes.'}`;
    }
    return `${reaction.reactionName}. ${reaction.observation}`;
};

export const simulateProfessionalMix = ({
    chemicals = [],
    temperatureC = 25,
    heatingIntensity = 0,
    mixingStrength = 0.6,
    beginnerMode = true
}) => {
    const normalized = normalizeChemicalList(chemicals);
    const reaction = detectProfessionalReaction(normalized);
    const temperatureDelta = temperatureDeltaFromReaction(reaction, heatingIntensity);
    const nextTemperature = clamp(temperatureC + temperatureDelta, 20, 130);
    const resultColor = getMixtureColor({ chemicals: normalized, reaction });

    if (!reaction) {
        return {
            hasReaction: false,
            reaction: null,
            resultColor,
            temperatureC: clamp(temperatureC + heatingIntensity * 3, 20, 130),
            reactionSpeed: 'none',
            gasProduced: null,
            precipitate: null,
            autoObservation: NO_REACTION_MESSAGE,
            aiExplanation: NO_REACTION_MESSAGE,
            instructorMessage: getInstructorMessage({ reaction: null, beginnerMode, heatingIntensity }),
            aiMistakeWarning: getAIMistakeWarning({ chemicals: normalized, reaction: null, beginnerMode }),
            safetyWarning: getSafetyWarning({ chemicals: normalized }),
            visualProfile: {
                bubbleIntensity: 0,
                precipitateIntensity: 0,
                diffusionIntensity: clamp(0.25 + mixingStrength * 0.45, 0, 1),
                shimmerIntensity: clamp(heatingIntensity * 0.45, 0, 1),
                foamIntensity: 0
            }
        };
    }

    return {
        hasReaction: true,
        reaction,
        resultColor,
        temperatureC: nextTemperature,
        reactionSpeed: reaction.reactionSpeed,
        gasProduced: reaction.gasProduced,
        precipitate: reaction.precipitate,
        autoObservation: reaction.observation,
        aiExplanation: `${reaction.reactionName}: ${reaction.reactionEquation}. ${reaction.observation}`,
        instructorMessage: getInstructorMessage({ reaction, beginnerMode, heatingIntensity }),
        aiMistakeWarning: null,
        safetyWarning: getSafetyWarning({ chemicals: normalized }),
        visualProfile: {
            bubbleIntensity: clamp((reaction.visualEffects?.bubbles || 0) + heatingIntensity * 0.22, 0, 1),
            precipitateIntensity: clamp((reaction.visualEffects?.precipitate || 0) + (1 - mixingStrength) * 0.16, 0, 1),
            diffusionIntensity: clamp((reaction.visualEffects?.diffusion || 0.55) + mixingStrength * 0.2, 0, 1),
            shimmerIntensity: clamp((reaction.visualEffects?.heatGlow || 0.1) + heatingIntensity * 0.42, 0, 1),
            foamIntensity: clamp((reaction.visualEffects?.foam || 0) + (reaction.gasProduced ? 0.14 : 0), 0, 1)
        }
    };
};

export const buildChemicalKnowledgeBase = () => {
    return Object.values(LAB_CHEMICAL_DATABASE).map((chemical) => ({
        name: chemical.name,
        formula: chemical.formula,
        color: CHEMICAL_COLOR_OVERRIDES[chemical.id] || chemical.color,
        state: chemical.state,
        hazardLevel: chemical.hazard,
        reactivityList: PROFESSIONAL_REACTION_LIBRARY
            .filter((rule) => rule.reactants.includes(chemical.id))
            .map((rule) => rule.reactionName)
    }));
};
