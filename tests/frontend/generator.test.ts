import { describe, it, expect } from 'bun:test';
import { generatePython } from '../../resources/js/blocks/generator';
import type { BlockInstance, BlockDefinition } from '../../resources/js/blocks/types';

function makeMockBlock(
    id: string,
    opcode: string,
    fields: Record<string, any> = {},
    inputs: Record<string, BlockInstance> = {}
): BlockInstance {
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
        inputs,
        next: null,
        children: [],
        elseChildren: [],
        x: 0,
        y: 0,
    };
}

describe('Python Code Generator', () => {
    it('generates placeholder comment for empty workspace', () => {
        const code = generatePython([]);
        expect(code).toBe('# Workspace is empty. Drag blocks to assemble your script.');
    });

    it('generates event handlers and sequential motion calls', () => {
        const flag = makeMockBlock('flag', 'event_whenflagclicked');
        const move = makeMockBlock('move', 'motion_movesteps', { STEPS: 25 });
        const turn = makeMockBlock('turn', 'motion_turnright', { DEGREES: 45 });
        const say = makeMockBlock('say', 'looks_say', { MESSAGE: 'Hello world' });

        flag.next = move;
        move.next = turn;
        turn.next = say;

        const code = generatePython([flag, move, turn, say]);

        expect(code).toContain('def on_green_flag():');
        expect(code).toContain('sprite.forward(25)');
        expect(code).toContain('sprite.right(45)');
        expect(code).toContain('sprite.say("Hello world")');
    });

    it('generates nested loop statements for control_repeat', () => {
        const repeat = makeMockBlock('rep', 'control_repeat', { TIMES: 4 });
        const step = makeMockBlock('step', 'motion_movesteps', { STEPS: 10 });
        repeat.children = [step];

        const code = generatePython([repeat]);

        expect(code).toContain('for _ in range(4):');
        expect(code).toContain('    sprite.forward(10)');
    });

    it('evaluates nested operator expressions', () => {
        const add = makeMockBlock('add', 'operator_add', { NUM1: 5, NUM2: 10 });
        const move = makeMockBlock('move', 'motion_movesteps', {}, { STEPS: add });

        const code = generatePython([move]);
        expect(code).toContain('sprite.forward((5 + 10))');
    });

    it('generates branch statements for control_if_else', () => {
        const ifElse = makeMockBlock('ifelse', 'control_if_else', { CONDITION: true });
        const sayYes = makeMockBlock('say1', 'looks_say', { MESSAGE: 'Yes' });
        const sayNo = makeMockBlock('say2', 'looks_say', { MESSAGE: 'No' });

        ifElse.children = [sayYes];
        ifElse.elseChildren = [sayNo];

        const code = generatePython([ifElse]);
        expect(code).toContain('if True:');
        expect(code).toContain('    sprite.say("Yes")');
        expect(code).toContain('else:');
        expect(code).toContain('    sprite.say("No")');
    });
});
