import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut, Beaker } from 'lucide-react';
import XPBar from '../gamification/XPBar';
import LevelBadge from '../gamification/LevelBadge';

export default function Navbar() {
    return (
        <nav className="w-full glass-panel h-20 flex items-center justify-between px-6 z-20 sticky top-0">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <Beaker className="w-8 h-8 text-neon-green group-hover:drop-shadow-[0_0_10px_rgba(57,255,20,0.8)] transition-all" />
                    <span className="text-xl font-bold font-outfit tracking-wider text-white">C-LAB 3.0</span>
                </Link>
            </div>

            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <XPBar />
            </div>

            <div className="flex items-center gap-6">
                <LevelBadge className="scale-75 origin-right lg:scale-100" />

                <div className="h-8 w-px bg-white/20 mx-2 hidden sm:block"></div>

                <button className="text-gray-400 hover:text-neon-blue transition-colors relative group">
                    <Settings className="w-6 h-6 z-10 relative group-hover:rotate-90 transition-transform duration-500" />
                </button>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
