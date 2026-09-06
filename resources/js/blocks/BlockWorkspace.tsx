import { useRef, useState, useCallback, useEffect } from 'react';
import BlockRenderer from './BlockRenderer';
import { BLOCK_DEFINITIONS } from './definitions';
import { generatePython } from './generator';
import type { BlockInstance, BlockDefinition } from './types';

// Calculate the actual height of a block based on its children
function calculateBlockHeight(block: BlockInstance): number {
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

// Helper: recursively find a block by id inside inputs of any block in the flat list
function findBlockInInputs(
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

interface BlockWorkspaceProps {
    onCodeChange?: (code: string) => void;
    onBlocksChange?: (blocks: BlockInstance[]) => void;
    className?: string;
}

export default function BlockWorkspace({
    onCodeChange,
    onBlocksChange,
    className = '',
}: BlockWorkspaceProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [blocks, setBlocks] = useState<BlockInstance[]>([]);

    useEffect(() => {
        onBlocksChange?.(blocks);
        onCodeChange?.(generatePython(blocks));
    }, [blocks, onBlocksChange, onCodeChange]);
    const [draggingBlock, setDraggingBlock] = useState<BlockInstance | null>(
        null,
    );
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [snapPreview, setSnapPreview] = useState<{
        x: number;
        y: number;
        visible: boolean;
        type?: 'stack' | 'nest' | 'insert' | 'input';
        targetId?: string;
        insertAfterId?: string;
    }>({ x: 0, y: 0, visible: false });
    // For input-slot snapping: which block+slot the dragged reporter should snap into
    const inputSnapRef = useRef<{ parentId: string; slotName: string } | null>(
        null,
    );
    const initialPositionsRef = useRef<Map<string, { x: number; y: number }>>(
        new Map(),
    );

    const createBlockInstance = useCallback(
        (def: BlockDefinition, x: number, y: number): BlockInstance => {
            const fields: Record<string, string | number | boolean> = {};
            def.fields?.forEach((field) => {
                fields[field.name] = field.value ?? '';
            });

            return {
                id: `block-${Date.now()}-${Math.random()}`,
                definition: def,
                fields,
                inputs: {},
                next: null,
                children: [],
                elseChildren: [],
                x,
                y,
            };
        },
        [],
    );

    const handleDragStart = useCallback(
        (e: React.DragEvent, def: BlockDefinition) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('application/json', JSON.stringify(def));
        },
        [],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('application/json');

            if (!data || !canvasRef.current) {
                return;
            }

            const def: BlockDefinition = JSON.parse(data);
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - 100;
            const y = e.clientY - rect.top - 20;

            const newBlock = createBlockInstance(def, x, y);
            setBlocks((prev) => [...prev, newBlock]);
        },
        [createBlockInstance],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    // Recalculate positions of blocks in a stack after snapping
    const recalculateStackPositions = useCallback(
        (
            startBlock: BlockInstance,
            allBlocks: BlockInstance[],
        ): BlockInstance[] => {
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
                if (
                    block.definition.hasContainer &&
                    block.children.length > 0
                ) {
                    let childY = y + 40; // flush with header bottom
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
                    let elseChildY = y + 40 + innerHeight + 40; // header + inner + else bar
                    block.elseChildren.forEach((child) => {
                        recalculateBlock(child, x + 12, elseChildY);
                        const childHeight = calculateBlockHeight(child);
                        const childOverlap = child.definition.hasTab ? 8 : 0;
                        elseChildY += childHeight - childOverlap;
                    });
                }

                // Recalculate next block position (tab peg overlaps into next block's notch by 8px)
                if (block.next) {
                    const overlap = block.definition.hasTab ? 8 : 0;
                    recalculateBlock(block.next, x, y + blockHeight - overlap);
                }
            };

            recalculateBlock(startBlock, startBlock.x, startBlock.y);

            return updated;
        },
        [],
    );

    // Scan all rendered empty input slots and find the nearest one to a canvas point
    const findNearestInputSlot = useCallback(
        (
            px: number,
            py: number,
            excludeId: string,
        ): { parentId: string; slotName: string; dist: number } | null => {
            if (!canvasRef.current) {
                return null;
            }

            const canvasRect = canvasRef.current.getBoundingClientRect();
            const slots =
                canvasRef.current.querySelectorAll<HTMLElement>(
                    '[data-input-slot]',
                );
            let best: {
                parentId: string;
                slotName: string;
                dist: number;
            } | null = null;
            const INPUT_SNAP_RADIUS = 60;

            slots.forEach((slot) => {
                const parentId = slot.dataset.parentBlockId;
                const slotName = slot.dataset.inputSlot;

                if (!parentId || !slotName || parentId === excludeId) {
                    return;
                }

                const rect = slot.getBoundingClientRect();
                const cx = rect.left + rect.width / 2 - canvasRect.left;
                const cy = rect.top + rect.height / 2 - canvasRect.top;
                const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);

                if (dist < INPUT_SNAP_RADIUS && (!best || dist < best.dist)) {
                    best = { parentId, slotName, dist };
                }
            });

            return best;
        },
        [],
    );

    const handleFieldChange = useCallback(
        (
            blockId: string,
            fieldName: string,
            value: string | number | boolean,
        ) => {
            setBlocks((prev) => {
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

                    const updatedInputs: Record<string, BlockInstance | null> =
                        {};

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

                return prev.map(updateBlock);
            });
        },
        [],
    );

    const handleBlockMouseDown = useCallback(
        (e: React.MouseEvent, block: BlockInstance) => {
            e.stopPropagation();
            const rect = (e.target as HTMLElement)
                .closest('[data-block-id]')
                ?.getBoundingClientRect();

            if (!rect) {
                return;
            }

            const offset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };

            // Disconnect from parent / previous block, but keep the attached sub-stack
            setBlocks((prev) => {
                let updated = [...prev];

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
                const prevBlockIdx = updated.findIndex(
                    (b) => b.next?.id === block.id,
                );

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
                    const pIdx = updated.findIndex(
                        (b) => b.id === parentBlock.id,
                    );

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
                        updated = [
                            ...updated,
                            { ...block, x: block.x, y: block.y },
                        ];
                    }
                }

                return updated;
            });

            const positions = new Map<string, { x: number; y: number }>();
            positions.set(block.id, { x: block.x, y: block.y });
            initialPositionsRef.current = positions;
            setDragOffset(offset);
            setDraggingBlock(block);
        },
        [],
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!draggingBlock || !canvasRef.current) {
                return;
            }

            const rect = canvasRef.current.getBoundingClientRect();
            const newX = e.clientX - rect.left - dragOffset.x;
            const newY = e.clientY - rect.top - dragOffset.y;

            // Move dragged block and reposition its attached stack
            setBlocks((prev) => {
                const updated = prev.map((block) => {
                    if (block.id === draggingBlock.id) {
                        return { ...block, x: newX, y: newY };
                    }

                    return block;
                });

                const draggedInstance = updated.find(
                    (b) => b.id === draggingBlock.id,
                );

                return draggedInstance
                    ? recalculateStackPositions(draggedInstance, updated)
                    : updated;
            });

            // Compute snap preview outside of setBlocks state updater
            const draggedShape = draggingBlock.definition.shape ?? 'stack';
            const isReporterLike =
                draggedShape === 'reporter' || draggedShape === 'boolean';

            if (isReporterLike) {
                const inputSnap = findNearestInputSlot(
                    e.clientX - rect.left,
                    e.clientY - rect.top,
                    draggingBlock.id,
                );

                if (inputSnap) {
                    const parentBlock = blocks.find(
                        (b) => b.id === inputSnap.parentId,
                    );

                    if (parentBlock) {
                        inputSnapRef.current = {
                            parentId: inputSnap.parentId,
                            slotName: inputSnap.slotName,
                        };
                        setSnapPreview({
                            x: parentBlock.x + 10,
                            y: parentBlock.y + 10,
                            visible: true,
                            type: 'input',
                            targetId: undefined,
                            insertAfterId: undefined,
                        });

                        return;
                    }
                }

                inputSnapRef.current = null;
                setSnapPreview({
                    x: 0,
                    y: 0,
                    visible: false,
                    targetId: undefined,
                    insertAfterId: undefined,
                });

                return;
            }

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
                        const horizontallyAligned =
                            Math.abs(newX - block.x) < 100;
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
                        const insertZoneBottom =
                            block.y + blockHeight + tabHeight;

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
                if (
                    snapType === 'nest' &&
                    nearestBlock.definition.hasContainer
                ) {
                    snapX = nearestBlock.x + 12;
                    let childY = nearestBlock.y + 40;
                    nearestBlock.children.forEach((child) => {
                        childY += calculateBlockHeight(child) - 8;
                    });
                    snapY = childY;
                } else if (snapType === 'insert' && insertAfterBlock) {
                    snapX = insertAfterBlock.x;
                    snapY =
                        insertAfterBlock.y +
                        calculateBlockHeight(insertAfterBlock) -
                        8;
                } else {
                    snapX = nearestBlock.x;
                    snapY =
                        nearestBlock.y + calculateBlockHeight(nearestBlock) - 8;
                }

                setSnapPreview({
                    x: snapX,
                    y: snapY,
                    visible: true,
                    type: snapType,
                    targetId: nearestBlock.id,
                    insertAfterId:
                        snapType === 'insert'
                            ? insertAfterBlock?.id
                            : undefined,
                });
            } else {
                setSnapPreview({
                    x: 0,
                    y: 0,
                    visible: false,
                    targetId: undefined,
                    insertAfterId: undefined,
                });
            }
        },
        [
            draggingBlock,
            dragOffset,
            blocks,
            findNearestInputSlot,
            recalculateStackPositions,
        ],
    );

    const handleMouseUp = useCallback(() => {
        if (!draggingBlock) {
            return;
        }

        // ── Input-slot snap (reporter/boolean into a slot) ──────────────────
        const inputSnap = inputSnapRef.current;

        if (snapPreview.visible && snapPreview.type === 'input' && inputSnap) {
            setBlocks((prev) => {
                const updated = [...prev];
                const draggedIndex = updated.findIndex(
                    (b) => b.id === draggingBlock.id,
                );

                if (draggedIndex === -1) {
                    return prev;
                }

                const parentIdx = updated.findIndex(
                    (b) => b.id === inputSnap.parentId,
                );

                if (parentIdx === -1) {
                    return prev;
                }

                const draggedBlock = updated[draggedIndex];

                // Embed the reporter into the parent's inputs
                updated[parentIdx] = {
                    ...updated[parentIdx],
                    inputs: {
                        ...updated[parentIdx].inputs,
                        [inputSnap.slotName]: draggedBlock,
                    },
                };

                // Remove from flat list (it now lives inside the parent)
                updated.splice(draggedIndex, 1);

                return updated;
            });
            inputSnapRef.current = null;
            setDraggingBlock(null);
            setSnapPreview({
                x: 0,
                y: 0,
                visible: false,
                targetId: undefined,
                insertAfterId: undefined,
            });

            return;
        }

        // Use the snap preview position if visible
        if (snapPreview.visible && snapPreview.targetId) {
            setBlocks((prev) => {
                const updated: BlockInstance[] = [...prev];
                const draggedIndex = updated.findIndex(
                    (b) => b.id === draggingBlock.id,
                );

                if (draggedIndex === -1) {
                    return prev;
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
                    const targetIdx = updated.findIndex(
                        (b) => b.id === targetId,
                    );

                    if (targetIdx !== -1) {
                        updated[targetIdx] = {
                            ...updated[targetIdx],
                            children: [
                                ...updated[targetIdx].children,
                                newDragged,
                            ],
                        };
                    }
                } else if (snapType === 'insert' && insertAfterId) {
                    const insertIdx = updated.findIndex(
                        (b) => b.id === insertAfterId,
                    );

                    if (insertIdx !== -1) {
                        const oldNext = updated[insertIdx].next;
                        updated[insertIdx] = {
                            ...updated[insertIdx],
                            next: newDragged,
                        };
                        newDragged = { ...newDragged, next: oldNext };
                    }
                } else if (targetId) {
                    const targetIdx = updated.findIndex(
                        (b) => b.id === targetId,
                    );

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
            });
        }

        inputSnapRef.current = null;
        setDraggingBlock(null);
        setSnapPreview({
            x: 0,
            y: 0,
            visible: false,
            targetId: undefined,
            insertAfterId: undefined,
        });
    }, [draggingBlock, snapPreview, recalculateStackPositions]);

    // Called when user mousedowns on a reporter block that's inside an input slot
    const handleInputRemove = useCallback(
        (parentBlockId: string, slotName: string) => {
            setBlocks((prev) => {
                const parentIdx = prev.findIndex((b) => b.id === parentBlockId);

                if (parentIdx === -1) {
                    return prev;
                }

                const inputBlock = prev[parentIdx].inputs[slotName];

                if (!inputBlock) {
                    return prev;
                }

                const parent = prev[parentIdx];
                // Place the extracted block near its parent
                const extracted: BlockInstance = {
                    ...inputBlock,
                    x: parent.x + 10,
                    y: parent.y + 10,
                };

                const updated = [
                    ...prev.slice(0, parentIdx),
                    {
                        ...parent,
                        inputs: { ...parent.inputs, [slotName]: null },
                    },
                    ...prev.slice(parentIdx + 1),
                    extracted,
                ];

                // Start dragging the extracted block
                const positions = new Map<string, { x: number; y: number }>();
                positions.set(extracted.id, { x: extracted.x, y: extracted.y });
                initialPositionsRef.current = positions;
                setDragOffset({ x: 10, y: 10 });
                setDraggingBlock(extracted);

                return updated;
            });
        },
        [],
    );

    // Add mouse move/up listeners
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleLoadStarter = useCallback(() => {
        const flagDef = BLOCK_DEFINITIONS.find(
            (b) => b.type === 'event_whenflagclicked',
        );
        const moveDef = BLOCK_DEFINITIONS.find(
            (b) => b.type === 'motion_movesteps',
        );
        const turnDef = BLOCK_DEFINITIONS.find(
            (b) => b.type === 'motion_turnright',
        );
        const sayDef = BLOCK_DEFINITIONS.find((b) => b.type === 'looks_say');

        if (!flagDef || !moveDef || !turnDef || !sayDef) {
            return;
        }

        const say = createBlockInstance(sayDef, 60, 160);
        say.fields = { MESSAGE: 'Hello Simply Blocks!' };

        const turn = createBlockInstance(turnDef, 60, 120);
        turn.fields = { DEGREES: 25 };
        turn.next = say;

        const move = createBlockInstance(moveDef, 60, 80);
        move.fields = { STEPS: 30 };
        move.next = turn;

        const flag = createBlockInstance(flagDef, 60, 40);
        flag.next = move;

        const starterBlocks = recalculateStackPositions(flag, [
            flag,
            move,
            turn,
            say,
        ]);
        setBlocks(starterBlocks);
    }, [createBlockInstance, recalculateStackPositions]);

    const handleClearAll = useCallback(() => {
        setBlocks([]);
    }, []);

    const CATEGORY_ORDER = [
        'motion',
        'looks',
        'sound',
        'events',
        'control',
        'sensing',
        'operators',
        'variables',
        'lists',
        'pen',
        'myblocks',
    ];

    const groupedBlocks = BLOCK_DEFINITIONS.reduce(
        (acc, def) => {
            if (!acc[def.category]) {
                acc[def.category] = [];
            }

            // Avoid duplicates (legacy aliases share the same sb3Opcode)
            const key = def.sb3Opcode ?? def.type;

            if (
                !acc[def.category].some((d) => (d.sb3Opcode ?? d.type) === key)
            ) {
                acc[def.category].push(def);
            }

            return acc;
        },
        {} as Record<string, BlockDefinition[]>,
    );

    const orderedCategories = [
        ...CATEGORY_ORDER.filter((c) => groupedBlocks[c]),
        ...Object.keys(groupedBlocks).filter(
            (c) => !CATEGORY_ORDER.includes(c),
        ),
    ];

    return (
        <div className={`flex h-full ${className}`}>
            {/* Sidebar / Block Palette */}
            <div className="w-52 overflow-y-auto border-r border-border bg-card p-3">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Blocks
                </h3>
                {orderedCategories.map((category) => {
                    const defs = groupedBlocks[category];

                    return (
                        <div key={category} className="mb-4">
                            <h4 className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground capitalize uppercase">
                                <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ backgroundColor: defs[0]?.color }}
                                />
                                {category}
                            </h4>
                            {defs.map((def) => (
                                <div
                                    key={def.type}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, def)}
                                    className="mb-1 cursor-grab active:cursor-grabbing"
                                >
                                    <div
                                        className="truncate rounded px-2 py-1.5 text-xs font-medium text-white"
                                        style={{
                                            backgroundColor: def.color,
                                            fontFamily:
                                                "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
                                        }}
                                        title={def.label.replace(/%\d+/g, '…')}
                                    >
                                        {def.label.replace(/%\d+/g, '…')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Workspace Canvas */}
            <div
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative flex-1 overflow-hidden bg-background"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, var(--muted-foreground) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}
            >
                {/* Render all blocks absolutely — children are positioned by recalculateStackPositions */}
                {blocks.map((block) => (
                    <div
                        key={block.id}
                        data-block-id={block.id}
                        onMouseDown={(e) => handleBlockMouseDown(e, block)}
                        className="absolute"
                        style={{
                            left: block.x,
                            top: block.y,
                            zIndex: draggingBlock?.id === block.id ? 1000 : 1,
                        }}
                    >
                        <BlockRenderer
                            block={block}
                            onFieldChange={(fieldName, value) =>
                                handleFieldChange(block.id, fieldName, value)
                            }
                            onInputRemove={handleInputRemove}
                        />
                    </div>
                ))}

                {/* Snap preview shadow — stack/nest/insert */}
                {snapPreview.visible &&
                    draggingBlock &&
                    snapPreview.type !== 'input' && (
                        <div
                            className="pointer-events-none absolute"
                            style={{
                                left: snapPreview.x,
                                top: snapPreview.y,
                                zIndex: 999,
                                opacity: 0.3,
                            }}
                        >
                            <BlockRenderer
                                block={draggingBlock}
                                isDragging={true}
                            />
                        </div>
                    )}
                {/* Input-slot snap glow ring */}
                {snapPreview.visible && snapPreview.type === 'input' && (
                    <div
                        className="pointer-events-none absolute animate-pulse"
                        style={{
                            left: snapPreview.x - 4,
                            top: snapPreview.y - 4,
                            width: 50,
                            height: 28,
                            borderRadius: 14,
                            border: '2px solid white',
                            background: 'rgba(255,255,255,0.25)',
                            zIndex: 999,
                        }}
                    />
                )}
                {/* Empty state callout */}
                {blocks.length === 0 && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
                        <div className="pointer-events-auto max-w-sm rounded-lg border border-dashed border-border bg-card/80 p-6 shadow-xs backdrop-blur-sm">
                            <p className="text-sm font-semibold text-foreground">
                                Workspace is empty
                            </p>
                            <p className="mt-1 mb-4 text-xs text-muted-foreground">
                                Drag blocks from the category palette on the
                                left to build logic, or insert a starter script.
                            </p>
                            <button
                                type="button"
                                onClick={handleLoadStarter}
                                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                            >
                                Insert Starter Script
                            </button>
                        </div>
                    </div>
                )}

                {/* Canvas top-right actions */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    {blocks.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="rounded border border-border bg-background/90 px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground shadow-xs backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
                        >
                            Clear Canvas ({blocks.length})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
