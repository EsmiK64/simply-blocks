import type { BlockDefinition } from '../types';
import { C } from './constants';

export const VARIABLES_BLOCKS: BlockDefinition[] = [
    {
        type: 'data_setvariableto',
        sb3Opcode: 'data_setvariableto',
        label: 'set %1 to %2',
        category: 'variables',
        color: C.variables,
        hasNotch: true,
        hasTab: true,
        fields: [
            {
                name: 'VARIABLE',
                type: 'dropdown',
                value: 'my variable',
                options: [{ label: 'my variable', value: 'my variable' }],
            },
        ],
        inputs: ['VALUE'],
    },
    {
        type: 'data_changevariableby',
        sb3Opcode: 'data_changevariableby',
        label: 'change %1 by %2',
        category: 'variables',
        color: C.variables,
        hasNotch: true,
        hasTab: true,
        fields: [
            {
                name: 'VARIABLE',
                type: 'dropdown',
                value: 'my variable',
                options: [{ label: 'my variable', value: 'my variable' }],
            },
        ],
        inputs: ['VALUE'],
    },
    {
        type: 'data_showvariable',
        sb3Opcode: 'data_showvariable',
        label: 'show variable %1',
        category: 'variables',
        color: C.variables,
        hasNotch: true,
        hasTab: true,
        fields: [
            {
                name: 'VARIABLE',
                type: 'dropdown',
                value: 'my variable',
                options: [{ label: 'my variable', value: 'my variable' }],
            },
        ],
    },
    {
        type: 'data_hidevariable',
        sb3Opcode: 'data_hidevariable',
        label: 'hide variable %1',
        category: 'variables',
        color: C.variables,
        hasNotch: true,
        hasTab: true,
        fields: [
            {
                name: 'VARIABLE',
                type: 'dropdown',
                value: 'my variable',
                options: [{ label: 'my variable', value: 'my variable' }],
            },
        ],
    },
    {
        type: 'data_variable',
        sb3Opcode: 'data_variable',
        label: '%1',
        category: 'variables',
        color: C.variables,
        shape: 'reporter',
        fields: [
            {
                name: 'VARIABLE',
                type: 'dropdown',
                value: 'my variable',
                options: [{ label: 'my variable', value: 'my variable' }],
            },
        ],
    },
];
