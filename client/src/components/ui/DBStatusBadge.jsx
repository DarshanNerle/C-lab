import React from 'react';
import useAuthStore from '../../store/useAuthStore';

export default function DBStatusBadge() {
    const { isAuthenticated, isDbDegraded, isLocalMode } = useAuthStore();
    if (!isAuthenticated) return null;

    if (isLocalMode) {
        return (
            <div className="fixed bottom-3 left-3 z-[1200] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                Offline Mode (Local Storage)
            </div>
        );
    }

    if (isDbDegraded) {
        return (
            <div className="fixed bottom-3 left-3 z-[1200] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                Cloud Sync Degraded
            </div>
        );
    }

    return (
        <div className="fixed bottom-3 left-3 z-[1200] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
            Cloud Sync Active
        </div>
    );
}
