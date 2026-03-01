/**
 * GamificationManager
 * Logic for levels, badges, and skill tree progression.
 */
export class GamificationManager {
    static RANKS = [
        { name: "Beginner", minLevel: 1 },
        { name: "Lab Apprentice", minLevel: 5 },
        { name: "Reaction Specialist", minLevel: 10 },
        { name: "Master of Elements", minLevel: 25 },
        { name: "Chemistry Legend", minLevel: 50 }
    ];

    static CALCULATE_LEVEL(xp) {
        return Math.floor(xp / 500) + 1;
    }

    static GET_RANK(level) {
        return this.RANKS.reverse().find(r => level >= r.minLevel)?.name || "Beginner";
    }

    /**
     * Checks if any achievements are unlocked
     */
    static checkAchievements(userStats) {
        const awards = [];
        if (userStats.reactionsPerformed >= 10) awards.push("Acid Master");
        if (userStats.quizStreak >= 5) awards.push("Quiz Champion");
        if (userStats.titrationPrecision >= 0.98) awards.push("Titration King");
        return awards;
    }

    /**
     * Skill Tree Cost Calculation
     */
    static getSkillCost(skillLevel) {
        return 5 * Math.pow(2, skillLevel);
    }
}

export const SKILL_TREE_DATA = {
    analytical: {
        name: "Analytical Chemistry",
        branches: ["Titration Speed", "Precision Monitoring", "Error Reduction"]
    },
    organic: {
        name: "Organic Chemistry",
        branches: ["Hydrocarbon Synthesis", "Functional Group Discovery"]
    },
    safety: {
        name: "Lab Safety Hero",
        branches: ["Corrosion Resistance", "Fume Management"]
    }
};
