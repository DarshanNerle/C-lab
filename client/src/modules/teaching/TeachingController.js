/**
 * TeachingController
 * Manages guided experiment flows and lesson sequences.
 */
export class TeachingController {
    static LESSONS = [
        {
            id: 'acid_base_101',
            title: 'Foundations of Neutralization',
            steps: [
                { task: "Add 50mL of HCl to the beaker", target: { chem: 'hydrochloric_acid', vol: 50 } },
                { task: "Add 2 drops of Phenolphthalein", target: { chem: 'phenolphthalein', vol: 1 } },
                { task: "Slowly titrate NaOH until pink", target: { chem: 'sodium_hydroxide', goal: 'reaction_trigger' } }
            ]
        },
        {
            id: 'ph_mastery',
            title: 'pH Calculation Mastery',
            steps: [
                {
                    task: "Prepare 100mL of Pure Water",
                    target: { chem: 'water', vol: 100 },
                    hints: {
                        basic: "Pour 100mL of water from the bottom shelf into the flask.",
                        intermediate: "Start with 100mL of H2O to establish a neutral baseline (pH 7.0).",
                        expert: "Calibrate your matrix by initializing with 100mL of the universal solvent."
                    }
                },
                {
                    task: "Add 20mL of HCl",
                    target: { chem: 'hydrochloric_acid', vol: 20 },
                    hints: {
                        basic: "Add the Hydrochloric Acid (HCl) to make the solution acidic.",
                        intermediate: "Introduce a strong acid (HCl) to increase [H+] concentration.",
                        expert: "Inject 20mL of 1.0M HCl. Calculate the new [H+] using C1V1 = C2V2."
                    }
                },
                {
                    task: "Neutralize with NaOH",
                    target: { chem: 'sodium_hydroxide', goal: 'ph_range', range: [6.8, 7.2] },
                    hints: {
                        basic: "Slowly add Sodium Hydroxide (NaOH) until the pH is close to 7.",
                        intermediate: "Titrate with NaOH to reach the equivalence point where pH ≈ 7.0.",
                        expert: "Precisely add OH- ions to neutralize the H3O+. Aim for exactly 1.0e-7 M concentration."
                    }
                }
            ]
        }
    ];

    static checkProgress(currentState, targetTask) {
        if (!targetTask) return false;

        // Handle pH Range goals
        if (targetTask.target.goal === 'ph_range') {
            const [min, max] = targetTask.target.range;
            return currentState.ph >= min && currentState.ph <= max;
        }

        // Handle specific chemical additions
        if (targetTask.target.chem && targetTask.target.vol) {
            const hasChem = (currentState.components || []).some(c => c.id === targetTask.target.chem && c.volume >= targetTask.target.vol);
            return hasChem;
        }

        return false;
    }
}

/**
 * TourGuide
 * Logic for the interactive assistant.
 */
export class TourGuide {
    static getAdvice(context, level = 'basic') {
        const triggers = {
            'empty_beaker': {
                basic: "Start by selecting a reagent from the bottom shelf.",
                intermediate: "Begin your synthesis by choosing an appropriate precursor.",
                expert: "Initialize the reaction matrix with your primary solute."
            },
            'reaction_detected': {
                basic: "Great job! Check your notebook for the auto-logged equation.",
                intermediate: "Reaction kinetics confirmed. Observations recorded in telemetry.",
                expert: "Molecular transformation verified. Stoichiometric data synchronized."
            }
        };

        if (triggers[context]) {
            return triggers[context][level] || triggers[context]['basic'];
        }

        return "I'm here to help with your synthesis.";
    }
}
