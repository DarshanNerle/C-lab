export const LAB_REACTION_DATABASE = [
    {
        id: 'rxn_zinc_hcl',
        reactionName: 'Zinc + HCl Reaction',
        reactants: ['zinc', 'hydrochloric_acid'],
        products: ['zinc_chloride', 'hydrogen_gas'],
        equation: 'Zn + 2HCl -> ZnCl2 + H2',
        conditions: 'Room Temperature',
        colorChange: 'none',
        gas: 'Hydrogen',
        precipitate: null,
        observation: 'Bubbles form rapidly on zinc surface.',
        energy: 'Exothermic',
        baseTemperatureDelta: 12,
        speed: 'fast'
    },
    {
        id: 'rxn_agno3_nacl',
        reactionName: 'Silver Nitrate + Sodium Chloride',
        reactants: ['silver_nitrate', 'sodium_chloride'],
        products: ['silver_chloride', 'sodium_nitrate'],
        equation: 'AgNO3 + NaCl -> AgCl + NaNO3',
        conditions: 'Aqueous',
        colorChange: 'cloudy white',
        gas: null,
        precipitate: 'Silver chloride (white)',
        observation: 'White precipitate appears and settles gradually.',
        energy: 'Neutral',
        baseTemperatureDelta: 1,
        speed: 'medium'
    },
    {
        id: 'rxn_hcl_naoh',
        reactionName: 'HCl + NaOH Neutralization',
        reactants: ['hydrochloric_acid', 'sodium_hydroxide'],
        products: ['sodium_chloride', 'water'],
        equation: 'HCl + NaOH -> NaCl + H2O',
        conditions: 'Room Temperature',
        colorChange: 'none',
        gas: null,
        precipitate: null,
        observation: 'Solution warms slightly with no visible precipitate.',
        energy: 'Exothermic',
        baseTemperatureDelta: 6,
        speed: 'fast'
    },
    {
        id: 'rxn_indicator_base',
        reactionName: 'Phenolphthalein in Basic Medium',
        reactants: ['phenolphthalein', 'sodium_hydroxide'],
        products: ['pink_indicator_complex'],
        equation: 'Phenolphthalein + Base -> Pink form',
        conditions: 'pH > 8.2',
        colorChange: 'colorless to pink',
        gas: null,
        precipitate: null,
        observation: 'Solution turns pink immediately.',
        energy: 'Neutral',
        baseTemperatureDelta: 0,
        speed: 'instant'
    }
];

export const LAB_EQUIPMENT_LIBRARY = {
    beaker: { label: 'Beaker', supports: ['mix', 'volume', 'heat'] },
    burette: { label: 'Burette', supports: ['pour', 'volume'] },
    pipette: { label: 'Pipette', supports: ['pour', 'volume'] },
    flask: { label: 'Conical Flask', supports: ['mix', 'heat'] },
    test_tube: { label: 'Test Tube', supports: ['mix', 'heat'] },
    bunsen_burner: { label: 'Bunsen Burner', supports: ['heat'] },
    ph_meter: { label: 'pH Meter', supports: ['measure_ph'] },
    conductivity_meter: { label: 'Conductivity Meter', supports: ['measure_conductivity'] },
    magnetic_stirrer: { label: 'Magnetic Stirrer', supports: ['mix'] }
};
