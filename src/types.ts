export interface SubtitleEntry {
    id: number;
    start: number;
    end: number;
    textParts: { text: string; isHighlighted: boolean }[];
}

export interface Project {
    id: string; // Folder name
    name: string;
    draftFile: File; // The actual draft_content.json file
    modifiedDate: Date | null;
}

// Interfaces for parsing CapCut's draft_content.json
export interface CapCutTimeRange {
    start: number;
    duration: number;
}

export interface CapCutTextSegment {
    id: string;
    material_id: string;
    target_timerange: CapCutTimeRange;
}

export interface CapCutTrack {
    id: string;
    type: 'video' | 'audio' | 'text' | 'sticker';
    segments: CapCutTextSegment[];
}

export interface CapCutMaterialText {
    id: string;
    type: 'text';
    content: string; // This is a JSON string
}

export interface CapCutJSON {
    materials: {
        texts: CapCutMaterialText[];
    };
    tracks: CapCutTrack[];
}
