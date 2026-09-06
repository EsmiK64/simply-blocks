import type { BlockDefinition, BlockInstance } from './types';

export interface SnapPreviewState {
    x: number;
    y: number;
    visible: boolean;
    type?: 'stack' | 'nest' | 'insert' | 'input';
    targetId?: string;
    insertAfterId?: string;
}

/**
 * Calculate the actual rendered height of a block based on its type and nested children.
 */
export function calculateBlockHeight(block: BlockInstance): number {
    if (block.definition.hasContainer) {
        let innerHeight = 0;

        if (block.children.length > 0) {
            block.children.forEach((child) => {
                innerHeight += calculateBlockHeight(child) - 8; // overlap by tab height
            });
        }

        innerHeight = Math.max(innerHeight, 60);

        let elseHeight = 0;

        if (block.definition.hasElse) {
            if (block.elseChildren.length > 0) {
                block.elseChildren.forEach((child) => {
                    elseHeight += calculateBlockHeight(child) - 8;
                });
            }

            elseHeight = Math.max(elseHeight, 60);
        }

        const tabHeight = block.definition.hasTab ? 8 : 0;

        return block.definition.hasElse
            ? 40 + innerHeight + 40 + elseHeight + 40 + tabHeight
            : 40 + innerHeight + 40 + tabHeight;
    }

    return block.definition.hasTab ? 48 : 40;
}

/**
 * Recursively find a block by id inside inputs of any block in the list.
 */
export function findBlockInInputs(
    targetId: string,
    allBlocks: BlockInstance[],
): { parentBlock: BlockInstance; slotName: string } | null {
    for (const b of allBlocks) {
        for (const [slotName, inputBlock] of Object.entries(b.inputs)) {
            if (inputBlock && inputBlock.id === targetId) {
                return { parentBlock: b, slotName };
            }

            if (inputBlock) {
                const nested = findBlockInInputs(targetId, [inputBlock]);

                if (nested) {
                    return nested;
                }
            }
        }
    }

    return null;
}

/**
 * Create a fresh BlockInstance from a BlockDefinition.
 */
export function createBlockInstance(
    def: BlockDefinition,
    x: number,
    y: number,
): BlockInstance {
    const fields: Record<string, string | number | boolean> = {};
    def.fields?.forEach((field) => {
        fields[field.name] = field.value ?? '';
    });

    return {
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        definition: def,
        fields,
        inputs: {},
        next: null,
        children: [],
        elseChildren: [],
        x,
        y,
    };
}

/**
 * Recalculate absolute canvas coordinates for an entire block stack.
 */
export function recalculateStackPositions(
    startBlock: BlockInstance,
    allBlocks: BlockInstance[],
): BlockInstance[] {
    const updated = [...allBlocks];
    const visited = new Set<string>();

    const recalculateBlock = (
        block: BlockInstance,
        x: number,
        y: number,
    ): void => {
        if (visited.has(block.id)) {
            return;
        }

        visited.add(block.id);

        const idx = updated.findIndex((b) => b.id === block.id);

        if (idx === -1) {
            return;
        }

        const blockHeight = calculateBlockHeight(block);
        updated[idx] = { ...block, x, y };

        // Recalculate children positions
        if (block.definition.hasContainer && block.children.length > 0) {
            let childY = y + 40;
            block.children.forEach((child) => {
                recalculateBlock(child, x + 12, childY);
                const childHeight = calculateBlockHeight(child);
                const childOverlap = child.definition.hasTab ? 8 : 0;
                childY += childHeight - childOverlap;
            });
        }

        // Recalculate else-children positions
        if (block.definition.hasElse && block.elseChildren.length > 0) {
            let innerHeight = 0;
            block.children.forEach((child) => {
                innerHeight += calculateBlockHeight(child) - 8;
            });
            innerHeight = Math.max(innerHeight, 60);
            let elseChildY = y + 40 + innerHeight + 40;
            block.elseChildren.forEach((child) => {
                recalculateBlock(child, x + 12, elseChildY);
                const childHeight = calculateBlockHeight(child);
                const childOverlap = child.definition.hasTab ? 8 : 0;
                elseChildY += childHeight - childOverlap;
            });
        }

        // Recalculate next block position
        if (block.next) {
            const overlap = block.definition.hasTab ? 8 : 0;
            recalculateBlock(block.next, x, y + blockHeight - overlap);
        }
    };

    recalculateBlock(startBlock, startBlock.x, startBlock.y);

    return updated;
}

/**
 * Calculate snapping target and preview coordinates for a dragged block.
 */
export function calculateSnapTarget(
    draggingBlock: BlockInstance,
    newX: number,
    newY: number,
    blocks: BlockInstance[],
): SnapPreviewState {
    let nearestBlock: BlockInstance | null = null;
    let minDistance = 50;
    let snapType: 'stack' | 'nest' | 'insert' | null = null;
    let snapX = newX;
    let snapY = newY;
    let insertAfterBlock: BlockInstance | null = null;

    for (const block of blocks) {
        if (block.id === draggingBlock.id) {
            continue;
        }

        if (block.definition.hasContainer) {
            const blockHeight = calculateBlockHeight(block);
            const containerTop = block.y + 40;
            const containerBottom = block.y + blockHeight;
            const horizontallyAligned = Math.abs(newX - block.x) < 100;

            if (
                horizontallyAligned &&
                newY > containerTop &&
                newY < containerBottom
            ) {
                nearestBlock = block;
                snapType = 'nest';
                minDistance = 0;
                break;
            }
        }

        const blockDist = Math.sqrt(
            Math.pow(block.x - newX, 2) + Math.pow(block.y - newY, 2),
        );

        if (blockDist < minDistance) {
            minDistance = blockDist;
            nearestBlock = block;

            if (block.definition.hasContainer) {
                const blockHeight = calculateBlockHeight(block);
                const containerTop = block.y + 40;
                const containerBottom = block.y + blockHeight;
                const horizontallyAligned = Math.abs(newX - block.x) < 100;
                snapType =
                    horizontallyAligned &&
                    newY > containerTop &&
                    newY < containerBottom
                        ? 'nest'
                        : 'stack';
            } else {
                const blockHeight = calculateBlockHeight(block);
                const tabHeight = block.definition.hasTab ? 8 : 0;
                const insertZoneTop = block.y + blockHeight / 2;
                const insertZoneBottom = block.y + blockHeight + tabHeight;

                if (newY > insertZoneTop && newY < insertZoneBottom) {
                    snapType = 'insert';
                    insertAfterBlock = block;
                } else {
                    snapType = 'stack';
                }
            }
        }
    }

    if (nearestBlock && snapType) {
        if (snapType === 'nest' && nearestBlock.definition.hasContainer) {
            snapX = nearestBlock.x + 12;
            let childY = nearestBlock.y + 40;
            nearestBlock.children.forEach((child) => {
                childY += calculateBlockHeight(child) - 8;
            });
            snapY = childY;
        } else if (snapType === 'insert' && insertAfterBlock) {
            snapX = insertAfterBlock.x;
            snapY =
                insertAfterBlock.y + calculateBlockHeight(insertAfterBlock) - 8;
        } else {
            snapX = nearestBlock.x;
            snapY = nearestBlock.y + calculateBlockHeight(nearestBlock) - 8;
        }

        return {
            x: snapX,
            y: snapY,
            visible: true,
            type: snapType,
            targetId: nearestBlock.id,
            insertAfterId:
                snapType === 'insert' ? insertAfterBlock?.id : undefined,
        };
    }

    return {
        x: 0,
        y: 0,
        visible: false,
    };
}

/**
 * Disconnect a block from parent or preceding stack connections.
 */
export function disconnectBlock(
    block: BlockInstance,
    blocks: BlockInstance[],
): BlockInstance[] {
    let updated = [...blocks];

    // Remove from parent's children or elseChildren if nested
    const parentIdx = updated.findIndex(
        (b) =>
            b.children.some((c) => c.id === block.id) ||
            b.elseChildren.some((c) => c.id === block.id),
    );

    if (parentIdx !== -1) {
        updated[parentIdx] = {
            ...updated[parentIdx],
            children: updated[parentIdx].children.filter(
                (c) => c.id !== block.id,
            ),
            elseChildren: updated[parentIdx].elseChildren.filter(
                (c) => c.id !== block.id,
            ),
        };
    }

    // Remove from previous block's next if it was in a stack
    const prevBlockIdx = updated.findIndex((b) => b.next?.id === block.id);

    if (prevBlockIdx !== -1) {
        updated[prevBlockIdx] = {
            ...updated[prevBlockIdx],
            next: null,
        };
    }

    // Remove from an input slot if it was snapped into one
    const inInputResult = findBlockInInputs(block.id, updated);

    if (inInputResult) {
        const { parentBlock, slotName } = inInputResult;
        const pIdx = updated.findIndex((b) => b.id === parentBlock.id);

        if (pIdx !== -1) {
            updated[pIdx] = {
                ...updated[pIdx],
                inputs: {
                    ...updated[pIdx].inputs,
                    [slotName]: null,
                },
            };
        }

        if (!updated.some((b) => b.id === block.id)) {
            updated = [...updated, { ...block, x: block.x, y: block.y }];
        }
    }

    return updated;
}

/**
 * Integrate a dragged block into the stack/nest/insert snap target.
 */
export function integrateStackSnap(
    draggingBlock: BlockInstance,
    snapPreview: SnapPreviewState,
    blocks: BlockInstance[],
): BlockInstance[] {
    const updated: BlockInstance[] = [...blocks];
    const draggedIndex = updated.findIndex((b) => b.id === draggingBlock.id);

    if (draggedIndex === -1) {
        return blocks;
    }

    let newDragged = { ...updated[draggedIndex] };

    // Remove from previous parent if any
    const parentIdx = updated.findIndex((b) =>
        b.children.some((c) => c.id === draggingBlock.id),
    );

    if (parentIdx !== -1) {
        updated[parentIdx] = {
            ...updated[parentIdx],
            children: updated[parentIdx].children.filter(
                (c) => c.id !== draggingBlock.id,
            ),
        };
    }

    const snapType = snapPreview.type;
    const targetId = snapPreview.targetId;
    const insertAfterId = snapPreview.insertAfterId;

    if (snapType === 'nest') {
        const targetIdx = updated.findIndex((b) => b.id === targetId);

        if (targetIdx !== -1) {
            updated[targetIdx] = {
                ...updated[targetIdx],
                children: [...updated[targetIdx].children, newDragged],
            };
        }
    } else if (snapType === 'insert' && insertAfterId) {
        const insertIdx = updated.findIndex((b) => b.id === insertAfterId);

        if (insertIdx !== -1) {
            const oldNext = updated[insertIdx].next;
            updated[insertIdx] = {
                ...updated[insertIdx],
                next: newDragged,
            };
            newDragged = { ...newDragged, next: oldNext };
        }
    } else if (targetId) {
        const targetIdx = updated.findIndex((b) => b.id === targetId);

        if (targetIdx !== -1) {
            updated[targetIdx] = {
                ...updated[targetIdx],
                next: newDragged,
            };
        }
    }

    newDragged = {
        ...newDragged,
        x: snapPreview.x,
        y: snapPreview.y,
    };
    updated[draggedIndex] = newDragged;

    return recalculateStackPositions(newDragged, updated);
}

/**
 * Snap a reporter/boolean block into an input slot of another block.
 */
export function integrateInputSlotSnap(
    draggingBlock: BlockInstance,
    inputSnap: { parentId: string; slotName: string },
    blocks: BlockInstance[],
): BlockInstance[] {
    const updated = [...blocks];
    const draggedIndex = updated.findIndex((b) => b.id === draggingBlock.id);

    if (draggedIndex === -1) {
        return blocks;
    }

    const parentIdx = updated.findIndex((b) => b.id === inputSnap.parentId);

    if (parentIdx === -1) {
        return blocks;
    }

    const draggedBlock = updated[draggedIndex];

    updated[parentIdx] = {
        ...updated[parentIdx],
        inputs: {
            ...updated[parentIdx].inputs,
            [inputSnap.slotName]: draggedBlock,
        },
    };

    updated.splice(draggedIndex, 1);

    return updated;
}

/**
 * Remove an input reporter block from its slot and place it adjacent to its parent.
 */
export function removeInputBlock(
    parentBlockId: string,
    slotName: string,
    blocks: BlockInstance[],
): { blocks: BlockInstance[]; extracted: BlockInstance } | null {
    const parentIdx = blocks.findIndex((b) => b.id === parentBlockId);

    if (parentIdx === -1) {
        return null;
    }

    const inputBlock = blocks[parentIdx].inputs[slotName];

    if (!inputBlock) {
        return null;
    }

    const parent = blocks[parentIdx];
    const extracted: BlockInstance = {
        ...inputBlock,
        x: parent.x + 10,
        y: parent.y + 10,
    };

    const updated = [
        ...blocks.slice(0, parentIdx),
        {
            ...parent,
            inputs: { ...parent.inputs, [slotName]: null },
        },
        ...blocks.slice(parentIdx + 1),
        extracted,
    ];

    return { blocks: updated, extracted };
}

/**
 * Immutably update a field value inside a block (even deeply nested).
 */
export function updateBlockFieldValue(
    blockId: string,
    fieldName: string,
    value: string | number | boolean,
    blocks: BlockInstance[],
): BlockInstance[] {
    const updateBlock = (b: BlockInstance): BlockInstance => {
        if (b.id === blockId) {
            return {
                ...b,
                fields: {
                    ...b.fields,
                    [fieldName]: value,
                },
            };
        }

        const updatedInputs: Record<string, BlockInstance | null> = {};

        for (const [slot, inp] of Object.entries(b.inputs)) {
            updatedInputs[slot] = inp ? updateBlock(inp) : null;
        }

        return {
            ...b,
            inputs: updatedInputs,
            children: b.children.map(updateBlock),
            elseChildren: b.elseChildren.map(updateBlock),
            next: b.next ? updateBlock(b.next) : null,
        };
    };

    return blocks.map(updateBlock);
}
