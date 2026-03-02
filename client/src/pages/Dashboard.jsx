import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Beaker,
    Bot,
    Bookmark,
    BarChart3,
    Clock3,
    Command,
    Download,
    Gauge,
    Goal,
    Lightbulb,
    Play,
    Search,
    Sparkles,
    Star,
    Target,
    Trophy,
    Upload,
    Zap
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useGameStore from '../store/useGameStore';
import useMissionStore from '../store/useMissionStore';
import useAIStore from '../store/useAIStore';
import useLabStore from '../store/useLabStore';
import TourGuide from '../components/tour/TourGuide';
import { safeLocalStorage } from '../utils/safeStorage';
import { REACTION_RULES } from '../constants/chemistryData';

const DAILY_CHALLENGE_KEY = 'clab_daily_challenge';
const GOALS_KEY = 'clab_goal_tracker';

const defaultGoals = {
    weeklyXpGoal: 1200,
    weeklyExperimentsTarget: 8,
    currentStreak: 0,
    lastActiveDate: ''
};

const quickActions = [
    { id: 'start-2d', title: 'Start 2D Lab', subtitle: 'Precision practice mode', icon: Beaker, to: '/lab2d' },
    { id: 'start-3d', title: 'Start 3D Lab', subtitle: 'Immersive simulation mode', icon: Sparkles, to: '/lab' },
    { id: 'ask-ai', title: 'Ask AI', subtitle: 'Tutor, exam and step modes', icon: Bot, to: '/ai-chemistry-master' }
];

const aiStudyModes = [
    { label: 'Explain Like I\'m 12', query: 'Explain this concept like I am 12 years old.' },
    { label: 'Exam Mode', query: 'Quiz me and grade me like an exam.' },
    { label: 'Step-by-Step Mode', query: 'Teach this with step by step instructions.' }
];

function getDailyChallenge() {
    const today = new Date().toISOString().slice(0, 10);
    const cachedRaw = safeLocalStorage.getItem(DAILY_CHALLENGE_KEY);
    const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

    if (cached?.date === today && cached.challenge) return cached.challenge;

    const challenge = REACTION_RULES[new Date().getDate() % REACTION_RULES.length];
    safeLocalStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify({ date: today, challenge }));
    return challenge;
}

function getRecommendation(level, recentActivity = [], discoveredReactions = []) {
    const lowProgress = recentActivity.find((item) => item.progress < 60);
    if (lowProgress) return { reason: 'Weak performance area detected', action: `Revisit ${lowProgress.title}`, to: '/lab2d' };

    if (level < 5) {
        return { reason: 'Level-based suggestion', action: 'Start with guided 2D neutralization labs', to: '/lab2d' };
    }

    if (discoveredReactions.length < 5) {
        return { reason: 'Recent activity recommendation', action: 'Run a new 3D reaction to unlock achievements', to: '/lab' };
    }

    return { reason: 'Consistency optimization', action: 'Take an AI revision challenge to reinforce concepts', to: '/ai-chemistry-master' };
}

function PerformancePanel() {
    const [fps, setFps] = useState(0);

    useEffect(() => {
        let raf = null;
        let last = performance.now();
        let frames = 0;

        const loop = (now) => {
            frames += 1;
            if (now - last >= 1000) {
                setFps(frames);
                frames = 0;
                last = now;
            }
            raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Dev Performance Monitor</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-emerald-100"><Gauge className="h-4 w-4" /> Approx FPS: {fps}</p>
        </div>
    );
}

export default function Dashboard() {
    const { profile, isTeacher, isAdmin } = useAuthStore();
    const { level, rank, xp, skillPoints, discoveredReactions, badges } = useGameStore();
    const missions = useMissionStore((state) => state.missions);
    const { fullChatHistory } = useAIStore();
    const { actionTimeline } = useLabStore();

    const [showTour, setShowTour] = useState(false);
    const [isUiLoading, setIsUiLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [goals, setGoals] = useState(defaultGoals);
    const [bookmarks, setBookmarks] = useState([]);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const hasSeenTour = safeLocalStorage.getItem('clab_tour_seen');
        if (!hasSeenTour && !isTeacher && !isAdmin) setShowTour(true);

        const goalsRaw = safeLocalStorage.getItem(GOALS_KEY);
        if (goalsRaw) {
            try {
                setGoals({ ...defaultGoals, ...JSON.parse(goalsRaw) });
            } catch {
                setGoals(defaultGoals);
            }
        }

        const bookmarksRaw = safeLocalStorage.getItem('clab_experiment_bookmarks');
        if (bookmarksRaw) {
            try {
                const next = JSON.parse(bookmarksRaw);
                setBookmarks(Array.isArray(next) ? next : []);
            } catch {
                setBookmarks([]);
            }
        }
    }, [isAdmin, isTeacher]);

    useEffect(() => {
        const timer = setTimeout(() => setIsUiLoading(false), 320);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        safeLocalStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }, [goals]);

    const handleTourComplete = () => {
        safeLocalStorage.setItem('clab_tour_seen', 'true');
        setShowTour(false);
    };

    const nextLevelXP = Math.max(level * 500, 500);
    const currentLevelBase = Math.max((level - 1) * 500, 0);
    const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevelBase) / 500) * 100));

    const completedMissions = missions.filter((mission) => mission.completed).length;
    const recentActivity = useMemo(
        () => missions.map((mission) => ({
            id: mission.id,
            title: mission.title,
            status: mission.completed ? 'Completed' : 'In Progress',
            detail: `${mission.current}/${mission.target} tasks`,
            xpValue: mission.rewardXP,
            progress: Math.round((mission.current / mission.target) * 100)
        })),
        [missions]
    );

    const dailyChallenge = useMemo(() => getDailyChallenge(), []);
    const recommendation = useMemo(() => getRecommendation(level, recentActivity, discoveredReactions), [level, recentActivity, discoveredReactions]);

    const weeklyXPProgress = Math.min(100, Math.round((xp / Math.max(goals.weeklyXpGoal, 1)) * 100));
    const experimentProgress = Math.min(100, Math.round((discoveredReactions.length / Math.max(goals.weeklyExperimentsTarget, 1)) * 100));

    const searchResults = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return [];

        const experimentMatches = REACTION_RULES
            .filter((reaction) => reaction.name.toLowerCase().includes(query))
            .slice(0, 4)
            .map((reaction) => ({ id: `rx-${reaction.id}`, type: 'Experiment', title: reaction.name, to: '/lab' }));

        const aiMatches = fullChatHistory
            .filter((entry) => String(entry.content || '').toLowerCase().includes(query))
            .slice(0, 4)
            .map((entry, index) => ({ id: `ai-${index}`, type: 'AI History', title: String(entry.content).slice(0, 70), to: '/ai-chemistry-master' }));

        return [...experimentMatches, ...aiMatches];
    }, [fullChatHistory, searchTerm]);

    const toggleBookmark = (reactionId) => {
        const next = bookmarks.includes(reactionId)
            ? bookmarks.filter((id) => id !== reactionId)
            : [...bookmarks, reactionId];
        setBookmarks(next);
        safeLocalStorage.setItem('clab_experiment_bookmarks', JSON.stringify(next));
    };

    const exportProgressPdf = () => window.print();

    const backupProfileData = () => {
        const payload = {
            profile,
            xp,
            level,
            badges,
            discoveredReactions,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'c-lab-profile-backup.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const restoreBackup = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(String(reader.result || '{}'));
                safeLocalStorage.setItem('clab_restored_backup', JSON.stringify(data));
            } catch {
                // ignore invalid backup files
            }
        };
        reader.readAsText(file);
    };

    if (isUiLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="skeleton h-44 rounded-3xl lg:col-span-2" />
                <div className="skeleton h-44 rounded-3xl" />
                <div className="skeleton h-52 rounded-3xl" />
                <div className="skeleton h-52 rounded-3xl lg:col-span-2" />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6 text-white">
            {showTour && <TourGuide onComplete={handleTourComplete} />}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">Dashboard</p>
                            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Welcome back, {profile?.name || 'Scientist'}</h1>
                            <p className="mt-2 text-sm text-slate-300">Professional workspace with adaptive recommendations, smart goals, and real-time performance insights.</p>
                        </div>
                        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">{rank}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Level</p>
                            <p className="mt-1 text-lg font-bold text-white">{level}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">XP</p>
                            <p className="mt-1 text-lg font-bold text-white">{xp}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Skill Points</p>
                            <p className="mt-1 text-lg font-bold text-white">{skillPoints}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Streak</p>
                            <p className="mt-1 text-lg font-bold text-white">{goals.currentStreak} days</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-cyan-100">XP Progress</span>
                            <span className="font-mono text-cyan-200">{xp} / {nextLevelXP}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Smart Recommendation</p>
                        <p className="mt-2 text-sm font-semibold text-white">{recommendation.action}</p>
                        <p className="mt-1 text-xs text-slate-400">{recommendation.reason}</p>
                        <Link to={recommendation.to} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20">
                            <Play className="h-3.5 w-3.5" /> Open Suggested Task
                        </Link>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Daily Challenge</p>
                        <p className="mt-1 text-sm font-semibold text-white">{dailyChallenge?.name || 'Reaction Challenge'}</p>
                        <p className="mt-1 text-xs text-slate-400">Bonus XP: {dailyChallenge?.xp || 100}</p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">XP Multiplier</p>
                        <p className="mt-1 text-lg font-bold text-amber-300">x{completedMissions >= missions.length ? '1.5' : '1.0'}</p>
                        <p className="mt-1 text-xs text-slate-400">Complete all missions for perfect-lab bonus.</p>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Quick Actions</h2>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
                        <Command className="h-3.5 w-3.5" /> Shortcuts: `L`, `A`, `D`, `Ctrl+K`
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link key={action.id} to={action.to} className="group flex min-h-28 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.06]">
                                <Icon className="h-5 w-5 text-cyan-300 transition duration-200 group-hover:text-cyan-200" />
                                <div>
                                    <h3 className="text-base font-semibold text-white">{action.title}</h3>
                                    <p className="mt-1 text-sm text-slate-400">{action.subtitle}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
                <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <h2 className="text-lg font-bold text-white">Goals & Learning Modes</h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Weekly XP Goal</p>
                            <input
                                type="number"
                                min={100}
                                value={goals.weeklyXpGoal}
                                onChange={(event) => setGoals((prev) => ({ ...prev, weeklyXpGoal: Number(event.target.value) || 100 }))}
                                className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                            />
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${weeklyXPProgress}%` }} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Weekly Experiments Target</p>
                            <input
                                type="number"
                                min={1}
                                value={goals.weeklyExperimentsTarget}
                                onChange={(event) => setGoals((prev) => ({ ...prev, weeklyExperimentsTarget: Number(event.target.value) || 1 }))}
                                className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                            />
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${experimentProgress}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {aiStudyModes.map((mode) => (
                            <Link
                                key={mode.label}
                                to="/ai-chemistry-master"
                                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200 transition hover:border-cyan-400/40"
                            >
                                <p className="font-semibold text-white">{mode.label}</p>
                                <p className="mt-1 text-xs text-slate-400">{mode.query}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <h2 className="text-lg font-bold text-white">Quick Search</h2>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search experiments or AI history"
                            className="w-full rounded-xl border border-white/15 bg-slate-950/50 py-2.5 pl-9 pr-3 text-sm text-white outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        {searchResults.length === 0 ? (
                            <p className="text-sm text-slate-500">Type to search experiment names and AI chat history.</p>
                        ) : (
                            searchResults.map((result) => (
                                <Link key={result.id} to={result.to} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40">
                                    <span className="truncate">{result.title}</span>
                                    <span className="text-[10px] uppercase tracking-wide text-slate-500">{result.type}</span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
                <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <h2 className="text-lg font-bold text-white">Recent Activity & Completion Stats</h2>
                    <div className="mt-5 space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className={`mt-0.5 rounded-full p-1.5 ${activity.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'}`}>
                                    {activity.status === 'Completed' ? <Trophy className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-white">{activity.title}</p>
                                    <p className="text-xs text-slate-400">{activity.detail}</p>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                                        <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${Math.min(100, activity.progress)}%` }} />
                                    </div>
                                </div>
                                <span className="whitespace-nowrap text-xs font-semibold text-cyan-200">+{activity.xpValue} XP</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-400">Experiments Done</p>
                            <p className="text-lg font-bold text-white">{discoveredReactions.length}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-400">Achievements</p>
                            <p className="text-lg font-bold text-white">{badges.length}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-400">Actions Logged</p>
                            <p className="text-lg font-bold text-white">{actionTimeline.length}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-400">Completion Rate</p>
                            <p className="text-lg font-bold text-white">{missions.length ? Math.round((completedMissions / missions.length) * 100) : 0}%</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <h2 className="text-lg font-bold text-white">Bookmarks & Export</h2>
                    <div className="space-y-2">
                        {REACTION_RULES.slice(0, 5).map((reaction) => (
                            <button
                                key={reaction.id}
                                onClick={() => toggleBookmark(reaction.id)}
                                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${bookmarks.includes(reaction.id)
                                    ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                                    : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20'
                                    }`}
                            >
                                <span className="truncate">{reaction.name}</span>
                                <Bookmark className="h-4 w-4" />
                            </button>
                        ))}
                    </div>

                    <button onClick={exportProgressPdf} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                        <Download className="h-4 w-4" /> Export Progress as PDF
                    </button>
                    <Link to="/report/latest" className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                        <BarChart3 className="h-4 w-4" /> Download Lab Report
                    </Link>
                    <button onClick={backupProfileData} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                        <Download className="h-4 w-4" /> Backup Profile Data
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                        <Upload className="h-4 w-4" /> Restore Backup
                    </button>
                    <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={restoreBackup} />

                    {import.meta.env.DEV ? <PerformancePanel /> : null}
                </div>
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Lab Safety Mode</p>
                    <p className="mt-1 text-sm text-slate-200">Safety warnings and hazard labels are active in labs before risky mixes.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Mistake Detection</p>
                    <p className="mt-1 text-sm text-slate-200">Prediction and warning overlays assist before probable wrong combinations.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Reaction Insights</p>
                    <p className="mt-1 text-sm text-slate-200">Each reaction includes mechanism, formula cue, and real-world context display.</p>
                </div>
            </section>
        </div>
    );
}
