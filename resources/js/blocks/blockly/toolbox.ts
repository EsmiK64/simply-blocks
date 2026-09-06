export const SCRATCH_TOOLBOX = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Events',
            colour: '#FFBF00',
            contents: [
                { kind: 'block', type: 'event_whenflagclicked' },
                { kind: 'block', type: 'event_whenkeypressed' },
                { kind: 'block', type: 'event_whenthisspriteclicked' },
            ],
        },
        {
            kind: 'category',
            name: 'Motion',
            colour: '#4C97FF',
            contents: [
                {
                    kind: 'block',
                    type: 'motion_movesteps',
                    inputs: {
                        STEPS: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'motion_turnright',
                    inputs: {
                        DEGREES: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 15 },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'motion_turnleft',
                    inputs: {
                        DEGREES: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 15 },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'motion_gotoxy',
                    inputs: {
                        X: {
                            shadow: { type: 'math_number', fields: { NUM: 0 } },
                        },
                        Y: {
                            shadow: { type: 'math_number', fields: { NUM: 0 } },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'motion_setx',
                    inputs: {
                        X: {
                            shadow: { type: 'math_number', fields: { NUM: 0 } },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'motion_changexby',
                    inputs: {
                        DX: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'motion_sety',
                    inputs: {
                        Y: {
                            shadow: { type: 'math_number', fields: { NUM: 0 } },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'motion_changeyby',
                    inputs: {
                        DY: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                    },
                },
                { kind: 'block', type: 'motion_xposition' },
                { kind: 'block', type: 'motion_yposition' },
                { kind: 'block', type: 'motion_direction' },
            ],
        },
        {
            kind: 'category',
            name: 'Looks',
            colour: '#9966FF',
            contents: [
                {
                    kind: 'block',
                    type: 'looks_sayforsecs',
                    inputs: {
                        MESSAGE: {
                            shadow: {
                                type: 'text',
                                fields: { TEXT: 'Hello!' },
                            },
                        },
                        SECS: {
                            shadow: { type: 'math_number', fields: { NUM: 2 } },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'looks_say',
                    inputs: {
                        MESSAGE: {
                            shadow: {
                                type: 'text',
                                fields: { TEXT: 'Hello!' },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'looks_thinkforsecs',
                    inputs: {
                        MESSAGE: {
                            shadow: {
                                type: 'text',
                                fields: { TEXT: 'Hmm...' },
                            },
                        },
                        SECS: {
                            shadow: { type: 'math_number', fields: { NUM: 2 } },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'looks_think',
                    inputs: {
                        MESSAGE: {
                            shadow: {
                                type: 'text',
                                fields: { TEXT: 'Hmm...' },
                            },
                        },
                    },
                },
                { kind: 'block', type: 'looks_show' },
                { kind: 'block', type: 'looks_hide' },
                {
                    kind: 'block',
                    type: 'looks_changesizeby',
                    inputs: {
                        CHANGE: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'looks_setsizeto',
                    inputs: {
                        SIZE: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 100 },
                            },
                        },
                    },
                },
            ],
        },
        {
            kind: 'category',
            name: 'Sound',
            colour: '#CF63CF',
            contents: [
                { kind: 'block', type: 'sound_playuntildone' },
                { kind: 'block', type: 'sound_play' },
                { kind: 'block', type: 'sound_stopallsounds' },
            ],
        },
        {
            kind: 'category',
            name: 'Control',
            colour: '#FFAB19',
            contents: [
                {
                    kind: 'block',
                    type: 'control_wait',
                    inputs: {
                        DURATION: {
                            shadow: { type: 'math_number', fields: { NUM: 1 } },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'control_repeat',
                    inputs: {
                        TIMES: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                    },
                },
                { kind: 'block', type: 'control_forever' },
                { kind: 'block', type: 'control_if' },
                { kind: 'block', type: 'control_if_else' },
                { kind: 'block', type: 'control_stop' },
            ],
        },
        {
            kind: 'category',
            name: 'Sensing',
            colour: '#5CB1D6',
            contents: [
                { kind: 'block', type: 'sensing_mousex' },
                { kind: 'block', type: 'sensing_mousey' },
                { kind: 'block', type: 'sensing_timer' },
                { kind: 'block', type: 'sensing_resettimer' },
            ],
        },
        {
            kind: 'category',
            name: 'Operators',
            colour: '#59C059',
            contents: [
                {
                    kind: 'block',
                    type: 'operator_add',
                    inputs: {
                        NUM1: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                        NUM2: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'operator_subtract',
                    inputs: {
                        NUM1: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                        NUM2: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'operator_multiply',
                    inputs: {
                        NUM1: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                        NUM2: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'operator_divide',
                    inputs: {
                        NUM1: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                        NUM2: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: '' },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'operator_random',
                    inputs: {
                        FROM: {
                            shadow: { type: 'math_number', fields: { NUM: 1 } },
                        },
                        TO: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                    },
                },
                { kind: 'block', type: 'operator_lt' },
                { kind: 'block', type: 'operator_equals' },
                { kind: 'block', type: 'operator_gt' },
                { kind: 'block', type: 'operator_and' },
                { kind: 'block', type: 'operator_or' },
                { kind: 'block', type: 'operator_not' },
                {
                    kind: 'block',
                    type: 'operator_join',
                    inputs: {
                        STRING1: {
                            shadow: {
                                type: 'text',
                                fields: { TEXT: 'apple ' },
                            },
                        },
                        STRING2: {
                            shadow: {
                                type: 'text',
                                fields: { TEXT: 'banana' },
                            },
                        },
                    },
                },
            ],
        },
        {
            kind: 'category',
            name: 'Variables',
            colour: '#FF8C1A',
            custom: 'VARIABLE',
            contents: [
                { kind: 'block', type: 'data_setvariableto' },
                { kind: 'block', type: 'data_changevariableby' },
            ],
        },
    ],
};
