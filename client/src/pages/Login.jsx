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
            setError(err.message || 'Failed to authenticate clearance')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="glass-card p-8 rounded-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 text-white">Access Lab</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-100 text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-lab-dark/50 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all"
                            placeholder="scientist@c-lab.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-lab-dark/50 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 px-6 py-3 rounded-lg font-bold bg-neon-blue text-black shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-400 text-sm">
                    Don't have clearance? <Link to="/register" className="text-neon-blue hover:underline">Register</Link>
                </p>
            </div>
        </div>
    )
}
