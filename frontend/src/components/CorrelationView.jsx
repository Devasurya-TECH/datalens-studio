import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export default function CorrelationView({ datasetData }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!datasetData?.metadata?.filename) return;

        const fetchCorrelation = async () => {
            setLoading(true);
            try {
                // Force fallback to Production Render deployment if Vercel Env Vars fail
                const API_URL = import.meta.env.VITE_API_URL || 'https://datalens-backend-1hs7.onrender.com';
                const res = await axios.get(`${API_URL}/api/correlation/${datasetData.metadata.filename}`);
                if (res.data.error) setError(res.data.error);
                else setData(res.data);
            } catch (err) {
                setError("Failed to fetch correlation matrix. Ensure engine is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchCorrelation();
    }, [datasetData]);

    if (!datasetData) {
        return <div className="flex h-full items-center justify-center text-slate-500">No dataset loaded.</div>;
    }

    if (loading) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-indigo-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Computing massive tensor correlations...</p>
            </div>
        );
    }

    if (error) {
        return <div className="flex h-full items-center justify-center text-red-500">{error}</div>;
    }

    if (!data || !data.matrix) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Correlation Insights</h2>
                <p className="text-slate-600">Discover linear relationships between numeric features.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col min-h-[500px] shadow-xl"
                >
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Interactive Heatmap</h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="x"
                                    type="category"
                                    name="Feature X"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis
                                    dataKey="y"
                                    type="category"
                                    name="Feature Y"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    interval={0}
                                />
                                <ZAxis dataKey="value" type="number" range={[100, 800]} name="Correlation" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#475569', fontWeight: 600 }}
                                    formatter={(value, name, props) => {
                                        if (name === 'Correlation') return [value.toFixed(2), name];
                                        return [value, name];
                                    }}
                                />
                                <Scatter data={data.matrix}>
                                    {data.matrix.map((entry, index) => {
                                        const val = entry.value;
                                        // Color scale: Red (negative) to Blue (positive)
                                        let fill = '#94a3b8'; // neutral
                                        if (val > 0.5) fill = '#4f46e5';
                                        else if (val > 0.1) fill = '#818cf8';
                                        else if (val < -0.5) fill = '#e11d48';
                                        else if (val < -0.1) fill = '#fb7185';

                                        return <Cell key={`cell-${index}`} fill={fill} opacity={0.8 + Math.abs(val) * 0.2} />;
                                    })}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col overflow-hidden shadow-sm"
                >
                    <h3 className="text-xl font-bold text-slate-900 mb-6">High Correlation Alerts</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {data.high_corr.length === 0 ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                                <p className="text-emerald-700 text-sm">No redundant features detected. The dataset features are nicely independent.</p>
                            </div>
                        ) : (
                            data.high_corr.map((alert, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white border border-rose-200 rounded-xl p-4 flex items-start flex-col transition-colors hover:border-rose-300 cursor-default shadow-sm"
                                >
                                    <div className="flex items-center text-rose-600 mb-2">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        <span className="font-bold text-sm">Collinearity Warning</span>
                                    </div>
                                    <div className="w-full bg-slate-50 rounded p-2 mb-2 font-mono text-xs text-slate-700 flex justify-between items-center border border-slate-200">
                                        <span className="truncate max-w-[40%]">{alert.col1}</span>
                                        <span className="text-slate-400">↔</span>
                                        <span className="truncate max-w-[40%] text-right">{alert.col2}</span>
                                    </div>
                                    <p className="text-rose-600 text-xs text-center w-full font-bold bg-rose-50 py-1 rounded">r = {alert.val.toFixed(2)}</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
