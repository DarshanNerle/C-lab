import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import { safeLocalStorage } from '../utils/safeStorage';
import useMissionStore from './useMissionStore';
import { QUIZ_QUESTIONS } from '../constants/quizData';

/**
 * useQuizStore - C-Lab 5.0 Quiz & Challenge System
 */
const useQuizStore = create(
    persist(
        (set, get) => ({
            activeQuiz: null,
            score: 0,
            streak: 0,
            maxStreak: 0,
            completedQuizzes: [],
            questions: QUIZ_QUESTIONS, // Use the real database

            // Actions
            startQuiz: (quizId) => {
                const pool = get().questions.length > 0 ? get().questions : QUIZ_QUESTIONS;
                const question = quizId
                    ? pool.find(q => q.id === quizId)
                    : pool[Math.floor(Math.random() * pool.length)];
                set({ activeQuiz: question });
            },

            submitAnswer: (answer) => {
                const { activeQuiz, streak, maxStreak } = get();
                if (!activeQuiz) return { success: false };
                const isCorrect = answer === activeQuiz.correctAnswer;

                if (isCorrect) {
                    const newStreak = streak + 1;
                    useMissionStore.getState().updateProgress('quiz', 1);

                    set(state => ({
                        score: state.score + (activeQuiz.xp * newStreak),
                        streak: newStreak,
                        maxStreak: Math.max(maxStreak, newStreak),
                        completedQuizzes: [...state.completedQuizzes, activeQuiz.id]
                        // Do NOT null activeQuiz here so user can see result
                    }));
                    return { success: true, xp: activeQuiz.xp * newStreak, streak: newStreak };
                } else {
                    set({ streak: 0 });
                    return { success: false, streak: 0 };
                }
            },

            resetQuiz: () => set({ activeQuiz: null, streak: 0 })
        }),
        {
            name: 'clab-quiz-storage',
            storage: safeLocalStorage
        }
    )
);

export default useQuizStore;
