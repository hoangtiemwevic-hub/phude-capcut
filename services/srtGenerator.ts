import { SubtitleEntry } from '../types';

// Helper function to format milliseconds into HH:MM:SS,mmm
export const formatSrtTime = (ms: number): string => {
    const date = new Date(ms);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds},${milliseconds}`;
};

export const generateSRTContent = (subtitles: SubtitleEntry[], fileName: string): void => {
    if (!subtitles || subtitles.length === 0) {
        alert("Không có phụ đề để xuất.");
        return;
    }

    const srtContent = subtitles
        .map((sub, index) => {
            const startTime = formatSrtTime(sub.start);
            const endTime = formatSrtTime(sub.end);
            const textContent = sub.textParts.map(p => p.text).join('');
            return `${index + 1}\n${startTime} --> ${endTime}\n${textContent}\n\n`;
        })
        .join('');

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedFileName = fileName.endsWith('.srt') ? fileName : `${fileName}.srt`;
    link.download = sanitizedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};