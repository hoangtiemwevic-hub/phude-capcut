import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SubtitleEntry } from '../types';

// Vite exposes environment variables on the `import.meta.env` object.
// VITE_ is a required prefix for variables to be exposed to the client-side code.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Gemini API key is not set. Please set the VITE_GEMINI_API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function translateSubtitles(
    subtitles: SubtitleEntry[],
    targetLanguage: string
): Promise<SubtitleEntry[]> {
    if (!API_KEY) {
        throw new Error("Thiếu API key của Gemini. Vui lòng đặt biến môi trường VITE_GEMINI_API_KEY.");
    }
    if (subtitles.length === 0) {
        return [];
    }

    // Combine all subtitle texts into a single numbered list for an efficient API call
    const combinedText = subtitles
        .map((sub, index) => `${index + 1}. ${sub.textParts.map(p => p.text).join('')}`)
        .join('\n');
    
    const prompt = `Dịch danh sách phụ đề được đánh số sau đây sang ngôn ngữ "${targetLanguage}".
Giữ nguyên chính xác thứ tự đánh số ban đầu.
Không thêm bất kỳ giải thích hay giới thiệu nào.
Chỉ trả về văn bản đã dịch cho mỗi số trên một dòng mới.

---
${combinedText}
---`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const translatedText = response.text;

    // Split the response back into individual lines
    const translatedLines = translatedText.split('\n').filter(line => line.trim() !== '');

    const newSubtitles: SubtitleEntry[] = [];
    let translationIndex = 0;

    for(let i = 0; i < subtitles.length; i++) {
        const originalSubtitle = subtitles[i];
        let translatedLine = translatedLines[translationIndex] || '';

        // Attempt to find the correct line if the model added numbering
        const match = translatedLine.match(new RegExp(`^${i + 1}[.\\s)]*(.*)`));

        if (match) {
            translatedLine = match[1].trim();
        } else if (translationIndex < translatedLines.length) {
            // Fallback for models that don't add numbers back
            translatedLine = translatedLines[translationIndex].trim();
        } else {
            // If we run out of translated lines, use a fallback message
            const originalText = originalSubtitle.textParts.map(p => p.text).join('');
            translatedLine = `[Dịch thất bại] ${originalText}`;
        }
        
        newSubtitles.push({
            ...originalSubtitle,
            textParts: [{ text: translatedLine, isHighlighted: false }],
        });
        translationIndex++;
    }

    if (newSubtitles.length !== subtitles.length) {
        console.warn('Số lượng phụ đề gốc và phụ đề đã dịch không khớp. Quay lại sử dụng phụ đề gốc.');
        return subtitles; // Fallback to avoid data corruption
    }

    return newSubtitles;
}
