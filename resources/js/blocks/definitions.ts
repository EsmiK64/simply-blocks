import { BlockDefinition } from './types';

// Scratch 3.0 colour palette per category
const C = {
    motion: '#4C97FF',
    looks: '#9966FF',
    sound: '#CF63CF',
    events: '#FFBF00',
    control: '#FFAB19',
    sensing: '#5CB1D6',
    operators: '#59C059',
    variables: '#FF8C1A',
    lists: '#FF661A',
    myblocks: '#FF6680',
    pen: '#0fBD8C',
    // legacy aliases kept for existing blocks
    logic: '#4C97FF',
    loops: '#FFAB19',
    math: '#59C059',
    text: '#FF6680',
};

// Full keyboard key list for event_whenkeypressed / sensing_keypressed
const KEY_OPTS = [
    'space', 'up arrow', 'down arrow', 'left arrow', 'right arrow', 'any',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
].map(k => ({ label: k, value: k }));

const ROTATION_STYLE_OPTS = [
    { label: 'left-right', value: 'left-right' },
    { label: "don't rotate", value: "don't rotate" },
    { label: 'all around', value: 'all around' },
];

const EFFECT_OPTS = [
    { label: 'color', value: 'COLOR' },
    { label: 'fisheye', value: 'FISHEYE' },
    { label: 'whirl', value: 'WHIRL' },
    { label: 'pixelate', value: 'PIXELATE' },
    { label: 'mosaic', value: 'MOSAIC' },
    { label: 'brightness', value: 'BRIGHTNESS' },
    { label: 'ghost', value: 'GHOST' },
];

const SOUND_EFFECT_OPTS = [
    { label: 'pitch', value: 'PITCH' },
    { label: 'pan left/right', value: 'PAN' },
];

const STOP_OPTS = [
    { label: 'all', value: 'all' },
    { label: 'this script', value: 'this script' },
    { label: 'other scripts in sprite', value: 'other scripts in sprite' },
];

const MATH_OP_OPTS = [
    { label: 'abs', value: 'abs' },
    { label: 'floor', value: 'floor' },
    { label: 'ceiling', value: 'ceiling' },
    { label: 'sqrt', value: 'sqrt' },
    { label: 'sin', value: 'sin' },
    { label: 'cos', value: 'cos' },
    { label: 'tan', value: 'tan' },
    { label: 'asin', value: 'asin' },
    { label: 'acos', value: 'acos' },
    { label: 'atan', value: 'atan' },
    { label: 'ln', value: 'ln' },
    { label: 'log', value: 'log' },
    { label: 'e ^', value: 'e ^' },
    { label: '10 ^', value: '10 ^' },
];

const CURRENT_OPTS = [
    { label: 'year', value: 'YEAR' },
    { label: 'month', value: 'MONTH' },
    { label: 'date', value: 'DATE' },
    { label: 'day of week', value: 'DAYOFWEEK' },
    { label: 'hour', value: 'HOUR' },
    { label: 'minute', value: 'MINUTE' },
    { label: 'second', value: 'SECOND' },
];

export const BLOCK_DEFINITIONS: BlockDefinition[] = [

    // ── EVENTS ────────────────────────────────────────────────────────────
    {
        type: 'event_whenflagclicked',
        sb3Opcode: 'event_whenflagclicked',
        label: 'when 🏁 clicked',
        category: 'events', color: C.events,
        shape: 'hat', isHat: true, hasTab: true,
    },
    {
        type: 'event_whenkeypressed',
        sb3Opcode: 'event_whenkeypressed',
        label: 'when %1 key pressed',
        category: 'events', color: C.events,
        shape: 'hat', isHat: true, hasTab: true,
        fields: [{ name: 'KEY_OPTION', type: 'key', value: 'space', options: KEY_OPTS }],
    },
    {
        type: 'event_whenthisspriteclicked',
        sb3Opcode: 'event_whenthisspriteclicked',
        label: 'when this sprite clicked',
        category: 'events', color: C.events,
        shape: 'hat', isHat: true, hasTab: true,
    },
    {
        type: 'event_whenbackdropswitchesto',
        sb3Opcode: 'event_whenbackdropswitchesto',
        label: 'when backdrop switches to %1',
        category: 'events', color: C.events,
        shape: 'hat', isHat: true, hasTab: true,
        fields: [{ name: 'BACKDROP', type: 'dropdown', value: 'backdrop1', options: [{ label: 'backdrop1', value: 'backdrop1' }] }],
    },
    {
        type: 'event_whenbroadcastreceived',
        sb3Opcode: 'event_whenbroadcastreceived',
        label: 'when I receive %1',
        category: 'events', color: C.events,
        shape: 'hat', isHat: true, hasTab: true,
        fields: [{ name: 'BROADCAST_OPTION', type: 'broadcast', value: 'message1', options: [{ label: 'message1', value: 'message1' }] }],
    },
    {
        type: 'event_broadcast',
        sb3Opcode: 'event_broadcast',
        label: 'broadcast %1',
        category: 'events', color: C.events,
        hasNotch: true, hasTab: true,
        inputs: ['BROADCAST_INPUT'],
    },
    {
        type: 'event_broadcastandwait',
        sb3Opcode: 'event_broadcastandwait',
        label: 'broadcast %1 and wait',
        category: 'events', color: C.events,
        hasNotch: true, hasTab: true,
        inputs: ['BROADCAST_INPUT'],
    },

    // ── MOTION ────────────────────────────────────────────────────────────
    {
        type: 'motion_movesteps',
        sb3Opcode: 'motion_movesteps',
        label: 'move %1 steps',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'STEPS', type: 'number', value: 10 }],
    },
    {
        type: 'motion_turnright',
        sb3Opcode: 'motion_turnright',
        label: 'turn ↻ %1 degrees',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'DEGREES', type: 'number', value: 15 }],
    },
    {
        type: 'motion_turnleft',
        sb3Opcode: 'motion_turnleft',
        label: 'turn ↺ %1 degrees',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'DEGREES', type: 'number', value: 15 }],
    },
    {
        type: 'motion_goto',
        sb3Opcode: 'motion_goto',
        label: 'go to %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{
            name: 'TO', type: 'sprite', value: '_random_', options: [
                { label: 'random position', value: '_random_' },
                { label: 'mouse-pointer', value: '_mouse_' },
            ]
        }],
    },
    {
        type: 'motion_gotoxy',
        sb3Opcode: 'motion_gotoxy',
        label: 'go to x: %1 y: %2',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'X', type: 'number', value: 0 },
            { name: 'Y', type: 'number', value: 0 },
        ],
    },
    {
        type: 'motion_glideto',
        sb3Opcode: 'motion_glideto',
        label: 'glide %1 secs to %2',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'SECS', type: 'number', value: 1 },
            {
                name: 'TO', type: 'sprite', value: '_random_', options: [
                    { label: 'random position', value: '_random_' },
                    { label: 'mouse-pointer', value: '_mouse_' },
                ]
            },
        ],
    },
    {
        type: 'motion_glidesecstoxy',
        sb3Opcode: 'motion_glidesecstoxy',
        label: 'glide %1 secs to x: %2 y: %3',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'SECS', type: 'number', value: 1 },
            { name: 'X', type: 'number', value: 0 },
            { name: 'Y', type: 'number', value: 0 },
        ],
    },
    {
        type: 'motion_pointindirection',
        sb3Opcode: 'motion_pointindirection',
        label: 'point in direction %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'DIRECTION', type: 'number', value: 90 }],
    },
    {
        type: 'motion_pointtowards',
        sb3Opcode: 'motion_pointtowards',
        label: 'point towards %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{
            name: 'TOWARDS', type: 'sprite', value: '_mouse_', options: [
                { label: 'mouse-pointer', value: '_mouse_' },
            ]
        }],
    },
    {
        type: 'motion_changexby',
        sb3Opcode: 'motion_changexby',
        label: 'change x by %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'DX', type: 'number', value: 10 }],
    },
    {
        type: 'motion_setx',
        sb3Opcode: 'motion_setx',
        label: 'set x to %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'X', type: 'number', value: 0 }],
    },
    {
        type: 'motion_changeyby',
        sb3Opcode: 'motion_changeyby',
        label: 'change y by %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'DY', type: 'number', value: 10 }],
    },
    {
        type: 'motion_sety',
        sb3Opcode: 'motion_sety',
        label: 'set y to %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'Y', type: 'number', value: 0 }],
    },
    {
        type: 'motion_ifonedgebounce',
        sb3Opcode: 'motion_ifonedgebounce',
        label: 'if on edge, bounce',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'motion_setrotationstyle',
        sb3Opcode: 'motion_setrotationstyle',
        label: 'set rotation style %1',
        category: 'motion', color: C.motion,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'STYLE', type: 'dropdown', value: 'left-right', options: ROTATION_STYLE_OPTS }],
    },
    // Motion reporters
    {
        type: 'motion_xposition',
        sb3Opcode: 'motion_xposition',
        label: 'x position',
        category: 'motion', color: C.motion, shape: 'reporter',
    },
    {
        type: 'motion_yposition',
        sb3Opcode: 'motion_yposition',
        label: 'y position',
        category: 'motion', color: C.motion, shape: 'reporter',
    },
    {
        type: 'motion_direction',
        sb3Opcode: 'motion_direction',
        label: 'direction',
        category: 'motion', color: C.motion, shape: 'reporter',
    },

    // ── LOOKS ─────────────────────────────────────────────────────────────
    {
        type: 'looks_sayforsecs',
        sb3Opcode: 'looks_sayforsecs',
        label: 'say %1 for %2 seconds',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'MESSAGE', type: 'string', value: 'Hello!' },
            { name: 'SECS', type: 'number', value: 2 },
        ],
    },
    {
        type: 'looks_say',
        sb3Opcode: 'looks_say',
        label: 'say %1',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'MESSAGE', type: 'string', value: 'Hello!' }],
    },
    {
        type: 'looks_thinkforsecs',
        sb3Opcode: 'looks_thinkforsecs',
        label: 'think %1 for %2 seconds',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'MESSAGE', type: 'string', value: 'Hmm...' },
            { name: 'SECS', type: 'number', value: 2 },
        ],
    },
    {
        type: 'looks_think',
        sb3Opcode: 'looks_think',
        label: 'think %1',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'MESSAGE', type: 'string', value: 'Hmm...' }],
    },
    {
        type: 'looks_switchcostumeto',
        sb3Opcode: 'looks_switchcostumeto',
        label: 'switch costume to %1',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'COSTUME', type: 'dropdown', value: 'costume1', options: [{ label: 'costume1', value: 'costume1' }] }],
    },
    {
        type: 'looks_nextcostume',
        sb3Opcode: 'looks_nextcostume',
        label: 'next costume',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'looks_switchbackdropto',
        sb3Opcode: 'looks_switchbackdropto',
        label: 'switch backdrop to %1',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'BACKDROP', type: 'dropdown', value: 'backdrop1', options: [{ label: 'backdrop1', value: 'backdrop1' }] }],
    },
    {
        type: 'looks_nextbackdrop',
        sb3Opcode: 'looks_nextbackdrop',
        label: 'next backdrop',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'looks_changesizeby',
        sb3Opcode: 'looks_changesizeby',
        label: 'change size by %1',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'CHANGE', type: 'number', value: 10 }],
    },
    {
        type: 'looks_setsizeto',
        sb3Opcode: 'looks_setsizeto',
        label: 'set size to %1 %',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'SIZE', type: 'number', value: 100 }],
    },
    {
        type: 'looks_changeeffectby',
        sb3Opcode: 'looks_changeeffectby',
        label: 'change %1 effect by %2',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'EFFECT', type: 'effect', value: 'COLOR', options: EFFECT_OPTS },
            { name: 'CHANGE', type: 'number', value: 25 },
        ],
    },
    {
        type: 'looks_seteffectto',
        sb3Opcode: 'looks_seteffectto',
        label: 'set %1 effect to %2',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'EFFECT', type: 'effect', value: 'COLOR', options: EFFECT_OPTS },
            { name: 'VALUE', type: 'number', value: 0 },
        ],
    },
    {
        type: 'looks_cleargraphiceffects',
        sb3Opcode: 'looks_cleargraphiceffects',
        label: 'clear graphic effects',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'looks_show',
        sb3Opcode: 'looks_show',
        label: 'show',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'looks_hide',
        sb3Opcode: 'looks_hide',
        label: 'hide',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'looks_gotofrontback',
        sb3Opcode: 'looks_gotofrontback',
        label: 'go to %1 layer',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [{
            name: 'FRONT_BACK', type: 'dropdown', value: 'front', options: [
                { label: 'front', value: 'front' },
                { label: 'back', value: 'back' },
            ]
        }],
    },
    {
        type: 'looks_goforwardbackwardlayers',
        sb3Opcode: 'looks_goforwardbackwardlayers',
        label: 'go %1 %2 layers',
        category: 'looks', color: C.looks,
        hasNotch: true, hasTab: true,
        fields: [
            {
                name: 'FORWARD_BACKWARD', type: 'dropdown', value: 'forward', options: [
                    { label: 'forward', value: 'forward' },
                    { label: 'backward', value: 'backward' },
                ]
            },
            { name: 'NUM', type: 'number', value: 1 },
        ],
    },
    // Looks reporters
    {
        type: 'looks_costumenumbername',
        sb3Opcode: 'looks_costumenumbername',
        label: 'costume %1',
        category: 'looks', color: C.looks, shape: 'reporter',
        fields: [{
            name: 'NUMBER_NAME', type: 'dropdown', value: 'number', options: [
                { label: 'number', value: 'number' },
                { label: 'name', value: 'name' },
            ]
        }],
    },
    {
        type: 'looks_backdropnumbername',
        sb3Opcode: 'looks_backdropnumbername',
        label: 'backdrop %1',
        category: 'looks', color: C.looks, shape: 'reporter',
        fields: [{
            name: 'NUMBER_NAME', type: 'dropdown', value: 'number', options: [
                { label: 'number', value: 'number' },
                { label: 'name', value: 'name' },
            ]
        }],
    },
    {
        type: 'looks_size',
        sb3Opcode: 'looks_size',
        label: 'size',
        category: 'looks', color: C.looks, shape: 'reporter',
    },

    // ── SOUND ─────────────────────────────────────────────────────────────
    {
        type: 'sound_playuntildone',
        sb3Opcode: 'sound_playuntildone',
        label: 'play sound %1 until done',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'SOUND_MENU', type: 'dropdown', value: 'pop', options: [{ label: 'pop', value: 'pop' }] }],
    },
    {
        type: 'sound_play',
        sb3Opcode: 'sound_play',
        label: 'start sound %1',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'SOUND_MENU', type: 'dropdown', value: 'pop', options: [{ label: 'pop', value: 'pop' }] }],
    },
    {
        type: 'sound_stopallsounds',
        sb3Opcode: 'sound_stopallsounds',
        label: 'stop all sounds',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'sound_changeeffectby',
        sb3Opcode: 'sound_changeeffectby',
        label: 'change %1 effect by %2',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'EFFECT', type: 'effect', value: 'PITCH', options: SOUND_EFFECT_OPTS },
            { name: 'VALUE', type: 'number', value: 10 },
        ],
    },
    {
        type: 'sound_seteffectto',
        sb3Opcode: 'sound_seteffectto',
        label: 'set %1 effect to %2',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'EFFECT', type: 'effect', value: 'PITCH', options: SOUND_EFFECT_OPTS },
            { name: 'VALUE', type: 'number', value: 100 },
        ],
    },
    {
        type: 'sound_cleareffects',
        sb3Opcode: 'sound_cleareffects',
        label: 'clear sound effects',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'sound_changevolumeby',
        sb3Opcode: 'sound_changevolumeby',
        label: 'change volume by %1',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'VOLUME', type: 'number', value: -10 }],
    },
    {
        type: 'sound_setvolumeto',
        sb3Opcode: 'sound_setvolumeto',
        label: 'set volume to %1 %',
        category: 'sound', color: C.sound,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'VOLUME', type: 'number', value: 100 }],
    },
    {
        type: 'sound_volume',
        sb3Opcode: 'sound_volume',
        label: 'volume',
        category: 'sound', color: C.sound, shape: 'reporter',
    },

    // ── CONTROL ───────────────────────────────────────────────────────────
    {
        type: 'control_wait',
        sb3Opcode: 'control_wait',
        label: 'wait %1 seconds',
        category: 'control', color: C.control,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'DURATION', type: 'number', value: 1 }],
    },
    {
        type: 'control_repeat',
        sb3Opcode: 'control_repeat',
        label: 'repeat %1',
        category: 'control', color: C.control,
        hasNotch: true, hasTab: true, hasContainer: true,
        fields: [{ name: 'TIMES', type: 'number', value: 10 }],
    },
    {
        type: 'control_forever',
        sb3Opcode: 'control_forever',
        label: 'forever',
        category: 'control', color: C.control,
        hasNotch: true, hasContainer: true, isEnd: true,
    },
    {
        type: 'control_if',
        sb3Opcode: 'control_if',
        label: 'if %1 then',
        category: 'control', color: C.control,
        hasNotch: true, hasTab: true, hasContainer: true,
        inputs: ['CONDITION'],
    },
    {
        type: 'control_if_else',
        sb3Opcode: 'control_if_else',
        label: 'if %1 then',
        category: 'control', color: C.control,
        hasNotch: true, hasTab: true, hasContainer: true, hasElse: true,
        inputs: ['CONDITION'],
    },
    {
        type: 'control_wait_until',
        sb3Opcode: 'control_wait_until',
        label: 'wait until %1',
        category: 'control', color: C.control,
        hasNotch: true, hasTab: true,
        inputs: ['CONDITION'],
    },
    {
        type: 'control_repeat_until',
        sb3Opcode: 'control_repeat_until',
        label: 'repeat until %1',
        category: 'control', color: C.control,
        hasNotch: true, hasTab: true, hasContainer: true,
        inputs: ['CONDITION'],
    },
    {
        type: 'control_stop',
        sb3Opcode: 'control_stop',
        label: 'stop %1',
        category: 'control', color: C.control,
        hasNotch: true, isEnd: true,
        fields: [{ name: 'STOP_OPTION', type: 'stopOption', value: 'all', options: STOP_OPTS }],
    },
    {
        type: 'control_start_as_clone',
        sb3Opcode: 'control_start_as_clone',
        label: 'when I start as a clone',
        category: 'control', color: C.control,
        shape: 'hat', isHat: true, hasTab: true,
    },
    {
        type: 'control_create_clone_of',
        sb3Opcode: 'control_create_clone_of',
        label: 'create clone of %1',
        category: 'control', color: C.control,
        hasNotch: true, hasTab: true,
        fields: [{
            name: 'CLONE_OPTION', type: 'sprite', value: '_myself_', options: [
                { label: 'myself', value: '_myself_' },
            ]
        }],
    },
    {
        type: 'control_delete_this_clone',
        sb3Opcode: 'control_delete_this_clone',
        label: 'delete this clone',
        category: 'control', color: C.control,
        hasNotch: true, isEnd: true,
    },

    // ── SENSING ───────────────────────────────────────────────────────────
    {
        type: 'sensing_touchingobject',
        sb3Opcode: 'sensing_touchingobject',
        label: 'touching %1 ?',
        category: 'sensing', color: C.sensing, shape: 'boolean',
        fields: [{
            name: 'TOUCHINGOBJECTMENU', type: 'sprite', value: '_mouse_', options: [
                { label: 'mouse-pointer', value: '_mouse_' },
                { label: 'edge', value: '_edge_' },
            ]
        }],
    },
    {
        type: 'sensing_touchingcolor',
        sb3Opcode: 'sensing_touchingcolor',
        label: 'touching color %1 ?',
        category: 'sensing', color: C.sensing, shape: 'boolean',
        fields: [{ name: 'COLOR', type: 'color', value: '#ff0000' }],
    },
    {
        type: 'sensing_coloristouchingcolor',
        sb3Opcode: 'sensing_coloristouchingcolor',
        label: 'color %1 is touching %2 ?',
        category: 'sensing', color: C.sensing, shape: 'boolean',
        fields: [
            { name: 'COLOR', type: 'color', value: '#ff0000' },
            { name: 'COLOR2', type: 'color', value: '#0000ff' },
        ],
    },
    {
        type: 'sensing_distanceto',
        sb3Opcode: 'sensing_distanceto',
        label: 'distance to %1',
        category: 'sensing', color: C.sensing, shape: 'reporter',
        fields: [{
            name: 'DISTANCETOMENU', type: 'sprite', value: '_mouse_', options: [
                { label: 'mouse-pointer', value: '_mouse_' },
            ]
        }],
    },
    {
        type: 'sensing_askandwait',
        sb3Opcode: 'sensing_askandwait',
        label: 'ask %1 and wait',
        category: 'sensing', color: C.sensing,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'QUESTION', type: 'string', value: 'What\'s your name?' }],
    },
    {
        type: 'sensing_answer',
        sb3Opcode: 'sensing_answer',
        label: 'answer',
        category: 'sensing', color: C.sensing, shape: 'reporter',
    },
    {
        type: 'sensing_keypressed',
        sb3Opcode: 'sensing_keypressed',
        label: 'key %1 pressed?',
        category: 'sensing', color: C.sensing, shape: 'boolean',
        fields: [{ name: 'KEY_OPTION', type: 'key', value: 'space', options: KEY_OPTS }],
    },
    {
        type: 'sensing_mousedown',
        sb3Opcode: 'sensing_mousedown',
        label: 'mouse down?',
        category: 'sensing', color: C.sensing, shape: 'boolean',
    },
    {
        type: 'sensing_mousex',
        sb3Opcode: 'sensing_mousex',
        label: 'mouse x',
        category: 'sensing', color: C.sensing, shape: 'reporter',
    },
    {
        type: 'sensing_mousey',
        sb3Opcode: 'sensing_mousey',
        label: 'mouse y',
        category: 'sensing', color: C.sensing, shape: 'reporter',
    },
    {
        type: 'sensing_setdragmode',
        sb3Opcode: 'sensing_setdragmode',
        label: 'set drag mode %1',
        category: 'sensing', color: C.sensing,
        hasNotch: true, hasTab: true,
        fields: [{
            name: 'DRAG_MODE', type: 'dropdown', value: 'draggable', options: [
                { label: 'draggable', value: 'draggable' },
                { label: 'not draggable', value: 'not draggable' },
            ]
        }],
    },
    {
        type: 'sensing_loudness',
        sb3Opcode: 'sensing_loudness',
        label: 'loudness',
        category: 'sensing', color: C.sensing, shape: 'reporter',
    },
    {
        type: 'sensing_timer',
        sb3Opcode: 'sensing_timer',
        label: 'timer',
        category: 'sensing', color: C.sensing, shape: 'reporter',
    },
    {
        type: 'sensing_resettimer',
        sb3Opcode: 'sensing_resettimer',
        label: 'reset timer',
        category: 'sensing', color: C.sensing,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'sensing_of',
        sb3Opcode: 'sensing_of',
        label: '%1 of %2',
        category: 'sensing', color: C.sensing, shape: 'reporter',
        fields: [
            {
                name: 'PROPERTY', type: 'dropdown', value: 'x position', options: [
                    { label: 'x position', value: 'x position' },
                    { label: 'y position', value: 'y position' },
                    { label: 'direction', value: 'direction' },
                    { label: 'costume #', value: 'costume #' },
                    { label: 'costume name', value: 'costume name' },
                    { label: 'size', value: 'size' },
                    { label: 'volume', value: 'volume' },
                ]
            },
            { name: 'OBJECT', type: 'sprite', value: '_stage_', options: [{ label: 'Stage', value: '_stage_' }] },
        ],
    },
    {
        type: 'sensing_current',
        sb3Opcode: 'sensing_current',
        label: 'current %1',
        category: 'sensing', color: C.sensing, shape: 'reporter',
        fields: [{ name: 'CURRENTMENU', type: 'dropdown', value: 'YEAR', options: CURRENT_OPTS }],
    },
    {
        type: 'sensing_dayssince2000',
        sb3Opcode: 'sensing_dayssince2000',
        label: 'days since 2000',
        category: 'sensing', color: C.sensing, shape: 'reporter',
    },
    {
        type: 'sensing_username',
        sb3Opcode: 'sensing_username',
        label: 'username',
        category: 'sensing', color: C.sensing, shape: 'reporter',
    },

    // ── OPERATORS ─────────────────────────────────────────────────────────
    {
        type: 'operator_add',
        sb3Opcode: 'operator_add',
        label: '%1 + %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        inputs: ['NUM1', 'NUM2'],
    },
    {
        type: 'operator_subtract',
        sb3Opcode: 'operator_subtract',
        label: '%1 - %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        inputs: ['NUM1', 'NUM2'],
    },
    {
        type: 'operator_multiply',
        sb3Opcode: 'operator_multiply',
        label: '%1 × %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        inputs: ['NUM1', 'NUM2'],
    },
    {
        type: 'operator_divide',
        sb3Opcode: 'operator_divide',
        label: '%1 / %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        inputs: ['NUM1', 'NUM2'],
    },
    {
        type: 'operator_random',
        sb3Opcode: 'operator_random',
        label: 'pick random %1 to %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        fields: [
            { name: 'FROM', type: 'number', value: 1 },
            { name: 'TO', type: 'number', value: 10 },
        ],
    },
    {
        type: 'operator_gt',
        sb3Opcode: 'operator_gt',
        label: '%1 > %2',
        category: 'operators', color: C.operators, shape: 'boolean',
        inputs: ['OPERAND1', 'OPERAND2'],
    },
    {
        type: 'operator_lt',
        sb3Opcode: 'operator_lt',
        label: '%1 < %2',
        category: 'operators', color: C.operators, shape: 'boolean',
        inputs: ['OPERAND1', 'OPERAND2'],
    },
    {
        type: 'operator_equals',
        sb3Opcode: 'operator_equals',
        label: '%1 = %2',
        category: 'operators', color: C.operators, shape: 'boolean',
        inputs: ['OPERAND1', 'OPERAND2'],
    },
    {
        type: 'operator_and',
        sb3Opcode: 'operator_and',
        label: '%1 and %2',
        category: 'operators', color: C.operators, shape: 'boolean',
        inputs: ['OPERAND1', 'OPERAND2'],
    },
    {
        type: 'operator_or',
        sb3Opcode: 'operator_or',
        label: '%1 or %2',
        category: 'operators', color: C.operators, shape: 'boolean',
        inputs: ['OPERAND1', 'OPERAND2'],
    },
    {
        type: 'operator_not',
        sb3Opcode: 'operator_not',
        label: 'not %1',
        category: 'operators', color: C.operators, shape: 'boolean',
        inputs: ['OPERAND'],
    },
    {
        type: 'operator_join',
        sb3Opcode: 'operator_join',
        label: 'join %1 %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        fields: [
            { name: 'STRING1', type: 'string', value: 'hello ' },
            { name: 'STRING2', type: 'string', value: 'world' },
        ],
    },
    {
        type: 'operator_letter_of',
        sb3Opcode: 'operator_letter_of',
        label: 'letter %1 of %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        fields: [
            { name: 'LETTER', type: 'number', value: 1 },
            { name: 'STRING', type: 'string', value: 'world' },
        ],
    },
    {
        type: 'operator_length',
        sb3Opcode: 'operator_length',
        label: 'length of %1',
        category: 'operators', color: C.operators, shape: 'reporter',
        fields: [{ name: 'STRING', type: 'string', value: 'world' }],
    },
    {
        type: 'operator_contains',
        sb3Opcode: 'operator_contains',
        label: '%1 contains %2 ?',
        category: 'operators', color: C.operators, shape: 'boolean',
        fields: [
            { name: 'STRING1', type: 'string', value: 'hello' },
            { name: 'STRING2', type: 'string', value: 'e' },
        ],
    },
    {
        type: 'operator_mod',
        sb3Opcode: 'operator_mod',
        label: '%1 mod %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        inputs: ['NUM1', 'NUM2'],
    },
    {
        type: 'operator_round',
        sb3Opcode: 'operator_round',
        label: 'round %1',
        category: 'operators', color: C.operators, shape: 'reporter',
        inputs: ['NUM'],
    },
    {
        type: 'operator_mathop',
        sb3Opcode: 'operator_mathop',
        label: '%1 of %2',
        category: 'operators', color: C.operators, shape: 'reporter',
        fields: [
            { name: 'OPERATOR', type: 'mathop', value: 'sqrt', options: MATH_OP_OPTS },
            { name: 'NUM', type: 'number', value: 9 },
        ],
    },

    // ── VARIABLES ─────────────────────────────────────────────────────────
    {
        type: 'data_setvariableto',
        sb3Opcode: 'data_setvariableto',
        label: 'set %1 to %2',
        category: 'variables', color: C.variables,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'VARIABLE', type: 'dropdown', value: 'my variable', options: [{ label: 'my variable', value: 'my variable' }] }],
        inputs: ['VALUE'],
    },
    {
        type: 'data_changevariableby',
        sb3Opcode: 'data_changevariableby',
        label: 'change %1 by %2',
        category: 'variables', color: C.variables,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'VARIABLE', type: 'dropdown', value: 'my variable', options: [{ label: 'my variable', value: 'my variable' }] }],
        inputs: ['VALUE'],
    },
    {
        type: 'data_showvariable',
        sb3Opcode: 'data_showvariable',
        label: 'show variable %1',
        category: 'variables', color: C.variables,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'VARIABLE', type: 'dropdown', value: 'my variable', options: [{ label: 'my variable', value: 'my variable' }] }],
    },
    {
        type: 'data_hidevariable',
        sb3Opcode: 'data_hidevariable',
        label: 'hide variable %1',
        category: 'variables', color: C.variables,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'VARIABLE', type: 'dropdown', value: 'my variable', options: [{ label: 'my variable', value: 'my variable' }] }],
    },
    {
        type: 'data_variable',
        sb3Opcode: 'data_variable',
        label: '%1',
        category: 'variables', color: C.variables, shape: 'reporter',
        fields: [{ name: 'VARIABLE', type: 'dropdown', value: 'my variable', options: [{ label: 'my variable', value: 'my variable' }] }],
    },

    // ── LISTS ─────────────────────────────────────────────────────────────
    {
        type: 'data_addtolist',
        sb3Opcode: 'data_addtolist',
        label: 'add %1 to %2',
        category: 'lists', color: C.lists,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'ITEM', type: 'string', value: 'thing' },
            { name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] },
        ],
    },
    {
        type: 'data_deleteoflist',
        sb3Opcode: 'data_deleteoflist',
        label: 'delete %1 of %2',
        category: 'lists', color: C.lists,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'INDEX', type: 'number', value: 1 },
            { name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] },
        ],
    },
    {
        type: 'data_deletealloflist',
        sb3Opcode: 'data_deletealloflist',
        label: 'delete all of %1',
        category: 'lists', color: C.lists,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] }],
    },
    {
        type: 'data_insertatlist',
        sb3Opcode: 'data_insertatlist',
        label: 'insert %1 at %2 of %3',
        category: 'lists', color: C.lists,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'ITEM', type: 'string', value: 'thing' },
            { name: 'INDEX', type: 'number', value: 1 },
            { name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] },
        ],
    },
    {
        type: 'data_replaceitemoflist',
        sb3Opcode: 'data_replaceitemoflist',
        label: 'replace item %1 of %2 with %3',
        category: 'lists', color: C.lists,
        hasNotch: true, hasTab: true,
        fields: [
            { name: 'INDEX', type: 'number', value: 1 },
            { name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] },
            { name: 'ITEM', type: 'string', value: 'thing' },
        ],
    },
    {
        type: 'data_showlist',
        sb3Opcode: 'data_showlist',
        label: 'show list %1',
        category: 'lists', color: C.lists,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] }],
    },
    {
        type: 'data_hidelist',
        sb3Opcode: 'data_hidelist',
        label: 'hide list %1',
        category: 'lists', color: C.lists,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] }],
    },
    // List reporters
    {
        type: 'data_itemoflist',
        sb3Opcode: 'data_itemoflist',
        label: 'item %1 of %2',
        category: 'lists', color: C.lists, shape: 'reporter',
        fields: [
            { name: 'INDEX', type: 'number', value: 1 },
            { name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] },
        ],
    },
    {
        type: 'data_itemnumoflist',
        sb3Opcode: 'data_itemnumoflist',
        label: 'item # of %1 in %2',
        category: 'lists', color: C.lists, shape: 'reporter',
        fields: [
            { name: 'ITEM', type: 'string', value: 'thing' },
            { name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] },
        ],
    },
    {
        type: 'data_lengthoflist',
        sb3Opcode: 'data_lengthoflist',
        label: 'length of %1',
        category: 'lists', color: C.lists, shape: 'reporter',
        fields: [{ name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] }],
    },
    {
        type: 'data_listcontainsitem',
        sb3Opcode: 'data_listcontainsitem',
        label: '%1 contains %2 ?',
        category: 'lists', color: C.lists, shape: 'boolean',
        fields: [
            { name: 'LIST', type: 'dropdown', value: 'my list', options: [{ label: 'my list', value: 'my list' }] },
            { name: 'ITEM', type: 'string', value: 'thing' },
        ],
    },

    // ── PEN (Extension) ───────────────────────────────────────────────────
    {
        type: 'pen_clear',
        sb3Opcode: 'pen_clear',
        label: 'erase all',
        category: 'pen', color: C.pen,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'pen_stamp',
        sb3Opcode: 'pen_stamp',
        label: 'stamp',
        category: 'pen', color: C.pen,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'pen_penDown',
        sb3Opcode: 'pen_penDown',
        label: 'pen down',
        category: 'pen', color: C.pen,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'pen_penUp',
        sb3Opcode: 'pen_penUp',
        label: 'pen up',
        category: 'pen', color: C.pen,
        hasNotch: true, hasTab: true,
    },
    {
        type: 'pen_setPenColorToColor',
        sb3Opcode: 'pen_setPenColorToColor',
        label: 'set pen color to %1',
        category: 'pen', color: C.pen,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'COLOR', type: 'color', value: '#59C059' }],
    },
    {
        type: 'pen_changePenSizeBy',
        sb3Opcode: 'pen_changePenSizeBy',
        label: 'change pen size by %1',
        category: 'pen', color: C.pen,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'SIZE', type: 'number', value: 1 }],
    },
    {
        type: 'pen_setPenSizeTo',
        sb3Opcode: 'pen_setPenSizeTo',
        label: 'set pen size to %1',
        category: 'pen', color: C.pen,
        hasNotch: true, hasTab: true,
        fields: [{ name: 'SIZE', type: 'number', value: 1 }],
    },

    // ── LEGACY ALIASES (kept for backward compat with existing workspaces) ──
    {
        type: 'events_whenflagclicked',
        sb3Opcode: 'event_whenflagclicked',
        label: 'when 🏁 clicked',
        category: 'events', color: C.events,
        shape: 'hat', isHat: true, hasTab: true,
    },
];

export function getBlockDefinition(type: string): BlockDefinition | undefined {
    return BLOCK_DEFINITIONS.find(def => def.type === type);
}
