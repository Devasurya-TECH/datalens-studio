import React from 'react';
import { Database, Hash, FileDigit, FileType, AlertCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OverviewView({ datasetData }) {
    if (!datasetData || !datasetData.analysis || !datasetData.analysis.stats) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-slate-500">No dataset loaded. Please upload a dataset first.</p>
            </div>
        );
    }

    const stats = datasetData.analysis.stats;

    const cards = [
        { label: 'Total Rows', value: stats.rows, icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Total Columns', value: stats.cols, icon: Hash, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Numeric Features', value: stats.numeric, icon: FileDigit, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Categorical Features', value: stats.categorical, icon: FileType, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Missing Values', value: stats.missing, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Duplicate Rows', value: stats.duplicates, icon: Copy, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Dataset Overview</h2>
                <p className="text-slate-600">High-level metrics and data preview from your uploaded CSV.</p>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={idx}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            whileHover={{ scale: 1.02, translateY: -5 }}
                            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex items-center space-x-4 cursor-pointer transition-colors hover:bg-slate-50"
                        >
                            <div className={`p-4 rounded-xl ${card.bg}`}>
                                <Icon className={`w-8 h-8 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{card.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{card.value.toLocaleString()}</h3>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex-1 overflow-hidden flex flex-col"
            >
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-indigo-600" /> Data Preview
                </h3>
                <div className="overflow-auto border border-slate-200 rounded-xl flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10 shadow-sm">
                            <tr>
                                {datasetData.analysis.preview.length > 0 &&
                                    Object.keys(datasetData.analysis.preview[0]).map((key) => (
                                        <th key={key} className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {key}
                                        </th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {datasetData.analysis.preview.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    {Object.values(row).map((val, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 text-sm text-slate-600 font-mono">
                                            {val !== null ? val.toString() : <span className="text-red-600 italic bg-red-500/10 px-2 py-0.5 rounded">null</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
