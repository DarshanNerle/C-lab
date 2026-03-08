import React from 'react';
import { 
    FlaskConical, 
    Beaker, 
    Pipette, 
    Flame, 
    Activity, 
    Droplets, 
    ThermometerSun, 
    Search, 
    Box, 
    ChevronRight,
    CircleHelp,
    Rotate3D
} from 'lucide-react';
import { motion } from 'framer-motion';

const INSTRUMENT_CATEGORIES = [
    {
        id: 'glassware',
        label: 'Glassware',
        items: [
            { id: 'beaker', label: 'Beaker', icon: Beaker, capacity: 250 },
            { id: 'conical_flask', label: 'Conical Flask', icon: FlaskConical, capacity: 250 },
            { id: 'test_tube', label: 'Test Tube', icon: Activity, capacity: 50 },
            { id: 'burette', label: 'Burette', icon: Activity, capacity: 50 },
        ]
    },
    {
        id: 'precision',
        label: 'Precision Tools',
        items: [
            { id: 'pipette', label: 'Pipette', icon: Pipette, capacity: 25 },
            { id: 'dropper', label: 'Dropper', icon: Droplets, capacity: 5 },
        ]
    },
    {
        id: 'equipment',
        label: 'Lab Equipment',
        items: [
            { id: 'bunsen_burner', label: 'Bunsen Burner', icon: Flame, capacity: 0 },
            { id: 'magnetic_stirrer', label: 'Magnetic Stirrer', icon: Rotate3D, capacity: 0 },
            { id: 'ph_meter', label: 'pH Meter', icon: Activity, capacity: 0 },
            { id: 'thermometer', label: 'Thermometer', icon: ThermometerSun, capacity: 0 },
            { id: 'stand_clamp', label: 'Stand + Clamp', icon: Box, capacity: 0 }
        ]
    }
];

const LibraryPanel = ({ isOpen, toggle, onSpawn, width = 300 }) => {
    return (
        <div 
            className={`h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-sm ${isOpen ? '' : 'w-12'}`}
            style={isOpen ? { width: `${width}px` } : {}}
        >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between min-h-[64px]">
                {isOpen ? (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                            <Box className="w-4 h-4 text-slate-700" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Instruments</h3>
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Lab Tools</h2>
                        </div>
                    </div>
                ) : (
                    <button onClick={toggle} className="w-full flex justify-center py-2 hover:bg-slate-100 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                )}
            </div>

            {isOpen && (
                <>
                    <div className="px-4 py-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-slate-700 Transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search instruments..." 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-700 focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 scrollbar-hide">
                        {INSTRUMENT_CATEGORIES.map(category => (
                            <section key={category.id} className="space-y-3">
                                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{category.label}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {category.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => onSpawn(item.id)}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData('instrumentId', item.id)}
                                            className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all"
                                        >
                                            <div className="relative">
                                                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 group-hover:scale-110 transition-all">
                                                    <item.icon className="w-6 h-6 text-slate-700" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <CircleHelp className="w-3 h-3 text-slate-400" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase text-center leading-tight">
                                                {item.label}
                                            </span>

                                            {/* Tooltip on Hover */}
                                            <div className="absolute invisible group-hover:visible z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-2 rounded-lg bg-white border border-slate-200 shadow-lg pointer-events-none">
                                                <p className="text-[9px] text-slate-600 leading-tight">
                                                    {item.id === 'burette' ? "Precision titration tool for measuring liquid flow." : 
                                                     item.id === 'conical_flask' ? "Wide-base container perfect for mixing and titration." :
                                                     `Standard ${item.label.toLowerCase()} for chemical experiments.`}
                                                </p>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Click Any Instrument To Add</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LibraryPanel;
