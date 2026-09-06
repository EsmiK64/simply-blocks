import type * as Blockly from 'blockly/core';
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
} from '@/stage/spriteActions';
import type { StageState } from '@/stage/SpriteRuntime';

export async function executeBlocklyWorkspace(
    workspace: Blockly.WorkspaceSvg,
    targetSpriteId: string,
    setStageState: React.Dispatch<React.SetStateAction<StageState>>,
    log: (entry: string) => void,
): Promise<{ count: number }> {
    const time = () => new Date().toLocaleTimeString([], { hour12: false });
    const topBlocks = workspace.getTopBlocks(true);

    if (topBlocks.length === 0) {
        log(
            `[${time()}] [warn] No blocks found in workspace. Drag blocks from the category drawer.`,
        );

        return { count: 0 };
    }

    log(
        `[${time()}] [system] Executing Blockly scripts (${topBlocks.length} stack(s))...`,
    );
    let count = 0;

    const evalNumber = (
        block: Blockly.Block,
        inputName: string,
        fallback = 0,
    ): number => {
        const target = block.getInputTargetBlock(inputName);

        if (!target) {
            return fallback;
        }

        if (target.type === 'math_number') {
            const num = parseFloat(target.getFieldValue('NUM'));

            return Number.isFinite(num) ? num : fallback;
        }

        return fallback;
    };

    const evalString = (
        block: Blockly.Block,
        inputName: string,
        fallback = '',
    ): string => {
        const target = block.getInputTargetBlock(inputName);

        if (!target) {
            return fallback;
        }

        if (target.type === 'text') {
            return target.getFieldValue('TEXT') ?? fallback;
        }

        return fallback;
    };

    const runBlockNode = async (block: Blockly.Block) => {
        count++;

        switch (block.type) {
            case 'event_whenflagclicked':
                log(`[${time()}] [event] Green flag clicked.`);
                break;
            case 'motion_movesteps': {
                const steps = evalNumber(block, 'STEPS', 10);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => moveSpriteSteps(s, steps),
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_turnright': {
                const deg = evalNumber(block, 'DEGREES', 15);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => turnSpriteRight(s, deg),
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_turnleft': {
                const deg = evalNumber(block, 'DEGREES', 15);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => turnSpriteLeft(s, deg),
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_gotoxy': {
                const gx = evalNumber(block, 'X', 0);
                const gy = evalNumber(block, 'Y', 0);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpritePosition(s, gx, gy),
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_changexby': {
                const dx = evalNumber(block, 'DX', 10);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => changeSpriteX(s, dx),
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'motion',
                );
                break;
            }
            case 'motion_changeyby': {
                const dy = evalNumber(block, 'DY', 10);
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => changeSpriteY(s, dy),
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
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
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'looks_sayforsecs': {
                const msg = evalString(block, 'MESSAGE', 'Hello!');
                const secs = Math.max(0.1, evalNumber(block, 'SECS', 2));
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteBubble(s, 'say', msg),
                    (cat, desc) =>
                        log(`[${time()}] [${cat}] ${desc} for ${secs}s`),
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
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'looks_thinkforsecs': {
                const msg = evalString(block, 'MESSAGE', 'Hmm...');
                const secs = Math.max(0.1, evalNumber(block, 'SECS', 2));
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteBubble(s, 'think', msg),
                    (cat, desc) =>
                        log(`[${time()}] [${cat}] ${desc} for ${secs}s`),
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
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'looks_hide': {
                mutateTargetSprite(
                    setStageState,
                    targetSpriteId,
                    (s) => setSpriteVisibility(s, false),
                    (cat, desc) => log(`[${time()}] [${cat}] ${desc}`),
                    'looks',
                );
                break;
            }
            case 'sound_play':
            case 'sound_playuntildone': {
                const snd = block.getFieldValue('SOUND_MENU') || 'meow';
                log(`[${time()}] [sound] Audio played: ${snd}`);
                break;
            }
            case 'control_repeat': {
                const times = Math.min(
                    50,
                    Math.max(1, evalNumber(block, 'TIMES', 5)),
                );
                log(
                    `[${time()}] [control] Loop starting (${times} repetitions)`,
                );
                const substack = block.getInputTargetBlock('SUBSTACK');

                if (substack) {
                    for (let i = 0; i < times; i++) {
                        let cur: Blockly.Block | null = substack;

                        while (cur) {
                            await runBlockNode(cur);
                            cur = cur.getNextBlock();
                        }
                    }
                }

                break;
            }
            default:
                log(`[${time()}] [exec] Block: ${block.type}`);
                break;
        }

        const next = block.getNextBlock();

        if (next) {
            await runBlockNode(next);
        }
    };

    for (const top of topBlocks) {
        await runBlockNode(top);
    }

    log(`[${time()}] [done] Script finished. Executed ${count} step(s).`);

    return { count };
}
