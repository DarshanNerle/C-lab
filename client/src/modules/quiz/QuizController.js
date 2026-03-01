import { QUIZ_QUESTIONS } from '../../constants/quizData';

/**
 * QuizController
 * Manages quiz states, scoring, and adaptive difficulty.
 */
export class QuizController {
    constructor() {
        this.currentStreak = 0;
        this.score = 0;
        this.difficulty = 'easy';
    }

    /**
     * Filters questions based on player level and performance
     */
    static getQuestions(mode, count = 10, playerLevel = 1) {
        let pool = QUIZ_QUESTIONS;

        if (mode === 'titration') {
            pool = pool.filter(q => q.category === 'Titration' || q.category === 'Molarity');
        }

        // Shuffle and take count
        return pool.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    static calculateXP(baseXP, streak, timeBonus) {
        const multiplier = 1 + (streak * 0.1);
        return Math.floor((baseXP + timeBonus) * multiplier);
    }

    /**
     * logic for multiplayer battle
     */
    static processBattleSubmission(p1_answer, p2_answer, correct_answer) {
        const results = {
            p1: p1_answer === correct_answer,
            p2: p2_answer === correct_answer,
            faster: null // client-side logic would determine timestamp
        };
        return results;
    }

    /**
     * Adaptive Difficulty Logic
     */
    static updateDifficulty(history) {
        const recentAccuracy = history.slice(-5).filter(h => h.correct).length / 5;
        if (recentAccuracy > 0.8) return 'hard';
        if (recentAccuracy > 0.5) return 'medium';
        return 'easy';
    }
}
