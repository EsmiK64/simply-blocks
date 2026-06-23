/**
 * SB3 Parser
 * Parses a Scratch 3.0 .sb3 file (ZIP archive) and reconstructs the block tree
 * into Simply Blocks' BlockInstance format.
 *
 * SB3 structure:
 *   project.json   — JSON with targets[], monitors[], extensions[], meta{}
 *   <md5hash>.svg/.png   — costume assets
 *   <md5hash>.wav/.mp3   — sound assets
 */

import { BlockInstance, BlockDefinition } from './types';
import { BLOCK_DEFINITIONS, getBlockDefinition } from './definitions';

// ── Minimal fflate type stubs (loaded dynamically if available) ──────────────

type UnzipResult = Record<string, Uint8Array>;

async function unzip(buffer: ArrayBuffer): Promise<UnzipResult> {
    try {
        // Try fflate if available
        const fflate = await import('fflate' as any);
        return new Promise((resolve, reject) => {
            fflate.unzip(new Uint8Array(buffer), (err: any, files: UnzipResult) => {
                if (err) reject(err); else resolve(files);
            });
        });
    } catch {
        // Fallback: try using native DecompressionStream via JSZip-compatible manual parse
        throw new Error('fflate not available. Install it: npm install fflate');
    }
}

// ── SB3 JSON types ────────────────────────────────────────────────────────────

interface SB3Block {
    opcode: string;
    next: string | null;
    parent: string | null;
    inputs: Record<string, [number, string | [number, ...any[]]] | [number, string | [number, ...any[]], string | [number, ...any[]]]>;
    fields: Record<string, [string, string | null]>;
    shadow: boolean;
    topLevel: boolean;
    x?: number;
    y?: number;
    mutation?: {
        proccode?: string;
        argumentids?: string;
        argumentnames?: string;
        argumentdefaults?: string;
        hasnext?: string;
        warp?: string;
    };
}

interface SB3Costume {
    name: string;
    assetId: string;
    dataFormat: string;
    rotationCenterX: number;
    rotationCenterY: number;
    bitmapResolution?: number;
}

interface SB3Sound {
    name: string;
    assetId: string;
    dataFormat: string;
    format?: string;
    rate?: number;
    sampleCount?: number;
}

interface SB3Variable {
    // [varName, initialValue]
    0: string;
    1: string | number;
}

interface SB3Target {
    isStage: boolean;
    name: string;
    variables: Record<string, [string, string | number]>;
    lists: Record<string, [string, Array<string | number>]>;
    broadcasts: Record<string, string>;
    blocks: Record<string, SB3Block>;
    costumes: SB3Costume[];
    sounds: SB3Sound[];
    currentCostume: number;
    layerOrder: number;
    volume: number;
    // Sprite-only
    visible?: boolean;
    x?: number;
    y?: number;
    size?: number;
    direction?: number;
    draggable?: boolean;
    rotationStyle?: string;
}

interface SB3Project {
    targets: SB3Target[];
    monitors: any[];
    extensions: string[];
    meta: { semver: string; vm: string; agent: string };
}

// ── Block tree reconstruction ─────────────────────────────────────────────────

let _idCounter = 0;
function genId(): string {
    return `sb3_${++_idCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

function makeBlockInstance(
    blockId: string,
    flatBlocks: Record<string, SB3Block>,
    visitedIds: Set<string>
): BlockInstance | null {
    if (visitedIds.has(blockId)) return null;
    visitedIds.add(blockId);

    const sb3Block = flatBlocks[blockId];
    if (!sb3Block || sb3Block.shadow) return null;

    const def: BlockDefinition = getBlockDefinition(sb3Block.opcode) ?? {
        type: sb3Block.opcode,
        label: sb3Block.opcode,
        category: 'control',
        color: '#888888',
        hasNotch: !sb3Block.topLevel,
        hasTab: sb3Block.next !== null,
    };

    // Convert SB3 fields → Simply Blocks fields
    const fieldValues: Record<string, string | number | boolean> = {};
    for (const [fname, fval] of Object.entries(sb3Block.fields)) {
        fieldValues[fname] = fval[0] ?? '';
    }

    // Resolve input blocks (reporter/boolean inputs embedded inline)
    const inputInstances: Record<string, BlockInstance | null> = {};
    for (const [inputName, inputVal] of Object.entries(sb3Block.inputs)) {
        const innerRef = inputVal[1];
        if (typeof innerRef === 'string' && flatBlocks[innerRef]) {
            inputInstances[inputName] = makeBlockInstance(innerRef, flatBlocks, visitedIds);
        }
    }

    // Resolve "next" block in stack
    const next = sb3Block.next
        ? makeBlockInstance(sb3Block.next, flatBlocks, visitedIds)
        : null;

    // Resolve "SUBSTACK" children (C-blocks, if/else)
    const children: BlockInstance[] = [];
    const elseChildren: BlockInstance[] = [];

    const substack1Ref = sb3Block.inputs['SUBSTACK'];
    if (substack1Ref) {
        const childRef = substack1Ref[1];
        if (typeof childRef === 'string' && flatBlocks[childRef]) {
            const firstChild = makeBlockInstance(childRef, flatBlocks, visitedIds);
            if (firstChild) {
                // Walk the next chain to collect all children
                let cur: BlockInstance | null = firstChild;
                while (cur) {
                    children.push({ ...cur, next: null });
                    cur = cur.next;
                }
            }
        }
    }

    const substack2Ref = sb3Block.inputs['SUBSTACK2'];
    if (substack2Ref) {
        const childRef = substack2Ref[1];
        if (typeof childRef === 'string' && flatBlocks[childRef]) {
            const firstChild = makeBlockInstance(childRef, flatBlocks, visitedIds);
            if (firstChild) {
                let cur: BlockInstance | null = firstChild;
                while (cur) {
                    elseChildren.push({ ...cur, next: null });
                    cur = cur.next;
                }
            }
        }
    }

    const instance: BlockInstance = {
        id: genId(),
        definition: def,
        fields: fieldValues,
        inputs: inputInstances,
        next,
        children,
        elseChildren,
        x: sb3Block.x ?? 0,
        y: sb3Block.y ?? 0,
    };

    return instance;
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ParsedSB3Target {
    name: string;
    isStage: boolean;
    scripts: BlockInstance[];      // top-level hat/floating block stacks
    costumes: SB3Costume[];
    sounds: SB3Sound[];
    variables: Record<string, [string, string | number]>;
    lists: Record<string, [string, Array<string | number>]>;
    layerOrder: number;
    currentCostume: number;
    // Sprite properties
    x: number;
    y: number;
    direction: number;
    size: number;
    visible: boolean;
}

export interface ParsedSB3 {
    targets: ParsedSB3Target[];
    extensions: string[];
    meta: SB3Project['meta'];
    assetBlobs: Map<string, Blob>; // assetId → blob
}

export async function parseSB3File(file: File): Promise<ParsedSB3> {
    const buffer = await file.arrayBuffer();
    const files = await unzip(buffer);

    // Parse project.json
    const projectJsonBytes = files['project.json'];
    if (!projectJsonBytes) throw new Error('No project.json found in .sb3');
    const projectJson = JSON.parse(new TextDecoder().decode(projectJsonBytes)) as SB3Project;

    // Build asset blob map
    const assetBlobs = new Map<string, Blob>();
    for (const [path, data] of Object.entries(files)) {
        if (path === 'project.json') continue;
        // Path is "<md5hash>.<ext>"
        const assetId = path.split('.')[0];
        const ext = path.split('.').pop() ?? '';
        const mime = ext === 'svg' ? 'image/svg+xml'
            : ext === 'png' ? 'image/png'
                : ext === 'wav' ? 'audio/wav'
                    : ext === 'mp3' ? 'audio/mpeg'
                        : 'application/octet-stream';
        assetBlobs.set(assetId, new Blob([data as Uint8Array<ArrayBuffer>], { type: mime }));
    }

    // Parse each target
    const parsedTargets: ParsedSB3Target[] = projectJson.targets.map(target => {
        const visited = new Set<string>();
        const scripts: BlockInstance[] = [];

        // Find all top-level blocks
        for (const [blockId, block] of Object.entries(target.blocks)) {
            if (block.topLevel && !block.shadow) {
                const instance = makeBlockInstance(blockId, target.blocks, visited);
                if (instance) {
                    instance.x = block.x ?? 0;
                    instance.y = block.y ?? 0;
                    scripts.push(instance);
                }
            }
        }

        return {
            name: target.name,
            isStage: target.isStage,
            scripts,
            costumes: target.costumes,
            sounds: target.sounds,
            variables: target.variables,
            lists: target.lists,
            layerOrder: target.layerOrder,
            currentCostume: target.currentCostume,
            x: target.x ?? 0,
            y: target.y ?? 0,
            direction: target.direction ?? 90,
            size: target.size ?? 100,
            visible: target.visible ?? true,
        };
    });

    return {
        targets: parsedTargets,
        extensions: projectJson.extensions,
        meta: projectJson.meta,
        assetBlobs,
    };
}
