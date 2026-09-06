import { CONTROL_BLOCKS } from './categories/control';
import { EVENTS_BLOCKS } from './categories/events';
import { LEGACY_BLOCKS } from './categories/legacy';
import { LISTS_BLOCKS } from './categories/lists';
import { LOOKS_BLOCKS } from './categories/looks';
import { MOTION_BLOCKS } from './categories/motion';
import { OPERATORS_BLOCKS } from './categories/operators';
import { PEN_BLOCKS } from './categories/pen';
import { SENSING_BLOCKS } from './categories/sensing';
import { SOUND_BLOCKS } from './categories/sound';
import { VARIABLES_BLOCKS } from './categories/variables';
import type { BlockDefinition } from './types';

export * from './categories/constants';

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
    ...EVENTS_BLOCKS,
    ...MOTION_BLOCKS,
    ...LOOKS_BLOCKS,
    ...SOUND_BLOCKS,
    ...CONTROL_BLOCKS,
    ...SENSING_BLOCKS,
    ...OPERATORS_BLOCKS,
    ...VARIABLES_BLOCKS,
    ...LISTS_BLOCKS,
    ...PEN_BLOCKS,
    ...LEGACY_BLOCKS,
];

export function getBlockDefinition(
    typeOrOpcode: string,
): BlockDefinition | undefined {
    return BLOCK_DEFINITIONS.find(
        (def) => def.type === typeOrOpcode || def.sb3Opcode === typeOrOpcode,
    );
}
