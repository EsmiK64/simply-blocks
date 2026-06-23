/**
 * SB3 Serialiser
 * Converts Simply Blocks' BlockInstance trees back into a valid Scratch 3.0
 * project.json structure, ready to be zipped into an .sb3 file.
 *
 * Limitation: costume/sound assets are not re-embedded (use parseSB3File assets).
 */

import { BlockInstance } from './types';

// ── SB3 output types ──────────────────────────────────────────────────────────

interface SB3BlockOut {
    opcode: string;
    next: string | null;
    parent: string | null;
    inputs: Record<string, [number, string | [number, string]]>;
    fields: Record<string, [string, string | null]>;
    shadow: boolean;
    topLevel: boolean;
    x?: number;
    y?: number;
}

type SB3BlocksMap = Record<string, SB3BlockOut>;

// ── ID generation ─────────────────────────────────────────────────────────────

function makeStableId(block: BlockInstance): string {
    return block.id;
}

// ── Block serialisation ───────────────────────────────────────────────────────

function serialiseBlock(
    block: BlockInstance,
    parentId: string | null,
    output: SB3BlocksMap,
    isTopLevel = false,
    topX = 0, topY = 0
): string {
    const id = makeStableId(block);
    const def = block.definition;
    const opcode = def.sb3Opcode ?? def.type;

    const out: SB3BlockOut = {
        opcode,
        next: null,
        parent: parentId,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: isTopLevel,
        ...(isTopLevel ? { x: topX, y: topY } : {}),
    };

    // Serialise fields
    for (const [fname, fval] of Object.entries(block.fields)) {
        out.fields[fname] = [String(fval), null];
    }

    // Serialise inline inputs (reporter/boolean blocks in input slots)
    for (const [inputName, inputBlock] of Object.entries(block.inputs)) {
        if (inputBlock) {
            const inputId = serialiseBlock(inputBlock, id, output);
            out.inputs[inputName] = [2, inputId];
        }
    }

    // Serialise SUBSTACK (C-block children)
    if (block.children.length > 0) {
        // Chain children together via next
        const chainedFirst = chainBlocks(block.children, id, output);
        if (chainedFirst) out.inputs['SUBSTACK'] = [2, chainedFirst];
    }

    // Serialise SUBSTACK2 (else children for E-blocks)
    if (block.elseChildren.length > 0) {
        const chainedFirst = chainBlocks(block.elseChildren, id, output);
        if (chainedFirst) out.inputs['SUBSTACK2'] = [2, chainedFirst];
    }

    output[id] = out;

    // Serialise next block in stack
    if (block.next) {
        const nextId = serialiseBlock(block.next, id, output);
        out.next = nextId;
    }

    return id;
}

function chainBlocks(
    blocks: BlockInstance[],
    parentId: string,
    output: SB3BlocksMap
): string | null {
    if (blocks.length === 0) return null;

    // Link them as a chain
    const chained: BlockInstance[] = blocks.map((b, i) => ({
        ...b,
        next: blocks[i + 1] ?? null,
    }));

    return serialiseBlock(chained[0], parentId, output);
}

// ── Sprite serialisation ──────────────────────────────────────────────────────

export interface SB3SpriteInput {
    name: string;
    isStage: boolean;
    scripts: BlockInstance[];
    costumes: any[];
    sounds: any[];
    variables?: Record<string, [string, string | number]>;
    lists?: Record<string, [string, Array<string | number>]>;
    currentCostume?: number;
    layerOrder?: number;
    volume?: number;
    // Sprite-only
    visible?: boolean;
    x?: number;
    y?: number;
    direction?: number;
    size?: number;
    draggable?: boolean;
    rotationStyle?: string;
}

export function serialiseTarget(sprite: SB3SpriteInput): object {
    const blocks: SB3BlocksMap = {};

    sprite.scripts.forEach(script => {
        serialiseBlock(script, null, blocks, true, script.x, script.y);
    });

    const base: Record<string, unknown> = {
        isStage: sprite.isStage,
        name: sprite.name,
        variables: sprite.variables ?? {},
        lists: sprite.lists ?? {},
        broadcasts: {},
        blocks,
        comments: {},
        currentCostume: sprite.currentCostume ?? 0,
        costumes: sprite.costumes,
        sounds: sprite.sounds,
        layerOrder: sprite.layerOrder ?? 1,
        volume: sprite.volume ?? 100,
    };

    if (!sprite.isStage) {
        base['visible'] = sprite.visible ?? true;
        base['x'] = sprite.x ?? 0;
        base['y'] = sprite.y ?? 0;
        base['size'] = sprite.size ?? 100;
        base['direction'] = sprite.direction ?? 90;
        base['draggable'] = sprite.draggable ?? false;
        base['rotationStyle'] = sprite.rotationStyle ?? 'all around';
    } else {
        base['tempo'] = 60;
        base['videoTransparency'] = 50;
        base['videoState'] = 'off';
        base['textToSpeechLanguage'] = null;
    }

    return base;
}

export function serialiseProject(
    sprites: SB3SpriteInput[],
    extensions: string[] = []
): object {
    return {
        targets: sprites.map(serialiseTarget),
        monitors: [],
        extensions,
        meta: {
            semver: '3.0.0',
            vm: '0.2.0-simply-blocks',
            agent: 'SimplyBlocks',
        },
    };
}

// ── Download helper ───────────────────────────────────────────────────────────

export async function downloadAsSB3(
    sprites: SB3SpriteInput[],
    filename = 'project.sb3',
    extensions: string[] = []
): Promise<void> {
    const fflate = await import('fflate' as any);

    const projectJson = JSON.stringify(serialiseProject(sprites, extensions));
    const projectBytes = new TextEncoder().encode(projectJson);

    const zipInput: Record<string, Uint8Array> = {
        'project.json': projectBytes,
    };

    const zipped: Uint8Array = await new Promise((resolve, reject) => {
        fflate.zip(zipInput, (err: any, data: Uint8Array) => {
            if (err) reject(err); else resolve(data);
        });
    });

    const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
