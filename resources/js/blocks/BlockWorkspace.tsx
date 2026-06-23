import { useRef, useState, useCallback, useEffect } from 'react';
import { BlockInstance, BlockDefinition } from './types';
import { BLOCK_DEFINITIONS, getBlockDefinition } from './definitions';
import BlockRenderer from './BlockRenderer';

interface BlockWorkspaceProps {
    onCodeChange?: (code: string) => void;
}

export default function BlockWorkspace({ onCodeChange }: BlockWorkspaceProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [blocks, setBlocks] = useState<BlockInstance[]>([]);
    const [draggingBlock, setDraggingBlock] = useState<BlockInstance | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [initialPositions, setInitialPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
    const [snapPreview, setSnapPreview] = useState<{ x: number; y: number; visible: boolean; type?: 'stack' | 'nest' | 'insert' | 'input' }>({ x: 0, y: 0, visible: false });
    // For input-slot snapping: which block+slot the dragged reporter should snap into
    const inputSnapRef = useRef<{ parentId: string; slotName: string } | null>(null);
    const initialPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

    const createBlockInstance = useCallback((def: BlockDefinition, x: number, y: number): BlockInstance => {
        const fields: Record<string, string | number | boolean> = {};
        def.fields?.forEach(field => {
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
    }, []);

    const handleDragStart = useCallback((e: React.DragEvent, def: BlockDefinition) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(def));
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data || !canvasRef.current) return;

        const def: BlockDefinition = JSON.parse(data);
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 100;
        const y = e.clientY - rect.top - 20;

        const newBlock = createBlockInstance(def, x, y);
        setBlocks(prev => [...prev, newBlock]);
    }, [createBlockInstance]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    // Get all blocks connected to the dragged block (stack and children)
    const getConnectedBlocks = useCallback((block: BlockInstance, allBlocks: BlockInstance[]): Set<string> => {
        const connected = new Set<string>();
        const toProcess = [block];

        while (toProcess.length > 0) {
            const current = toProcess.pop()!;
            if (connected.has(current.id)) continue;

            connected.add(current.id);

            // Add next block in stack
            if (current.next) {
                toProcess.push(current.next);
            }

            // Add children (nested blocks)
            current.children.forEach(child => {
                toProcess.push(child);
            });
        }

        return connected;
    }, []);

    // Calculate the actual height of a block based on its children
    const calculateBlockHeight = useCallback((block: BlockInstance): number => {
        if (block.definition.hasContainer) {
            // C-block = header(40) + inner + footer(40). Minimum inner = 60.
            if (block.children.length === 0) return 40 + 60 + 40;
            let innerHeight = 0;
            block.children.forEach(child => {
                innerHeight += calculateBlockHeight(child) - 8; // overlap by tab height
            });
            innerHeight = Math.max(innerHeight, 60);
            const tabHeight = block.definition.hasTab ? 8 : 0;
            return 40 + innerHeight + 40 + tabHeight;
        }
        return block.definition.hasTab ? 48 : 40;
    }, []);

    // Recalculate positions of blocks in a stack after snapping
    const recalculateStackPositions = useCallback((startBlock: BlockInstance, allBlocks: BlockInstance[]): BlockInstance[] => {
        const updated = [...allBlocks];
        const blockMap = new Map(updated.map(b => [b.id, b]));
        const visited = new Set<string>();

        const recalculateBlock = (block: BlockInstance, x: number, y: number): void => {
            // Prevent infinite recursion
            if (visited.has(block.id)) return;
            visited.add(block.id);

            const idx = updated.findIndex(b => b.id === block.id);
            if (idx === -1) return;

            const blockHeight = calculateBlockHeight(block);
            const tabHeight = block.definition.hasTab ? 8 : 0;

            updated[idx] = { ...block, x, y };

            // Recalculate children positions
            if (block.definition.hasContainer && block.children.length > 0) {
                let childY = y + 40; // flush with header bottom
                block.children.forEach(child => {
                    recalculateBlock(child, x + 12, childY);
                    const childHeight = calculateBlockHeight(child);
                    const childOverlap = child.definition.hasTab ? 8 : 0;
                    childY += childHeight - childOverlap;
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
    }, [calculateBlockHeight]);

    // Helper: recursively find a block by id inside inputs of any block in the flat list
    const findBlockInInputs = useCallback((targetId: string, allBlocks: BlockInstance[]): { parentBlock: BlockInstance; slotName: string } | null => {
        for (const b of allBlocks) {
            for (const [slotName, inputBlock] of Object.entries(b.inputs)) {
                if (inputBlock && inputBlock.id === targetId) return { parentBlock: b, slotName };
                if (inputBlock) {
                    const nested = findBlockInInputs(targetId, [inputBlock]);
                    if (nested) return nested;
                }
            }
        }
        return null;
    }, []);

    // Helper: walk all input blocks recursively and collect them as flat ids
    const collectInputIds = useCallback((block: BlockInstance, ids: Set<string>) => {
        for (const inputBlock of Object.values(block.inputs)) {
            if (inputBlock) {
                ids.add(inputBlock.id);
                collectInputIds(inputBlock, ids);
            }
        }
    }, []);

    // Scan all input slots in all blocks and find the nearest one to a point
    const findNearestInputSlot = useCallback((px: number, py: number, allBlocks: BlockInstance[], excludeId: string) => {
        let best: { parentId: string; slotName: string; dist: number } | null = null;
        const INPUT_SNAP_RADIUS = 60;

        const scanBlock = (b: BlockInstance) => {
            if (!b.definition.inputs) return;
            b.definition.inputs.forEach(slotName => {
                // Only snap into empty slots
                if (b.inputs[slotName]) return;
                // Approximate slot position: block x + some offset based on label
                const slotX = b.x + 30;
                const slotY = b.y + 20;
                const dist = Math.sqrt((px - slotX) ** 2 + (py - slotY) ** 2);
                if (dist < INPUT_SNAP_RADIUS && (!best || dist < best.dist)) {
                    best = { parentId: b.id, slotName, dist };
                }
            });
            // Recurse into children
            b.children.forEach(scanBlock);
            b.elseChildren?.forEach(scanBlock);
        };

        allBlocks.forEach(b => { if (b.id !== excludeId) scanBlock(b); });
        return best as { parentId: string; slotName: string; dist: number } | null;
    }, []);

    const handleBlockMouseDown = useCallback((e: React.MouseEvent, block: BlockInstance) => {
        e.stopPropagation();
        const rect = (e.target as HTMLElement).closest('[data-block-id]')?.getBoundingClientRect();
        if (!rect) return;

        const offset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        // Disconnect the block from its connections when dragging starts
        setBlocks(prev => {
            let updated = [...prev];

            // Remove from parent's children if it's nested
            const parentIdx = updated.findIndex(b => b.children.some(c => c.id === block.id));
            if (parentIdx !== -1) {
                updated[parentIdx] = {
                    ...updated[parentIdx],
                    children: updated[parentIdx].children.filter(c => c.id !== block.id)
                };
            }

            // Remove from previous block's next if it's in a stack
            const prevBlockIdx = updated.findIndex(b => b.next?.id === block.id);
            if (prevBlockIdx !== -1) {
                updated[prevBlockIdx] = {
                    ...updated[prevBlockIdx],
                    next: null
                };
            }

            // Remove from an input slot if it was snapped into one
            const inInputResult = findBlockInInputs(block.id, updated);
            if (inInputResult) {
                const { parentBlock, slotName } = inInputResult;
                const pIdx = updated.findIndex(b => b.id === parentBlock.id);
                if (pIdx !== -1) {
                    updated[pIdx] = {
                        ...updated[pIdx],
                        inputs: { ...updated[pIdx].inputs, [slotName]: null },
                    };
                }
                // Ensure the dragged block is in the flat list
                if (!updated.some(b => b.id === block.id)) {
                    updated = [...updated, { ...block, x: block.x, y: block.y }];
                }
            }

            // Clear the dragged block's next reference (disconnect blocks below it)
            const draggedIdx = updated.findIndex(b => b.id === block.id);
            if (draggedIdx !== -1) {
                const oldNext = updated[draggedIdx].next;
                updated[draggedIdx] = { ...updated[draggedIdx], next: null };

                if (oldNext) {
                    const recalculateDisconnected = (b: BlockInstance, x: number, y: number) => {
                        const idx = updated.findIndex(bl => bl.id === b.id);
                        if (idx !== -1) updated[idx] = { ...b, x, y };
                        if (b.next) {
                            const height = calculateBlockHeight(b);
                            recalculateDisconnected(b.next, x, y + height - 10);
                        }
                    };
                    const height = calculateBlockHeight(block);
                    recalculateDisconnected(oldNext, block.x, block.y + height - 10);
                }
            }

            return updated;
        });

        // Store initial positions of the dragged block only (not connected blocks)
        const positions = new Map<string, { x: number; y: number }>();
        positions.set(block.id, { x: block.x, y: block.y });

        initialPositionsRef.current = positions;
        setDragOffset(offset);
        setDraggingBlock(block);
        setInitialPositions(positions);
    }, [blocks, calculateBlockHeight]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!draggingBlock || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;

        const initialPos = initialPositionsRef.current.get(draggingBlock.id);
        if (!initialPos) return;

        const dx = newX - initialPos.x;
        const dy = newY - initialPos.y;

        // Move only the dragged block (use absolute position from initialPos + delta)
        setBlocks(prev => {
            const updated = prev.map(block => {
                if (block.id === draggingBlock.id) {
                    return { ...block, x: newX, y: newY };
                }
                return block;
            });

            // Find snap target for preview
            let nearestBlock: BlockInstance | null = null;
            let minDistance = 50;
            let snapType: 'stack' | 'nest' | 'insert' | null = null;
            let snapX = newX;
            let snapY = newY;
            let insertAfterBlock: BlockInstance | null = null;

            for (const block of updated) {
                if (block.id === draggingBlock.id) continue;

                const dragged = updated.find(b => b.id === draggingBlock.id);
                if (!dragged) continue;

                // Special handling for container blocks - check if inside container area
                if (block.definition.hasContainer) {
                    const blockHeight = calculateBlockHeight(block);
                    const containerTop = block.y + 40;
                    const containerBottom = block.y + blockHeight;
                    const horizontallyAligned = Math.abs(dragged.x - block.x) < 100;

                    if (horizontallyAligned && dragged.y > containerTop && dragged.y < containerBottom) {
                        // Block is inside container - prioritize this over distance check
                        nearestBlock = block;
                        snapType = 'nest';
                        minDistance = 0; // Force this to be selected
                        break;
                    }
                }

                const blockDist = Math.sqrt(Math.pow(block.x - dragged.x, 2) + Math.pow(block.y - dragged.y, 2));

                if (blockDist < minDistance) {
                    minDistance = blockDist;
                    nearestBlock = block;

                    if (block.definition.hasContainer) {
                        const blockHeight = calculateBlockHeight(block);
                        const containerTop = block.y + 40;
                        const containerBottom = block.y + blockHeight;
                        // Check if dragged block is inside the container area
                        // More lenient check: if Y is in range and X is reasonably close
                        const horizontallyAligned = Math.abs(dragged.x - block.x) < 100;
                        if (horizontallyAligned && dragged.y > containerTop && dragged.y < containerBottom) {
                            snapType = 'nest';
                        } else {
                            snapType = 'stack';
                        }
                    } else {
                        const blockHeight = calculateBlockHeight(block);
                        const tabHeight = block.definition.hasTab ? 8 : 0;
                        const insertZoneTop = block.y + blockHeight / 2;
                        const insertZoneBottom = block.y + blockHeight + tabHeight;

                        if (dragged.y > insertZoneTop && dragged.y < insertZoneBottom) {
                            snapType = 'insert';
                            insertAfterBlock = block;
                        } else {
                            snapType = 'stack';
                        }
                    }
                }
            }

            const draggedShape = draggingBlock.definition.shape ?? 'stack';
            const isReporterLike = draggedShape === 'reporter' || draggedShape === 'boolean';

            // For reporter/boolean: check input-slot proximity first
            if (isReporterLike) {
                const dragged = updated.find(b => b.id === draggingBlock.id);
                if (dragged) {
                    const inputSnap = findNearestInputSlot(dragged.x + 20, dragged.y + 10, updated, draggingBlock.id);
                    if (inputSnap) {
                        // Find parent block position for snap preview
                        const parentBlock = updated.find(b => b.id === inputSnap.parentId);
                        if (parentBlock) {
                            inputSnapRef.current = { parentId: inputSnap.parentId, slotName: inputSnap.slotName };
                            setSnapPreview({ x: parentBlock.x + 10, y: parentBlock.y + 10, visible: true, type: 'input' });
                            return updated;
                        }
                    }
                }
                inputSnapRef.current = null;
            }

            if (!isReporterLike && nearestBlock && snapType) {
                if (snapType === 'nest' && nearestBlock.definition.hasContainer) {
                    snapX = nearestBlock.x + 12;
                    let childY = nearestBlock.y + 40;
                    nearestBlock.children.forEach(child => {
                        childY += calculateBlockHeight(child) - 8;
                    });
                    snapY = childY;
                } else if (snapType === 'insert' && insertAfterBlock) {
                    snapX = insertAfterBlock.x;
                    snapY = insertAfterBlock.y + calculateBlockHeight(insertAfterBlock) - 8;
                } else {
                    snapX = nearestBlock.x;
                    snapY = nearestBlock.y + calculateBlockHeight(nearestBlock) - 8;
                }
                setSnapPreview({ x: snapX, y: snapY, visible: true, type: snapType as any });
            } else if (!isReporterLike) {
                setSnapPreview({ x: 0, y: 0, visible: false });
            }

            return updated;
        });
    }, [draggingBlock, dragOffset, getConnectedBlocks, findNearestInputSlot]);

    const handleMouseUp = useCallback(() => {
        if (!draggingBlock) return;

        // ── Input-slot snap (reporter/boolean into a slot) ──────────────────
        const inputSnap = inputSnapRef.current;
        if (snapPreview.visible && snapPreview.type === 'input' && inputSnap) {
            setBlocks(prev => {
                const updated = [...prev];
                const draggedIndex = updated.findIndex(b => b.id === draggingBlock.id);
                if (draggedIndex === -1) return prev;

                const parentIdx = updated.findIndex(b => b.id === inputSnap.parentId);
                if (parentIdx === -1) return prev;

                const draggedBlock = updated[draggedIndex];

                // Embed the reporter into the parent's inputs
                updated[parentIdx] = {
                    ...updated[parentIdx],
                    inputs: { ...updated[parentIdx].inputs, [inputSnap.slotName]: draggedBlock },
                };

                // Remove from flat list (it now lives inside the parent)
                updated.splice(draggedIndex, 1);
                return updated;
            });
            inputSnapRef.current = null;
            setDraggingBlock(null);
            setInitialPositions(new Map());
            setSnapPreview({ x: 0, y: 0, visible: false });
            return;
        }

        // Use the snap preview position if visible
        if (snapPreview.visible) {
            setBlocks(prev => {
                const updated: BlockInstance[] = [...prev];
                const draggedIndex = updated.findIndex(b => b.id === draggingBlock.id);
                if (draggedIndex === -1) return prev;

                const draggedBlock = updated[draggedIndex];

                // Find nearest block to snap to
                let nearestBlock: BlockInstance | null = null;
                let minDistance = 50;
                let snapType: 'stack' | 'nest' | 'insert' | null = null;
                let insertAfterBlock: BlockInstance | null = null;

                for (const block of updated) {
                    if (block.id === draggingBlock.id) continue;

                    const dx = block.x - draggedBlock.x;
                    const dy = block.y - draggedBlock.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Special handling for container blocks - check if inside container area
                    if (block.definition.hasContainer) {
                        const blockHeight = calculateBlockHeight(block);
                        const containerTop = block.y + 40;
                        const containerBottom = block.y + blockHeight;
                        const horizontallyAligned = Math.abs(draggedBlock.x - block.x) < 100;

                        if (horizontallyAligned && draggedBlock.y > containerTop && draggedBlock.y < containerBottom) {
                            // Block is inside container - prioritize this over distance check
                            nearestBlock = block;
                            snapType = 'nest';
                            minDistance = 0; // Force this to be selected
                            break;
                        }
                    }

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestBlock = block;

                        if (block.definition.hasContainer) {
                            const blockHeight = calculateBlockHeight(block);
                            const containerTop = block.y + 40;
                            const containerBottom = block.y + blockHeight;
                            // Check if dragged block is inside the container area
                            // More lenient check: if Y is in range and X is reasonably close
                            const horizontallyAligned = Math.abs(draggedBlock.x - block.x) < 100;
                            if (horizontallyAligned && draggedBlock.y > containerTop && draggedBlock.y < containerBottom) {
                                snapType = 'nest';
                            } else {
                                snapType = 'stack';
                            }
                        } else {
                            const blockHeight = calculateBlockHeight(block);
                            const tabHeight = block.definition.hasTab ? 8 : 0;
                            const insertZoneTop = block.y + blockHeight / 2;
                            const insertZoneBottom = block.y + blockHeight + tabHeight;

                            if (draggedBlock.y > insertZoneTop && draggedBlock.y < insertZoneBottom) {
                                snapType = 'insert';
                                insertAfterBlock = block;
                            } else {
                                snapType = 'stack';
                            }
                        }
                    }
                }

                if (nearestBlock && snapType) {
                    // Update the connection first
                    if (snapType === 'nest' && nearestBlock.definition.hasContainer) {
                        // Remove from previous parent if any
                        const parentIdx = updated.findIndex(b => b.children.some(c => c.id === draggingBlock.id));
                        if (parentIdx !== -1) {
                            updated[parentIdx].children = updated[parentIdx].children.filter(c => c.id !== draggingBlock.id);
                        }
                        // Add to children
                        nearestBlock.children = [...nearestBlock.children, updated[draggedIndex]];
                    } else if (snapType === 'insert' && insertAfterBlock) {
                        // Remove from previous parent if any
                        const parentIdx = updated.findIndex(b => b.children.some(c => c.id === draggingBlock.id));
                        if (parentIdx !== -1) {
                            updated[parentIdx].children = updated[parentIdx].children.filter(c => c.id !== draggingBlock.id);
                        }
                        // Insert in the middle of the stack
                        const oldNext = insertAfterBlock.next;
                        insertAfterBlock.next = updated[draggedIndex];
                        updated[draggedIndex].next = oldNext;
                    } else {
                        // Remove from previous parent if any
                        const parentIdx = updated.findIndex(b => b.children.some(c => c.id === draggingBlock.id));
                        if (parentIdx !== -1) {
                            updated[parentIdx].children = updated[parentIdx].children.filter(c => c.id !== draggingBlock.id);
                        }
                        // Link the blocks
                        nearestBlock.next = updated[draggedIndex];
                    }

                    // Move to snap position
                    updated[draggedIndex] = {
                        ...updated[draggedIndex],
                        x: snapPreview.x,
                        y: snapPreview.y,
                    };

                    // Recalculate all positions in the stack
                    return recalculateStackPositions(updated[draggedIndex], updated);
                }

                return updated;
            });
        }

        inputSnapRef.current = null;
        setDraggingBlock(null);
        setInitialPositions(new Map());
        setSnapPreview({ x: 0, y: 0, visible: false });
    }, [draggingBlock, snapPreview, recalculateStackPositions]);

    // Called when user mousedowns on a reporter block that's inside an input slot
    const handleInputRemove = useCallback((parentBlockId: string, slotName: string) => {
        setBlocks(prev => {
            const parentIdx = prev.findIndex(b => b.id === parentBlockId);
            if (parentIdx === -1) return prev;

            const inputBlock = prev[parentIdx].inputs[slotName];
            if (!inputBlock) return prev;

            const parent = prev[parentIdx];
            // Place the extracted block near its parent
            const extracted: BlockInstance = {
                ...inputBlock,
                x: parent.x + 10,
                y: parent.y + 10,
            };

            const updated = [
                ...prev.slice(0, parentIdx),
                { ...parent, inputs: { ...parent.inputs, [slotName]: null } },
                ...prev.slice(parentIdx + 1),
                extracted,
            ];

            // Start dragging the extracted block
            const positions = new Map<string, { x: number; y: number }>();
            positions.set(extracted.id, { x: extracted.x, y: extracted.y });
            initialPositionsRef.current = positions;
            setDragOffset({ x: 10, y: 10 });
            setDraggingBlock(extracted);
            setInitialPositions(positions);

            return updated;
        });
    }, []);

    // Add mouse move/up listeners
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const CATEGORY_ORDER = [
        'motion', 'looks', 'sound', 'events', 'control',
        'sensing', 'operators', 'variables', 'lists', 'pen', 'myblocks',
    ];

    const groupedBlocks = BLOCK_DEFINITIONS.reduce((acc, def) => {
        if (!acc[def.category]) acc[def.category] = [];
        // Avoid duplicates (legacy aliases may repeat)
        if (!acc[def.category].some(d => d.type === def.type)) {
            acc[def.category].push(def);
        }
        return acc;
    }, {} as Record<string, BlockDefinition[]>);

    const orderedCategories = [
        ...CATEGORY_ORDER.filter(c => groupedBlocks[c]),
        ...Object.keys(groupedBlocks).filter(c => !CATEGORY_ORDER.includes(c)),
    ];

    return (
        <div className="flex h-full">
            {/* Sidebar / Block Palette */}
            <div className="w-52 border-r border-border bg-card p-3 overflow-y-auto">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Blocks</h3>
                {orderedCategories.map((category) => {
                    const defs = groupedBlocks[category]; return (
                        <div key={category} className="mb-4">
                            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2 capitalize flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: defs[0]?.color }} />
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
                                        className="px-2 py-1.5 rounded text-white text-xs font-medium truncate"
                                        style={{
                                            backgroundColor: def.color,
                                            fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
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
                className="flex-1 relative overflow-hidden bg-background"
                style={{
                    backgroundImage: 'radial-gradient(circle, var(--muted-foreground) 1px, transparent 1px)',
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
                            onInputRemove={handleInputRemove}
                        />
                    </div>
                ))}

                {/* Snap preview shadow — stack/nest/insert */}
                {snapPreview.visible && draggingBlock && snapPreview.type !== 'input' && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            left: snapPreview.x,
                            top: snapPreview.y,
                            zIndex: 999,
                            opacity: 0.3,
                        }}
                    >
                        <BlockRenderer block={draggingBlock} isDragging={true} />
                    </div>
                )}
                {/* Input-slot snap glow ring */}
                {snapPreview.visible && snapPreview.type === 'input' && (
                    <div
                        className="absolute pointer-events-none animate-pulse"
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
            </div>
        </div>
    );
}
