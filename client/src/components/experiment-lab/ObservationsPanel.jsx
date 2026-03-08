import React, { useMemo, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, Table, LineChart, Cpu, FileCheck, AlertTriangle, XCircle, Download, Info, Trash2, Minus, X, Maximize2, Minimize2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const parseFormulaResult = (formula = '', readings = []) => {
    const cleaned = String(formula || '').replace(/\s+/g, '').toUpperCase();
    if (!cleaned || readings.length < 2) return null;

    const last = readings[readings.length - 1];
    const volume = Number(last.volumeUsed ?? last.volume ?? last.x ?? 0);
    const value = Number(last.finalReading ?? last.reading ?? last.y ?? 0);

    if (cleaned.includes('N1V1=N2V2') || cleaned.includes('M1V1=M2V2')) {
        const v1 = 10;
        const n2 = 0.1;
        const v2 = Number.isFinite(volume) && volume > 0 ? volume : 1;
        const userResult = (n2 * v2) / v1;
        const expectedResult = 0.1;
        const errorPercent = expectedResult > 0 ? Math.abs((userResult - expectedResult) / expectedResult) * 100 : 0;
        return {
            finalResult: userResult.toFixed(4),
            expectedResult: expectedResult.toFixed(4),
            userResult: userResult.toFixed(4),
            errorPercent: errorPercent.toFixed(2)
        };
    }

    if (Number.isFinite(value) && value > 0) {
        return {
            finalResult: value.toFixed(4),
            expectedResult: '',
            userResult: value.toFixed(4),
            errorPercent: '0.00'
        };
    }

    return null;
};

const normalizeReadings = (experiment, readings) => {
    if (Array.isArray(readings) && readings.length) return readings;
    if (!Array.isArray(experiment?.observationTable)) return [];

    return experiment.observationTable.map((row, idx) => ({
        id: Date.now() + idx,
        trial: idx + 1,
        volume: Number.isFinite(Number(row?.x)) ? Number(row.x) : idx + 1,
        reading: Number.isFinite(Number(row?.y)) ? Number(row.y) : 0,
        note: String(row?.note || '')
    }));
};

const ObservationsPanel = ({
    isOpen,
    toggle,
    experiment,
    readings,
    setReadings,
    aiFeedback,
    onDownloadReport,
    onSaveProgress,
    resultSummary,
    autoObservations = [],
    onUpdateAutoObservations,
    width = 340,
    onResizeStart,
    isMaximized = false,
    onMaximize
}) => {
    const [activeTab, setActiveTab] = useState('table');
    const chartRef = useRef(null);

    const normalizedRows = normalizeReadings(experiment, readings);
    const derivedResult = parseFormulaResult(experiment?.formula, normalizedRows);
    const finalResult = resultSummary || derivedResult;

    const observationTableStructure = useMemo(() => {
        if (Array.isArray(experiment?.observationTableStructure) && experiment.observationTableStructure.length) {
            return experiment.observationTableStructure;
        }

        const graphType = String(experiment?.graphType || '').toLowerCase();
        const title = String(experiment?.title || '').toLowerCase();
        
        if (graphType.includes('ph') || graphType.includes('conduct') || title.includes('titration')) {
            return [
                { key: 'trial', label: 'T' },
                { key: 'initialReading', label: 'Start (ml)' },
                { key: 'finalReading', label: 'End (ml)' },
                { key: 'volumeUsed', label: 'Used (ml)' }
            ];
        }

        return [
            { key: 'trial', label: 'No.' },
            { key: 'volume', label: 'X Value' },
            { key: 'reading', label: 'Y Value' },
            { key: 'note', label: 'Notes' }
        ];
    }, [experiment]);

    const xKey = experiment?.graph?.xAxis || (observationTableStructure.find((col) => col.key === 'volumeUsed') ? 'volumeUsed' : 'volume');
    const yKey = experiment?.graph?.yAxis || (observationTableStructure.find((col) => col.key === 'finalReading') ? 'finalReading' : (observationTableStructure.find((col) => col.key !== 'trial' && col.key !== xKey)?.key || 'reading'));

    if (!experiment) return null;

    const handleAddRow = () => {
        const newRow = { id: Date.now() };
        observationTableStructure.forEach((col) => {
            newRow[col.key] = col.key === 'trial' ? normalizedRows.length + 1 : '';
        });
        setReadings([...normalizedRows, newRow]);
    };

    const handleChange = (id, key, value) => {
        setReadings(normalizedRows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    };

    const handleDeleteRow = (id) => {
        setReadings(normalizedRows.filter((row) => row.id !== id));
    };

    const graphData = {
        labels: normalizedRows.map((r) => r[xKey] || ''),
        datasets: [
            {
                label: experiment?.graph?.title || experiment?.graphType || 'Data',
                data: normalizedRows.map((r) => Number(r[yKey]) || 0),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(255, 255, 255)'
            }
        ]
    };

    const graphOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            zoom: {
                pan: { enabled: true, mode: 'xy' },
                zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } }
            }
        }
    };

    return (
        <div
            className={`h-full bg-slate-900/40 backdrop-blur-xl border-l border-white/5 transition-all duration-500 ease-in-out flex flex-col overflow-hidden relative ${isOpen ? '' : 'w-10'} ${isMaximized ? 'w-full flex-1' : ''}`}
            style={isOpen && !isMaximized ? { width: `${width}px` } : undefined}
        >
            <div className="p-4 border-b border-white/5 flex items-center justify-between min-h-[64px] bg-slate-900/20">
                {!isOpen ? (
                    <button onClick={toggle} className="w-full h-full flex items-center justify-center hover:bg-white/5 transition-colors" title="Expand Results">
                        <ChevronLeft className="w-4 h-4 text-emerald-400" />
                    </button>
                ) : (
                    <div className="flex items-center gap-3 overflow-hidden text-nowrap">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Table className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Analytics</span>
                            <span className="font-bold truncate text-slate-100 text-xs">DATA RECORDS</span>
                        </div>
                    </div>
                )}
                {isOpen && (
                    <div className="flex items-center gap-1">
                        <button onClick={onMaximize} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-all">{isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}</button>
                        <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-all"><X className="w-3.5 h-3.5" /></button>
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10">
                        <button onClick={() => setActiveTab('table')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'table' ? 'bg-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Table</button>
                        <button onClick={() => setActiveTab('graph')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'graph' ? 'bg-cyan-500 shadow-[0_4px_15px_rgba(6,182,212,0.3)] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Graph</button>
                        <button onClick={() => setActiveTab('results')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'results' ? 'bg-purple-500 shadow-[0_4px_15px_rgba(168,85,247,0.3)] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Final</button>
                    </div>

                    {activeTab === 'table' && (
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-white/5 border-b border-white/5">
                                        <tr>
                                            {observationTableStructure.map((col) => (
                                                <th key={col.key} className="px-3 py-4 font-black text-slate-500 uppercase tracking-widest">{col.label}</th>
                                            ))}
                                            <th className="px-3 py-4 w-8" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {normalizedRows.map((row) => (
                                            <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                                                {observationTableStructure.map((col) => (
                                                    <td key={col.key} className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            value={row[col.key] ?? ''}
                                                            onChange={(e) => handleChange(row.id, col.key, e.target.value)}
                                                            className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-2 py-2 text-slate-200 focus:border-emerald-500/50 outline-none transition-all font-mono"
                                                            placeholder="..."
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-2 py-2 text-right">
                                                    <button onClick={() => handleDeleteRow(row.id)} className="p-2 hover:text-red-400 text-slate-600 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={handleAddRow} className="w-full py-4 rounded-2xl border-2 border-dashed border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-slate-500 hover:text-emerald-400 transition-all text-[10px] font-black uppercase tracking-widest">+ New Entry</button>
                            <button onClick={() => onSaveProgress?.(normalizedRows, finalResult)} className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">Submit Journal</button>
                        </div>
                    )}

                    {activeTab === 'graph' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/5 h-[340px] shadow-2xl">
                                {normalizedRows.length > 1 ? (
                                    <Line ref={chartRef} data={graphData} options={graphOptions} />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                                        <LineChart className="w-12 h-12 text-slate-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-center px-8">Awaiting Data Population</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div className="space-y-8">
                            <section className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <Cpu className="w-5 h-5 text-purple-400" />
                                    <h4 className="font-black text-slate-200 text-[10px] uppercase tracking-widest text-nowrap">Computed Values</h4>
                                </div>
                                {finalResult ? (
                                    <div className="space-y-4 font-mono">
                                        {[
                                            { label: 'Observed Reading', value: finalResult.finalResult, color: 'text-cyan-400' },
                                            { label: 'Standard Reference', value: finalResult.expectedResult || 'N/A', color: 'text-emerald-400' },
                                            { label: 'Deviation %', value: `${finalResult.errorPercent || '0.00'}%`, color: 'text-amber-400' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <span className="text-[10px] text-slate-500 uppercase">{item.label}</span>
                                                <span className={`${item.color} font-bold text-sm`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-500 text-center py-6 font-medium italic">Complete the simulation to unlock analytics.</p>
                                )}
                            </section>

                            <button onClick={() => onDownloadReport?.(normalizedRows, finalResult)} className="w-full py-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-[10px] font-black uppercase text-slate-200 hover:bg-white/10 transition-all">
                                <Download className="w-4 h-4 text-cyan-400" />
                                Export Digital Report
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isOpen && typeof onResizeStart === 'function' && !isMaximized && (
                <button
                    onMouseDown={(event) => onResizeStart(event, 'observations')}
                    className="absolute top-0 left-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-emerald-500/30 transition-colors"
                />
            )}
        </div>
    );
};

export default ObservationsPanel;
