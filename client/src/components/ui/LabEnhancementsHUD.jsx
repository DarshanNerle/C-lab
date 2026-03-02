import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Expand, Minimize, NotepadText, Play, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { storageService } from '../../lib/storageService';
import { safeLocalStorage } from '../../utils/safeStorage';

const uiModeKey = 'clab_lab_ui_mode';

const formatTime = (seconds) => {
    const total = Math.max(0, Number(seconds) || 0);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return [hrs, mins, secs].map((value) => String(value).padStart(2, '0')).join(':');
};

export default function LabEnhancementsHUD({ contextKey = 'lab', reaction, onReplay }) {
    const { user, profile, setUser, dbSource, storageMode } = useAuthStore();

    const [elapsed, setElapsed] = useState(0);
    const [uiMode, setUiMode] = useState('beginner');
    const [notesOpen, setNotesOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [safetyMode, setSafetyMode] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const savedMode = safeLocalStorage.getItem(uiModeKey);
        setUiMode(savedMode === 'advanced' ? 'advanced' : 'beginner');

        const storedNotes = profile?.settings?.labNotes?.[contextKey] || safeLocalStorage.getItem(`clab_notes_${contextKey}`) || '';
        setNotes(storedNotes);
    }, [contextKey, profile?.settings?.labNotes]);

    useEffect(() => {
        const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const uiGuideText = useMemo(
        () => (uiMode === 'beginner' ? 'Beginner mode: safety prompts and guided hints are emphasized.' : 'Advanced mode: compact controls and faster workflow cues.'),
        [uiMode]
    );

    const updateMode = (nextMode) => {
        const normalized = nextMode === 'advanced' ? 'advanced' : 'beginner';
        setUiMode(normalized);
        safeLocalStorage.setItem(uiModeKey, normalized);
    };

    const toggleFullscreen = async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await document.documentElement.requestFullscreen();
            }
        } catch {
            // fullscreen may be unavailable in embedded contexts
        }
    };

    const saveNotes = async () => {
        safeLocalStorage.setItem(`clab_notes_${contextKey}`, notes);
        if (!user?.email) return;

        const nextSettings = {
            ...(profile?.settings || {}),
            labNotes: {
                ...(profile?.settings?.labNotes || {}),
                [contextKey]: notes
            }
        };

        setIsSavingNotes(true);
        try {
            const response = await storageService.updateUserProfile({
                email: user.email,
                name: profile?.name || user?.displayName || '',
                settings: nextSettings
            });

            if (response?.ok) {
                setUser(
                    user,
                    {
                        ...(profile || {}),
                        settings: nextSettings
                    },
                    dbSource,
                    storageMode
                );
            }
        } finally {
            setIsSavingNotes(false);
        }
    };

    return (
        <>
            <div className="pointer-events-auto absolute right-4 top-20 z-[105] w-[300px] max-w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-white shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-400">
                    <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Lab Timer</span>
                    <span className="font-mono text-cyan-200">{formatTime(elapsed)}</span>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Lab Mode Switcher</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => updateMode('beginner')}
                            className={`rounded-lg px-3 py-2 font-semibold transition ${uiMode === 'beginner' ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                        >
                            Beginner
                        </button>
                        <button
                            type="button"
                            onClick={() => updateMode('advanced')}
                            className={`rounded-lg px-3 py-2 font-semibold transition ${uiMode === 'advanced' ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                        >
                            Advanced
                        </button>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">{uiGuideText}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => setNotesOpen((prev) => !prev)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                        <NotepadText className="h-3.5 w-3.5" /> Notes
                    </button>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                        {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}
                        Fullscreen
                    </button>
                    <button
                        type="button"
                        onClick={() => setSafetyMode((prev) => !prev)}
                        className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 font-semibold transition ${safetyMode ? 'border-amber-400/40 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10'}`}
                    >
                        <ShieldAlert className="h-3.5 w-3.5" /> Safety
                    </button>
                    <button
                        type="button"
                        onClick={() => setComparisonMode((prev) => !prev)}
                        className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 font-semibold transition ${comparisonMode ? 'border-violet-400/40 bg-violet-500/10 text-violet-200' : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10'}`}
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" /> Compare
                    </button>
                </div>

                <button
                    type="button"
                    disabled={!reaction}
                    onClick={onReplay}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Play className="h-3.5 w-3.5" /> Replay Last Reaction
                </button>

                {reaction ? (
                    <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-[11px] text-emerald-100">
                        <p className="font-semibold">Reaction Insight</p>
                        <p className="mt-1">{reaction.scientificMechanism || 'Mechanism insights update after a valid reaction.'}</p>
                        <p className="mt-1 text-emerald-200">Formula: {reaction.equation}</p>
                    </div>
                ) : null}

                {comparisonMode ? (
                    <div className="mt-2 rounded-lg border border-violet-400/20 bg-violet-500/10 p-2 text-[11px] text-violet-100">
                        Comparison mode is enabled. Open 2D and 3D labs in separate tabs for side-by-side experiment review.
                    </div>
                ) : null}
            </div>

            {notesOpen ? (
                <div className="pointer-events-auto absolute bottom-24 right-4 z-[115] w-[340px] max-w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-white shadow-xl backdrop-blur-xl">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Experiment Notes</p>
                        <button type="button" onClick={() => setNotesOpen(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none"
                        placeholder="Write observations, expected outcomes, and corrections..."
                    />
                    <button
                        type="button"
                        onClick={saveNotes}
                        className="mt-2 w-full rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                </div>
            ) : null}

            <div className="fixed inset-x-3 bottom-3 z-[130] grid grid-cols-4 gap-2 rounded-2xl border border-white/15 bg-slate-950/90 p-2 text-xs backdrop-blur-xl md:hidden">
                <button
                    type="button"
                    onClick={() => setNotesOpen((prev) => !prev)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-slate-200"
                >
                    Notes
                </button>
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-slate-200"
                >
                    Screen
                </button>
                <button
                    type="button"
                    onClick={() => setComparisonMode((prev) => !prev)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-slate-200"
                >
                    Compare
                </button>
                <button
                    type="button"
                    disabled={!reaction}
                    onClick={onReplay}
                    className="rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-2 py-2 text-cyan-100 disabled:opacity-40"
                >
                    Replay
                </button>
            </div>
        </>
    );
}
