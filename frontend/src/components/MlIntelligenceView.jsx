import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Cpu, Lightbulb, Target, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MlIntelligenceView({ datasetData }) {
    const [insight, setInsight] = useState(null);
    const [mlData, setMlData] = useState(null);
    const [target, setTarget] = useState('');
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [loadingMl, setLoadingMl] = useState(false);

    const columns = datasetData?.analysis?.preview?.length > 0
        ? Object.keys(datasetData.analysis.preview[0])
        : [];

    useEffect(() => {
        if (!datasetData?.metadata?.filename) return;

        const fetchInsights = async () => {
            setLoadingInsight(true);
            try {
                // Force fallback to Production Render deployment if Vercel Env Vars fail
                const API_URL = import.meta.env.VITE_API_URL || 'https://datalens-backend-1hs7.onrender.com';
                const res = await axios.get(`${API_URL}/api/insights/${datasetData.metadata.filename}`);
                setInsight(res.data.insight);
            } catch (err) {
                console.error('Failed to fetch AI insights');
            } finally {
                setLoadingInsight(false);
            }
        };

        fetchInsights();
    }, [datasetData]);

    const handleDetect = async () => {
        if (!target) return;
        setLoadingMl(true);
        setMlData(null);
        try {
            // Force fallback to Production Render deployment if Vercel Env Vars fail
            const API_URL = import.meta.env.VITE_API_URL || 'https://datalens-backend-1hs7.onrender.com';
            const res = await axios.get(`${API_URL}/api/ml-detect/${datasetData.metadata.filename}/${encodeURIComponent(target)}`);
            setMlData(res.data);
        } catch (err) {
            console.error('Failed to fetch ML detection');
        } finally {
            setLoadingMl(false);
        }
    };

    if (!datasetData) {
        return <div className="flex h-full items-center justify-center text-slate-500">No dataset loaded.</div>;
    }

    return (
        <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-10">

            {/* AI Insights Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl p-8 relative overflow-hidden shadow-xl"
            >
                <div className="absolute -top-10 -right-10 opacity-5">
                    <Bot className="w-48 h-48 text-indigo-600" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                        <Bot className="w-6 h-6 mr-3 text-indigo-600" /> AI Dataset Insights
                    </h2>
                    {loadingInsight ? (
                        <div className="flex items-center text-indigo-600 font-medium">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating natural language insights...
                        </div>
                    ) : (
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            "{insight || 'No insights available.'}"
                        </p>
                    )}
                </div>
            </motion.div>

            {/* ML Problem Detection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
            >
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                    <Cpu className="w-6 h-6 mr-3 text-emerald-600" /> ML Problem Detection
                </h2>
                <p className="text-slate-600 mb-6">Select your target variable and the AI engine will determine the task type.</p>

                <div className="flex items-center space-x-4 mb-8">
                    <div className="relative flex-1 max-w-sm">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            className="w-full appearance-none bg-white border border-slate-300 shadow-sm text-slate-900 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        >
                            <option value="">Select Target Variable...</option>
                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleDetect}
                        disabled={!target || loadingMl}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
                    >
                        {loadingMl ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Run Analysis'}
                    </button>
                </div>

                {mlData && !mlData.error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-center shadow-sm">
                            <p className="text-slate-500 text-sm uppercase tracking-wider mb-2 font-bold">Detected Architecture</p>
                            <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">
                                {mlData.problem_type}
                            </h3>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                            <Lightbulb className="w-5 h-5 mr-3 text-amber-500" /> Recommended Models
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mlData.suggestions.map((model, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-colors rounded-2xl p-5 group cursor-default shadow-sm"
                                >
                                    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{model.name}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{model.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
