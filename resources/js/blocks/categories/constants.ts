// Scratch 3.0 colour palette per category
export const C = {
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
export const KEY_OPTS = [
    'space',
    'up arrow',
    'down arrow',
    'left arrow',
    'right arrow',
    'any',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
].map((k) => ({ label: k, value: k }));

export const ROTATION_STYLE_OPTS = [
    { label: 'left-right', value: 'left-right' },
    { label: "don't rotate", value: "don't rotate" },
    { label: 'all around', value: 'all around' },
];

export const EFFECT_OPTS = [
    { label: 'color', value: 'COLOR' },
    { label: 'fisheye', value: 'FISHEYE' },
    { label: 'whirl', value: 'WHIRL' },
    { label: 'pixelate', value: 'PIXELATE' },
    { label: 'mosaic', value: 'MOSAIC' },
    { label: 'brightness', value: 'BRIGHTNESS' },
    { label: 'ghost', value: 'GHOST' },
];

export const SOUND_EFFECT_OPTS = [
    { label: 'pitch', value: 'PITCH' },
    { label: 'pan left/right', value: 'PAN' },
];

export const STOP_OPTS = [
    { label: 'all', value: 'all' },
    { label: 'this script', value: 'this script' },
    { label: 'other scripts in sprite', value: 'other scripts in sprite' },
];

export const MATH_OP_OPTS = [
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

export const CURRENT_OPTS = [
    { label: 'year', value: 'YEAR' },
    { label: 'month', value: 'MONTH' },
    { label: 'date', value: 'DATE' },
    { label: 'day of week', value: 'DAYOFWEEK' },
    { label: 'hour', value: 'HOUR' },
    { label: 'minute', value: 'MINUTE' },
    { label: 'second', value: 'SECOND' },
];
