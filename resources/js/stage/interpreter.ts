import type { BlockInstance } from '@/blocks/types';
import {
    mutateTargetSprite,
    updateTargetSprite,
    moveSpriteSteps,
    turnSpriteRight,
    turnSpriteLeft,
    setSpritePosition,
    changeSpriteX,
    changeSpriteY,
    setSpriteBubble,
    clearSpriteBubble,
    setSpriteVisibility,
} from './spriteActions';
import type { StageState } from './SpriteRuntime';

export interface ExecutionResult {
    executedCount: number;
    logs: string[];
}

export async function executeBlocks(
    blocks: BlockInstance[],
    targetSpriteId: string,
    setStageState: React.Dispatch<React.SetStateAction<StageState>>,
    log: (entry: string) => void,
): Promise<ExecutionResult> {
    const timestamp = () =>
        new Date().toLocaleTimeString([], { hour12: false });
    let count = 0;

    const evalInput = (
        block: BlockInstance,
        name: string,
        fallback = 0,
    ): number => {
        const val = block.fields[name];

        if (typeof val === 'number') {
            return val;
        }

        if (typeof val === 'string') {
            const num = parseFloat(val);

            return Number.isFinite(num) ? num : fallback;
        }

        return fallback;
    };

    const evalString = (
        block: BlockInstance,
        name: string,
        fallback = '',
    ): string => {
        const val = block.fields[name];

        if (val !== undefined && val !== null) {
            return String(val);
        }

        return fallback;
    };

    // Find root block
    const childIds = new Set<string>();
    blocks.forEach((b) => {
        if (b.next) {
            childIds.add(b.next.id);
        }

        b.children.forEach((c) => childIds.add(c.id));
        b.elseChildren.forEach((c) => childIds.add(c.id));
    });
    const rootBlocks = blocks.filter((b) => !childIds.has(b.id));

    if (rootBlocks.length === 0) {
        log(
            `[${timestamp()}] [warn] No runnable blocks found on the workspace.`,
        );

        return { executedCount: 0, logs: [] };
    }

    log(
        `[${timestamp()}] [system] Executing script (${rootBlocks.length} stack root(s))...`,
    );

    const runBlockNode = async (block: BlockInstance) => {
        count++;
        const opcode = block.definition.sb3Opcode ?? block.definition.type;

        switch (opcode) {
            case 'event_whenflagclicked':
                log(`[${timestamp()}] [event] Green Flag triggered.`);
                break;
            case 'motion_movesteps': {
                const steps = evalInput(block, 'STEPS', 10);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => moveSpriteSteps(s, steps),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_turnright': {
                const deg = evalInput(block, 'DEGREES', 15);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => turnSpriteRight(s, deg),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_turnleft': {
                const deg = evalInput(block, 'DEGREES', 15);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => turnSpriteLeft(s, deg),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_gotoxy': {
                const gx = evalInput(block, 'X', 0);
                const gy = evalInput(block, 'Y', 0);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpritePosition(s, gx, gy),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_changexby': {
                const dx = evalInput(block, 'DX', 10);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => changeSpriteX(s, dx),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_changeyby': {
                const dy = evalInput(block, 'DY', 10);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => changeSpriteY(s, dy),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'looks_say': {
                const msg = evalString(block, 'MESSAGE', 'Hello!');
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteBubble(s, 'say', msg),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'looks_sayforsecs': {
                const msg = evalString(block, 'MESSAGE', 'Hello!');
                const secs = Math.max(0.1, evalInput(block, 'SECS', 2));
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteBubble(s, 'say', msg),
                    (cat, desc) =>
                        log(`[${timestamp()}] [${cat}] ${desc} for ${secs}s`),
                    'looks',
                );
                await new Promise((r) => setTimeout(r, secs * 1000));
                setStageState((prev) =>
                    updateTargetSprite(prev, targetSpriteId, clearSpriteBubble),
                );
                break;
            }
            case 'looks_think': {
                const msg = evalString(block, 'MESSAGE', 'Hmm...');
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteBubble(s, 'think', msg),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'looks_thinkforsecs': {
                const msg = evalString(block, 'MESSAGE', 'Hmm...');
                const secs = Math.max(0.1, evalInput(block, 'SECS', 2));
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteBubble(s, 'think', msg),
                    (cat, desc) =>
                        log(`[${timestamp()}] [${cat}] ${desc} for ${secs}s`),
                    'looks',
                );
                await new Promise((r) => setTimeout(r, secs * 1000));
                setStageState((prev) =>
                    updateTargetSprite(prev, targetSpriteId, clearSpriteBubble),
                );
                break;
            }
            case 'looks_show': {
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteVisibility(s, true),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'looks_hide': {
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteVisibility(s, false),
                    (cat, desc) => log(`[${timestamp()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'sound_play':
            case 'sound_playuntildone': {
                const snd = evalString(block, 'SOUND_MENU', 'meow');
                log(`[${timestamp()}] [sound] Audio played: ${snd}`);
                break;
            }
            case 'control_repeat': {
                const times = Math.min(
                    50,
                    Math.max(1, evalInput(block, 'TIMES', 5)),
                );
                log(
                    `[${timestamp()}] [control] Starting repeat loop (${times} times)`,
                );

                for (let i = 0; i < times; i++) {
                    for (const child of block.children) {
                        let cur: BlockInstance | null = child;

                        while (cur) {
                            await runBlockNode(cur);
                            cur = cur.next;
                        }
                    }
                }

                break;
            }
            default:
                log(`[${timestamp()}] [exec] ${block.definition.label}`);
                break;
        }

        if (block.next) {
            await runBlockNode(block.next);
        }
    };

    for (const root of rootBlocks) {
        await runBlockNode(root);
    }

    log(
        `[${timestamp()}] [done] Executed ${count} block step(s) successfully.`,
    );

    return { executedCount: count, logs: [] };
}
