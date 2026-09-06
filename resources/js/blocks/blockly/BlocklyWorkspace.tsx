import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import { pythonGenerator } from 'blockly/python';
import { Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { registerScratchBlocks } from './blocks';
import { registerGenerators } from './generators';
import { SimplyBlocksDarkTheme } from './theme';
import { SCRATCH_TOOLBOX } from './toolbox';

export interface BlocklyWorkspaceProps {
    onCodeChange?: (python: string) => void;
    onWorkspaceReady?: (workspace: Blockly.WorkspaceSvg) => void;
    onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg) => void;
    className?: string;
}

export default function BlocklyWorkspace({
    onCodeChange,
    onWorkspaceReady,
    onWorkspaceChange,
    className = '',
}: BlocklyWorkspaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

    const insertStarterScript = useCallback(
        (ws: Blockly.WorkspaceSvg) => {
            ws.clear();

            const flagBlock = ws.newBlock('event_whenflagclicked');
            flagBlock.initSvg();
            flagBlock.render();
            flagBlock.moveBy(40, 30);

            const moveBlock = ws.newBlock('motion_movesteps');
            const numShadow = ws.newBlock('math_number');
            numShadow.setShadow(true);
            numShadow.setFieldValue('25', 'NUM');
            numShadow.initSvg();
            numShadow.render();
            moveBlock
                .getInput('STEPS')
                ?.connection?.connect(numShadow.outputConnection!);
            moveBlock.initSvg();
            moveBlock.render();
            flagBlock.nextConnection?.connect(moveBlock.previousConnection!);

            const turnBlock = ws.newBlock('motion_turnright');
            const degShadow = ws.newBlock('math_number');
            degShadow.setShadow(true);
            degShadow.setFieldValue('15', 'NUM');
            degShadow.initSvg();
            degShadow.render();
            turnBlock
                .getInput('DEGREES')
                ?.connection?.connect(degShadow.outputConnection!);
            turnBlock.initSvg();
            turnBlock.render();
            moveBlock.nextConnection?.connect(turnBlock.previousConnection!);

            const sayBlock = ws.newBlock('looks_say');
            const textShadow = ws.newBlock('text');
            textShadow.setShadow(true);
            textShadow.setFieldValue('Hello Simply Blocks!', 'TEXT');
            textShadow.initSvg();
            textShadow.render();
            sayBlock
                .getInput('MESSAGE')
                ?.connection?.connect(textShadow.outputConnection!);
            sayBlock.initSvg();
            sayBlock.render();
            turnBlock.nextConnection?.connect(sayBlock.previousConnection!);

            const code = pythonGenerator.workspaceToCode(ws);
            onCodeChange?.(code);
            onWorkspaceChange?.(ws);
        },
        [onCodeChange, onWorkspaceChange],
    );

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        Blockly.setLocale(En as unknown as Record<string, string>);
        registerScratchBlocks();
        registerGenerators();

        const ws = Blockly.inject(containerRef.current, {
            renderer: 'zelos',
            theme: SimplyBlocksDarkTheme,
            toolbox: SCRATCH_TOOLBOX,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 0.85,
                maxScale: 2.2,
                minScale: 0.35,
                scaleSpeed: 1.1,
            },
            grid: {
                spacing: 24,
                length: 2,
                colour: '#33415535',
                snap: true,
            },
            trashcan: true,
            sounds: false,
            move: {
                scrollbars: {
                    horizontal: true,
                    vertical: true,
                },
                drag: true,
                wheel: false,
            },
        });

        workspaceRef.current = ws;
        onWorkspaceReady?.(ws);

        // Insert default starter
        insertStarterScript(ws);

        const changeListener = (e: Blockly.Events.Abstract) => {
            if (e.isUiEvent) {
                return;
            }

            const code = pythonGenerator.workspaceToCode(ws);
            onCodeChange?.(code);
            onWorkspaceChange?.(ws);
        };

        ws.addChangeListener(changeListener);

        const ro = new ResizeObserver(() => {
            Blockly.svgResize(ws);
        });
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            ws.removeChangeListener(changeListener);
            ws.dispose();
            workspaceRef.current = null;
        };
    }, [
        insertStarterScript,
        onCodeChange,
        onWorkspaceReady,
        onWorkspaceChange,
    ]);

    const handleClearWorkspace = () => {
        if (!workspaceRef.current) {
            return;
        }

        workspaceRef.current.clear();
        onCodeChange?.('# Workspace is empty\n');
        onWorkspaceChange?.(workspaceRef.current);
    };

    const handleResetStarter = () => {
        if (!workspaceRef.current) {
            return;
        }

        insertStarterScript(workspaceRef.current);
    };

    return (
        <div
            className={`relative flex h-full min-h-0 w-full flex-1 flex-col ${className}`}
        >
            {/* Top Workspace Action Strip */}
            <div className="pointer-events-auto absolute top-3 right-4 z-20 flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleResetStarter}
                    title="Insert Scratch Starter Script"
                    className="flex h-7 items-center gap-1.5 rounded border border-border/80 bg-card/90 px-2.5 font-mono text-xs text-foreground shadow-xs backdrop-blur transition-all hover:bg-accent"
                >
                    <Plus className="size-3 text-primary" />
                    <span>Starter Stack</span>
                </button>
                <button
                    type="button"
                    onClick={handleClearWorkspace}
                    title="Clear Blockly workspace"
                    className="flex h-7 items-center gap-1.5 rounded border border-border/80 bg-card/90 px-2.5 font-mono text-xs text-muted-foreground shadow-xs backdrop-blur transition-all hover:bg-accent hover:text-foreground"
                >
                    <Trash2 className="size-3" />
                    <span>Clear</span>
                </button>
            </div>

            {/* Blockly SVG container */}
            <div
                ref={containerRef}
                className="h-full min-h-0 w-full flex-1 overflow-hidden"
                style={{ position: 'relative' }}
            />
        </div>
    );
}
