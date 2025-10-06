import { SubtitleEntry } from '../types';

// NOTE: This list is not exhaustive and is for demonstration purposes.
// In a real-world application, this list would be much more extensive
// and could be loaded from an external source.
const PROFANE_WORDS_EN = [
    'fuck', 'fucked', 'fucking', 'shit', 'piss', 'cunt', 'cocksucker', 'motherfucker', 
    'tits', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'nigger', 'nigga',
    // YouTube policy related
    'kill', 'die', 'murder', 'suicide', 'bomb', 'terrorist', 'nazi',
    'sex', 'porn', 'naked', 'gun', 'drugs'
];

const PROFANE_WORDS_VI = [
    'địt', 'đụ', 'lồn', 'cặc', 'buồi', 'đĩ', 'chó đẻ', 'đốn mạt', 'ngu',
    'cứt', 'đái',
    // YouTube policy related
    'giết', 'chết', 'tự tử', 'khủng bố', 'bom', 'súng', 'ma túy', 'quan hệ'
];

// Combine and create a regex for efficient matching
const ALL_WORDS = [...new Set([...PROFANE_WORDS_EN, ...PROFANE_WORDS_VI])];
const profanityRegex = new RegExp(`\\b(${ALL_WORDS.join('|')})\\b`, 'gi');

/**
 * Censors a word by replacing middle characters with asterisks.
 * e.g., "word" -> "w**d"
 * @param word The word to censor.
 * @returns The censored word.
 */
const censorWord = (word: string): string => {
    if (word.length <= 2) {
        return '*'.repeat(word.length);
    }
    return word[0] + '*'.repeat(word.length - 2) + word.slice(-1);
};

/**
 * Filters subtitles to censor profane words, returns the filtered list with highlighted parts,
 * and a map of the words that were replaced.
 * @param subtitles An array of subtitle entries with the original text.
 * @returns An object containing the filtered subtitles and a map of replaced words with their counts.
 */
export const filterSubtitles = (
    subtitles: SubtitleEntry[]
): { filteredSubtitles: SubtitleEntry[]; replacedWords: Map<string, number> } => {
    
    const replacedWords = new Map<string, number>();

    const filteredSubtitles = subtitles.map(sub => {
        // Always work from the original, joined text
        const originalText = sub.textParts.map(p => p.text).join('');
        const newParts: { text: string; isHighlighted: boolean }[] = [];
        let lastIndex = 0;
        let match;

        // Reset regex index before each use with a global flag
        profanityRegex.lastIndex = 0;

        while ((match = profanityRegex.exec(originalText)) !== null) {
            const profaneWord = match[0];
            const index = match.index;

            // 1. Add the text part before the profane word
            if (index > lastIndex) {
                newParts.push({ text: originalText.substring(lastIndex, index), isHighlighted: false });
            }

            // 2. Add the censored and highlighted profane word
            newParts.push({ text: censorWord(profaneWord), isHighlighted: true });

            // 3. Update the count of replaced words
            const lowerCaseMatch = profaneWord.toLowerCase();
            replacedWords.set(lowerCaseMatch, (replacedWords.get(lowerCaseMatch) || 0) + 1);
            
            // 4. Update the last index
            lastIndex = index + profaneWord.length;
        }

        // 5. Add any remaining text after the last match
        if (lastIndex < originalText.length) {
            newParts.push({ text: originalText.substring(lastIndex), isHighlighted: false });
        }
        
        // If no matches were found, the newParts array will be empty.
        // In that case, return the original subtitle structure.
        if (newParts.length === 0) {
            return sub;
        }

        return { ...sub, textParts: newParts };
    });

    return { filteredSubtitles, replacedWords };
};