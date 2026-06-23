import { BlockDefinition } from './types';

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
    // Events (Start blocks - hat blocks)
    {
        type: 'events_whenflagclicked',
        label: 'when flag clicked',
        category: 'events',
        color: '#FFBF00',
        isHat: true,
        hasTab: true,
    },
    {
        type: 'events_whenkeypressed',
        label: 'when %1 key pressed',
        category: 'events',
        color: '#FFBF00',
        isHat: true,
        hasTab: true,
        fields: [{
            name: 'KEY', type: 'dropdown', value: 'space', options: [
                { label: 'space', value: 'space' },
                { label: 'up arrow', value: 'up' },
                { label: 'down arrow', value: 'down' },
                { label: 'left arrow', value: 'left' },
                { label: 'right arrow', value: 'right' },
            ]
        }],
    },

    // Motion
    {
        type: 'motion_movesteps',
        label: 'move %1 steps',
        category: 'motion',
        color: '#4C97FF',
        hasNotch: true,
        hasTab: true,
        fields: [{ name: 'STEPS', type: 'number', value: 10 }],
    },
    {
        type: 'motion_turnright',
        label: 'turn right %1 degrees',
        category: 'motion',
        color: '#4C97FF',
        hasNotch: true,
        hasTab: true,
        fields: [{ name: 'DEGREES', type: 'number', value: 15 }],
    },
    {
        type: 'motion_gotoxy',
        label: 'go to x: %1 y: %2',
        category: 'motion',
        color: '#4C97FF',
        hasNotch: true,
        hasTab: true,
        fields: [
            { name: 'X', type: 'number', value: 0 },
            { name: 'Y', type: 'number', value: 0 },
        ],
    },

    // Logic
    {
        type: 'logic_if',
        label: 'if %1 then',
        category: 'logic',
        color: '#4C97FF',
        hasNotch: true,
        hasTab: true,
        hasContainer: true,
        inputs: ['CONDITION'],
    },
    {
        type: 'logic_ifelse',
        label: 'if %1 then',
        category: 'logic',
        color: '#4C97FF',
        hasNotch: true,
        hasTab: true,
        hasContainer: true,
        hasElse: true,
        inputs: ['CONDITION'],
    },
    {
        type: 'logic_compare',
        label: '%1 %2 %3',
        category: 'logic',
        color: '#4C97FF',
        hasNotch: false,
        hasTab: false,
        fields: [
            {
                name: 'OPERATOR', type: 'dropdown', value: '=', options: [
                    { label: '=', value: '=' },
                    { label: '<', value: '<' },
                    { label: '>', value: '>' },
                    { label: '≤', value: '<=' },
                    { label: '≥', value: '>=' },
                ]
            },
        ],
        inputs: ['A', 'B'],
    },
    {
        type: 'logic_boolean',
        label: '%1',
        category: 'logic',
        color: '#4C97FF',
        hasNotch: false,
        hasTab: false,
        fields: [{
            name: 'BOOL', type: 'dropdown', value: 'true', options: [
                { label: 'true', value: 'true' },
                { label: 'false', value: 'false' },
            ]
        }],
    },

    // Loops
    {
        type: 'loops_repeat',
        label: 'repeat %1',
        category: 'loops',
        color: '#FFAB19',
        hasNotch: true,
        hasTab: true,
        hasContainer: true,
        fields: [{ name: 'TIMES', type: 'number', value: 10 }],
    },
    {
        type: 'loops_forever',
        label: 'forever',
        category: 'loops',
        color: '#FFAB19',
        hasNotch: true,
        hasTab: true,
        hasContainer: true,
    },
    {
        type: 'loops_while',
        label: 'while %1',
        category: 'loops',
        color: '#FFAB19',
        hasNotch: true,
        hasTab: true,
        hasContainer: true,
        inputs: ['CONDITION'],
    },

    // Math
    {
        type: 'math_number',
        label: '%1',
        category: 'math',
        color: '#59C059',
        hasNotch: false,
        hasTab: false,
        fields: [{ name: 'NUM', type: 'number', value: 0 }],
    },
    {
        type: 'math_arithmetic',
        label: '%1 %2 %3',
        category: 'math',
        color: '#59C059',
        hasNotch: false,
        hasTab: false,
        fields: [{
            name: 'OP', type: 'dropdown', value: '+', options: [
                { label: '+', value: '+' },
                { label: '-', value: '-' },
                { label: '×', value: '*' },
                { label: '/', value: '/' },
            ]
        }],
        inputs: ['A', 'B'],
    },
    {
        type: 'math_random',
        label: 'pick random %1 to %2',
        category: 'math',
        color: '#59C059',
        hasNotch: false,
        hasTab: false,
        inputs: ['FROM', 'TO'],
    },

    // Text
    {
        type: 'text',
        label: '%1',
        category: 'text',
        color: '#FF6680',
        hasNotch: false,
        hasTab: false,
        fields: [{ name: 'TEXT', type: 'string', value: '' }],
    },
    {
        type: 'text_join',
        label: 'join %1 %2',
        category: 'text',
        color: '#FF6680',
        hasNotch: false,
        hasTab: false,
        inputs: ['A', 'B'],
    },
    {
        type: 'text_print',
        label: 'print %1',
        category: 'text',
        color: '#FF6680',
        hasNotch: true,
        hasTab: true,
        inputs: ['TEXT'],
    },

    // Variables
    {
        type: 'variables_set',
        label: 'set %1 to %2',
        category: 'variables',
        color: '#FF8C1A',
        hasNotch: true,
        hasTab: true,
        fields: [{
            name: 'VAR', type: 'dropdown', value: 'my variable', options: [
                { label: 'my variable', value: 'my variable' },
            ]
        }],
        inputs: ['VALUE'],
    },
    {
        type: 'variables_get',
        label: '%1',
        category: 'variables',
        color: '#FF8C1A',
        hasNotch: false,
        hasTab: false,
        fields: [{
            name: 'VAR', type: 'dropdown', value: 'my variable', options: [
                { label: 'my variable', value: 'my variable' },
            ]
        }],
    },

    // Control (End blocks)
    {
        type: 'control_stop',
        label: 'stop all',
        category: 'control',
        color: '#FFAB19',
        hasNotch: true,
        isEnd: true,
    },
    {
        type: 'control_wait',
        label: 'wait %1 seconds',
        category: 'control',
        color: '#FFAB19',
        hasNotch: true,
        hasTab: true,
        fields: [{ name: 'SECONDS', type: 'number', value: 1 }],
    },
];

export function getBlockDefinition(type: string): BlockDefinition | undefined {
    return BLOCK_DEFINITIONS.find(def => def.type === type);
}
