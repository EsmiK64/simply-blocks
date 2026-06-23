import React from 'react';
import { StageState, SpriteState } from './SpriteRuntime';

interface SpritePanelProps {
    stageState: StageState;
    selectedSpriteId: string | null;
    onSelectSprite: (id: string) => void;
    onAddSprite: () => void;
    onDeleteSprite: (id: string) => void;
    onSpritePropertyChange: (id: string, prop: keyof SpriteState, value: unknown) => void;
}

export default function SpritePanel({
    stageState,
    selectedSpriteId,
    onSelectSprite,
    onAddSprite,
    onDeleteSprite,
    onSpritePropertyChange,
}: SpritePanelProps) {
    const selected = stageState.sprites.find(s => s.id === selectedSpriteId);
    const sprites = stageState.sprites.filter(s => !s.isStage);

    return (
        <div className="flex flex-col gap-2 p-2 bg-card border-t border-border">
            {/* Sprite list */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {sprites.map(sprite => (
                    <button
                        key={sprite.id}
                        onClick={() => onSelectSprite(sprite.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded border text-xs transition-colors ${
                            selectedSpriteId === sprite.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-border bg-background hover:bg-muted'
                        }`}
                        style={{ minWidth: 64 }}
                    >
                        {/* Costume thumbnail placeholder */}
                        <div
                            className="w-12 h-12 rounded bg-muted flex items-center justify-center text-muted-foreground text-[10px]"
                            style={{ backgroundColor: '#4C97FF22' }}
                        >
                            {sprite.costumes[sprite.currentCostume]?.dataUrl ? (
                                <img
                                    src={sprite.costumes[sprite.currentCostume].dataUrl!}
                                    className="max-w-full max-h-full object-contain"
                                    alt={sprite.name}
                                />
                            ) : (
                                <span className="text-blue-400">?</span>
                            )}
                        </div>
                        <span className="truncate max-w-[60px] text-foreground">{sprite.name}</span>
                    </button>
                ))}

                {/* Add sprite button */}
                <button
                    onClick={onAddSprite}
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-1 p-2 rounded border border-dashed border-border text-muted-foreground hover:bg-muted transition-colors"
                    style={{ minWidth: 64, minHeight: 80 }}
                    title="Add sprite"
                >
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-[10px]">Sprite</span>
                </button>
            </div>

            {/* Selected sprite properties */}
            {selected && !selected.isStage && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border pt-2">
                    <label className="flex items-center gap-1">
                        <span className="text-foreground font-medium">x</span>
                        <input
                            type="number"
                            value={Math.round(selected.x)}
                            onChange={e => onSpritePropertyChange(selected.id, 'x', parseFloat(e.target.value))}
                            className="w-14 h-5 rounded bg-background border border-input text-foreground px-1 text-xs"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="text-foreground font-medium">y</span>
                        <input
                            type="number"
                            value={Math.round(selected.y)}
                            onChange={e => onSpritePropertyChange(selected.id, 'y', parseFloat(e.target.value))}
                            className="w-14 h-5 rounded bg-background border border-input text-foreground px-1 text-xs"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="text-foreground font-medium">direction</span>
                        <input
                            type="number"
                            value={Math.round(selected.direction)}
                            onChange={e => onSpritePropertyChange(selected.id, 'direction', parseFloat(e.target.value))}
                            className="w-14 h-5 rounded bg-background border border-input text-foreground px-1 text-xs"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="text-foreground font-medium">size</span>
                        <input
                            type="number"
                            value={Math.round(selected.size)}
                            onChange={e => onSpritePropertyChange(selected.id, 'size', parseFloat(e.target.value))}
                            className="w-14 h-5 rounded bg-background border border-input text-foreground px-1 text-xs"
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        <span className="text-foreground font-medium">show</span>
                        <input
                            type="checkbox"
                            checked={selected.visible}
                            onChange={e => onSpritePropertyChange(selected.id, 'visible', e.target.checked)}
                            className="accent-blue-500"
                        />
                    </label>
                    <button
                        onClick={() => onDeleteSprite(selected.id)}
                        className="ml-auto text-red-500 hover:text-red-700 text-xs"
                    >
                        Delete sprite
                    </button>
                </div>
            )}
        </div>
    );
}
