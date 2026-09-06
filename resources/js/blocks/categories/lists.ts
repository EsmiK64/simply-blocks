import type { BlockDefinition } from '../types';
import { C } from './constants';

export const LISTS_BLOCKS: BlockDefinition[] = [
    {
        type: 'data_addtolist',
        sb3Opcode: 'data_addtolist',
        label: 'add %1 to %2',
        category: 'lists',
        color: C.lists,
        hasNotch: true,
        hasTab: true,
        fields: [
            { name: 'ITEM', type: 'string', value: 'thing' },
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_deleteoflist',
        sb3Opcode: 'data_deleteoflist',
        label: 'delete %1 of %2',
        category: 'lists',
        color: C.lists,
        hasNotch: true,
        hasTab: true,
        fields: [
            { name: 'INDEX', type: 'number', value: 1 },
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_deletealloflist',
        sb3Opcode: 'data_deletealloflist',
        label: 'delete all of %1',
        category: 'lists',
        color: C.lists,
        hasNotch: true,
        hasTab: true,
        fields: [
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_insertatlist',
        sb3Opcode: 'data_insertatlist',
        label: 'insert %1 at %2 of %3',
        category: 'lists',
        color: C.lists,
        hasNotch: true,
        hasTab: true,
        fields: [
            { name: 'ITEM', type: 'string', value: 'thing' },
            { name: 'INDEX', type: 'number', value: 1 },
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_replaceitemoflist',
        sb3Opcode: 'data_replaceitemoflist',
        label: 'replace item %1 of %2 with %3',
        category: 'lists',
        color: C.lists,
        hasNotch: true,
        hasTab: true,
        fields: [
            { name: 'INDEX', type: 'number', value: 1 },
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
            { name: 'ITEM', type: 'string', value: 'thing' },
        ],
    },
    {
        type: 'data_showlist',
        sb3Opcode: 'data_showlist',
        label: 'show list %1',
        category: 'lists',
        color: C.lists,
        hasNotch: true,
        hasTab: true,
        fields: [
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_hidelist',
        sb3Opcode: 'data_hidelist',
        label: 'hide list %1',
        category: 'lists',
        color: C.lists,
        hasNotch: true,
        hasTab: true,
        fields: [
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    // List reporters
    {
        type: 'data_itemoflist',
        sb3Opcode: 'data_itemoflist',
        label: 'item %1 of %2',
        category: 'lists',
        color: C.lists,
        shape: 'reporter',
        fields: [
            { name: 'INDEX', type: 'number', value: 1 },
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_itemnumoflist',
        sb3Opcode: 'data_itemnumoflist',
        label: 'item # of %1 in %2',
        category: 'lists',
        color: C.lists,
        shape: 'reporter',
        fields: [
            { name: 'ITEM', type: 'string', value: 'thing' },
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_lengthoflist',
        sb3Opcode: 'data_lengthoflist',
        label: 'length of %1',
        category: 'lists',
        color: C.lists,
        shape: 'reporter',
        fields: [
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
        ],
    },
    {
        type: 'data_listcontainsitem',
        sb3Opcode: 'data_listcontainsitem',
        label: '%1 contains %2 ?',
        category: 'lists',
        color: C.lists,
        shape: 'boolean',
        fields: [
            {
                name: 'LIST',
                type: 'dropdown',
                value: 'my list',
                options: [{ label: 'my list', value: 'my list' }],
            },
            { name: 'ITEM', type: 'string', value: 'thing' },
        ],
    },
];
