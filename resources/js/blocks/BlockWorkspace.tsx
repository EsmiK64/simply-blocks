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
    const [snapPreview, setSnapPreview] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
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
            const updated = [...prev];

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

            // Clear the dragged block's next reference (disconnect blocks below it)
            // and recalculate positions of disconnected blocks
            const draggedIdx = updated.findIndex(b => b.id === block.id);
            if (draggedIdx !== -1) {
                const oldNext = updated[draggedIdx].next;
                updated[draggedIdx] = {
                    ...updated[draggedIdx],
                    next: null
                };

                // Recalculate positions of blocks that were below the dragged block
                if (oldNext) {
                    const recalculateDisconnected = (b: BlockInstance, x: number, y: number) => {
                        const idx = updated.findIndex(bl => bl.id === b.id);
                        if (idx !== -1) {
                            updated[idx] = { ...b, x, y };
                        }
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

            if (nearestBlock && snapType) {
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
                setSnapPreview({ x: snapX, y: snapY, visible: true });
            } else {
                setSnapPreview({ x: 0, y: 0, visible: false });
            }

            return updated;
        });
    }, [draggingBlock, dragOffset, getConnectedBlocks]);

    const handleMouseUp = useCallback(() => {
        if (!draggingBlock) return;

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

        setDraggingBlock(null);
        setInitialPositions(new Map());
        setSnapPreview({ x: 0, y: 0, visible: false });
    }, [draggingBlock, snapPreview, recalculateStackPositions]);

    // Add mouse move/up listeners
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const groupedBlocks = BLOCK_DEFINITIONS.reduce((acc, def) => {
        if (!acc[def.category]) {
            acc[def.category] = [];
        }
        acc[def.category].push(def);
        return acc;
    }, {} as Record<string, BlockDefinition[]>);

    return (
        <div className="flex h-full">
            {/* Sidebar / Block Palette */}
            <div className="w-48 border-r border-border bg-card p-3 overflow-y-auto">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Blocks</h3>
                {Object.entries(groupedBlocks).map(([category, defs]) => (
                    <div key={category} className="mb-4">
                        <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2 capitalize">
                            {category}
                        </h4>
                        {defs.map((def) => (
                            <div
                                key={def.type}
                                draggable
                                onDragStart={(e) => handleDragStart(e, def)}
                                className="mb-2 cursor-grab active:cursor-grabbing"
                            >
                                <div
                                    className="px-3 py-2 rounded text-white text-xs font-medium"
                                    style={{
                                        backgroundColor: def.color,
                                        fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
                                    }}
                                >
                                    {def.label.replace(/%\d+/g, '…')}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
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
                        <BlockRenderer block={block} />
                    </div>
                ))}

                {/* Snap preview shadow */}
                {snapPreview.visible && draggingBlock && (
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
            </div>
        </div>
    );
}
