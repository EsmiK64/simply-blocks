import type { StageState, SpriteState } from './SpriteRuntime';

export function isTargetSprite(
    sprite: SpriteState,
    targetSpriteId: string,
): boolean {
    return sprite.id === targetSpriteId || (!targetSpriteId && !sprite.isStage);
}

export function moveSpriteSteps(
    sprite: SpriteState,
    steps: number,
): { sprite: SpriteState; description: string } {
    const rad = ((sprite.direction - 90) * Math.PI) / 180;
    const nx = Math.min(
        240,
        Math.max(-240, Math.round(sprite.x + steps * Math.cos(rad))),
    );
    const ny = Math.min(
        180,
        Math.max(-180, Math.round(sprite.y - steps * Math.sin(rad))),
    );

    return {
        sprite: { ...sprite, x: nx, y: ny },
        description: `${sprite.name} moved ${steps} steps -> (${nx}, ${ny})`,
    };
}

export function turnSpriteRight(
    sprite: SpriteState,
    deg: number,
): { sprite: SpriteState; description: string } {
    const nd = Math.round((sprite.direction + deg) % 360);

    return {
        sprite: { ...sprite, direction: nd },
        description: `${sprite.name} turned right ${deg}° -> ${nd}°`,
    };
}

export function turnSpriteLeft(
    sprite: SpriteState,
    deg: number,
): { sprite: SpriteState; description: string } {
    const nd = Math.round((sprite.direction - deg + 360) % 360);

    return {
        sprite: { ...sprite, direction: nd },
        description: `${sprite.name} turned left ${deg}° -> ${nd}°`,
    };
}

export function setSpritePosition(
    sprite: SpriteState,
    x: number,
    y: number,
): { sprite: SpriteState; description: string } {
    const nx = Math.min(240, Math.max(-240, Math.round(x)));
    const ny = Math.min(180, Math.max(-180, Math.round(y)));

    return {
        sprite: { ...sprite, x: nx, y: ny },
        description: `${sprite.name} goto (${nx}, ${ny})`,
    };
}

export function changeSpriteX(
    sprite: SpriteState,
    dx: number,
): { sprite: SpriteState; description: string } {
    const nx = Math.min(240, Math.max(-240, Math.round(sprite.x + dx)));

    return {
        sprite: { ...sprite, x: nx },
        description: `${sprite.name} change x by ${dx} -> ${nx}`,
    };
}

export function changeSpriteY(
    sprite: SpriteState,
    dy: number,
): { sprite: SpriteState; description: string } {
    const ny = Math.min(180, Math.max(-180, Math.round(sprite.y + dy)));

    return {
        sprite: { ...sprite, y: ny },
        description: `${sprite.name} change y by ${dy} -> ${ny}`,
    };
}

export function setSpriteBubble(
    sprite: SpriteState,
    type: 'say' | 'think',
    text: string,
): { sprite: SpriteState; description: string } {
    const actionVerb = type === 'say' ? 'says' : 'thinks';

    return {
        sprite: {
            ...sprite,
            bubble: text ? { type, text } : null,
        },
        description: `Sprite ${actionVerb}: "${text}"`,
    };
}

export function clearSpriteBubble(sprite: SpriteState): SpriteState {
    return { ...sprite, bubble: null };
}

export function setSpriteVisibility(
    sprite: SpriteState,
    visible: boolean,
): { sprite: SpriteState; description: string } {
    return {
        sprite: { ...sprite, visible },
        description: visible ? 'Sprite shown.' : 'Sprite hidden.',
    };
}

export function updateTargetSprite(
    state: StageState,
    targetSpriteId: string,
    mutate: (sprite: SpriteState) => SpriteState,
): StageState {
    return {
        ...state,
        sprites: state.sprites.map((s) =>
            isTargetSprite(s, targetSpriteId) ? mutate(s) : s,
        ),
    };
}

export function mutateTargetSprite(
    setStageState: React.Dispatch<React.SetStateAction<StageState>>,
    targetSpriteId: string,
    action: (sprite: SpriteState) => {
        sprite: SpriteState;
        description?: string;
    },
    onLog?: (category: string, description: string) => void,
    category = 'motion',
): void {
    setStageState((prev) => {
        let desc: string | undefined;
        const nextSprites = prev.sprites.map((s) => {
            if (!isTargetSprite(s, targetSpriteId)) {
                return s;
            }

            const res = action(s);

            if (res.description) {
                desc = res.description;
            }

            return res.sprite;
        });

        if (desc && onLog) {
            onLog(category, desc);
        }

        return { ...prev, sprites: nextSprites };
    });
}
