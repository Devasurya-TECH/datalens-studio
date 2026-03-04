import React, { useState } from 'react';
import axios from 'axios';
import { Settings2, Plus, Play, Download, X, FlaskConical, Beaker, TableProperties, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PreprocessingView({ datasetData }) {
    const [operations, setOperations] = useState([]);
    const [col, setCol] = useState('');
    const [action, setAction] = useState('impute');
    const [method, setMethod] = useState('');

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const columns = datasetData?.analysis?.preview?.length > 0
        ? Object.keys(datasetData.analysis.preview[0])
        : [];

    const handleAddOp = () => {
        if (!col || !action || !method) return;
        setOperations([...operations, { action, column: col, params: { method } }]);
        setCol(''); setMethod('');
    };

    const removeOp = (idx) => {
        setOperations(operations.filter((_, i) => i !== idx));
    };

    const handleApply = async () => {
        if (!datasetData?.metadata?.filename) return;
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/preprocess`, {
                filename: datasetData.metadata.filename,
                operations,
                export: false
            });
            if (res.data.error) alert(res.data.error);
            else setPreview(res.data.preview);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!datasetData?.metadata?.filename) return;
        setExporting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/preprocess`, {
                filename: datasetData.metadata.filename,
                operations,
                export: true
            });
            if (res.data.download_url) {
                const original = encodeURIComponent(datasetData.metadata.originalName || 'dataset.csv');
                window.location.href = `http://localhost:5000/api/download/${res.data.download_url}?original=${original}`;
            }
        } catch (err) {
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    if (!datasetData) {
        return <div className="flex h-full items-center justify-center text-slate-500">No dataset loaded.</div>;
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="mb-2">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Preprocessing Lab</h2>
                <p className="text-slate-600">Build a sequential pipeline of data transformations and engineering steps.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col h-full shadow-xl"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <Settings2 className="w-5 h-5 mr-2 text-indigo-600" /> Pipeline Builder
                    </h3>

                    <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <label className="text-xs font-mono uppercase text-slate-600 mb-1 block">Target Column</label>
                            <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
                                value={col} onChange={e => setCol(e.target.value)}>
                                <option value="">Select Column...</option>
                                {columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-mono uppercase text-slate-600 mb-1 block">Transformation</label>
                                <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 outline-none shadow-sm cursor-pointer"
                                    value={action} onChange={e => { setAction(e.target.value); setMethod(''); }}>
                                    <option value="impute">Impute Missing</option>
                                    <option value="outliers">Handle Outliers</option>
                                    <option value="encode">Encode Categories</option>
                                    <option value="scale">Scale Dynamics</option>
                                    <option value="transform">Math Transform</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-mono uppercase text-slate-600 mb-1 block">Method</label>
                                <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 outline-none shadow-sm cursor-pointer"
                                    value={method} onChange={e => setMethod(e.target.value)}>
                                    <option value="">Select Method...</option>
                                    {action === 'impute' && <><option value="mean">Mean</option><option value="median">Median</option><option value="mode">Mode</option><option value="drop">Drop Rows</option></>}
                                    {action === 'outliers' && <><option value="remove">Remove (IQR)</option><option value="cap">Cap Bounds (IQR)</option></>}
                                    {action === 'encode' && <><option value="label">Label Encoding</option><option value="onehot">One-Hot Encoding</option></>}
                                    {action === 'scale' && <><option value="standard">Standard Scaler</option><option value="minmax">MinMax Scaler</option><option value="robust">Robust Scaler</option></>}
                                    {action === 'transform' && <><option value="log">Log(x+1)</option><option value="poly">Polynomial (^2)</option></>}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleAddOp} disabled={!col || !method} className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center">
                            <Plus className="w-4 h-4 mr-1" /> Add Step
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2 custom-scrollbar">
                        {operations.map((op, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-r-lg p-3 flex justify-between items-center text-sm shadow-sm group">
                                <div>
                                    <span className="font-bold text-slate-800">{idx + 1}. {op.action.toUpperCase()}</span>
                                    <span className="text-slate-400 mx-2">→</span>
                                    <span className="font-mono text-indigo-600">{op.column}</span>
                                    <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">{op.params.method}</span>
                                </div>
                                <button onClick={() => removeOp(idx)} className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {operations.length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                                <FlaskConical className="w-8 h-8 mb-2 opacity-80 text-indigo-400" />
                                <p className="text-sm font-medium tracking-wide">Pipeline is empty</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                        <button onClick={handleApply} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 active:scale-95">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />} Apply
                        </button>
                        <button onClick={handleExport} disabled={exporting || operations.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95">
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />} Export
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col h-full overflow-hidden shadow-xl"
                >
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <TableProperties className="w-5 h-5 mr-2 text-emerald-600" /> Transformed Preview
                    </h3>

                    <div className="flex-1 overflow-auto border border-slate-200/60 rounded-xl bg-slate-50 shadow-inner custom-scrollbar relative">
                        {!preview ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                <Beaker className="w-12 h-12 mb-4 opacity-50" />
                                <p>Apply transformation steps to view preview.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                                <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 z-10">
                                    <tr>
                                        {Object.keys(preview[0] || {}).map((key) => (
                                            <th key={key} className="px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {preview.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-100 transition-colors">
                                            {Object.values(row).map((val, colIdx) => (
                                                <td key={colIdx} className="px-4 py-3 text-sm text-slate-700 font-mono">
                                                    {typeof val === 'number' ? Number.isInteger(val) ? val : val.toFixed(4) : val?.toString() || 'null'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
