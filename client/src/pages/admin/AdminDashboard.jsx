import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase/config'
import useAuthStore from '../../store/useAuthStore'
import { Users, AlertTriangle, Activity, Settings, Database } from 'lucide-react'

export default function AdminDashboard() {
    const { profile, isAdmin } = useAuthStore()
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeExperiments: 0,
        systemHealth: 'Optimal',
        databaseLoad: 'Low'
    })

    const [recentUsers, setRecentUsers] = useState([])

    useEffect(() => {
        if (!isAdmin) return;

        const fetchStats = async () => {
            try {
                // In a real app, these would be aggregated via Cloud Functions
                const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)))

                const users = []
                usersSnap.forEach(doc => {
                    users.push({ id: doc.id, ...doc.data() })
                })

                setRecentUsers(users)
                setStats(prev => ({ ...prev, totalUsers: usersSnap.size * 142 /* Mock multiplier for view */ }))

            } catch (error) {
                console.error("Error fetching admin stats:", error)
            }
        }

        fetchStats()
    }, [isAdmin])

    if (!isAdmin) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-lab-dark text-red-500 font-bold">
                <AlertTriangle className="w-12 h-12 mr-4" /> ACCESS DENIED. ADMIN CLEARANCE REQUIRED.
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-lab-dark text-white p-8 overflow-y-auto custom-scrollbar">

            <header className="mb-10 flex justify-between items-end border-b border-neon-cyan/20 pb-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-neon-cyan tracking-wider flex items-center gap-4">
                        <Settings className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
                        SYSADMIN OVERRIDE
                    </h1>
                    <p className="text-gray-400 font-mono mt-2">Welcome back, {profile?.name}. System operates normally.</p>
                </div>
                <div className="text-right font-mono">
                    <div className="text-neon-green">Status: {stats.systemHealth}</div>
                    <div className="text-xs text-gray-500">Node: us-central-1a</div>
                </div>
            </header>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="TOTAL APPRENTICES"
                    value={stats.totalUsers}
                    icon={<Users className="w-6 h-6 text-neon-blue" />}
                    color="border-neon-blue"
                />
                <StatCard
                    title="ACTIVE SESSIONS"
                    value={Math.floor(Math.random() * 50) + 12}
                    icon={<Activity className="w-6 h-6 text-neon-green" />}
                    color="border-neon-green"
                />
                <StatCard
                    title="DB LOAD"
                    value={stats.databaseLoad}
                    icon={<Database className="w-6 h-6 text-neon-purple" />}
                    color="border-neon-purple"
                />
                <StatCard
                    title="CRITICAL ALERTS"
                    value={"0"}
                    icon={<AlertTriangle className="w-6 h-6 text-neon-red" />}
                    color="border-neon-red shadow-[0_0_15px_rgba(255,0,0,0.2)]"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Registrations Log */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-neon-cyan mb-6 tracking-widest border-b border-white/10 pb-2">RECENT REGISTRATIONS</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/5">
                                    <th className="pb-3 pl-2">USER ID</th>
                                    <th className="pb-3">NAME</th>
                                    <th className="pb-3">ROLE</th>
                                    <th className="pb-3">RANK</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.length > 0 ? recentUsers.map(u => (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-2 text-gray-500">{u.id.substring(0, 8)}...</td>
                                        <td className="py-3 text-neon-blue">{u.name}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : u.role === 'teacher' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-300">{u.rank || 'N/A'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="py-4 text-center text-gray-500 italic">No recent incoming trainees detected.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-neon-purple mb-2 tracking-widest border-b border-white/10 pb-2">COMMAND PROTOCOLS</h2>

                    <button className="glass-button w-full py-4 text-left px-6 rounded-lg text-sm font-bold tracking-widest border-neon-cyan hover:bg-neon-cyan/10 transition-colors flex items-center justify-between">
                        INSPECT CHEMICAL DB
                        <Database className="w-4 h-4 text-neon-cyan" />
                    </button>

                    <button className="glass-button w-full py-4 text-left px-6 rounded-lg text-sm font-bold tracking-widest border-neon-purple hover:bg-neon-purple/10 transition-colors flex items-center justify-between">
                        MANAGE CURRICULUM
                        <Layers className="w-4 h-4 text-neon-purple" />
                    </button>

                    <button className="glass-button w-full py-4 text-left px-6 rounded-lg text-sm font-bold tracking-widest border-neon-red hover:bg-neon-red/10 transition-colors flex items-center justify-between mt-auto">
                        TRIGGER LAB LOCKDOWN
                        <AlertTriangle className="w-4 h-4 text-neon-red" />
                    </button>
                </div>
            </div>

        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className={`glass-card p-6 rounded-xl border-l-4 ${color} flex items-center justify-between`}>
            <div>
                <div className="text-gray-400 text-xs font-bold tracking-widest mb-1">{title}</div>
                <div className="text-3xl font-mono text-white">{value}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                {icon}
            </div>
        </div>
    )
}
