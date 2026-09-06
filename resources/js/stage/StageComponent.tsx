import React, { useRef, useEffect, useCallback, useState } from 'react';
import type {
    StageState,
    SpriteState,
    Costume,
    SpeechBubble,
} from './SpriteRuntime';
import {
    scratchToCanvas,
    canvasToScratch,
    createStageSprite,
    createDefaultSprite,
} from './SpriteRuntime';

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

// ── Speech / Thought Bubble Renderer ──────────────────────────────────────────

function renderBubble(
    ctx: CanvasRenderingContext2D,
    spriteCx: number,
    spriteCy: number,
    spriteSize: number,
    bubble: SpeechBubble,
    stageW: number,
    stageH: number,
) {
    const rawText = bubble.text ? String(bubble.text).trim() : '';

    if (!rawText) {
        return;
    }

    ctx.save();
    ctx.font =
        '500 12px "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif';

    // Multi-line word wrapping
    const maxTextWidth = 160;
    const words = rawText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxTextWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    let contentWidth = 40;

    for (const line of lines) {
        const w = ctx.measureText(line).width;

        if (w > contentWidth) {
            contentWidth = w;
        }
    }

    const paddingX = 12;
    const paddingY = 8;
    const lineHeight = 16;
    const bubbleW = Math.max(52, Math.min(220, contentWidth + paddingX * 2));
    const bubbleH = lines.length * lineHeight + paddingY * 2;

    const targetBottom = spriteCy - spriteSize / 2 - 12;
    const bubbleLeft = Math.max(
        8,
        Math.min(stageW - bubbleW - 8, spriteCx - bubbleW / 2),
    );
    const bubbleTop = Math.max(
        8,
        Math.min(stageH - bubbleH - 16, targetBottom - bubbleH),
    );
    const actualBottom = bubbleTop + bubbleH;

    // 1. Shadow for bubble container
    ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // 2. Rounded bubble body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(bubbleLeft, bubbleTop, bubbleW, bubbleH, 10);
    ctx.fill();

    // 3. Pointer tail or thought circles
    ctx.shadowColor = 'transparent';

    if (bubble.type === 'say') {
        const tailAnchorX = Math.max(
            bubbleLeft + 14,
            Math.min(bubbleLeft + bubbleW - 14, spriteCx),
        );

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(tailAnchorX - 6, actualBottom);
        ctx.lineTo(spriteCx, spriteCy - spriteSize / 2 - 2);
        ctx.lineTo(tailAnchorX + 6, actualBottom);
        ctx.fill();

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tailAnchorX - 6, actualBottom);
        ctx.lineTo(spriteCx, spriteCy - spriteSize / 2 - 2);
        ctx.lineTo(tailAnchorX + 6, actualBottom);
        ctx.stroke();

        // Conceal internal seam with white connector line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tailAnchorX - 5, actualBottom);
        ctx.lineTo(tailAnchorX + 5, actualBottom);
        ctx.stroke();
    } else {
        // Thought bubble: progressive mini circles leading to sprite
        const c1X = spriteCx - 3;
        const c1Y = spriteCy - spriteSize / 2 - 8;
        const c2X = spriteCx - 1;
        const c2Y = spriteCy - spriteSize / 2 - 3;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(c1X, c1Y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c2X, c2Y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Outer outline around main bubble
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(bubbleLeft, bubbleTop, bubbleW, bubbleH, 10);
    ctx.stroke();

    // 4. Text Content
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font =
        '600 12px "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif';

    const textCenterX = bubbleLeft + bubbleW / 2;
    lines.forEach((line, index) => {
        const lineY = bubbleTop + paddingY + (index + 0.5) * lineHeight;
        ctx.fillText(line, textCenterX, lineY);
    });

    ctx.restore();
}

// ── Square Sprite Renderer ───────────────────────────────────────────────────

function renderSquareSprite(
    ctx: CanvasRenderingContext2D,
    sprite: SpriteState,
    cx: number,
    cy: number,
    scale: number,
    isSelected: boolean,
) {
    const size = 48 * scale;
    const half = size / 2;
    const radius = 9 * scale;

    ctx.save();
    ctx.translate(cx, cy);

    // Scratch rotation: 90=right, 0=up, 180=down, -90=left
    ctx.rotate(((sprite.direction - 90) * Math.PI) / 180);

    // Ghost effect
    if (sprite.effects.ghost !== 0) {
        ctx.globalAlpha =
            1 - Math.min(100, Math.max(0, sprite.effects.ghost)) / 100;
    }

    // Selection ring
    if (isSelected) {
        ctx.save();
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-half - 5, -half - 5, size + 10, size + 10, radius + 4);
        ctx.stroke();
        ctx.restore();
    }

    // Square shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // Square body fill
    const baseColor = sprite.color || '#FFAB19';
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, radius);
    ctx.fill();

    // Square border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Two expressive eyes looking forward in direction
    const eyeForwardX = 5 * scale;
    const eyeSpacing = 8.5 * scale;
    const eyeRadius = 4.2 * scale;
    const pupilRadius = 2.2 * scale;
    const pupilLookX = 1.8 * scale;

    // Top eye in local coordinates
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeForwardX, -eyeSpacing, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(eyeForwardX + pupilLookX, -eyeSpacing, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bottom eye in local coordinates
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeForwardX, eyeSpacing, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(eyeForwardX + pupilLookX, eyeSpacing, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    // Direction beak / indicator arrow pointing forward
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(half - 2, 0);
    ctx.lineTo(eyeForwardX + 2, -3.2 * scale);
    ctx.lineTo(eyeForwardX + 2, 3.2 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Sprite name label below sprite
    ctx.save();
    ctx.font = '600 10px "Instrument Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.fillText(sprite.name, cx, cy + half + 14);
    ctx.restore();
}

function renderSprite(
    ctx: CanvasRenderingContext2D,
    sprite: SpriteState,
    images: Map<string, HTMLImageElement>,
    stageW: number,
    stageH: number,
    isSelected = false,
) {
    if (!sprite.visible) {
        return;
    }

    if (sprite.isStage) {
        // Render stage backdrop
        const costume: Costume | undefined =
            sprite.costumes[sprite.currentCostume];
        const img = costume?.dataUrl ? images.get(costume.dataUrl) : null;

        if (img) {
            ctx.drawImage(img, 0, 0, stageW, stageH);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, stageW, stageH);
        }

        return;
    }

    const [cx, cy] = scratchToCanvas(sprite.x, sprite.y, stageW, stageH);
    const scale = (sprite.size || 100) / 100;
    const costume: Costume | undefined = sprite.costumes[sprite.currentCostume];
    const img = costume?.dataUrl ? images.get(costume.dataUrl) : null;

    if (img && costume) {
        const costumeW = costume.width * scale;
        const costumeH = costume.height * scale;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(((sprite.direction - 90) * Math.PI) / 180);

        if (sprite.effects.ghost !== 0) {
            ctx.globalAlpha =
                1 - Math.min(100, Math.max(0, sprite.effects.ghost)) / 100;
        }

        const drawX = -costume.rotationCenterX * scale;
        const drawY = -costume.rotationCenterY * scale;

        ctx.drawImage(img, drawX, drawY, costumeW, costumeH);
        ctx.restore();
    } else {
        // Default: Render responsive square sprite
        renderSquareSprite(ctx, sprite, cx, cy, scale, isSelected);
    }

    // Render speech / thought bubble above sprite
    if (sprite.bubble && sprite.bubble.text) {
        const spriteDimension = 48 * scale;
        renderBubble(
            ctx,
            cx,
            cy,
            spriteDimension,
            sprite.bubble,
            stageW,
            stageH,
        );
    }
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
) {
    setState((prev) => {
        const id = `sprite_${Date.now()}`;
        const layerOrder = prev.sprites.length;
        const colors = ['#FFAB19', '#4C97FF', '#9966FF', '#0FBD8C', '#FF6680'];
        const color = colors[(prev.sprites.length - 1) % colors.length];
        const sprite = { ...createDefaultSprite(id, name), color, layerOrder };

        return { ...prev, sprites: [...prev.sprites, sprite] };
    });
}
