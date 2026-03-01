import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useGameStore from '../store/useGameStore'
import useMissionStore from '../store/useMissionStore'
import useSkillStore from '../store/useSkillStore'
import TourGuide from '../components/tour/TourGuide'
import { FlaskConical, BookOpen, Shield, HelpCircle, Zap, Star, CheckCircle2, Trophy } from 'lucide-react'
import { safeLocalStorage } from '../utils/safeStorage'

/**
 * C-Lab 5.0 SCIENTIST CONSOLE
 * High-performance dashboard with neural link aesthetics.
 */
export default function Dashboard() {
    const { profile, isTeacher, isAdmin } = useAuthStore()
    const { level, rank, xp } = useGameStore()
    const [showTour, setShowTour] = useState(false)

    useEffect(() => {
        const hasSeenTour = safeLocalStorage.getItem('clab_tour_seen');
        if (!hasSeenTour && !isTeacher && !isAdmin) {
            setShowTour(true);
        }
    }, [isTeacher, isAdmin])

    const handleTourComplete = () => {
        safeLocalStorage.setItem('clab_tour_seen', 'true');
        setShowTour(false);
    }

    // Determine XP progress
    const nextLevelXP = level * 100;
    const progressPercent = Math.min(100, Math.max(0, (xp / nextLevelXP) * 100));

    return (
        <div className="flex-1 flex flex-col p-8 gap-8 h-full overflow-y-auto bg-lab-dark relative text-white mesh-gradient-blue">

            {/* Animated Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {showTour && <TourGuide onComplete={handleTourComplete} />}

            <div className="flex justify-between items-end border-b border-neon-cyan/10 pb-8 relative z-10 transition-all duration-700">
                <div>
                    <h1 id="dashboard-welcome" className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple drop-shadow-[0_0_15px_rgba(0,243,255,0.3)] neon-text-glow">SCIENTIST CONSOLE</h1>
                    <p className="text-gray-500 font-mono mt-3 tracking-widest text-xs uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-flicker"></span>
                        Authorized Access: {profile?.name || 'Guest Explorer'}
                    </p>
                </div>

                <div id="gamification-stats" className="flex items-center gap-8">
                    <button onClick={() => setShowTour(true)} className="p-3 advanced-glass rounded-xl text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 group" title="Replay System Overview">
                        <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>

                    <div className="text-right flex flex-col gap-1">
                        <p className="text-[10px] text-neon-purple font-black tracking-[0.3em] uppercase flex items-center justify-end gap-2 drop-shadow-[0_0_5px_rgba(176,38,255,0.5)]">
                            <Shield className="w-3 h-3" /> RANK: {rank}
                        </p>
                        <p className="text-sm font-black mt-1 text-white flex items-center justify-end gap-3 font-mono">
                            LVL {level}
                            <span className="text-gray-600 text-[10px] tracking-widest">[{xp} XP]</span>
                            <span className="text-neon-cyan text-[10px] font-black advanced-glass px-3 py-1 rounded-full border-cyan-500/30 neon-text-glow">{useGameStore.getState().skillPoints} SP</span>
                        </p>
                        <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden mt-2 border border-white/5 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-neon-purple via-neon-cyan to-white shadow-[0_0_15px_rgba(0,243,255,1)] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-neon-cyan to-neon-purple shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:scale-105 transition-transform cursor-pointer">
                        <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                            <span className="font-black text-white text-xl tracking-tighter">{(profile?.name || 'US').substring(0, 2).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 relative z-10">
                {/* Primary Action - 3D */}
                <div className="advanced-glass p-8 rounded-[32px] flex flex-col border border-white/5 hover:border-neon-blue/40 transition-all hover:shadow-[0_20px_40px_rgba(0,102,255,0.15)] group relative overflow-hidden h-[320px]">
                    <div className="absolute -right-12 -bottom-12 opacity-5 translate-x-4 translate-y-4 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700" aria-hidden="true">
                        <Zap className="w-64 h-64 text-neon-blue" />
                    </div>
                    <div className="mb-6 w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                        <Zap className="w-6 h-6 text-neon-blue neon-text-glow" />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white mb-3 uppercase">3D Holographic Lab</h3>
                    <p className="text-gray-500 text-xs flex-1 font-mono leading-relaxed pr-10">Neural-synced environment for spatial manipulation and molecular synthesis.</p>
                    <Link to="/lab" className="advanced-glass group-hover:bg-neon-blue/20 group-hover:border-neon-blue/50 w-full py-4 rounded-2xl text-center font-black tracking-[0.2em] text-[10px] text-white transition-all uppercase drop-shadow-2xl">
                        INITIATE 3D LINK
                    </Link>
                </div>

                {/* Primary Action - 2D Precision */}
                <div className="advanced-glass p-8 rounded-[32px] flex flex-col border border-white/5 hover:border-neon-green/40 transition-all hover:shadow-[0_20px_40px_rgba(57,255,20,0.15)] group relative overflow-hidden h-[320px]">
                    <div className="absolute -right-12 -bottom-12 opacity-5 translate-x-4 translate-y-4 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700" aria-hidden="true">
                        <FlaskConical className="w-64 h-64 text-neon-green" />
                    </div>
                    <div className="mb-6 w-12 h-12 rounded-2xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
                        <FlaskConical className="w-6 h-6 text-neon-green neon-text-glow" />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white mb-3 uppercase">2D Precision Matrix</h3>
                    <p className="text-gray-500 text-xs flex-1 font-mono leading-relaxed pr-10">High-fidelity titration and stoichiometric simulation module.</p>
                    <Link to="/lab2d" className="advanced-glass group-hover:bg-neon-green/20 group-hover:border-neon-green/50 w-full py-4 rounded-2xl text-center font-black tracking-[0.2em] text-[10px] text-white transition-all uppercase drop-shadow-2xl">
                        SYNC PRECISION
                    </Link>
                </div>

                <div className="advanced-glass p-8 rounded-[32px] flex flex-col border border-white/5 hover:border-neon-cyan/40 transition-all hover:shadow-[0_20px_40px_rgba(0,243,255,0.1)] group relative overflow-hidden h-[320px]">
                    <div className="absolute -right-12 -bottom-12 opacity-5 translate-x-4 translate-y-4 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700" aria-hidden="true">
                        <Star className="w-64 h-64 text-neon-cyan" />
                    </div>
                    <div className="mb-6 w-12 h-12 rounded-2xl bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20">
                        <Star className="w-6 h-6 text-neon-cyan neon-text-glow" />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white mb-3 uppercase">Knowledge Matrix</h3>
                    <p className="text-gray-500 text-xs flex-1 font-mono leading-relaxed pr-10">Spend Adaptive Points to unlock neural upgrades and scientific breakthroughs.</p>
                    <Link to="/skills" className="advanced-glass group-hover:bg-neon-cyan/20 group-hover:border-neon-cyan/50 w-full py-4 rounded-2xl text-center font-black tracking-[0.2em] text-[10px] text-white transition-all uppercase drop-shadow-2xl">
                        ACCESS SKILLS
                    </Link>
                </div>

                {/* Missions Panel */}
                <div className="md:col-span-2 lg:col-span-3 advanced-glass p-10 rounded-[40px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h3 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-4 uppercase">
                                <Trophy className="text-yellow-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" /> Mission Objectives
                            </h3>
                            <p className="text-gray-500 text-[10px] font-mono mt-2 uppercase tracking-[0.3em]">Neural calibration via field data collection.</p>
                        </div>
                        <div className="advanced-glass px-4 py-2 rounded-full text-[10px] font-black text-neon-purple uppercase tracking-widest border-purple-500/30">
                            Resets in 14h 22m
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {useMissionStore.getState().missions.map((m) => (
                            <div key={m.id} className={`p-8 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${m.completed ? 'bg-green-500/10 border-green-500/30 shadow-[0_10px_30px_rgba(34,197,94,0.1)]' : 'advanced-glass hover:bg-white/10 border-white/5'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                                        {m.type === 'pour' && <FlaskConical className="w-5 h-5 text-blue-400" />}
                                        {m.type === 'quiz' && <Zap className="w-5 h-5 text-yellow-400" />}
                                        {m.type === 'reaction' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                    </div>
                                    <span className="text-[10px] font-black text-white px-3 py-1 bg-white/5 rounded-full border border-white/5 group-hover:bg-white/10 transition-colors">+{m.rewardXP} XP</span>
                                </div>
                                <h4 className="font-black italic text-lg text-white mb-2 leading-tight uppercase tracking-tight">{m.title}</h4>
                                <p className="text-[10px] text-gray-500 mb-6 font-mono leading-relaxed h-8">{m.description}</p>

                                <div className="relative pt-2">
                                    <div className="flex mb-3 items-center justify-between">
                                        <div>
                                            <span className={`text-[9px] font-black inline-block py-1 px-3 uppercase rounded-full tracking-widest ${m.completed ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                                {m.completed ? 'COMPLETE' : 'ACTIVE'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-white font-mono opacity-80">
                                                {m.current} / {m.target}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-white/5 border border-white/5 p-0.5">
                                        <div style={{ width: `${(m.current / m.target) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-neon-cyan rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,102,255,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {(isTeacher || isAdmin) && (
                    <div className="advanced-glass p-8 rounded-[32px] flex flex-col border border-neon-purple/20 hover:border-neon-purple/50 transition-all hover:shadow-[0_20px_40px_rgba(176,38,255,0.1)]">
                        <div className="mb-6 w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/20">
                            <Shield className="w-6 h-6 text-neon-purple neon-text-glow" />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter text-white mb-3 uppercase">Instructor Console</h3>
                        <p className="text-gray-500 text-xs flex-1 mb-6 font-mono leading-relaxed text-slate-500">System administrator node for class synchronization and protocol overrides.</p>
                        <Link to={isAdmin ? "/admin" : "/teacher"} className="advanced-glass hover:bg-neon-purple/20 hover:border-neon-purple/50 w-full py-4 rounded-xl text-center text-[10px] font-black tracking-widest text-white transition-all uppercase drop-shadow-2xl">
                            ENTER COMMAND
                        </Link>
                    </div>
                )}
            </div>

        </div>
    )
}
