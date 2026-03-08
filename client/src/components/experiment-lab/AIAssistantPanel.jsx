import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, BarChart3, FileText, Bot, Send, Activity, ChevronsRight, Droplets, Lightbulb, RotateCcw, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHEMICAL_CATEGORIES = [
  {
    id: 'acids',
    label: 'Acids',
    items: [
      { id: 'hcl', label: '0.1M HCl', color: '#f8fbff', type: 'acid', icon: Droplets },
      { id: 'h2so4', label: 'H2SO4', color: '#f6f2d5', type: 'acid', icon: Droplets }
    ]
  },
  {
    id: 'bases',
    label: 'Bases',
    items: [
      { id: 'naoh', label: '0.1M NaOH', color: '#fbfdff', type: 'base', icon: Droplets }
    ]
  },
  {
    id: 'indicators',
    label: 'Indicators',
    items: [
      { id: 'phenolphthalein', label: 'Phenolphthalein', color: '#ffffff', type: 'indicator', icon: Lightbulb },
      { id: 'methyl_orange', label: 'Methyl Orange', color: '#ffa500', type: 'indicator', icon: Lightbulb }
    ]
  },
  {
    id: 'other',
    label: 'Chemicals & Others',
    items: [
      { id: 'kmno4', label: 'KMnO4', color: '#6f1d9b', type: 'oxidizer', icon: Droplets },
      { id: 'water', label: 'Distilled Water', color: '#c4e8ff', type: 'neutral', icon: Droplets }
    ]
  }
];

export default function AIAssistantPanel({ 
    isOpen, toggle, experiment, readings, setReadings, aiFeedback, onDownloadReport, onSaveProgress, onResetExperiment, onResetInstruments, onCalculateResult, resultSummary, currentStep = 0, guidedMode = true, isMaximized, onMaximize, width = 340
}) {
    const [activeTab, setActiveTab] = useState('reagents');
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { id: 1, type: 'bot', text: "Hello! Add 10ml HCl to the flask. Now add 2 drops of phenolphthalein. Start titration using NaOH. Stop when color becomes light pink." }
    ]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Simple auto-responses to simulate AI detection
    useEffect(() => {
        if(aiFeedback?.length > 0) {
            setChatHistory(prev => [...prev, { id: Date.now(), type: 'bot', text: aiFeedback[0].message }]);
        }
    }, [aiFeedback]);

    const handleAsk = () => {
        if (!question.trim()) return;
        setChatHistory(prev => [...prev, { id: Date.now(), type: 'user', text: question }]);
        setQuestion('');
        setTimeout(() => {
            setChatHistory(prev => [...prev, { 
                id: Date.now() + 1, type: 'bot', text: "I'm monitoring the lab. Please check the color change and stop flow instantly at the endpoint." 
            }]);
        }, 800);
    };

    const onDragStart = (e, id) => {
        e.dataTransfer.setData('reagent', id);
    };

    const TABS = [
        { id: 'reagents', label: 'Reagents', icon: Droplets },
        { id: 'assistant', label: 'AI Instructor', icon: MessageSquare },
        { id: 'data', label: 'Data', icon: BarChart3 }
    ];

    return (
        <div className={`h-full bg-white border-l border-slate-200 flex flex-col transition-all duration-300 shadow-sm ${isOpen ? '' : 'w-12'}`} style={isOpen ? { width: `${width}px` } : {}}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between min-h-[64px] bg-white">
                {isOpen ? (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                            <Bot className="w-4 h-4 text-slate-700" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Reagents</h3>
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Chemicals & Measurements</h2>
                        </div>
                    </div>
                ) : (
                    <button onClick={toggle} className="w-full flex justify-center py-2 hover:bg-slate-100 transition-colors">
                        <ChevronsRight className="w-4 h-4 text-slate-600 rotate-180" />
                    </button>
                )}
            </div>

            {isOpen && (
                <>
                    <div className="flex border-b border-slate-200 bg-slate-50 p-1 mx-4 my-3 rounded-xl">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            {activeTab === 'assistant' && (
                                <motion.div key="assistant" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                                    <div className="flex-1 space-y-4 pb-4">
                                        {chatHistory.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                                                    msg.type === 'user' ? 'bg-slate-700 text-white rounded-br-none' : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-bl-none'
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-slate-200">
                                        <div className="relative group">
                                            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAsk()} placeholder="Ask instructor..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-4 pr-12 text-xs text-slate-700 outline-none focus:border-slate-400" />
                                            <button onClick={handleAsk} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600">
                                                <Send className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'reagents' && (
                                <motion.div key="reagents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                    <p className="text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">Drag reagents and drop them on target containers in the workspace.</p>
                                    {CHEMICAL_CATEGORIES.map(category => (
                                      <section key={category.id} className="space-y-3">
                                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{category.label}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                          {category.items.map(chem => (
                                            <div key={chem.id} draggable onDragStart={(e) => onDragStart(e, chem.id)} className="group relative flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-all cursor-grab active:cursor-grabbing">
                                               <div className="w-6 h-8 rounded-b-lg border border-slate-400 relative overflow-hidden bg-slate-100">
                                                  <div className="absolute left-0 right-0 bottom-0 h-6" style={{ backgroundColor: chem.color, opacity: 0.8 }} />
                                               </div>
                                               <span className="text-[9px] font-bold text-slate-700 text-center">{chem.label}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === 'data' && (
                                <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Measurements</h3>
                                        <button onClick={onDownloadReport} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 hover:text-slate-900"><FileText className="w-3.5 h-3.5" />EXPORT</button>
                                    </div>
                                    <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white">
                                        <table className="w-full text-[10px] border-collapse">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3 text-left font-black text-slate-500">Step</th>
                                                    <th className="p-3 text-left font-black text-slate-500">Vol</th>
                                                    <th className="p-3 text-left font-black text-slate-500">pH/Rd</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {readings.map((r, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                                                        <td className="p-3 text-slate-700 font-mono">{r.volumeUsed || r.volume || '0.00'}</td>
                                                        <td className="p-3 text-slate-900 font-mono">{r.ph || r.reading || '0.00'}</td>
                                                    </tr>
                                                ))}
                                                {readings.length === 0 && (
                                                    <tr><td colSpan="3" className="p-6 text-center text-slate-600 italic">No readings logged.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button onClick={onCalculateResult} className="w-full py-4 rounded-xl bg-slate-800 text-white font-black uppercase tracking-widest"><Activity className="w-4 h-4 inline mr-2" />Evaluate Result</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={onResetExperiment} className="py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2"><RotateCcw className="w-3 h-3" /> RESET</button>
                             <button onClick={onResetInstruments} className="py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2"><Trash2 className="w-3 h-3" /> CLEAN LAB</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
