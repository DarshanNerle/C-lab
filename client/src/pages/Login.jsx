import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../firebase/auth'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        
        try {
            await loginUser(email, password)
            navigate('/dashboard')
        } catch (err) {
            console.error("Login attempt failed:", err);
            if (err.message === 'FIREBASE_MISCONFIGURED' || err.code?.includes('configuration-not-found')) {
                setError('CRITICAL: Firebase Configuration Mismatch. Please ensure your .env matching IDs (App ID, Sender ID) match your API Key.')
            } else if (err.message?.includes('identitytoolkit')) {
                setError('ACTION REQUIRED: Please enable "Identity Toolkit API" in your Google Cloud Console.')
            } else {
                setError(err.message || 'Login failed. Check credentials.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="glass-card p-10 rounded-2xl w-full max-w-md border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-neon-blue/10 rounded-full flex items-center justify-center border border-neon-blue/30 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                        <span className="text-2xl">🧪</span>
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-center mb-2 text-white uppercase tracking-tight">Clearance Access</h2>
                <p className="text-gray-400 text-xs text-center mb-8 uppercase tracking-[0.2em] font-bold">C-LAB Security Protocol</p>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-100 text-[11px] leading-relaxed text-center font-bold">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-6" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Researcher Email</label>
                        <input
                            type="email"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-neon-blue transition-all"
                            placeholder="scientist@c-lab.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Lab Password</label>
                        <input
                            type="password"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-neon-blue transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 px-6 py-4 rounded-xl font-black bg-neon-blue text-black shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs">
                        {isLoading ? 'Decrypting...' : 'Initialize Session'}
                    </button>
                </form>
                
                <p className="mt-10 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    No clearance? <Link to="/register" className="text-neon-blue hover:text-white transition-colors underline underline-offset-4">Apply for Access</Link>
                </p>
            </div>
        </div>
    )
}
