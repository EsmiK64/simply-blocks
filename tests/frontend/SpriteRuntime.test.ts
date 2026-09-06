import { describe, it, expect } from 'bun:test';
import type { BlockInstance, BlockDefinition } from '../../resources/js/blocks/types';
import { executeBlocks } from '../../resources/js/stage/interpreter';
import type {
    StageState} from '../../resources/js/stage/SpriteRuntime';
import {
    createDefaultSprite,
    createStageSprite,
    scratchToCanvas,
    canvasToScratch
} from '../../resources/js/stage/SpriteRuntime';

function makeMockBlock(id: string, opcode: string, fields: Record<string, any> = {}): BlockInstance {
    const def: BlockDefinition = {
        type: opcode,
        label: opcode,
        category: 'motion',
        color: '#4C97FF',
    };

    return {
        id,
        definition: def,
        fields,
        inputs: {},
        next: null,
        children: [],
        elseChildren: [],
        x: 0,
        y: 0,
    };
}

describe('SpriteRuntime', () => {
    describe('createDefaultSprite', () => {
        it('initializes sprite with default values and proper origin', () => {
            const sprite = createDefaultSprite('sprite-1', 'Cat');

            expect(sprite.id).toBe('sprite-1');
            expect(sprite.name).toBe('Cat');
            expect(sprite.isStage).toBe(false);
            expect(sprite.x).toBe(0);
            expect(sprite.y).toBe(0);
            expect(sprite.direction).toBe(90);
            expect(sprite.size).toBe(100);
            expect(sprite.visible).toBe(true);
            expect(sprite.draggable).toBe(false);
            expect(sprite.layerOrder).toBe(1);
            expect(sprite.costumes).toEqual([]);
            expect(sprite.effects.color).toBe(0);
            expect(sprite.effects.ghost).toBe(0);
            expect(sprite.bubble).toBeNull();
        });
    });

    describe('createStageSprite', () => {
        it('initializes stage background with default backdrop', () => {
            const stage = createStageSprite();

            expect(stage.id).toBe('_stage_');
            expect(stage.name).toBe('Stage');
            expect(stage.isStage).toBe(true);
            expect(stage.layerOrder).toBe(0);
            expect(stage.costumes).toHaveLength(1);
            expect(stage.costumes[0].name).toBe('backdrop1');
            expect(stage.costumes[0].width).toBe(480);
            expect(stage.costumes[0].height).toBe(360);
        });
    });

    describe('scratchToCanvas and canvasToScratch', () => {
        it('maps origin (0, 0) in Scratch to canvas center (240, 180)', () => {
            const [cx, cy] = scratchToCanvas(0, 0);
            expect(cx).toBe(240);
            expect(cy).toBe(180);

            const [sx, sy] = canvasToScratch(240, 180);
            expect(sx).toBe(0);
            expect(sy).toBe(0);
        });

        it('maps Scratch boundaries correctly', () => {
            // Top-Right: (240, 180) -> Canvas (480, 0)
            const [trX, trY] = scratchToCanvas(240, 180);
            expect(trX).toBe(480);
            expect(trY).toBe(0);

            // Bottom-Left: (-240, -180) -> Canvas (0, 360)
            const [blX, blY] = scratchToCanvas(-240, -180);
            expect(blX).toBe(0);
            expect(blY).toBe(360);
        });

        it('is completely reversible for arbitrary coordinates', () => {
            const testCoords: [number, number][] = [
                [0, 0],
                [100, -50],
                [-150, 120],
                [240, 180],
                [-240, -180],
            ];

            for (const [sx, sy] of testCoords) {
                const [cx, cy] = scratchToCanvas(sx, sy);
                const [roundSx, roundSy] = canvasToScratch(cx, cy);
                expect(roundSx).toBe(sx);
                expect(roundSy).toBe(sy);
            }
        });
    });

    describe('interpreter executeBlocks', () => {
        it('returns 0 executedCount on empty blocks without crashing', async () => {
            const logs: string[] = [];
            const result = await executeBlocks([], 'sprite-1', () => {}, msg => logs.push(msg));

            expect(result.executedCount).toBe(0);
            expect(logs.some(l => l.includes('No runnable blocks'))).toBe(true);
        });

        it('executes motion and visibility blocks on stage state', async () => {
            const sprite = createDefaultSprite('cat-1', 'ScratchCat');
            let stageState: StageState = {
                width: 480,
                height: 360,
                sprites: [sprite],
                tempo: 60,
                videoTransparency: 50,
                videoState: 'off',
            };

            const setStageState = (action: any) => {
                stageState = typeof action === 'function' ? action(stageState) : action;
            };

            const logs: string[] = [];
            const logFn = (msg: string) => logs.push(msg);

            // Create a chain: flag -> movesteps(20) -> turnright(90) -> hide
            const b1 = makeMockBlock('b1', 'event_whenflagclicked');
            const b2 = makeMockBlock('b2', 'motion_movesteps', { STEPS: 20 });
            const b3 = makeMockBlock('b3', 'motion_turnright', { DEGREES: 90 });
            const b4 = makeMockBlock('b4', 'looks_hide');

            b1.next = b2;
            b2.next = b3;
            b3.next = b4;

            const res = await executeBlocks([b1, b2, b3, b4], 'cat-1', setStageState as any, logFn);

            expect(res.executedCount).toBe(4);
            const updated = stageState.sprites.find(s => s.id === 'cat-1')!;
            // Moving 20 steps at 90 deg (facing right) increases X by 20
            expect(updated.x).toBe(20);
            expect(updated.y).toBe(0);
            expect(updated.direction).toBe(180);
            expect(updated.visible).toBe(false);
        });

        it('executes looks_say and looks_think to set speech bubbles', async () => {
            const sprite = createDefaultSprite('square-1', 'Square');
            let stageState: StageState = {
                width: 480,
                height: 360,
                sprites: [sprite],
                tempo: 60,
                videoTransparency: 50,
                videoState: 'off',
            };

            const setStageState = (action: any) => {
                stageState = typeof action === 'function' ? action(stageState) : action;
            };

            const logs: string[] = [];
            const logFn = (msg: string) => logs.push(msg);

            // say "Hello!"
            const sayBlock = makeMockBlock('s1', 'looks_say', { MESSAGE: 'I am a movable square!' });
            await executeBlocks([sayBlock], 'square-1', setStageState as any, logFn);

            let updated = stageState.sprites.find(s => s.id === 'square-1')!;
            expect(updated.bubble).toBeDefined();
            expect(updated.bubble?.type).toBe('say');
            expect(updated.bubble?.text).toBe('I am a movable square!');

            // think "Thinking..."
            const thinkBlock = makeMockBlock('t1', 'looks_think', { MESSAGE: 'Pondering...' });
            await executeBlocks([thinkBlock], 'square-1', setStageState as any, logFn);

            updated = stageState.sprites.find(s => s.id === 'square-1')!;
            expect(updated.bubble).toBeDefined();
            expect(updated.bubble?.type).toBe('think');
            expect(updated.bubble?.text).toBe('Pondering...');
        });
    });
});
