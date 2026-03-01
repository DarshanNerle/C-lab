import React from 'react'
import { Link } from 'react-router-dom'
import { Beaker } from 'lucide-react'

export default function Home() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="glass-card p-12 rounded-2xl max-w-2xl w-full flex flex-col items-center">
                <Beaker className="w-24 h-24 text-neon-green mb-6 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
                <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-neon-green to-neon-blue">
                    C-Lab 3.0
                </h1>
                <p className="text-gray-300 text-lg mb-8 max-w-md">
                    A production-level virtual chemistry lab with real-time 3D reactions, gamification, and stunning glass UI.
                </p>
                <div className="flex gap-4">
                    <Link to="/login" className="px-8 py-3 rounded-full font-semibold border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)]">
                        Login
                    </Link>
                    <Link to="/dashboard" className="px-8 py-3 rounded-full font-semibold glass-button text-white">
                        Guest Area
                    </Link>
                </div>
            </div>
        </div>
    )
}
