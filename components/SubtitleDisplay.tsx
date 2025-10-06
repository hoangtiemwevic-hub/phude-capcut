import React from 'react';
import { SubtitleEntry } from '../types';
import { formatSrtTime } from '../services/srtGenerator';

interface SubtitleDisplayProps {
    subtitles: SubtitleEntry[];
}

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ subtitles }) => {
    return (
        <div className="w-full bg-slate-800/50 rounded-xl shadow-lg overflow-hidden border border-slate-700">
            <div className="h-[60vh] overflow-y-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-cyan-300 uppercase bg-slate-800/70 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-16 text-center">STT</th>
                            <th scope="col" className="px-6 py-3 w-40">Bắt đầu</th>
                            <th scope="col" className="px-6 py-3 w-40">Kết thúc</th>
                            <th scope="col" className="px-6 py-3">Nội dung Phụ đề</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subtitles.map((sub, index) => (
                            <tr 
                                key={sub.id} 
                                className="border-b border-slate-700/50 transition-colors duration-150 odd:bg-slate-800/40 even:bg-slate-800/20 hover:bg-slate-700/50"
                            >
                                <td className="px-4 py-3 font-medium text-slate-400 text-center">{index + 1}</td>
                                <td className="px-6 py-3 font-mono">{formatSrtTime(sub.start)}</td>
                                <td className="px-6 py-3 font-mono">{formatSrtTime(sub.end)}</td>
                                <td className="px-6 py-3 text-base text-slate-100 whitespace-pre-wrap leading-relaxed">
                                    {sub.textParts.map((part, i) =>
                                        part.isHighlighted ? (
                                            <mark key={i} className="bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded">
                                                {part.text}
                                            </mark>
                                        ) : (
                                            <span key={i}>{part.text}</span>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubtitleDisplay;