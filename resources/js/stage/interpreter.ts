import type { BlockInstance } from '@/blocks/types';
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
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (
                            s.id !== targetSpriteId &&
                            !(!targetSpriteId && !s.isStage)
                        ) {
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
                            `[${timestamp()}] [motion] ${s.name} moved ${steps} steps -> (${nx}, ${ny})`,
                        );

                        return { ...s, x: nx, y: ny };
                    }),
                }));
                break;
            }
            case 'motion_turnright': {
                const deg = evalInput(block, 'DEGREES', 15);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (
                            s.id !== targetSpriteId &&
                            !(!targetSpriteId && !s.isStage)
                        ) {
                            return s;
                        }

                        const nd = Math.round((s.direction + deg) % 360);
                        log(
                            `[${timestamp()}] [motion] ${s.name} turned right ${deg}° -> ${nd}°`,
                        );

                        return { ...s, direction: nd };
                    }),
                }));
                break;
            }
            case 'motion_turnleft': {
                const deg = evalInput(block, 'DEGREES', 15);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (
                            s.id !== targetSpriteId &&
                            !(!targetSpriteId && !s.isStage)
                        ) {
                            return s;
                        }

                        const nd = Math.round((s.direction - deg + 360) % 360);
                        log(
                            `[${timestamp()}] [motion] ${s.name} turned left ${deg}° -> ${nd}°`,
                        );

                        return { ...s, direction: nd };
                    }),
                }));
                break;
            }
            case 'motion_gotoxy': {
                const gx = evalInput(block, 'X', 0);
                const gy = evalInput(block, 'Y', 0);
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) => {
                        if (
                            s.id !== targetSpriteId &&
                            !(!targetSpriteId && !s.isStage)
                        ) {
                            return s;
                        }

                        log(
                            `[${timestamp()}] [motion] ${s.name} goto (${gx}, ${gy})`,
                        );

                        return { ...s, x: gx, y: gy };
                    }),
                }));
                break;
            }
            case 'looks_sayforsecs':
            case 'looks_say': {
                const msg = evalString(block, 'MESSAGE', 'Hello!');
                log(`[${timestamp()}] [looks] Sprite says: "${msg}"`);
                break;
            }
            case 'looks_think': {
                const msg = evalString(block, 'MESSAGE', 'Hmm...');
                log(`[${timestamp()}] [looks] Sprite thinks: "${msg}"`);
                break;
            }
            case 'looks_show': {
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        s.id === targetSpriteId ||
                        (!targetSpriteId && !s.isStage)
                            ? { ...s, visible: true }
                            : s,
                    ),
                }));
                log(`[${timestamp()}] [looks] Sprite is now visible`);
                break;
            }
            case 'looks_hide': {
                setStageState((prev) => ({
                    ...prev,
                    sprites: prev.sprites.map((s) =>
                        s.id === targetSpriteId ||
                        (!targetSpriteId && !s.isStage)
                            ? { ...s, visible: false }
                            : s,
                    ),
                }));
                log(`[${timestamp()}] [looks] Sprite is now hidden`);
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
