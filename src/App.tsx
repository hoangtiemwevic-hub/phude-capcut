import React, { useState, useCallback, useEffect } from 'react';
import { SubtitleEntry, Project } from './types';
import { parseCapCutJSON } from './services/capcutParser';
import { generateSRTContent } from './services/srtGenerator';
import { validateApiKey, translateSubtitles } from './services/geminiService';
import { discoverProjects } from './services/projectService';
import { filterSubtitles } from './services/profanityFilter';
import { TARGET_LANGUAGES } from './constants';
import ProjectSelector from './components/ProjectSelector';
import SubtitleDisplay from './components/SubtitleDisplay';
import ActionPanel from './components/ActionPanel';
import ApiKeyInput from './components/ApiKeyInput';
import { LogoIcon, LoadingSpinnerIcon, CopyIcon, CheckIcon } from './components/icons';

const SESSION_STORAGE_KEY = 'capcut-subtitle-session';
const API_KEY_STORAGE_KEY = 'gemini-api-key';

type AppView = 'api_key_input' | 'select_folder' | 'select_project' | 'editor';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isApiKeyValidating, setIsApiKeyValidating] = useState<boolean>(true);
    const [originalSubtitles, setOriginalSubtitles] = useState<SubtitleEntry[] | null>(null);
    const [subtitles, setSubtitles] = useState<SubtitleEntry[] | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [fileName, setFileName] = useState<string>('phude');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<AppView>('api_key_input');
    const [isProfanityFilterEnabled, setIsProfanityFilterEnabled] = useState(true);
    const [replacedWords, setReplacedWords] = useState<Map<string, number>>(new Map());

    // Effect to check for API key on initial mount
    useEffect(() => {
        const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedApiKey) {
            setApiKey(savedApiKey);
            loadSessionOrGoToSelectFolder();
        } else {
            setCurrentView('api_key_input');
        }
        setIsApiKeyValidating(false);
    }, []);

    const loadSessionOrGoToSelectFolder = () => {
        try {
            const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
            if (savedSession) {
                const { subtitles: savedOriginalSubtitles, fileName: savedFileName } = JSON.parse(savedSession);
                if (savedOriginalSubtitles && savedOriginalSubtitles.length > 0 && savedFileName) {
                    setOriginalSubtitles(savedOriginalSubtitles);
                    setFileName(savedFileName);
                    setCurrentView('editor');
                    return;
                }
            }
        } catch (err) {
            console.error("Failed to load session from localStorage", err);
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
        setCurrentView('select_folder');
    };
    
    useEffect(() => {
        if (currentView === 'editor' && originalSubtitles && fileName) {
            try {
                const sessionData = JSON.stringify({ subtitles: originalSubtitles, fileName });
                localStorage.setItem(SESSION_STORAGE_KEY, sessionData);
            } catch (err) {
                console.error("Failed to save session to localStorage", err);
            }
        }
    }, [originalSubtitles, fileName, currentView]);

    useEffect(() => {
        if (!originalSubtitles) {
            setSubtitles(null);
            setReplacedWords(new Map());
            return;
        }

        if (isProfanityFilterEnabled) {
            const { filteredSubtitles, replacedWords: newReplacedWords } = filterSubtitles(originalSubtitles);
            setSubtitles(filteredSubtitles);
            setReplacedWords(newReplacedWords);
        } else {
            setSubtitles(originalSubtitles);
            setReplacedWords(new Map());
        }
    }, [isProfanityFilterEnabled, originalSubtitles]);

    const handleApiKeySubmit = useCallback(async (submittedKey: string) => {
        const isValid = await validateApiKey(submittedKey);
        if (isValid) {
            localStorage.setItem(API_KEY_STORAGE_KEY, submittedKey);
            setApiKey(submittedKey);
            setCurrentView('select_folder');
        } else {
            throw new Error("API Key validation failed.");
        }
    }, []);

    const handleDirectorySelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) {
            setError("Chưa chọn thư mục hoặc tệp.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const foundProjects = await discoverProjects(files);
            if (foundProjects.length === 0) {
                setError("Không tìm thấy dự án CapCut hợp lệ nào trong thư mục đã chọn. Hãy chắc chắn rằng nó chứa các thư mục con có tệp 'draft_content.json'.");
            } else {
                setProjects(foundProjects);
                setCurrentView('select_project');
            }
        } catch (err) {
            console.error(err);
            setError('Xử lý thư mục đã chọn thất bại.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleProjectSelect = useCallback(async (project: Project) => {
        setIsLoading(true);
        setError(null);
        setOriginalSubtitles(null);
        
        const baseFileName = project.name.replace(/[\s_]+/g, '-');
        setFileName(baseFileName || 'phude');
        
        try {
            const file = project.draftFile;
            const fileContent = await file.text();
            const parsedSubtitles = parseCapCutJSON(fileContent);

            if (parsedSubtitles.length === 0) {
                setError("Không tìm thấy phụ đề nào trong dự án này. Vui lòng chọn dự án khác hoặc kiểm tra lại tệp dự án.");
                setCurrentView('select_project');
            } else {
                setOriginalSubtitles(parsedSubtitles);
                setCurrentView('editor');
            }
        } catch (err) {
            console.error(err);
            setError('Phân tích tệp dự án thất bại. Vui lòng đảm bảo đây là một dự án CapCut hợp lệ.');
            setCurrentView('select_project');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleTranslate = useCallback(async (targetLanguage: string) => {
        if (!originalSubtitles || !apiKey) return;
        setIsTranslating(true);
        setError(null);

        try {
            const translated = await translateSubtitles(originalSubtitles, targetLanguage, apiKey);
            setOriginalSubtitles(translated);
            setFileName(prev => `${prev}-${targetLanguage.toLowerCase()}`);
        } catch (err) {
            console.error(err);
            setError('Đã xảy ra lỗi trong quá trình dịch. Vui lòng kiểm tra API key của bạn và thử lại.');
        } finally {
            setIsTranslating(false);
        }
    }, [originalSubtitles, apiKey]);

    const handleExport = useCallback(() => {
        if (!subtitles) return;
        generateSRTContent(subtitles, fileName);
    }, [subtitles, fileName]);
    
    const handleBackToProjects = () => {
        setOriginalSubtitles(null);
        setError(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setCurrentView('select_project');
    };
    
    const handleChangeFolder = () => {
        setOriginalSubtitles(null);
        setProjects([]);
        setError(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setCurrentView('select_folder');
    };

    const handleChangeApiKey = () => {
        setApiKey(null);
        setOriginalSubtitles(null);
        setProjects([]);
        setError(null);
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setCurrentView('api_key_input');
    };
    
    const ReplacedWordsPanel = () => {
        const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
        const [copiedWord, setCopiedWord] = useState<string | null>(null);

        const handleCopyAll = () => {
            if (replacedWords.size === 0) return;
            const textToCopy = `Danh sách các từ đã được thay thế:\n${Array.from(replacedWords.entries())
                .map(([word, count]) => `- ${word} (${count} lần)`)
                .join('\n')}`;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopyStatus('success');
                setTimeout(() => setCopyStatus('idle'), 2000);
            }, () => {
                setCopyStatus('error');
                setTimeout(() => setCopyStatus('idle'), 2000);
            });
        };
        
        const handleCopyWord = (word: string) => {
            navigator.clipboard.writeText(word).then(() => {
                setCopiedWord(word);
                setTimeout(() => setCopiedWord(null), 2000);
            });
        };
        
        const getCopyAllText = () => {
            if (copyStatus === 'success') return 'Đã sao chép!';
            if (copyStatus === 'error') return 'Lỗi!';
            return 'Sao chép tất cả';
        }

        return (
            <div className="w-full bg-slate-800/50 p-4 rounded-xl shadow-lg animate-fade-in border border-slate-700">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-cyan-400">Các từ đã được che tự động:</h3>
                    <button 
                        onClick={handleCopyAll}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-1.5 px-3 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
                    >
                        <CopyIcon className="w-4 h-4" />
                        {getCopyAllText()}
                    </button>
                </div>
                <div className="max-h-32 overflow-y-auto bg-slate-900/50 p-3 rounded-md">
                   {replacedWords.size > 0 ? (
                        <div className="flex flex-wrap gap-2 text-sm text-slate-300 font-mono">
                            {Array.from(replacedWords.entries()).map(([word, count]) => (
                                <div key={word} className="flex items-center justify-between bg-slate-700/80 py-1 pl-2.5 pr-1.5 rounded-full">
                                    <span className="truncate" title={word}>
                                        {word} <span className="text-slate-500 text-xs">({count})</span>
                                    </span>
                                    <button onClick={() => handleCopyWord(word)} title={`Sao chép "${word}"`} className="ml-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full p-1 focus:outline-none focus:bg-slate-600">
                                        {copiedWord === word ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                   ) : (
                    <div className="text-center text-slate-500 text-sm">Không có từ nào bị thay thế.</div>
                   )}
                </div>
            </div>
        );
    };

    const renderHeaderButtons = () => {
        if (!apiKey) return null;
        const baseClass = "bg-slate-700 hover:bg-slate-600/80 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500";
        if (currentView === 'editor') {
            return (
                <button
                    onClick={handleBackToProjects}
                    className={baseClass}
                >
                    &larr; Quay lại Dự án
                </button>
            );
        }
        if (currentView === 'select_project') {
             return (
                <button
                    onClick={handleChangeFolder}
                    className={baseClass}
                >
                    Đổi Thư mục
                </button>
            );
        }
        return null;
    }

    const renderContent = () => {
        if (isApiKeyValidating) {
            return (
                <div className="flex flex-col items-center justify-center text-center">
                    <LoadingSpinnerIcon />
                </div>
            );
        }
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center">
                    <LoadingSpinnerIcon />
                    <p className="text-xl text-cyan-400 mt-4 animate-pulse">Đang quét các dự án...</p>
                </div>
            );
        }

        if (error) {
            return <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg relative w-full text-center" role="alert">{error}</div>;
        }

        switch (currentView) {
            case 'api_key_input':
                return <ApiKeyInput onApiKeyValidated={handleApiKeySubmit} />;
            case 'select_folder':
                return <ProjectSelector onDirectorySelect={handleDirectorySelect} projects={[]} onProjectSelect={() => {}} />;
            case 'select_project':
                return <ProjectSelector onDirectorySelect={() => handleChangeFolder()} projects={projects} onProjectSelect={handleProjectSelect} />;
            case 'editor':
                 if (subtitles) {
                    return (
                        <div className="w-full flex flex-col gap-6 animate-fade-in">
                             <ActionPanel 
                                fileName={fileName}
                                onFileNameChange={setFileName}
                                onExport={handleExport}
                                onTranslate={handleTranslate}
                                isTranslating={isTranslating}
                                targetLanguages={TARGET_LANGUAGES}
                                isProfanityFilterEnabled={isProfanityFilterEnabled}
                                onProfanityFilterChange={setIsProfanityFilterEnabled}
                            />
                            {isProfanityFilterEnabled && replacedWords.size > 0 && <ReplacedWordsPanel />}
                            <SubtitleDisplay subtitles={subtitles} />
                        </div>
                    );
                }
                return null;
            default:
                 return <p>Đã có lỗi xảy ra.</p>;
        }
    };


    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <LogoIcon />
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-tight">Trích xuất Phụ đề CapCut</h1>
                </div>
                 {renderHeaderButtons()}
            </header>

            <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center">
                {renderContent()}
            </main>
            
            <footer className="w-full max-w-7xl mx-auto mt-8 text-center text-slate-500 text-sm">
                <p>Được xây dựng với React, Tailwind CSS, và Gemini API. Đây là một công cụ không chính thức.</p>
                {apiKey && (
                    <p className="mt-2">
                        <button onClick={handleChangeApiKey} className="text-cyan-500 hover:text-cyan-400 underline transition-colors">
                            Thay đổi API Key
                        </button>
                    </p>
                )}
            </footer>
        </div>
    );
};

export default App;