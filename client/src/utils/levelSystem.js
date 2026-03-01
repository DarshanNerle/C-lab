// Simple helper to calculate current level and progress to next level
// Level Formula: Level = floor(XP / 500) + 1
// Next Level XP limit = Level * 500

export const calculateLevelInfo = (currentXP) => {
    const level = Math.floor(currentXP / 500) + 1;
    const currentLevelBaseXP = (level - 1) * 500;
    const nextLevelBaseXP = level * 500;

    const xpIntoCurrentLevel = currentXP - currentLevelBaseXP;
    const xpNeededForNext = 500;

    const progressPercent = (xpIntoCurrentLevel / xpNeededForNext) * 100;

    return {
        level,
        xpIntoCurrentLevel,
        xpNeededForNext,
        progressPercent: Math.min(Math.max(progressPercent, 0), 100)
    };
};
