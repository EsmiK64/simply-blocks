import { describe, it, expect } from 'bun:test';
import { serialiseTarget, serialiseProject, chainBlocks } from '../../resources/js/blocks/sb3Serialiser';
import type { BlockInstance, BlockDefinition } from '../../resources/js/blocks/types';

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

describe('Scratch 3.0 Serialiser', () => {
    it('chainBlocks links blocks sequentially from index 0 to N', () => {
        const b1 = makeMockBlock('b1', 'motion_movesteps');
        const b2 = makeMockBlock('b2', 'motion_turnright');
        const b3 = makeMockBlock('b3', 'looks_say');
        const b4 = makeMockBlock('b4', 'control_wait');

        const output: Record<string, any> = {};
        const headId = chainBlocks([b1, b2, b3, b4], 'parent-loop', output);

        expect(headId).toBe('b1');
        expect(output['b1']).toBeDefined();
        expect(output['b2']).toBeDefined();
        expect(output['b3']).toBeDefined();
        expect(output['b4']).toBeDefined();

        expect(output['b1'].next).toBe('b2');
        expect(output['b2'].next).toBe('b3');
        expect(output['b3'].next).toBe('b4');
        expect(output['b4'].next).toBeNull();
    });

    it('chainBlocks handles single block and empty array', () => {
        const output: Record<string, any> = {};
        expect(chainBlocks([], 'p', output)).toBeNull();

        const single = makeMockBlock('s1', 'motion_movesteps');
        expect(chainBlocks([single], 'p', output)).toBe('s1');
        expect(output['s1'].next).toBeNull();
    });

    it('serialiseTarget serialises sprite properties and blocks map correctly', () => {
        const b1 = makeMockBlock('b1', 'motion_movesteps', { STEPS: 10 });
        const b2 = makeMockBlock('b2', 'motion_turnright', { DEGREES: 15 });
        b1.next = b2;

        const target: any = serialiseTarget({
            name: 'Sprite1',
            isStage: false,
            costumes: [],
            sounds: [],
            scripts: [b1],
            x: 50,
            y: -30,
            direction: 90,
            visible: true,
        });

        expect(target.name).toBe('Sprite1');
        expect(target.isStage).toBe(false);
        expect(target.x).toBe(50);
        expect(target.y).toBe(-30);
        expect(target.blocks).toBeDefined();

        const blockMap = target.blocks;
        expect(blockMap['b1']).toBeDefined();
        expect(blockMap['b2']).toBeDefined();
        expect(blockMap['b1'].opcode).toBe('motion_movesteps');
        expect(blockMap['b1'].next).toBe('b2');
        expect(blockMap['b2'].opcode).toBe('motion_turnright');
        expect(blockMap['b2'].next).toBeNull();
    });

    it('serialiseProject formats valid project JSON envelope', () => {
        const project: any = serialiseProject([
            {
                name: 'Stage',
                isStage: true,
                costumes: [],
                sounds: [],
                scripts: [],
            },
        ]);

        expect(project.meta).toBeDefined();
        expect(project.meta.semver).toBe('3.0.0');
        expect(project.targets).toHaveLength(1);
        expect(project.targets[0].isStage).toBe(true);
    });
});
