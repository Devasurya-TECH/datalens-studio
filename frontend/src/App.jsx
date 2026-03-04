import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import UploadView from './components/UploadView';
import OverviewView from './components/OverviewView';
import QualityView from './components/QualityView';
import ExplorerView from './components/ExplorerView';
import CorrelationView from './components/CorrelationView';
import MlIntelligenceView from './components/MlIntelligenceView';
import PreprocessingView from './components/PreprocessingView';

export default function App() {
    const [activeTab, setActiveTab] = useState('upload');
    const [datasetData, setDatasetData] = useState(null);

    const renderContent = () => {
        switch (activeTab) {
            case 'upload':
                return <UploadView setDatasetData={setDatasetData} setActiveTab={setActiveTab} />;
            case 'overview':
                return <OverviewView datasetData={datasetData} />;
            case 'quality':
                return <QualityView datasetData={datasetData} />;
            case 'explorer':
                return <ExplorerView datasetData={datasetData} />;
            case 'correlation':
                return <CorrelationView datasetData={datasetData} />;
            case 'preprocessing':
            case 'outliers':
            case 'engineering':
            case 'export':
                return <PreprocessingView datasetData={datasetData} />;
            case 'ml':
            case 'suggestions':
            case 'ai':
                return <MlIntelligenceView datasetData={datasetData} />;
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
                            <p className="text-slate-500">The {activeTab} view is under construction.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 overflow-y-auto focus:outline-none relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                <div className="p-8 h-full max-w-7xl mx-auto relative z-10 overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="h-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
