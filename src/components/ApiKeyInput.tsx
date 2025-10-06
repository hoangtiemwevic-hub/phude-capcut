import React, { useState } from 'react';
import { LoadingSpinnerIcon, KeyIcon } from './icons';

interface ApiKeyInputProps {
    onApiKeyValidated: (apiKey: string) => Promise<void>;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyValidated }) => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setErrorMessage('Vui lòng nhập API key.');
            setStatus('error');
            return;
        }
        
        setStatus('loading');
        setErrorMessage('');
        
        try {
            await onApiKeyValidated(apiKey);
        } catch (error) {
            setStatus('error');
            setErrorMessage('API Key không hợp lệ hoặc đã xảy ra lỗi. Vui lòng kiểm tra lại key của bạn.');
        }
    };
    
    const getButtonText = () => {
        if (status === 'loading') {
            return 'Đang xác thực...';
        }
        return 'Lưu & Xác thực';
    }

    return (
        <div className="w-full max-w-lg flex flex-col items-center justify-center p-8 bg-slate-800/50 border border-slate-700 rounded-xl text-center transition-all duration-300 animate-fade-in">
            <KeyIcon />
            <h2 className="mt-4 text-2xl font-bold text-slate-100">
                Nhập Gemini API Key
            </h2>
            <p className="mt-2 text-slate-400">
                Bạn cần API key của Google AI Studio để sử dụng tính năng dịch. Ứng dụng sẽ lưu key này an toàn trên trình duyệt của bạn.
            </p>
            
            <form onSubmit={handleSubmit} className="w-full mt-6">
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-3.5 text-center font-mono"
                    placeholder="dán_api_key_của_bạn_vào_đây"
                    disabled={status === 'loading'}
                />
                
                {status === 'error' && (
                    <p className="text-red-400 text-sm mt-3">{errorMessage}</p>
                )}
                
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 flex items-center justify-center gap-2"
                >
                    {status === 'loading' && <LoadingSpinnerIcon />}
                    {getButtonText()}
                </button>
            </form>
            
             <div className="mt-6 text-left text-slate-400 text-sm w-full bg-slate-800 p-4 rounded-lg">
                <p>
                    Bạn có thể lấy API key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold">Google AI Studio</a>.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyInput;