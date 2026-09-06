import React, { useRef, useEffect, useCallback, useState } from 'react';
import { renderSprite } from './canvasRenderer';
import {
    canvasToScratch,
    createStageSprite,
    createDefaultSprite,
} from './SpriteRuntime';
import type { StageState } from './SpriteRuntime';

interface StageComponentProps {
    state: StageState;
    selectedSpriteId?: string | null;
    onSpriteClick?: (spriteId: string) => void;
    onSpriteMove?: (
        spriteId: string,
        scratchX: number,
        scratchY: number,
    ) => void;
    onStageClick?: (scratchX: number, scratchY: number) => void;
    onMouseMove?: (scratchX: number, scratchY: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StageComponent({
    state,
    selectedSpriteId,
    onSpriteClick,
    onSpriteMove,
    onStageClick,
    onMouseMove,
}: StageComponentProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const [draggingSpriteId, setDraggingSpriteId] = useState<string | null>(
        null,
    );
    const [isHoveringSprite, setIsHoveringSprite] = useState(false);
    const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({
        offsetX: 0,
        offsetY: 0,
    });

    const STAGE_W = state.width; // 480
    const STAGE_H = state.height; // 360

    // Render loop
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, STAGE_W, STAGE_H);

        // Sort sprites by layerOrder
        const sorted = [...state.sprites].sort(
            (a, b) => a.layerOrder - b.layerOrder,
        );

        sorted.forEach((sprite) => {
            const isSelected = Boolean(
                selectedSpriteId && sprite.id === selectedSpriteId,
            );
            renderSprite(
                ctx,
                sprite,
                imagesRef.current,
                STAGE_W,
                STAGE_H,
                isSelected,
            );
        });
    }, [state, STAGE_W, STAGE_H, selectedSpriteId]);

    // Pre-load costume images
    useEffect(() => {
        const images = imagesRef.current;

        state.sprites.forEach((sprite) => {
            sprite.costumes.forEach((costume) => {
                if (costume.dataUrl && !images.has(costume.dataUrl)) {
                    const img = new Image();

                    img.onload = () => {
                        images.set(costume.dataUrl!, img);
                        drawFrame();
                    };

                    img.src = costume.dataUrl;
                }
            });
        });
    }, [state.sprites, drawFrame]);

    useEffect(() => {
        drawFrame();
    }, [drawFrame]);

    // Responsive scaling
    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const updateScale = () => {
            const containerW = container.clientWidth;
            const newScale = Math.min(1, containerW / STAGE_W);
            setScale(newScale);
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(container);

        return () => observer.disconnect();
    }, [STAGE_W]);

    const getEventScratchCoords = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current!;
            const rect = canvas.getBoundingClientRect();
            const canvasX = (e.clientX - rect.left) / scale;
            const canvasY = (e.clientY - rect.top) / scale;

            return canvasToScratch(canvasX, canvasY, STAGE_W, STAGE_H);
        },
        [scale, STAGE_W, STAGE_H],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const [sx, sy] = getEventScratchCoords(e);
            const clickableSprites = [...state.sprites]
                .filter((s) => !s.isStage && s.visible)
                .sort((a, b) => b.layerOrder - a.layerOrder);

            for (const s of clickableSprites) {
                const half = (28 * (s.size || 100)) / 100;

                if (
                    sx >= s.x - half &&
                    sx <= s.x + half &&
                    sy >= s.y - half &&
                    sy <= s.y + half
                ) {
                    setDraggingSpriteId(s.id);
                    dragOffsetRef.current = {
                        offsetX: s.x - sx,
                        offsetY: s.y - sy,
                    };
                    onSpriteClick?.(s.id);

                    return;
                }
            }

            onStageClick?.(sx, sy);
        },
        [getEventScratchCoords, onSpriteClick, onStageClick, state.sprites],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const [sx, sy] = getEventScratchCoords(e);

            if (draggingSpriteId) {
                const newX = Math.min(
                    240,
                    Math.max(
                        -240,
                        Math.round(sx + dragOffsetRef.current.offsetX),
                    ),
                );
                const newY = Math.min(
                    180,
                    Math.max(
                        -180,
                        Math.round(sy + dragOffsetRef.current.offsetY),
                    ),
                );

                onSpriteMove?.(draggingSpriteId, newX, newY);
            } else {
                const clickableSprites = [...state.sprites].filter(
                    (s) => !s.isStage && s.visible,
                );

                const isOver = clickableSprites.some((s) => {
                    const half = (28 * (s.size || 100)) / 100;

                    return (
                        sx >= s.x - half &&
                        sx <= s.x + half &&
                        sy >= s.y - half &&
                        sy <= s.y + half
                    );
                });

                setIsHoveringSprite(isOver);
            }

            onMouseMove?.(sx, sy);
        },
        [
            draggingSpriteId,
            getEventScratchCoords,
            onMouseMove,
            onSpriteMove,
            state.sprites,
        ],
    );

    const handleMouseUp = useCallback(() => {
        setDraggingSpriteId(null);
    }, []);

    return (
        <div ref={containerRef} className="w-full">
            <div
                className="relative mx-auto overflow-hidden rounded border border-border bg-white shadow-xs"
                style={{
                    width: STAGE_W * scale,
                    height: STAGE_H * scale,
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={STAGE_W}
                    height={STAGE_H}
                    style={{
                        width: STAGE_W * scale,
                        height: STAGE_H * scale,
                        display: 'block',
                        cursor: draggingSpriteId
                            ? 'grabbing'
                            : isHoveringSprite
                              ? 'grab'
                              : 'crosshair',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                {/* Stage coordinates overlay */}
                <div className="pointer-events-none absolute right-2 bottom-1 font-mono text-[10px] text-gray-400 select-none">
                    480×360
                </div>
            </div>
        </div>
    );
}

// ── Convenience hook ──────────────────────────────────────────────────────────

export function useStageState(): [
    StageState,
    React.Dispatch<React.SetStateAction<StageState>>,
] {
    const [stageState, setStageState] = useState<StageState>(() => {
        const stage = createStageSprite();
        const defaultSprite = createDefaultSprite('sprite-1', 'Square');
        defaultSprite.bubble = { type: 'say', text: 'Hello! Drag me around!' };

        return {
            width: 480,
            height: 360,
            sprites: [stage, defaultSprite],
            tempo: 60,
            videoTransparency: 50,
            videoState: 'off',
        };
    });

    return [stageState, setStageState];
}

export function addSprite(
    setState: React.Dispatch<React.SetStateAction<StageState>>,
    name = 'Sprite',
): string {
    const id = `sprite_${Date.now()}`;

    setState((prev) => {
        const layerOrder = prev.sprites.length;
        const colors = ['#FFAB19', '#4C97FF', '#9966FF', '#0FBD8C', '#FF6680'];
        const color = colors[(prev.sprites.length - 1) % colors.length];
        const sprite = { ...createDefaultSprite(id, name), color, layerOrder };

        return { ...prev, sprites: [...prev.sprites, sprite] };
    });

    return id;
}
