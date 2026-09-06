import { describe, it, expect } from 'bun:test';
import type { BlockDefinition } from '../../resources/js/blocks/types';
import {
    calculateBlockHeight,
    createBlockInstance,
    recalculateStackPositions,
    calculateSnapTarget,
    disconnectBlock,
    integrateStackSnap,
    integrateInputSlotSnap,
    removeInputBlock,
    updateBlockFieldValue,
} from '../../resources/js/blocks/workspaceGeometry';

const MOCK_DEF: BlockDefinition = {
    type: 'motion_movesteps',
    label: 'move %1 steps',
    category: 'motion',
    color: '#4C97FF',
    hasTab: true,
    fields: [{ name: 'STEPS', type: 'number', value: 10 }],
};

const MOCK_CONTAINER_DEF: BlockDefinition = {
    type: 'control_repeat',
    label: 'repeat %1',
    category: 'control',
    color: '#FFAB19',
    hasTab: true,
    hasContainer: true,
    fields: [{ name: 'TIMES', type: 'number', value: 10 }],
};

describe('workspaceGeometry', () => {
    describe('calculateBlockHeight', () => {
        it('calculates standard tab block height as 48', () => {
            const block = createBlockInstance(MOCK_DEF, 0, 0);
            expect(calculateBlockHeight(block)).toBe(48);
        });

        it('calculates container block height with empty inner slot', () => {
            const container = createBlockInstance(MOCK_CONTAINER_DEF, 0, 0);
            // 40 + min(innerHeight, 60) + 40 + tabHeight(8) = 148
            expect(calculateBlockHeight(container)).toBe(148);
        });
    });

    describe('createBlockInstance', () => {
        it('creates an instance with default fields populated', () => {
            const block = createBlockInstance(MOCK_DEF, 100, 200);
            expect(block.id).toMatch(/^block-/);
            expect(block.x).toBe(100);
            expect(block.y).toBe(200);
            expect(block.fields.STEPS).toBe(10);
            expect(block.inputs).toEqual({});
            expect(block.children).toEqual([]);
        });
    });

    describe('recalculateStackPositions', () => {
        it('positions stacked blocks sequentially with tab overlap', () => {
            const b1 = createBlockInstance(MOCK_DEF, 50, 50);
            const b2 = createBlockInstance(MOCK_DEF, 0, 0);
            b1.next = b2;

            const updated = recalculateStackPositions(b1, [b1, b2]);
            const updatedB2 = updated.find((b) => b.id === b2.id);

            // b1 height is 48, overlap is 8 -> b2.y = 50 + 48 - 8 = 90
            expect(updatedB2?.y).toBe(90);
            expect(updatedB2?.x).toBe(50);
        });
    });

    describe('calculateSnapTarget', () => {
        it('returns invisible preview when no blocks nearby', () => {
            const b1 = createBlockInstance(MOCK_DEF, 0, 0);
            const dragging = createBlockInstance(MOCK_DEF, 500, 500);

            const snap = calculateSnapTarget(dragging, 500, 500, [b1]);
            expect(snap.visible).toBe(false);
        });

        it('detects stack snap when dragged directly below an existing block', () => {
            const b1 = createBlockInstance(MOCK_DEF, 100, 100);
            const dragging = createBlockInstance(MOCK_DEF, 105, 142);

            const snap = calculateSnapTarget(dragging, 105, 142, [b1]);
            expect(snap.visible).toBe(true);
            expect(snap.targetId).toBe(b1.id);
            expect(snap.x).toBe(100);
            expect(snap.y).toBe(140); // 100 + 48 - 8
        });
    });

    describe('disconnectBlock', () => {
        it('clears previous block next pointer when disconnected', () => {
            const b1 = createBlockInstance(MOCK_DEF, 100, 100);
            const b2 = createBlockInstance(MOCK_DEF, 100, 140);
            b1.next = b2;

            const disconnected = disconnectBlock(b2, [b1, b2]);
            const updatedB1 = disconnected.find((b) => b.id === b1.id);
            expect(updatedB1?.next).toBeNull();
        });
    });

    describe('integrateStackSnap', () => {
        it('links target block next pointer to dragged block', () => {
            const b1 = createBlockInstance(MOCK_DEF, 100, 100);
            const dragging = createBlockInstance(MOCK_DEF, 100, 200);

            const snap = {
                x: 100,
                y: 140,
                visible: true,
                type: 'stack' as const,
                targetId: b1.id,
            };

            const updated = integrateStackSnap(dragging, snap, [b1, dragging]);
            const updatedB1 = updated.find((b) => b.id === b1.id);
            expect(updatedB1?.next?.id).toBe(dragging.id);
        });
    });

    describe('integrateInputSlotSnap and removeInputBlock', () => {
        it('snaps reporter block into an input slot and extracts it cleanly', () => {
            const reporterDef: BlockDefinition = {
                type: 'operator_add',
                label: '%1 + %2',
                category: 'operators',
                color: '#59C059',
                shape: 'reporter',
            };

            const parent = createBlockInstance(MOCK_DEF, 50, 50);
            const reporter = createBlockInstance(reporterDef, 100, 100);

            const integrated = integrateInputSlotSnap(
                reporter,
                { parentId: parent.id, slotName: 'STEPS' },
                [parent, reporter],
            );

            // Reporter is now embedded in parent's inputs
            expect(integrated.length).toBe(1);
            expect(integrated[0].inputs.STEPS?.id).toBe(reporter.id);

            // Remove reporter back to flat canvas list
            const extractedRes = removeInputBlock(parent.id, 'STEPS', integrated);
            expect(extractedRes).not.toBeNull();
            expect(extractedRes!.blocks.length).toBe(2);
            expect(extractedRes!.blocks[0].inputs.STEPS).toBeNull();
            expect(extractedRes!.extracted.id).toBe(reporter.id);
        });
    });

    describe('updateBlockFieldValue', () => {
        it('immutably updates field value in tree', () => {
            const b1 = createBlockInstance(MOCK_DEF, 0, 0);
            const updated = updateBlockFieldValue(b1.id, 'STEPS', 42, [b1]);
            expect(updated[0].fields.STEPS).toBe(42);
        });
    });
});
