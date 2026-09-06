import { describe, it, expect } from 'bun:test';
import {
    moveSpriteSteps,
    turnSpriteRight,
    turnSpriteLeft,
    setSpritePosition,
    changeSpriteX,
    changeSpriteY,
    setSpriteBubble,
    clearSpriteBubble,
    setSpriteVisibility,
    isTargetSprite,
    updateTargetSprite,
} from '../../resources/js/stage/spriteActions';
import { createDefaultSprite } from '../../resources/js/stage/SpriteRuntime';

describe('spriteActions', () => {
    describe('isTargetSprite', () => {
        it('matches sprite by exact id or default fallback', () => {
            const sprite = createDefaultSprite('sprite-1', 'Square');
            expect(isTargetSprite(sprite, 'sprite-1')).toBe(true);
            expect(isTargetSprite(sprite, 'other-id')).toBe(false);
            expect(isTargetSprite(sprite, '')).toBe(true); // default when no target selected
        });
    });

    describe('motion operations', () => {
        it('moves sprite steps forward in direction 90 (right)', () => {
            const sprite = { ...createDefaultSprite('s1', 'Square'), x: 0, y: 0, direction: 90 };
            const res = moveSpriteSteps(sprite, 50);

            expect(res.sprite.x).toBe(50);
            expect(res.sprite.y).toBe(0);
            expect(res.description).toContain('moved 50 steps');
        });

        it('moves sprite steps forward in direction 0 (up in Scratch)', () => {
            const sprite = { ...createDefaultSprite('s1', 'Square'), x: 0, y: 0, direction: 0 };
            const res = moveSpriteSteps(sprite, 30);

            expect(res.sprite.x).toBe(0);
            expect(res.sprite.y).toBe(30);
        });

        it('clamps movement to stage boundaries [-240, 240] and [-180, 180]', () => {
            const sprite = { ...createDefaultSprite('s1', 'Square'), x: 230, y: 170, direction: 90 };
            const res = moveSpriteSteps(sprite, 100);

            expect(res.sprite.x).toBe(240);
        });

        it('turns sprite right and wraps around 360', () => {
            const sprite = { ...createDefaultSprite('s1', 'Square'), direction: 350 };
            const res = turnSpriteRight(sprite, 20);

            expect(res.sprite.direction).toBe(10);
            expect(res.description).toContain('turned right 20°');
        });

        it('turns sprite left and wraps around 360', () => {
            const sprite = { ...createDefaultSprite('s1', 'Square'), direction: 10 };
            const res = turnSpriteLeft(sprite, 20);

            expect(res.sprite.direction).toBe(350);
            expect(res.description).toContain('turned left 20°');
        });

        it('sets position and changes coordinates with boundary clamping', () => {
            const sprite = createDefaultSprite('s1', 'Square');
            const resPos = setSpritePosition(sprite, 500, -500);

            expect(resPos.sprite.x).toBe(240);
            expect(resPos.sprite.y).toBe(-180);

            const resDx = changeSpriteX(resPos.sprite, -50);
            expect(resDx.sprite.x).toBe(190);

            const resDy = changeSpriteY(resDx.sprite, 80);
            expect(resDy.sprite.y).toBe(-100);
        });
    });

    describe('looks operations', () => {
        it('sets and clears speech bubble', () => {
            const sprite = createDefaultSprite('s1', 'Square');
            const resSay = setSpriteBubble(sprite, 'say', 'Hello world');

            expect(resSay.sprite.bubble).toEqual({ type: 'say', text: 'Hello world' });
            expect(resSay.description).toBe('Sprite says: "Hello world"');

            const cleared = clearSpriteBubble(resSay.sprite);
            expect(cleared.bubble).toBeNull();
        });

        it('sets and clears thought bubble', () => {
            const sprite = createDefaultSprite('s1', 'Square');
            const resThink = setSpriteBubble(sprite, 'think', 'Deep thoughts');

            expect(resThink.sprite.bubble).toEqual({ type: 'think', text: 'Deep thoughts' });
            expect(resThink.description).toBe('Sprite thinks: "Deep thoughts"');
        });

        it('toggles visibility', () => {
            const sprite = createDefaultSprite('s1', 'Square');
            const hidden = setSpriteVisibility(sprite, false);
            expect(hidden.sprite.visible).toBe(false);

            const shown = setSpriteVisibility(hidden.sprite, true);
            expect(shown.sprite.visible).toBe(true);
        });
    });

    describe('updateTargetSprite', () => {
        it('immutably updates only matching sprite in stage state', () => {
            const s1 = createDefaultSprite('s1', 'Sprite 1');
            const s2 = createDefaultSprite('s2', 'Sprite 2');
            const state = {
                width: 480,
                height: 360,
                sprites: [s1, s2],
                tempo: 60,
                videoTransparency: 50,
                videoState: 'off' as const,
            };

            const nextState = updateTargetSprite(state, 's2', (s) => ({ ...s, x: 100 }));
            expect(nextState.sprites[0].x).toBe(0);
            expect(nextState.sprites[1].x).toBe(100);
        });
    });
});
