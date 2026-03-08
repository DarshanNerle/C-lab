export const LAB_CHEMICAL_DATABASE = {
    hydrochloric_acid: {
        id: 'hydrochloric_acid',
        name: 'Hydrochloric Acid',
        formula: 'HCl',
        color: '#f7fbff',
        state: 'liquid',
        hazard: 'Corrosive',
        ph: 1,
        aliases: ['hcl', 'hydrochloric acid']
    },
    sodium_hydroxide: {
        id: 'sodium_hydroxide',
        name: 'Sodium Hydroxide',
        formula: 'NaOH',
        color: '#f8f8ff',
        state: 'liquid',
        hazard: 'Corrosive',
        ph: 13,
        aliases: ['naoh', 'sodium hydroxide']
    },
    zinc: {
        id: 'zinc',
        name: 'Zinc',
        formula: 'Zn',
        color: '#b6c0cc',
        state: 'solid',
        hazard: 'Moderate',
        aliases: ['zn', 'zinc']
    },
    copper_sulfate: {
        id: 'copper_sulfate',
        name: 'Copper Sulfate',
        formula: 'CuSO4',
        color: '#1971d8',
        state: 'liquid',
        hazard: 'Harmful',
        aliases: ['cuso4', 'copper sulfate']
    },
    potassium_permanganate: {
        id: 'potassium_permanganate',
        name: 'Potassium Permanganate',
        formula: 'KMnO4',
        color: '#6f1d9b',
        state: 'liquid',
        hazard: 'Oxidizer',
        aliases: ['kmno4', 'potassium permanganate']
    },
    potassium_dichromate: {
        id: 'potassium_dichromate',
        name: 'Potassium Dichromate',
        formula: 'K2Cr2O7',
        color: '#f08c00',
        state: 'liquid',
        hazard: 'Toxic',
        aliases: ['k2cr2o7', 'potassium dichromate']
    },
    ferric_chloride: {
        id: 'ferric_chloride',
        name: 'Ferric Chloride',
        formula: 'FeCl3',
        color: '#9c661f',
        state: 'liquid',
        hazard: 'Corrosive',
        aliases: ['fecl3', 'ferric chloride', 'iron(iii) chloride']
    },
    phenolphthalein: {
        id: 'phenolphthalein',
        name: 'Phenolphthalein',
        formula: 'C20H14O4',
        color: '#ffffff',
        state: 'liquid',
        hazard: 'Low',
        aliases: ['phenolphthalein']
    },
    silver_nitrate: {
        id: 'silver_nitrate',
        name: 'Silver Nitrate',
        formula: 'AgNO3',
        color: '#f8f8f8',
        state: 'liquid',
        hazard: 'Corrosive',
        aliases: ['agno3', 'silver nitrate']
    },
    sodium_chloride: {
        id: 'sodium_chloride',
        name: 'Sodium Chloride',
        formula: 'NaCl',
        color: '#fbfbfb',
        state: 'liquid',
        hazard: 'Low',
        aliases: ['nacl', 'sodium chloride']
    },
    iodine: {
        id: 'iodine',
        name: 'Iodine',
        formula: 'I2',
        color: '#7a3e00',
        state: 'liquid',
        hazard: 'Moderate',
        aliases: ['iodine', 'i2']
    }
};

export const COLOR_SYSTEM_RULES = [
    {
        id: 'indicator-base',
        reactants: ['phenolphthalein', 'sodium_hydroxide'],
        finalColor: '#ff4db8',
        note: 'Phenolphthalein turns pink in alkaline medium.'
    },
    {
        id: 'kmno4-fade',
        reactants: ['potassium_permanganate', 'sodium_hydroxide'],
        finalColor: '#c08adf',
        note: 'Permanganate color intensity decreases with reaction progress.'
    }
];

export const mapChemicalNameToId = (name = '') => {
    const normalized = String(name || '').trim().toLowerCase();
    if (!normalized) return null;

    const entries = Object.values(LAB_CHEMICAL_DATABASE);
    const exact = entries.find((item) => item.id === normalized || item.formula.toLowerCase() === normalized || item.name.toLowerCase() === normalized);
    if (exact) return exact.id;

    const alias = entries.find((item) => (item.aliases || []).includes(normalized));
    return alias?.id || null;
};
