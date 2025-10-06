import { CapCutJSON, SubtitleEntry, CapCutTextSegment } from '../types';

export const parseCapCutJSON = (jsonContent: string): SubtitleEntry[] => {
    const data: CapCutJSON = JSON.parse(jsonContent);

    // Find the first text track, searching from the end as the Python script does
    const textTrack = [...data.tracks].reverse().find(track => track.type === 'text');
    if (!textTrack) {
        return [];
    }

    // Create a map of material IDs to their timing information for quick lookup
    const timeMap = new Map<string, { start: number; duration: number }>();
    for (const segment of textTrack.segments) {
        timeMap.set(segment.material_id, {
            start: segment.target_timerange.start,
            duration: segment.target_timerange.duration,
        });
    }

    const subtitles: SubtitleEntry[] = [];
    let counter = 1;

    // Iterate through all text materials and match them with timing info
    for (const textMaterial of data.materials.texts) {
        const times = timeMap.get(textMaterial.id);
        if (times) {
            try {
                // The 'content' field is a JSON string itself that needs to be parsed
                const content = JSON.parse(textMaterial.content);
                const text = content.text;

                if (text) {
                    subtitles.push({
                        id: counter++,
                        // Times are in microseconds, convert to milliseconds
                        start: Math.round(times.start / 1000),
                        end: Math.round((times.start + times.duration) / 1000),
                        textParts: [{ text: text, isHighlighted: false }],
                    });
                }
            } catch (e) {
                console.warn(`Could not parse content for material ID ${textMaterial.id}:`, e);
            }
        }
    }

    // Sort subtitles by start time as a final guarantee of order
    subtitles.sort((a, b) => a.start - b.start);
    
    // Re-assign IDs after sorting to ensure correct SRT sequence
    return subtitles.map((sub, index) => ({...sub, id: index + 1}));
};
