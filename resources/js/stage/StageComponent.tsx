import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
    StageState, SpriteState, Costume,
    scratchToCanvas, canvasToScratch,
    createStageSprite, createDefaultSprite,
} from './SpriteRuntime';

interface StageComponentProps {
    state: StageState;
    onSpriteClick?: (spriteId: string) => void;
    onStageClick?: (scratchX: number, scratchY: number) => void;
    onMouseMove?: (scratchX: number, scratchY: number) => void;
}

// ── Renderer ──────────────────────────────────────────────────────────────────

function applyCSSFilters(effects: SpriteState['effects']): string {
    const filters: string[] = [];
    if (effects.brightness !== 0) {
        const b = 1 + effects.brightness / 100;
        filters.push(`brightness(${b})`);
    }
    if (effects.ghost !== 0) {
        const opacity = 1 - Math.min(100, Math.max(0, effects.ghost)) / 100;
        filters.push(`opacity(${opacity})`);
    }
    if (effects.pixelate !== 0) {
        // approximate with blur (true pixelate needs canvas shader)
        const r = Math.abs(effects.pixelate) / 10;
        filters.push(`blur(${r}px)`);
    }
    return filters.join(' ') || 'none';
}

function renderSprite(
    ctx: CanvasRenderingContext2D,
    sprite: SpriteState,
    images: Map<string, HTMLImageElement>,
    stageW: number,
    stageH: number
) {
    if (!sprite.visible) return;

    const costume: Costume | undefined = sprite.costumes[sprite.currentCostume];
    if (!costume) return;

    const img = costume.dataUrl ? images.get(costume.dataUrl) : null;

    const [cx, cy] = scratchToCanvas(sprite.x, sprite.y, stageW, stageH);
    const scale = sprite.size / 100;
    const costumeW = costume.width * scale;
    const costumeH = costume.height * scale;

    ctx.save();
    ctx.translate(cx, cy);

    if (!sprite.isStage) {
        // Rotate: Scratch direction 90=right, canvas 0=right → subtract 90
        ctx.rotate(((sprite.direction - 90) * Math.PI) / 180);
    }

    // Ghost effect via globalAlpha
    if (sprite.effects.ghost !== 0) {
        ctx.globalAlpha = 1 - Math.min(100, Math.max(0, sprite.effects.ghost)) / 100;
    }

    const drawX = -costume.rotationCenterX * scale;
    const drawY = -costume.rotationCenterY * scale;

    if (img) {
        ctx.drawImage(img, drawX, drawY, costumeW, costumeH);
    } else {
        // Placeholder: coloured rectangle
        ctx.fillStyle = sprite.isStage ? '#e8e8e8' : '#4C97FF';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(drawX, drawY, costumeW || 60, costumeH || 60);
        ctx.globalAlpha = sprite.effects.ghost !== 0
            ? 1 - Math.min(100, Math.max(0, sprite.effects.ghost)) / 100
            : 1;
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sprite.name, 0, 5);
    }

    ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StageComponent({
    state,
    onSpriteClick,
    onStageClick,
    onMouseMove,
}: StageComponentProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const STAGE_W = state.width;   // 480
    const STAGE_H = state.height;  // 360

    // Pre-load costume images
    useEffect(() => {
        const images = imagesRef.current;
        state.sprites.forEach(sprite => {
            sprite.costumes.forEach(costume => {
                if (costume.dataUrl && !images.has(costume.dataUrl)) {
                    const img = new Image();
                    img.onload = () => {
                        images.set(costume.dataUrl!, img);
                        // Trigger re-render on load
                        drawFrame();
                    };
                    img.src = costume.dataUrl;
                }
            });
        });
    }, [state.sprites]);

    // Render loop
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, STAGE_W, STAGE_H);

        // Sort sprites by layerOrder
        const sorted = [...state.sprites].sort((a, b) => a.layerOrder - b.layerOrder);
        sorted.forEach(sprite => {
            renderSprite(ctx, sprite, imagesRef.current, STAGE_W, STAGE_H);
        });
    }, [state, STAGE_W, STAGE_H]);

    useEffect(() => {
        drawFrame();
    }, [drawFrame]);

    // Responsive scaling
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver(() => {
            const { width } = container.getBoundingClientRect();
            setScale(Math.min(1, width / STAGE_W));
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [STAGE_W]);

    const getEventScratchCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left) / scale;
        const canvasY = (e.clientY - rect.top) / scale;
        return canvasToScratch(canvasX, canvasY, STAGE_W, STAGE_H);
    }, [scale, STAGE_W, STAGE_H]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const [sx, sy] = getEventScratchCoords(e);
        onMouseMove?.(sx, sy);
    }, [getEventScratchCoords, onMouseMove]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const [sx, sy] = getEventScratchCoords(e);
        onStageClick?.(sx, sy);
        // TODO: hit-test sprites for sprite click events
    }, [getEventScratchCoords, onStageClick]);

    return (
        <div ref={containerRef} className="w-full">
            <div
                className="relative mx-auto overflow-hidden rounded border border-border bg-white"
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
                        cursor: 'crosshair',
                    }}
                    onMouseMove={handleMouseMove}
                    onClick={handleClick}
                />
                {/* Stage coordinates overlay */}
                <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 pointer-events-none select-none font-mono">
                    480×360
                </div>
            </div>
        </div>
    );
}

// ── Convenience hook ──────────────────────────────────────────────────────────

export function useStageState(): [StageState, React.Dispatch<React.SetStateAction<StageState>>] {
    const [stageState, setStageState] = useState<StageState>(() => ({
        width: 480,
        height: 360,
        sprites: [createStageSprite()],
        tempo: 60,
        videoTransparency: 50,
        videoState: 'off',
    }));
    return [stageState, setStageState];
}

export function addSprite(
    setState: React.Dispatch<React.SetStateAction<StageState>>,
    name = 'Sprite1'
) {
    setState(prev => {
        const id = `sprite_${Date.now()}`;
        const layerOrder = prev.sprites.length;
        const sprite = { ...createDefaultSprite(id, name), layerOrder };
        return { ...prev, sprites: [...prev.sprites, sprite] };
    });
}
