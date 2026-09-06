import { useRef, useState, useCallback, useEffect } from 'react';
import BlockRenderer from './BlockRenderer';
import { BLOCK_DEFINITIONS } from './definitions';
import { generatePython } from './generator';
import type { BlockInstance, BlockDefinition } from './types';
import type { SnapPreviewState } from './workspaceGeometry';
import {
    createBlockInstance,
    recalculateStackPositions,
    calculateSnapTarget,
    disconnectBlock,
    integrateStackSnap,
    integrateInputSlotSnap,
    removeInputBlock,
    updateBlockFieldValue,
} from './workspaceGeometry';

interface BlockWorkspaceProps {
    onCodeChange?: (code: string) => void;
    onBlocksChange?: (blocks: BlockInstance[]) => void;
    className?: string;
}

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
    const [snapPreview, setSnapPreview] = useState<SnapPreviewState>({
        x: 0,
        y: 0,
        visible: false,
    });
    const inputSnapRef = useRef<{ parentId: string; slotName: string } | null>(
        null,
    );

    const handleDragStart = useCallback(
        (e: React.DragEvent, def: BlockDefinition) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('application/json', JSON.stringify(def));
        },
        [],
    );

    const handleDrop = useCallback((e: React.DragEvent) => {
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
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

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
            setBlocks((prev) =>
                updateBlockFieldValue(blockId, fieldName, value, prev),
            );
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

            setBlocks((prev) => disconnectBlock(block, prev));
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
                const updated = prev.map((block) =>
                    block.id === draggingBlock.id
                        ? { ...block, x: newX, y: newY }
                        : block,
                );

                const draggedInstance = updated.find(
                    (b) => b.id === draggingBlock.id,
                );

                return draggedInstance
                    ? recalculateStackPositions(draggedInstance, updated)
                    : updated;
            });

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
                });

                return;
            }

            const snap = calculateSnapTarget(draggingBlock, newX, newY, blocks);
            setSnapPreview(snap);
        },
        [draggingBlock, dragOffset, blocks, findNearestInputSlot],
    );

    const handleMouseUp = useCallback(() => {
        if (!draggingBlock) {
            return;
        }

        const inputSnap = inputSnapRef.current;

        if (snapPreview.visible && snapPreview.type === 'input' && inputSnap) {
            setBlocks((prev) =>
                integrateInputSlotSnap(draggingBlock, inputSnap, prev),
            );
        } else if (snapPreview.visible && snapPreview.targetId) {
            setBlocks((prev) =>
                integrateStackSnap(draggingBlock, snapPreview, prev),
            );
        }

        inputSnapRef.current = null;
        setDraggingBlock(null);
        setSnapPreview({
            x: 0,
            y: 0,
            visible: false,
        });
    }, [draggingBlock, snapPreview]);

    const handleInputRemove = useCallback(
        (parentBlockId: string, slotName: string) => {
            setBlocks((prev) => {
                const res = removeInputBlock(parentBlockId, slotName, prev);

                if (!res) {
                    return prev;
                }

                setDragOffset({ x: 10, y: 10 });
                setDraggingBlock(res.extracted);

                return res.blocks;
            });
        },
        [],
    );

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
    }, []);

    const handleClearAll = useCallback(() => {
        setBlocks([]);
    }, []);

    const groupedBlocks = BLOCK_DEFINITIONS.reduce(
        (acc, def) => {
            if (!acc[def.category]) {
                acc[def.category] = [];
            }

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
                {/* Render all blocks absolutely */}
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

                {/* Snap preview shadow */}
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
