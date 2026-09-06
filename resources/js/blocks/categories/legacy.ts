import type { BlockDefinition } from '../types';
import { C } from './constants';

export const LEGACY_BLOCKS: BlockDefinition[] = [
    {
        type: 'events_whenflagclicked',
        sb3Opcode: 'event_whenflagclicked',
        label: 'when 🏁 clicked',
        category: 'events',
        color: C.events,
        shape: 'hat',
        isHat: true,
        hasTab: true,
    },
];
