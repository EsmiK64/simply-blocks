import * as Blockly from 'blockly/core';

export const SCRATCH_BLOCKS_JSON: Array<Record<string, unknown>> = [
    // ── Events ─────────────────────────────────────────────────────────────
    {
        type: 'event_whenflagclicked',
        message0: 'when ⚑ clicked',
        nextStatement: null,
        colour: '#FFBF00',
        tooltip: 'Run when the green flag is clicked',
    },
    {
        type: 'event_whenkeypressed',
        message0: 'when %1 key pressed',
        args0: [
            {
                type: 'field_dropdown',
                name: 'KEY_OPTION',
                options: [
                    ['space', 'space'],
                    ['up arrow', 'up arrow'],
                    ['down arrow', 'down arrow'],
                    ['right arrow', 'right arrow'],
                    ['left arrow', 'left arrow'],
                    ['any', 'any'],
                    ['a', 'a'],
                    ['b', 'b'],
                    ['c', 'c'],
                ],
            },
        ],
        nextStatement: null,
        colour: '#FFBF00',
    },
    {
        type: 'event_whenthisspriteclicked',
        message0: 'when this sprite clicked',
        nextStatement: null,
        colour: '#FFBF00',
    },

    // ── Motion ─────────────────────────────────────────────────────────────
    {
        type: 'motion_movesteps',
        message0: 'move %1 steps',
        args0: [{ type: 'input_value', name: 'STEPS', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_turnright',
        message0: 'turn ↻ %1 degrees',
        args0: [{ type: 'input_value', name: 'DEGREES', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_turnleft',
        message0: 'turn ↺ %1 degrees',
        args0: [{ type: 'input_value', name: 'DEGREES', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_gotoxy',
        message0: 'go to x: %1 y: %2',
        args0: [
            { type: 'input_value', name: 'X', check: 'Number' },
            { type: 'input_value', name: 'Y', check: 'Number' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_setx',
        message0: 'set x to %1',
        args0: [{ type: 'input_value', name: 'X', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_changexby',
        message0: 'change x by %1',
        args0: [{ type: 'input_value', name: 'DX', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_sety',
        message0: 'set y to %1',
        args0: [{ type: 'input_value', name: 'Y', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_changeyby',
        message0: 'change y by %1',
        args0: [{ type: 'input_value', name: 'DY', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#4C97FF',
    },
    {
        type: 'motion_xposition',
        message0: 'x position',
        output: 'Number',
        colour: '#4C97FF',
    },
    {
        type: 'motion_yposition',
        message0: 'y position',
        output: 'Number',
        colour: '#4C97FF',
    },
    {
        type: 'motion_direction',
        message0: 'direction',
        output: 'Number',
        colour: '#4C97FF',
    },

    // ── Looks ──────────────────────────────────────────────────────────────
    {
        type: 'looks_sayforsecs',
        message0: 'say %1 for %2 seconds',
        args0: [
            { type: 'input_value', name: 'MESSAGE' },
            { type: 'input_value', name: 'SECS', check: 'Number' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },
    {
        type: 'looks_say',
        message0: 'say %1',
        args0: [{ type: 'input_value', name: 'MESSAGE' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },
    {
        type: 'looks_thinkforsecs',
        message0: 'think %1 for %2 seconds',
        args0: [
            { type: 'input_value', name: 'MESSAGE' },
            { type: 'input_value', name: 'SECS', check: 'Number' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },
    {
        type: 'looks_think',
        message0: 'think %1',
        args0: [{ type: 'input_value', name: 'MESSAGE' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },
    {
        type: 'looks_show',
        message0: 'show',
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },
    {
        type: 'looks_hide',
        message0: 'hide',
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },
    {
        type: 'looks_changesizeby',
        message0: 'change size by %1',
        args0: [{ type: 'input_value', name: 'CHANGE', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },
    {
        type: 'looks_setsizeto',
        message0: 'set size to %1 %',
        args0: [{ type: 'input_value', name: 'SIZE', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#9966FF',
    },

    // ── Sound ──────────────────────────────────────────────────────────────
    {
        type: 'sound_playuntildone',
        message0: 'play sound %1 until done',
        args0: [
            {
                type: 'field_dropdown',
                name: 'SOUND_MENU',
                options: [
                    ['meow', 'meow'],
                    ['pop', 'pop'],
                    ['laser', 'laser'],
                    ['bell', 'bell'],
                ],
            },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#CF63CF',
    },
    {
        type: 'sound_play',
        message0: 'start sound %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'SOUND_MENU',
                options: [
                    ['meow', 'meow'],
                    ['pop', 'pop'],
                    ['laser', 'laser'],
                    ['bell', 'bell'],
                ],
            },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#CF63CF',
    },
    {
        type: 'sound_stopallsounds',
        message0: 'stop all sounds',
        previousStatement: null,
        nextStatement: null,
        colour: '#CF63CF',
    },

    // ── Control ────────────────────────────────────────────────────────────
    {
        type: 'control_wait',
        message0: 'wait %1 seconds',
        args0: [{ type: 'input_value', name: 'DURATION', check: 'Number' }],
        previousStatement: null,
        nextStatement: null,
        colour: '#FFAB19',
    },
    {
        type: 'control_repeat',
        message0: 'repeat %1 %2 %3',
        args0: [
            { type: 'input_value', name: 'TIMES', check: 'Number' },
            { type: 'input_dummy' },
            { type: 'input_statement', name: 'SUBSTACK' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#FFAB19',
    },
    {
        type: 'control_forever',
        message0: 'forever %1 %2',
        args0: [
            { type: 'input_dummy' },
            { type: 'input_statement', name: 'SUBSTACK' },
        ],
        previousStatement: null,
        colour: '#FFAB19',
    },
    {
        type: 'control_if',
        message0: 'if %1 then %2 %3',
        args0: [
            { type: 'input_value', name: 'CONDITION', check: 'Boolean' },
            { type: 'input_dummy' },
            { type: 'input_statement', name: 'SUBSTACK' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#FFAB19',
    },
    {
        type: 'control_if_else',
        message0: 'if %1 then %2 %3 else %4 %5',
        args0: [
            { type: 'input_value', name: 'CONDITION', check: 'Boolean' },
            { type: 'input_dummy' },
            { type: 'input_statement', name: 'SUBSTACK' },
            { type: 'input_dummy' },
            { type: 'input_statement', name: 'SUBSTACK2' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#FFAB19',
    },
    {
        type: 'control_stop',
        message0: 'stop %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'STOP_OPTION',
                options: [
                    ['all', 'all'],
                    ['this script', 'this script'],
                    ['other scripts in sprite', 'other scripts in sprite'],
                ],
            },
        ],
        previousStatement: null,
        colour: '#FFAB19',
    },

    // ── Sensing ────────────────────────────────────────────────────────────
    {
        type: 'sensing_mousex',
        message0: 'mouse x',
        output: 'Number',
        colour: '#5CB1D6',
    },
    {
        type: 'sensing_mousey',
        message0: 'mouse y',
        output: 'Number',
        colour: '#5CB1D6',
    },
    {
        type: 'sensing_timer',
        message0: 'timer',
        output: 'Number',
        colour: '#5CB1D6',
    },
    {
        type: 'sensing_resettimer',
        message0: 'reset timer',
        previousStatement: null,
        nextStatement: null,
        colour: '#5CB1D6',
    },

    // ── Operators ──────────────────────────────────────────────────────────
    {
        type: 'operator_add',
        message0: '%1 + %2',
        args0: [
            { type: 'input_value', name: 'NUM1', check: 'Number' },
            { type: 'input_value', name: 'NUM2', check: 'Number' },
        ],
        output: 'Number',
        colour: '#59C059',
    },
    {
        type: 'operator_subtract',
        message0: '%1 - %2',
        args0: [
            { type: 'input_value', name: 'NUM1', check: 'Number' },
            { type: 'input_value', name: 'NUM2', check: 'Number' },
        ],
        output: 'Number',
        colour: '#59C059',
    },
    {
        type: 'operator_multiply',
        message0: '%1 * %2',
        args0: [
            { type: 'input_value', name: 'NUM1', check: 'Number' },
            { type: 'input_value', name: 'NUM2', check: 'Number' },
        ],
        output: 'Number',
        colour: '#59C059',
    },
    {
        type: 'operator_divide',
        message0: '%1 / %2',
        args0: [
            { type: 'input_value', name: 'NUM1', check: 'Number' },
            { type: 'input_value', name: 'NUM2', check: 'Number' },
        ],
        output: 'Number',
        colour: '#59C059',
    },
    {
        type: 'operator_random',
        message0: 'pick random %1 to %2',
        args0: [
            { type: 'input_value', name: 'FROM', check: 'Number' },
            { type: 'input_value', name: 'TO', check: 'Number' },
        ],
        output: 'Number',
        colour: '#59C059',
    },
    {
        type: 'operator_lt',
        message0: '%1 < %2',
        args0: [
            { type: 'input_value', name: 'OPERAND1' },
            { type: 'input_value', name: 'OPERAND2' },
        ],
        output: 'Boolean',
        colour: '#59C059',
    },
    {
        type: 'operator_equals',
        message0: '%1 = %2',
        args0: [
            { type: 'input_value', name: 'OPERAND1' },
            { type: 'input_value', name: 'OPERAND2' },
        ],
        output: 'Boolean',
        colour: '#59C059',
    },
    {
        type: 'operator_gt',
        message0: '%1 > %2',
        args0: [
            { type: 'input_value', name: 'OPERAND1' },
            { type: 'input_value', name: 'OPERAND2' },
        ],
        output: 'Boolean',
        colour: '#59C059',
    },
    {
        type: 'operator_and',
        message0: '%1 and %2',
        args0: [
            { type: 'input_value', name: 'OPERAND1', check: 'Boolean' },
            { type: 'input_value', name: 'OPERAND2', check: 'Boolean' },
        ],
        output: 'Boolean',
        colour: '#59C059',
    },
    {
        type: 'operator_or',
        message0: '%1 or %2',
        args0: [
            { type: 'input_value', name: 'OPERAND1', check: 'Boolean' },
            { type: 'input_value', name: 'OPERAND2', check: 'Boolean' },
        ],
        output: 'Boolean',
        colour: '#59C059',
    },
    {
        type: 'operator_not',
        message0: 'not %1',
        args0: [{ type: 'input_value', name: 'OPERAND', check: 'Boolean' }],
        output: 'Boolean',
        colour: '#59C059',
    },
    {
        type: 'operator_join',
        message0: 'join %1 %2',
        args0: [
            { type: 'input_value', name: 'STRING1' },
            { type: 'input_value', name: 'STRING2' },
        ],
        output: 'String',
        colour: '#59C059',
    },

    // ── Variables ──────────────────────────────────────────────────────────
    {
        type: 'data_setvariableto',
        message0: 'set %1 to %2',
        args0: [
            {
                type: 'field_variable',
                name: 'VARIABLE',
                variable: 'my variable',
            },
            { type: 'input_value', name: 'VALUE' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#FF8C1A',
    },
    {
        type: 'data_changevariableby',
        message0: 'change %1 by %2',
        args0: [
            {
                type: 'field_variable',
                name: 'VARIABLE',
                variable: 'my variable',
            },
            { type: 'input_value', name: 'VALUE', check: 'Number' },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#FF8C1A',
    },
];

let isInitialized = false;

export function registerScratchBlocks() {
    if (isInitialized) {
        return;
    }

    Blockly.defineBlocksWithJsonArray(SCRATCH_BLOCKS_JSON);
    isInitialized = true;
}
