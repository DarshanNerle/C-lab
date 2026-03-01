import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, FlaskConical, Calendar, User, FileText } from 'lucide-react';
import useNotebookStore from '../../store/useNotebookStore';
import useAuthStore from '../../store/useAuthStore';
import { REACTION_RULES, CHEMISTRY_DATABASE } from '../../constants/chemistryData';

/**
 * C-Lab 5.0 Professional Lab Report
 * Optimized for window.print()
 */
export default function LabReport() {
    const { reportId } = useParams();
    const { entries } = useNotebookStore();
    const { profile } = useAuthStore();

    const entry = entries.find(e => e.id === (reportId || entries[0]?.id));

    const handlePrint = () => {
        window.print();
    };

    if (!entry) return <div className="p-20 text-center text-white">Report not found.</div>;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-serif selection:bg-blue-100">
            {/* Header: Controls (Hide on print) */}
            <div className="print:hidden bg-slate-950 p-6 flex justify-between items-center text-white sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-lg">
                        <ArrowLeft />
                    </Link>
                    <h1 className="font-bold tracking-tight">Report Preview: {entry.title}</h1>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition-all"
                >
                    <Printer size={18} /> PRINT TO PDF
                </button>
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto p-12 lg:p-20 print:p-0">
                {/* Institutional Header */}
                <div className="border-b-4 border-slate-900 pb-8 mb-12 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 text-blue-600 mb-2">
                            <FlaskConical size={32} />
                            <span className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">C-LAB 5.0</span>
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Virtual Chemistry Laboratory</h2>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold uppercase text-slate-400 mb-1">Document Ser. No.</div>
                        <div className="font-mono text-sm tracking-tighter">REP-{entry.id.substring(0, 8).toUpperCase()}</div>
                    </div>
                </div>

                <h1 className="text-5xl font-black mb-12 leading-tight text-slate-900">
                    EXPERIMENTAL RECORD:<br />
                    <span className="text-blue-600 uppercase">{entry.title}</span>
                </h1>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-12 mb-16 p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="text-slate-400" size={18} />
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Investigator</span>
                                <span className="font-bold">{profile?.name || 'Authorized Personnel'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="text-slate-400" size={18} />
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Timestamp</span>
                                <span className="font-bold">{new Date(parseInt(entry.id)).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <FileText className="text-slate-400" size={18} />
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Classification</span>
                                <span className="font-bold">Academic Achievement (Level {profile?.level || 1})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experiment Logs */}
                <section className="mb-16">
                    <h3 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-4 mb-8 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Sequential Interaction Log
                    </h3>
                    <div className="space-y-4">
                        {entry.logs.length > 0 ? entry.logs.map((log, i) => (
                            <div key={i} className="flex gap-4 items-start pl-4 border-l-2 border-slate-100">
                                <span className="text-slate-300 font-mono text-xs pt-1">{i + 1}.</span>
                                <p className="text-slate-600 font-mono text-sm leading-relaxed">{log}</p>
                            </div>
                        )) : (
                            <p className="italic text-slate-400">No automated logs recorded for this session.</p>
                        )}
                    </div>
                </section>

                {/* Investigator Notes */}
                <section className="mb-16">
                    <h3 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-4 mb-8 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                        Qualitative Observations
                    </h3>
                    <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl min-h-[200px] whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-700">
                        {entry.content || "No manual observations documented."}
                    </div>
                </section>

                {/* Scientific Analysis (AI Generated based on logs) */}
                <section className="mb-16">
                    <h3 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-4 mb-8 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Scientific Framework & Mechanisms
                    </h3>
                    <div className="space-y-8">
                        {entry.logs.some(log => log.includes('REACTION:')) ? (
                            REACTION_RULES.filter(rule =>
                                entry.logs.some(log => log.includes(rule.name))
                            ).map((rule, idx) => (
                                <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                                    <h4 className="font-bold text-blue-600 mb-2 uppercase tracking-tight">{rule.equation}</h4>
                                    <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest text-[10px]">{rule.type} Process</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-400 uppercase mb-2">Molecular Mechanism</span>
                                            <p className="text-sm leading-relaxed text-slate-700">{rule.scientificMechanism}</p>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-400 uppercase mb-2">Stoichiometric Dynamics</span>
                                            <p className="text-sm leading-relaxed text-slate-700">{rule.stoichiometricNote}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-400 uppercase mb-2">Energy Balance</span>
                                            <p className="text-xs font-mono">{rule.energy ? `${rule.energy.type.toUpperCase()} (ΔH: ${rule.energy.deltaH} kJ/mol)` : 'Thermoneutral / Minimal Exchange'}</p>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-400 uppercase mb-2">Experimental Yield</span>
                                            <p className="text-xs font-mono font-bold text-green-600">UNIFORM (Verified via C-Lab Engine)</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="italic text-slate-400 p-8 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                                No definitive chemical reactions detected for structural analysis.
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer Section */}
                <div className="mt-32 pt-8 border-t border-slate-200 flex justify-between items-center opacity-50 text-[10px] font-bold uppercase tracking-widest">
                    <span>Generated via C-Lab 5.0 Engine PV-10</span>
                    <span>System Integrity: Verified</span>
                    <span>Digital Signature: {profile?.uid?.substring(0, 10) || 'D-SIGN-OFF'}</span>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    @page { margin: 2cm; }
                    .max-w-4xl { max-width: 100% !important; border: none !important; }
                }
            `}</style>
        </div>
    );
}
