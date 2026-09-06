import React from 'react';
import type { StageState, SpriteState } from './SpriteRuntime';

interface SpritePanelProps {
    stageState: StageState;
    selectedSpriteId: string | null;
    onSelectSprite: (id: string) => void;
    onAddSprite: () => void;
    onDeleteSprite: (id: string) => void;
    onSpritePropertyChange: (
        id: string,
        prop: keyof SpriteState,
        value: unknown,
    ) => void;
}

export default function SpritePanel({
    stageState,
    selectedSpriteId,
    onSelectSprite,
    onAddSprite,
    onDeleteSprite,
    onSpritePropertyChange,
}: SpritePanelProps) {
    const selected = stageState.sprites.find((s) => s.id === selectedSpriteId);
    const sprites = stageState.sprites.filter((s) => !s.isStage);

    return (
        <div className="flex flex-col gap-2 border-t border-border bg-card p-2">
            {/* Sprite list */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {sprites.map((sprite) => (
                    <button
                        key={sprite.id}
                        onClick={() => onSelectSprite(sprite.id)}
                        className={`flex flex-shrink-0 flex-col items-center gap-1 rounded border p-2 text-xs transition-colors ${
                            selectedSpriteId === sprite.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-border bg-background hover:bg-muted'
                        }`}
                        style={{ minWidth: 64 }}
                    >
                        {/* Costume thumbnail placeholder */}
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground"
                            style={{ backgroundColor: '#4C97FF22' }}
                        >
                            {sprite.costumes[sprite.currentCostume]?.dataUrl ? (
                                <img
                                    src={
                                        sprite.costumes[sprite.currentCostume]
                                            .dataUrl!
                                    }
                                    className="max-h-full max-w-full object-contain"
                                    alt={sprite.name}
                                />
                            ) : (
                                <span className="text-blue-400">?</span>
                            )}
                        </div>
                        <span className="max-w-[60px] truncate text-foreground">
                            {sprite.name}
                        </span>
                    </button>
                ))}

                {/* Add sprite button */}
                <button
                    onClick={onAddSprite}
                    className="flex flex-shrink-0 flex-col items-center justify-center gap-1 rounded border border-dashed border-border p-2 text-muted-foreground transition-colors hover:bg-muted"
                    style={{ minWidth: 64, minHeight: 80 }}
                    title="Add sprite"
                >
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-[10px]">Sprite</span>
                </button>
            </div>

            {/* Selected sprite properties */}
            {selected && !selected.isStage && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                    <label className="flex items-center gap-1">
                        <span className="font-medium text-foreground">x</span>
                        <input
                            type="number"
                            value={
                                Number.isFinite(selected.x)
                                    ? Math.round(selected.x)
                                    : 0
                            }
                            onChange={(e) => {
                                const parsed = parseFloat(e.target.value);
                                onSpritePropertyChange(
                                    selected.id,
                                    'x',
                                    Number.isFinite(parsed) ? parsed : 0,
                                );
                            }}
                            className="h-5 w-14 rounded border border-input bg-background px-1 text-xs text-foreground"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="font-medium text-foreground">y</span>
                        <input
                            type="number"
                            value={
                                Number.isFinite(selected.y)
                                    ? Math.round(selected.y)
                                    : 0
                            }
                            onChange={(e) => {
                                const parsed = parseFloat(e.target.value);
                                onSpritePropertyChange(
                                    selected.id,
                                    'y',
                                    Number.isFinite(parsed) ? parsed : 0,
                                );
                            }}
                            className="h-5 w-14 rounded border border-input bg-background px-1 text-xs text-foreground"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="font-medium text-foreground">
                            direction
                        </span>
                        <input
                            type="number"
                            value={
                                Number.isFinite(selected.direction)
                                    ? Math.round(selected.direction)
                                    : 90
                            }
                            onChange={(e) => {
                                const parsed = parseFloat(e.target.value);
                                onSpritePropertyChange(
                                    selected.id,
                                    'direction',
                                    Number.isFinite(parsed) ? parsed : 90,
                                );
                            }}
                            className="h-5 w-14 rounded border border-input bg-background px-1 text-xs text-foreground"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="font-medium text-foreground">
                            size
                        </span>
                        <input
                            type="number"
                            value={
                                Number.isFinite(selected.size)
                                    ? Math.round(selected.size)
                                    : 100
                            }
                            onChange={(e) => {
                                const parsed = parseFloat(e.target.value);
                                onSpritePropertyChange(
                                    selected.id,
                                    'size',
                                    Number.isFinite(parsed)
                                        ? Math.max(1, parsed)
                                        : 100,
                                );
                            }}
                            className="h-5 w-14 rounded border border-input bg-background px-1 text-xs text-foreground"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="font-medium text-foreground">
                            show
                        </span>
                        <input
                            type="checkbox"
                            checked={selected.visible}
                            onChange={(e) =>
                                onSpritePropertyChange(
                                    selected.id,
                                    'visible',
                                    e.target.checked,
                                )
                            }
                            className="accent-blue-500"
                        />
                    </label>
                    <button
                        onClick={() => onDeleteSprite(selected.id)}
                        className="ml-auto text-xs text-red-500 hover:text-red-700"
                    >
                        Delete sprite
                    </button>
                </div>
            )}
        </div>
    );
}
