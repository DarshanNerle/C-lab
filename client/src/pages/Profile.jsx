import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import { User, Award, PencilLine, LogOut } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import useAuthStore from '../store/useAuthStore';
import useAIStore from '../store/useAIStore';
import LevelBadge from '../components/gamification/LevelBadge';
import { logoutUser } from '../firebase/auth';
import { safeLocalStorage, safeSessionStorage } from '../utils/safeStorage';

export default function Profile() {
    const navigate = useNavigate();
    const store = useGameStore();
    const { user, profile, clearUser } = useAuthStore();
    const scientistName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Guest Scientist';

    const handleLogout = async () => {
        try {
            await logoutUser();
            store.resetGameStats?.();
            useAIStore.getState().resetAI?.();
            clearUser();
            safeLocalStorage.clear();
            safeSessionStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="w-full max-w-4xl space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Profile</h1>
                        <p className="mt-2 text-sm text-slate-400">Manage your scientist identity and earned badges.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/profile/edit"
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                        >
                            <PencilLine className="h-4 w-4" />
                            Edit Profile
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <GlassCard className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-neon-blue bg-lab-dark shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                    <User className="h-12 w-12 text-neon-blue" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold font-outfit text-white">{scientistName}</h2>
                    {user?.email && <p className="mt-1 text-sm text-slate-400">{user.email}</p>}
                    <p className="mt-2 text-gray-300">
                        Total XP: <span className="font-mono font-bold text-neon-green">{store.xp}</span>
                    </p>
                </div>
                <div className="self-start sm:self-center">
                    <LevelBadge className="scale-110" />
                </div>
            </GlassCard>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold font-outfit text-white sm:text-xl">
                    <Award className="text-yellow-500" /> Badges Unlocked
                </h2>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {store.badges.length > 0 ? store.badges.map((badge, index) => (
                        <GlassCard key={index} className="rounded-2xl border border-yellow-500/40 bg-white/[0.03] p-4 text-center">
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500/20">
                                <Award className="text-yellow-400" />
                            </div>
                            <span className="text-xs font-semibold text-gray-200">{badge}</span>
                        </GlassCard>
                    )) : (
                        <p className="col-span-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-sm italic text-slate-400">
                            No badges earned yet. Head to the lab to unlock achievements.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
