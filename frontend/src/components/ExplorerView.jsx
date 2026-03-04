import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExplorerView({ datasetData }) {
    const [selectedColumn, setSelectedColumn] = useState('');
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Extract column names from preview
    const columns = datasetData?.analysis?.preview?.length > 0
        ? Object.keys(datasetData.analysis.preview[0])
        : [];

    useEffect(() => {
        if (columns.length > 0 && !selectedColumn) {
            setSelectedColumn(columns[0]);
        }
    }, [columns]);

    useEffect(() => {
        if (!selectedColumn || !datasetData?.metadata?.filename) return;

        const fetchColumnData = async () => {
            setLoading(true);
            try {
                // Force fallback to Production Render deployment if Vercel Env Vars fail
                const API_URL = import.meta.env.VITE_API_URL || 'https://datalens-backend-1hs7.onrender.com';
                const res = await axios.get(`${API_URL}/api/feature/${datasetData.metadata.filename}/${encodeURIComponent(selectedColumn)}`);
                setChartData(res.data);
            } catch (err) {
                console.error('Failed to fetch feature data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchColumnData();
    }, [selectedColumn, datasetData]);

    if (!datasetData) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-slate-500">No dataset loaded.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Feature Explorer</h2>
                    <p className="text-slate-600">Deep dive into individual feature distributions and statistics.</p>
                </div>
                <div className="relative shadow-sm rounded-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        className="appearance-none bg-white border border-slate-300 text-slate-800 py-2 pl-10 pr-10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-w-[250px] shadow-sm cursor-pointer"
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                    >
                        {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col"
            >
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                        <p className="text-indigo-600 font-medium tracking-wide">Crunching data metrics...</p>
                    </div>
                )}

                {chartData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col"
                    >
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-mono mr-3 border border-indigo-200">
                                {chartData.type.toUpperCase()}
                            </span>
                            Distribution Profile: {selectedColumn}
                        </h3>

                        <div className="flex-[2] mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartData.type === 'numeric' ? (
                                    <AreaChart data={chartData.histogram}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="bin" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} minTickGap={20} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={chartData.barchart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#059669', fontWeight: 600 }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>

                        {chartData.type === 'numeric' && chartData.boxplot && (
                            <div className="flex-1 border-t border-slate-200 pt-6">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Statistical Five-Number Summary</h4>
                                <div className="grid grid-cols-5 gap-4">
                                    {[
                                        { label: 'Minimum', value: chartData.boxplot.min },
                                        { label: '1st Quartile', value: chartData.boxplot.q1 },
                                        { label: 'Median', value: chartData.boxplot.median },
                                        { label: '3rd Quartile', value: chartData.boxplot.q3 },
                                        { label: 'Maximum', value: chartData.boxplot.max },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center cursor-default transition-colors hover:bg-slate-100 shadow-sm"
                                        >
                                            <p className="text-slate-500 text-xs uppercase mb-1 font-medium tracking-wide">{stat.label}</p>
                                            <p className="text-emerald-600 font-mono text-xl font-bold">{Number(stat.value).toFixed(2)}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
