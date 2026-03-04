import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function UploadView({ setDatasetData, setActiveTab }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setDatasetData(response.data);
            setActiveTab('overview');
        } catch (err) {
            console.error(err);
            setError('Failed to upload file. Ensure backend and engine are running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-12 w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <h2 className="text-3xl font-bold mb-4 text-slate-900">Upload Dataset</h2>
                <p className="text-slate-600 mb-8">Select a CSV file to begin your analysis journey.</p>

                <div className={`border-2 border-dashed ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'} rounded-2xl p-12 transition-all cursor-pointer group mb-8`}>
                    <input type="file" className="hidden" id="file-upload" accept=".csv" onChange={handleFileChange} disabled={loading} />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        {file ? (
                            <>
                                <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                                </div>
                                <span className="text-emerald-400 font-medium text-lg mb-1 truncate max-w-[200px]">{file.name}</span>
                                <span className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                                </div>
                                <span className="text-indigo-400 font-medium text-lg mb-1 hover:text-indigo-300">Browse Files</span>
                                <span className="text-slate-500 text-sm">or drop your CSV here</span>
                            </>
                        )}
                    </label>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-left">
                        <AlertTriangle className="text-red-400 w-5 h-5 mr-3 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${!file || loading
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                        }`}
                >
                    {loading ? (
                        <><Loader2 className="w-6 h-6 animate-spin mr-2" /> Initializing Engine...</>
                    ) : (
                        'Analyze Dataset'
                    )}
                </button>
            </div>
        </div>
    );
}
