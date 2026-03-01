import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, FileText, FlaskConical, PlusCircle, Activity, BookOpen } from 'lucide-react';

export default function TeacherDashboard() {
    const { profile, isTeacher } = useAuthStore();
    const [classrooms, setClassrooms] = useState([]);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        if (!isTeacher) return;

        const fetchTeacherData = async () => {
            // Mock fetching logic for UI display. Actul query will need proper rules/indexing
            // const q = query(collection(db, 'classrooms'), where('teacherId', '==', profile.uid));
            // const snap = await getDocs(q);

            // Mock Data Setup for now
            setClassrooms([
                { id: 'c1', name: 'AP Chemistry Period 2', studentCount: 24, averageScore: 88 },
                { id: 'c2', name: 'Intro to Alchemy', studentCount: 15, averageScore: 92 }
            ]);

            setAssignments([
                { id: 'a1', title: 'Acid-Base Titration', dueDate: '2026-03-01', completionRate: 75, class: 'AP Chemistry Period 2' },
                { id: 'a2', title: 'Precipitation Reactions', dueDate: '2026-03-05', completionRate: 0, class: 'Intro to Alchemy' }
            ]);
        };

        fetchTeacherData();
    }, [isTeacher, profile]);

    if (!isTeacher) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-lab-dark text-white p-8">
                <BookOpen className="w-16 h-16 text-neon-purple mb-4" />
                <h1 className="text-2xl font-bold tracking-widest text-neon-purple mt-4">INSTRUCTOR ACCESS REQUIRED</h1>
                <p className="text-gray-400 mt-2">Your account does not have teaching privileges.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-lab-dark text-white p-4 md:p-8 overflow-y-auto custom-scrollbar">

            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neon-purple/20 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-neon-purple tracking-widest flex items-center gap-3">
                        <BookOpen className="w-8 h-8" />
                        INSTRUCTOR CONSOLE
                    </h1>
                    <p className="text-gray-400 font-mono mt-2 text-sm">Welcome, Prof. {profile?.name}. Manage your virtual cohorts below.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="glass-button px-4 py-2 rounded flex-1 md:flex-none flex items-center justify-center gap-2 border-neon-cyan hover:bg-neon-cyan/20 text-xs font-bold tracking-widest">
                        <PlusCircle className="w-4 h-4" /> NEW CLASS
                    </button>
                    <button className="glass-button px-4 py-2 rounded flex-1 md:flex-none flex items-center justify-center gap-2 border-neon-green hover:bg-neon-green/20 text-xs font-bold tracking-widest">
                        <FlaskConical className="w-4 h-4" /> ASSIGN LAB
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Active Classes */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2 border-b border-white/10 pb-2">
                        <Users className="w-5 h-5 text-neon-cyan" /> ACTIVE COHORTS
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {classrooms.map(cls => (
                            <div key={cls.id} className="glass-panel p-5 rounded-xl border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all group cursor-pointer">
                                <h3 className="text-lg font-bold text-neon-cyan group-hover:text-white transition-colors">{cls.name}</h3>
                                <div className="mt-4 flex justify-between text-sm font-mono text-gray-400">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 uppercase">Apprentices</span>
                                        <span className="text-white text-base">{cls.studentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-500 uppercase">Avg Score</span>
                                        <span className="text-neon-green text-base">{cls.averageScore}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2 border-b border-white/10 pb-2 mt-4">
                        <Activity className="w-5 h-5 text-neon-green" /> RECENT LAB ASSIGNMENTS
                    </h2>

                    <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                        <table className="w-full text-left font-mono text-sm">
                            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                                <tr>
                                    <th className="p-4 font-normal">EXPERIMENT</th>
                                    <th className="p-4 font-normal">COHORT</th>
                                    <th className="p-4 font-normal">DUE DATE</th>
                                    <th className="p-4 font-normal">COMPLETION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((assignment, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-bold">{assignment.title}</td>
                                        <td className="p-4 text-gray-400">{assignment.class}</td>
                                        <td className="p-4 text-neon-red">{assignment.dueDate}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-black/50 rounded-full h-2">
                                                    <div className="bg-neon-green h-2 rounded-full" style={{ width: `${assignment.completionRate}%` }}></div>
                                                </div>
                                                <span className="text-xs">{assignment.completionRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Reports & Analytics */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-6 rounded-xl border border-neon-purple/20">
                        <h2 className="text-lg font-bold text-neon-purple mb-4 tracking-widest flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            NEEDS REVIEW
                        </h2>

                        <div className="space-y-4">
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg cursor-pointer hover:bg-red-500/20 transition-colors">
                                <div className="text-xs text-red-400 font-bold mb-1">ALERT: Safety Protocol Violation</div>
                                <div className="text-sm text-gray-300">Student: Alex J. mixed HCl and NaOH without goggles in Virtual Lab.</div>
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-neon-blue font-bold">Lab Report Submitted</span>
                                    <span className="text-[10px] text-gray-500">2 mins ago</span>
                                </div>
                                <div className="text-sm text-gray-300">Sarah K. finished "Titration Baseline"</div>
                            </div>
                        </div>

                        <button className="w-full mt-4 glass-button py-2 rounded text-xs text-white bg-transparent hover:bg-white/10 transition-colors">
                            VIEW ALL ALERTS
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
