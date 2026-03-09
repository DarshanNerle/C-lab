import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, X, Plus, Trash2, Download, Clock, Tag, Save,
    ChevronRight, ChevronLeft, Printer, Trash,
    Maximize, Minimize, Moon, Sun, Loader2, FlaskConical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotebookStore from '../../store/useNotebookStore';
import useAuthStore from '../../store/useAuthStore';
import { db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

/**
 * C-Lab 6.0 Advanced Virtual Lab Notebook
 * A floating, feature-rich sidebar for researcher records.
 */
export default function LabNotebook() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        entries,
        activeEntryId,
        isOpen,
        toggleNotebook,
        addEntry,
        updateActiveContent,
        updateActiveTitle,
        deleteEntry,
        setActiveEntry,
        isSaving,
        lastSaved,
        clearActiveEntry
    } = useNotebookStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Find the active entry
    const activeEntry = entries.find(e => e.id === activeEntryId) || entries[0] || {
        id: 'none',
        title: 'No Session',
        content: '',
        logs: [],
        timestamp: new Date().toISOString()
    };

    // Local state for immediate responsiveness
    const [localContent, setLocalContent] = useState(activeEntry?.content || '');
    const [localTitle, setLocalTitle] = useState(activeEntry?.title || '');

    useEffect(() => {
        if (activeEntry) {
            setLocalContent(activeEntry.content || '');
            setLocalTitle(activeEntry.title || '');
        }
    }, [activeEntryId, activeEntry.id]);

    // Character and Word Count
    const stats = {
        chars: localContent.length,
        words: localContent.trim() ? localContent.trim().split(/\s+/).length : 0
    };

    // Advanced Actions
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const logsHtml = activeEntry.logs.map(log => `<li>${log}</li>`).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Lab Report: ${localTitle}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
                        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .title { font-size: 24px; font-weight: 800; margin: 0; }
                        .meta { font-size: 12px; color: #666; margin-top: 5px; }
                        .content { line-height: 1.6; white-space: pre-wrap; font-size: 14px; }
                        .logs { margin-top: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
                        .logs h3 { font-size: 14px; text-transform: uppercase; margin-top: 0; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="title">${localTitle}</h1>
                        <div class="meta">Researcher: ${user?.displayName || 'Guest'} | ID: ${activeEntry.id} | Date: ${new Date(activeEntry.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="content">${localContent}</div>
                    ${activeEntry.logs.length > 0 ? `
                        <div class="logs">
                            <h3>Automated Reaction Logs</h3>
                            <ul>${logsHtml}</ul>
                        </div>
                    ` : ''}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleDownload = () => {
        const data = `TITLE: ${localTitle}\nDATE: ${new Date(activeEntry.timestamp).toLocaleString()}\n\nNOTES:\n${localContent}\n\nLOGS:\n${activeEntry.logs.join('\n')}`;
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${localTitle.replace(/\s+/g, '_')}_notes.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear your notes for this session? This cannot be undone.")) {
            clearActiveEntry();
            setLocalContent('');
        }
    };

    // Firebase Auto-save Logic
    useEffect(() => {
        // Essential: only sync if user has a Firebase UID and there is an active session
        if (!user || !user.uid || !activeEntryId || activeEntryId === 'none') return;

        const saveToFirebase = async () => {
            try {
                const docRef = doc(db, 'notebook_entries', `${user.uid}_${activeEntryId}`);
                await setDoc(docRef, {
                    ...activeEntry,
                    userId: user.uid,
                    lastSynced: new Date().toISOString()
                }, { merge: true });
            } catch (err) {
                console.error("Firebase Sync Error:", err);
            }
        };

        const timer = setTimeout(saveToFirebase, 2000); // 2-second debounce
        return () => clearTimeout(timer);
    }, [localContent, localTitle, user, activeEntryId]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`fixed top-0 right-0 h-full z-50 flex shadow-2xl transition-all duration-500 pointer-events-auto ${isFullscreen ? 'w-full' : (isExpanded ? 'w-[1000px]' : 'w-[450px]')} ${isDarkMode ? 'dark' : ''}`}
            >
                {/* Control Column */}
                <div className={`flex flex-col gap-4 p-4 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-100/40'} backdrop-blur-xl border-r border-white/10 z-[60]`}>
                    <button onClick={toggleNotebook} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all">
                        {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Left Panel: Entry List (Expanded only) */}
                {isExpanded && !isFullscreen && (
                    <div className={`w-80 h-full ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} backdrop-blur-2xl border-l border-white/5 p-6 overflow-y-auto`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-black text-xs uppercase tracking-[0.2em]`}>Archive</h3>
                            <button onClick={() => addEntry()} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {entries.map(entry => (
                                <button
                                    key={entry.id}
                                    onClick={() => setActiveEntry(entry.id)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${entry.id === activeEntryId
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-100'
                                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="text-sm font-bold truncate">{entry.title}</div>
                                    <div className="text-[9px] opacity-40 mt-1 uppercase font-mono">{new Date(entry.timestamp).toLocaleDateString()}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className={`flex-1 h-full flex flex-col ${isDarkMode ? 'bg-slate-900/95' : 'bg-white'} transition-colors duration-300 relative p-8`}>

                    {/* Header Info */}
                    <div className="mb-8 flex justify-between items-start pr-12">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={localTitle}
                                onChange={(e) => {
                                    setLocalTitle(e.target.value);
                                    updateActiveTitle(e.target.value);
                                }}
                                className={`bg-transparent border-none text-3xl font-black outline-none w-full ${isDarkMode ? 'text-white placeholder:text-white/10' : 'text-slate-900 placeholder:text-slate-200'}`}
                                placeholder="Session Name..."
                            />
                            <div className="flex items-center gap-4 mt-3">
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black rounded uppercase tracking-tighter">
                                    Researcher ID: {activeEntry.id}
                                </span>
                                <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase">
                                    <Clock size={10} /> {new Date(activeEntry.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Save Status Indicators */}
                        <div className="flex flex-col items-end gap-1">
                            {isSaving ? (
                                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase">
                                    <Loader2 size={12} className="animate-spin" /> Saving...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Cloud Sync Active
                                </div>
                            )}
                            {lastSaved && (
                                <div className="text-[8px] text-gray-600 font-mono uppercase">
                                    Last Backup: {new Date(lastSaved).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Editor Base */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 relative group bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                            <textarea
                                value={localContent}
                                onChange={(e) => {
                                    setLocalContent(e.target.value);
                                    updateActiveContent(e.target.value);
                                }}
                                placeholder="Begin recording your methodology and results here..."
                                className={`w-full h-full bg-transparent p-10 outline-none resize-none leading-relaxed font-sans text-lg scrollbar-hide ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
                            />

                            {/* Stats Float overlay */}
                            <div className={`absolute bottom-6 right-6 px-4 py-2 ${isDarkMode ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-md rounded-xl flex gap-4 text-[10px] font-mono font-bold ${isDarkMode ? 'text-gray-400' : 'text-slate-600'} border border-white/10`}>
                                <span>WORDS: {stats.words}</span>
                                <div className="w-px h-3 bg-white/10" />
                                <span>CHARS: {stats.chars}</span>
                            </div>
                        </div>

                        {/* Quick Action Bar */}
                        <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-2xl border border-white/5">
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-500/10 text-blue-400 rounded-xl transition-all text-[11px] font-black uppercase">
                                    <Printer size={16} /> Print Reports
                                </button>
                                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-gray-400 rounded-xl transition-all text-[11px] font-black uppercase">
                                    <Download size={16} /> Export .txt
                                </button>
                            </div>
                            <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all text-[11px] font-black uppercase">
                                <Trash size={16} /> Reset Buffer
                            </button>
                        </div>
                    </div>

                    {/* Footer Nav */}
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                            <FlaskConical size={14} className="text-neon-cyan" />
                            C-Lab Research Protocol v6.1.4
                        </div>
                        <button
                            onClick={() => deleteEntry(activeEntry.id)}
                            className="p-3 text-gray-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
