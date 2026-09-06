import type * as Blockly from 'blockly/core';
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

    const isTarget = (s: { id: string; isStage: boolean }) =>
        s.id === targetSpriteId || (!targetSpriteId && !s.isStage);

    const runBlockNode = async (block: Blockly.Block) => {
        count++;

        switch (block.type) {
            case 'event_whenflagclicked':
                log(`[${time()}] [event] Green flag clicked.`);
                break;
            case 'motion_movesteps': {
                const steps = evalNumber(block, 'STEPS', 10);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (!isTarget(s)) {
                            return s;
                        }

                        const rad = ((s.direction - 90) * Math.PI) / 180;
                        const nx = Math.min(
                            240,
                            Math.max(
                                -240,
                                Math.round(s.x + steps * Math.cos(rad)),
                            ),
                        );
                        const ny = Math.min(
                            180,
                            Math.max(
                                -180,
                                Math.round(s.y - steps * Math.sin(rad)),
                            ),
                        );
                        log(
                            `[${time()}] [motion] ${s.name} moved ${steps} steps -> (${nx}, ${ny})`,
                        );

                        return { ...s, x: nx, y: ny };
                    }),
                }));
                break;
            }
            case 'motion_turnright': {
                const deg = evalNumber(block, 'DEGREES', 15);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (!isTarget(s)) {
                            return s;
                        }

                        const nd = Math.round((s.direction + deg) % 360);
                        log(
                            `[${time()}] [motion] ${s.name} turned right ${deg}° -> ${nd}°`,
                        );

                        return { ...s, direction: nd };
                    }),
                }));
                break;
            }
            case 'motion_turnleft': {
                const deg = evalNumber(block, 'DEGREES', 15);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (!isTarget(s)) {
                            return s;
                        }

                        const nd = Math.round((s.direction - deg + 360) % 360);
                        log(
                            `[${time()}] [motion] ${s.name} turned left ${deg}° -> ${nd}°`,
                        );

                        return { ...s, direction: nd };
                    }),
                }));
                break;
            }
            case 'motion_gotoxy': {
                const gx = evalNumber(block, 'X', 0);
                const gy = evalNumber(block, 'Y', 0);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (!isTarget(s)) {
                            return s;
                        }

                        log(
                            `[${time()}] [motion] ${s.name} goto (${gx}, ${gy})`,
                        );

                        return { ...s, x: gx, y: gy };
                    }),
                }));
                break;
            }
            case 'motion_changexby': {
                const dx = evalNumber(block, 'DX', 10);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (!isTarget(s)) {
                            return s;
                        }

                        const nx = Math.min(240, Math.max(-240, s.x + dx));
                        log(
                            `[${time()}] [motion] ${s.name} change x by ${dx} -> ${nx}`,
                        );

                        return { ...s, x: nx };
                    }),
                }));
                break;
            }
            case 'motion_changeyby': {
                const dy = evalNumber(block, 'DY', 10);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (!isTarget(s)) {
                            return s;
                        }

                        const ny = Math.min(180, Math.max(-180, s.y + dy));
                        log(
                            `[${time()}] [motion] ${s.name} change y by ${dy} -> ${ny}`,
                        );

                        return { ...s, y: ny };
                    }),
                }));
                break;
            }
            case 'looks_say': {
                const msg = evalString(block, 'MESSAGE', 'Hello!');
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s)
                            ? {
                                  ...s,
                                  bubble: msg
                                      ? { type: 'say', text: msg }
                                      : null,
                              }
                            : s,
                    ),
                }));
                log(`[${time()}] [looks] Sprite says: "${msg}"`);
                break;
            }
            case 'looks_sayforsecs': {
                const msg = evalString(block, 'MESSAGE', 'Hello!');
                const secs = Math.max(0.1, evalNumber(block, 'SECS', 2));
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s)
                            ? {
                                  ...s,
                                  bubble: msg
                                      ? { type: 'say', text: msg }
                                      : null,
                              }
                            : s,
                    ),
                }));
                log(`[${time()}] [looks] Sprite says: "${msg}" for ${secs}s`);
                await new Promise((r) => setTimeout(r, secs * 1000));
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s) ? { ...s, bubble: null } : s,
                    ),
                }));
                break;
            }
            case 'looks_think': {
                const msg = evalString(block, 'MESSAGE', 'Hmm...');
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s)
                            ? {
                                  ...s,
                                  bubble: msg
                                      ? { type: 'think', text: msg }
                                      : null,
                              }
                            : s,
                    ),
                }));
                log(`[${time()}] [looks] Sprite thinks: "${msg}"`);
                break;
            }
            case 'looks_thinkforsecs': {
                const msg = evalString(block, 'MESSAGE', 'Hmm...');
                const secs = Math.max(0.1, evalNumber(block, 'SECS', 2));
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s)
                            ? {
                                  ...s,
                                  bubble: msg
                                      ? { type: 'think', text: msg }
                                      : null,
                              }
                            : s,
                    ),
                }));
                log(`[${time()}] [looks] Sprite thinks: "${msg}" for ${secs}s`);
                await new Promise((r) => setTimeout(r, secs * 1000));
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s) ? { ...s, bubble: null } : s,
                    ),
                }));
                break;
            }
            case 'looks_show': {
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s) ? { ...s, visible: true } : s,
                    ),
                }));
                log(`[${time()}] [looks] Sprite shown.`);
                break;
            }
            case 'looks_hide': {
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        isTarget(s) ? { ...s, visible: false } : s,
                    ),
                }));
                log(`[${time()}] [looks] Sprite hidden.`);
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
