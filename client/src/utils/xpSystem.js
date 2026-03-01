import useGameStore from '../store/useGameStore';

export const REWARDS = {
    COMPLETE_EXPERIMENT: 100,
    CORRECT_STEPS: 20,
    PERFECT_LAB: 50,
    DAILY_LOGIN: 10,
    RARE_REACTION: 200
};

export const awardXP = (rewardType) => {
    const amount = REWARDS[rewardType] || 0;
    if (amount > 0) {
        useGameStore.getState().addXP(amount);
    }
    return amount;
};

export const checkBadgeUnlock = (badgeName) => {
    const store = useGameStore.getState();
    if (!store.badges.includes(badgeName)) {
        store.addBadge(badgeName);
        return true; // Newly unlocked
    }
    return false;
}
