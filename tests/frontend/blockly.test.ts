import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { describe, it, expect } from 'bun:test';
import { registerScratchBlocks } from '../../resources/js/blocks/blockly/blocks';
import { registerGenerators } from '../../resources/js/blocks/blockly/generators';
import { SCRATCH_TOOLBOX } from '../../resources/js/blocks/blockly/toolbox';

describe('Blockly Zelos Integration', () => {
    it('registers custom Scratch-style blocks in Blockly.Blocks', () => {
        registerScratchBlocks();

        const expectedBlockTypes = [
            'event_whenflagclicked',
            'event_whenkeypressed',
            'event_whenthisspriteclicked',
            'motion_movesteps',
            'motion_turnright',
            'motion_turnleft',
            'motion_gotoxy',
            'looks_say',
            'looks_think',
            'control_repeat',
            'control_forever',
            'control_if',
            'control_if_else',
            'operator_add',
            'operator_random',
        ];

        for (const type of expectedBlockTypes) {
            expect(Blockly.Blocks[type]).toBeDefined();
            expect(typeof Blockly.Blocks[type].init).toBe('function');
        }
    });

    it('registers Python and JavaScript generators for Scratch blocks', () => {
        registerGenerators();

        // Hat block returns header comments directly
        expect(typeof pythonGenerator.forBlock['event_whenflagclicked']).toBe('function');
        const flagPy = (pythonGenerator.forBlock['event_whenflagclicked'] as any)();
        expect(flagPy).toBe('# When green flag clicked\n');

        expect(typeof javascriptGenerator.forBlock['event_whenflagclicked']).toBe('function');
        const flagJs = (javascriptGenerator.forBlock['event_whenflagclicked'] as any)();
        expect(flagJs).toBe('// When green flag clicked\n');

        // Check motion generators
        expect(typeof pythonGenerator.forBlock['motion_movesteps']).toBe('function');
        expect(typeof javascriptGenerator.forBlock['motion_movesteps']).toBe('function');
        expect(typeof pythonGenerator.forBlock['motion_turnright']).toBe('function');
        expect(typeof pythonGenerator.forBlock['control_repeat']).toBe('function');
    });

    it('contains all essential categories in SCRATCH_TOOLBOX', () => {
        expect(SCRATCH_TOOLBOX.kind).toBe('categoryToolbox');
        expect(Array.isArray(SCRATCH_TOOLBOX.contents)).toBe(true);

        const categoryNames = SCRATCH_TOOLBOX.contents.map((c: any) => c.name);
        expect(categoryNames).toContain('Events');
        expect(categoryNames).toContain('Motion');
        expect(categoryNames).toContain('Looks');
        expect(categoryNames).toContain('Sound');
        expect(categoryNames).toContain('Control');
        expect(categoryNames).toContain('Sensing');
        expect(categoryNames).toContain('Operators');
        expect(categoryNames).toContain('Variables');
    });
});
