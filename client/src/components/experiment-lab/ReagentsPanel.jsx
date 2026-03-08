import React from 'react';
import { Bot, Droplets, ThermometerSun, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function ReagentsPanel({ isOpen, toggle, width = 320, aiFeedback = [] }) {
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('reagent', id);
  };

  return (
    <div className={`h-full bg-white border-l border-slate-200 flex flex-col transition-all duration-300 ${isOpen ? '' : 'w-12'}`} style={isOpen ? { width: `${width}px` } : {}}>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between min-h-[64px] bg-slate-50">
        {isOpen ? (
          <div>
            <h3 className="text-[10px] font-black uppercase text-cyan-600 tracking-widest leading-none mb-1">Materials</h3>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Reagents & Data</h2>
          </div>
        ) : (
          <button onClick={toggle} className="w-full flex justify-center py-2 text-slate-400">&lt;</button>
        )}
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 mt-4 space-y-6 scrollbar-hide">
          
          <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-700">
               <Bot className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">AI Instructor</span>
            </div>
            {aiFeedback.length > 0 ? aiFeedback.map((fb, idx) => (
                <p key={idx} className="text-[11px] text-cyan-800 bg-white/60 p-2 rounded">{fb.message}</p>
            )) : (
              <p className="text-[11px] text-cyan-800 bg-white/60 p-2 rounded">Select instruments from the left panel and drag them to the workspace. Drag reagents onto the instruments to fill them.</p>
            )}
          </div>

          {CHEMICAL_CATEGORIES.map(category => (
            <section key={category.id} className="space-y-3">
               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">{category.label}</h4>
               <div className="grid grid-cols-2 gap-2">
                 {category.items.map(chem => (
                    <div
                       key={chem.id}
                       draggable
                       onDragStart={(e) => onDragStart(e, chem.id)}
                       className="group relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="w-8 h-10 rounded-b-xl border border-slate-300 relative overflow-hidden bg-slate-50">
                         <div className="absolute left-0 right-0 bottom-0 h-8" style={{ backgroundColor: chem.color, opacity: 0.8 }} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 text-center">{chem.label}</span>
                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Droplets className="w-3 h-3 text-cyan-500" />
                      </div>
                    </div>
                 ))}
               </div>
            </section>
          ))}

          <section className="space-y-3 pt-4 border-t border-slate-100">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Data Display</h4>
             <div className="bg-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 relative">
                <ThermometerSun className="w-6 h-6 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Meter Connection</span>
                <span className="text-2xl font-mono text-emerald-400 font-black tracking-widest">ON</span>
             </div>
          </section>

        </div>
      )}
    </div>
  );
}
