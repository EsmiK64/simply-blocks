// Scratch-faithful sprite/stage runtime state model.
// Coordinates match Scratch convention: centre = (0,0), x: -240..240, y: -180..180.

export interface Costume {
    name: string;
    assetId: string;        // MD5 hash (for SB3 compat)
    dataUrl: string | null; // loaded blob URL or data URL
    rotationCenterX: number;
    rotationCenterY: number;
    width: number;
    height: number;
}

export interface Sound {
    name: string;
    assetId: string;
    format: string;
    dataUrl: string | null;
}

export type GraphicEffect =
    | 'color' | 'fisheye' | 'whirl' | 'pixelate'
    | 'mosaic' | 'brightness' | 'ghost';

export interface SpriteState {
    id: string;
    name: string;
    isStage: boolean;

    // Transform
    x: number;
    y: number;
    direction: number;  // degrees, 90 = right
    size: number;       // percent, 100 = normal
    visible: boolean;

    // Costumes
    costumes: Costume[];
    currentCostume: number; // 0-indexed

    // Sounds
    sounds: Sound[];
    volume: number;

    // Effects (0 = none)
    effects: Record<GraphicEffect, number>;

    // Drag mode
    draggable: boolean;

    // Layer order (higher = front)
    layerOrder: number;
}

export interface StageState {
    width: number;   // 480
    height: number;  // 360
    sprites: SpriteState[];
    tempo: number;   // BPM
    videoTransparency: number;
    videoState: 'on' | 'off' | 'on-flipped';
}

export function createDefaultSprite(id: string, name: string): SpriteState {
    return {
        id,
        name,
        isStage: false,
        x: 0,
        y: 0,
        direction: 90,
        size: 100,
        visible: true,
        costumes: [],
        currentCostume: 0,
        sounds: [],
        volume: 100,
        effects: {
            color: 0, fisheye: 0, whirl: 0, pixelate: 0,
            mosaic: 0, brightness: 0, ghost: 0,
        },
        draggable: false,
        layerOrder: 1,
    };
}

export function createStageSprite(): SpriteState {
    return {
        ...createDefaultSprite('_stage_', 'Stage'),
        isStage: true,
        costumes: [{
            name: 'backdrop1',
            assetId: '',
            dataUrl: null,
            rotationCenterX: 240,
            rotationCenterY: 180,
            width: 480,
            height: 360,
        }],
        layerOrder: 0,
    };
}

// Convert Scratch coords (origin=centre) to canvas coords (origin=top-left)
export function scratchToCanvas(
    sx: number, sy: number,
    canvasW = 480, canvasH = 360
): [number, number] {
    return [sx + canvasW / 2, canvasH / 2 - sy];
}

// Convert canvas coords back to Scratch coords
export function canvasToScratch(
    cx: number, cy: number,
    canvasW = 480, canvasH = 360
): [number, number] {
    return [cx - canvasW / 2, canvasH / 2 - cy];
}
