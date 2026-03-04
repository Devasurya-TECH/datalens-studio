import React from 'react';
import { Upload, BarChart2, ShieldAlert, Search, Network, AlertOctagon, Wrench, Variable, Cpu, Lightbulb, Bot, Download } from 'lucide-react';

const navItems = [
    { id: 'upload', label: 'Upload Dataset', icon: Upload },
    { id: 'overview', label: 'Dataset Overview', icon: BarChart2 },
    { id: 'quality', label: 'Data Quality', icon: ShieldAlert },
    { id: 'explorer', label: 'Feature Explorer', icon: Search },
    { id: 'correlation', label: 'Correlation', icon: Network },
    { id: 'preprocessing', label: 'Preprocessing Lab', icon: Wrench },
    { id: 'ml', label: 'ML Intelligence', icon: Lightbulb },
];

export default function Sidebar({ activeTab, setActiveTab }) {
    return (
        <div className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col hidden md:flex">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
                    DataLens <span className="text-indigo-600 font-light">Studio</span>
                </h1>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">MERN + Python Engine</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${isActive
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                }`}
                        >
                            <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-200">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-500 font-mono">System Status</p>
                    <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-slate-700 font-medium">Engine Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
