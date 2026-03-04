import React from 'react';
import { AlertCircle, FileWarning, HelpCircle, Activity, Copy } from 'lucide-react';

export default function QualityView({ datasetData }) {
    if (!datasetData || !datasetData.analysis || !datasetData.analysis.quality) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-slate-500">No dataset loaded. Please upload a dataset to view quality metrics.</p>
            </div>
        );
    }

    const { quality, stats } = datasetData.analysis;

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Data Quality Analysis</h2>
                <p className="text-slate-600">Automated detection of missing values, anomalies, and structural issues.</p>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar pb-10">

                {/* Missing Values Alert */}
                <div className={`border rounded-2xl p-6 ${quality.missing.length > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                    <div className="flex items-start">
                        <div className={`p-3 rounded-xl mr-4 ${quality.missing.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold mb-1 ${quality.missing.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                Missing Values
                            </h3>
                            {quality.missing.length > 0 ? (
                                <>
                                    <p className="text-slate-700 text-sm mb-4">
                                        Detected missing data in {quality.missing.length} features out of {stats.rows} total rows.
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {quality.missing.map((item, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-3 flex justify-between items-center border border-slate-200 shadow-sm">
                                                <span className="font-mono text-xs text-slate-700 truncate mr-2">{item.column}</span>
                                                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">{item.count} nulls</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-emerald-400/80 text-sm">No missing values detected in the dataset. Excellent!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Duplicates Alert */}
                <div className={`border rounded-2xl p-6 ${stats.duplicates > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                    <div className="flex items-start">
                        <div className={`p-3 rounded-xl mr-4 ${stats.duplicates > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            <Copy className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold mb-1 ${stats.duplicates > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                Duplicate Rows
                            </h3>
                            <p className={stats.duplicates > 0 ? "text-slate-700 text-sm" : "text-emerald-700 font-medium text-sm"}>
                                {stats.duplicates > 0
                                    ? `Found ${stats.duplicates.toLocaleString()} duplicate rows. These could cause data leakage or skewed ML metrics.`
                                    : 'Zero duplicate rows detected. The dataset is structurally distinct.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Highly Skewed Features */}
                <div className={`border rounded-2xl p-6 ${quality.skewed.length > 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                    <div className="flex items-start">
                        <div className={`p-3 rounded-xl mr-4 ${quality.skewed.length > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold mb-1 ${quality.skewed.length > 0 ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                Skewed Features
                            </h3>
                            {quality.skewed.length > 0 ? (
                                <>
                                    <p className="text-slate-700 text-sm mb-4">
                                        Found {quality.skewed.length} features with a high skew factor (|skew| &gt; 1.0). Standardizing or log-transforming these features is highly recommended.
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {quality.skewed.map((item, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-3 flex justify-between items-center border border-slate-200 shadow-sm">
                                                <span className="font-mono text-xs text-slate-700 truncate mr-2">{item.column}</span>
                                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded tracking-widest">{item.skew > 0 ? '+' : ''}{item.skew.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-emerald-400/80 text-sm">All numeric features have an acceptable skewness distribution.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Constant Columns */}
                {quality.constant.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-start">
                            <div className="p-3 rounded-xl mr-4 bg-slate-200 text-slate-600">
                                <FileWarning className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Constant Columns Detected</h3>
                                <p className="text-slate-600 text-sm mb-4">
                                    These columns contain only a single unique value and offer zero variance for ML models. They should be dropped.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {quality.constant.map((col, idx) => (
                                        <span key={idx} className="bg-white px-3 py-1.5 rounded-md text-xs font-mono text-rose-600 border border-slate-200 shadow-sm">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
