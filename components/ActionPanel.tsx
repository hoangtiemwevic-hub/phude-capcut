import React, { useState } from 'react';
import { ExportIcon, TranslateIcon, LoadingSpinnerIcon } from './icons';

interface ActionPanelProps {
    fileName: string;
    onFileNameChange: (name: string) => void;
    onExport: () => void;
    onTranslate: (language: string) => void;
    isTranslating: boolean;
    targetLanguages: { code: string; name: string }[];
    isProfanityFilterEnabled: boolean;
    onProfanityFilterChange: (enabled: boolean) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ 
    fileName, 
    onFileNameChange, 
    onExport, 
    onTranslate, 
    isTranslating, 
    targetLanguages,
    isProfanityFilterEnabled,
    onProfanityFilterChange
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState(targetLanguages[0]?.code || 'vi');

    const handleTranslateClick = () => {
        if (selectedLanguage) {
            onTranslate(selectedLanguage);
        }
    };
    
    return (
        <div className="w-full bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col lg:flex-row items-center gap-4">
            {/* File Name Group */}
            <div className="flex-grow w-full lg:w-auto">
                <label htmlFor="fileName" className="text-sm font-medium text-slate-400 mr-2 mb-1 block">Tên tệp:</label>
                <div className="flex items-center">
                    <input
                        type="text"
                        id="fileName"
                        value={fileName}
                        onChange={(e) => onFileNameChange(e.target.value)}
                        className="bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2.5 w-full"
                        placeholder="Nhập tên tệp"
                    />
                    <span className="text-slate-400 ml-2 font-mono">.srt</span>
                </div>
            </div>

            <div className="w-full lg:w-px h-px lg:h-12 bg-slate-700"></div>

            {/* Tools & Actions Group */}
            <div className="flex-grow w-full lg:w-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Profanity Filter */}
                <div className="flex items-center justify-center py-2">
                    <input
                        type="checkbox"
                        id="profanityFilter"
                        checked={isProfanityFilterEnabled}
                        onChange={(e) => onProfanityFilterChange(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-offset-slate-800"
                    />
                    <label htmlFor="profanityFilter" className="ml-2 text-sm font-medium text-slate-300 select-none cursor-pointer">Che từ ngữ tục</label>
                </div>
                
                {/* Translation */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        disabled={isTranslating}
                        className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2.5 w-full"
                    >
                        {targetLanguages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleTranslateClick}
                        disabled={isTranslating}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500"
                    >
                        {isTranslating ? <LoadingSpinnerIcon /> : <TranslateIcon />}
                        <span>{isTranslating ? 'Đang dịch...' : 'Dịch'}</span>
                    </button>
                </div>

                {/* Export Button */}
                <button
                    onClick={onExport}
                    className="bg-cyan-600 hover:bg-cyan-500 w-full sm:w-auto text-white font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-400"
                >
                    <ExportIcon />
                    <span>Xuất file</span>
                </button>
            </div>
        </div>
    );
};

export default ActionPanel;