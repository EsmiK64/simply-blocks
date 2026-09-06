import * as Blockly from 'blockly/core';
import {
    Play,
    Square,
    Terminal,
    Code2,
    Layers,
    Trash2,
    Copy,
    Check,
    MousePointer,
    RotateCcw,
    Monitor,
} from 'lucide-react';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { executeBlocklyWorkspace } from '@/blocks/blockly/blocklyRunner';
import BlocklyWorkspace from '@/blocks/blockly/BlocklyWorkspace';
import SpritePanel from '@/stage/SpritePanel';
import type { SpriteState } from '@/stage/SpriteRuntime';
import StageComponent, {
    useStageState,
    addSprite,
} from '@/stage/StageComponent';

export default function TestBlockLab() {
    const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(
        null,
    );
    const [pythonCode, setPythonCode] = useState<string>(
        '# Initializing Blockly Zelos...',
    );
    const [blockCount, setBlockCount] = useState<number>(4);
    const [logs, setLogs] = useState<string[]>([
        `[${new Date().toLocaleTimeString([], { hour12: false })}] [system] Studio workbench initialized with Google Blockly Zelos engine.`,
    ]);
    const [isRunning, setIsRunning] = useState(false);
    const [activeTab, setActiveTab] = useState<'console' | 'python' | 'sb3'>(
        'console',
    );
    const [copiedTab, setCopiedTab] = useState<string | null>(null);

    const [stageState, setStageState] = useStageState();
    const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(
        () => {
            return stageState.sprites.find((s) => !s.isStage)?.id ?? null;
        },
    );
    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

    const consoleBottomRef = useRef<HTMLDivElement>(null);

    // Set document title
    useEffect(() => {
        document.title = 'Simply Blocks - Studio Lab';
    }, []);

    const addLog = useCallback((msg: string) => {
        setLogs((prev) => [...prev, msg]);
    }, []);

    useEffect(() => {
        if (activeTab === 'console') {
            consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, activeTab]);

    const handleWorkspaceChange = useCallback((ws: Blockly.WorkspaceSvg) => {
        setWorkspace(ws);
        setBlockCount(ws.getAllBlocks(false).length);
    }, []);

    const handleRun = useCallback(async () => {
        if (isRunning || !workspace) {
            return;
        }

        setIsRunning(true);

        try {
            await executeBlocklyWorkspace(
                workspace,
                selectedSpriteId ?? '',
                setStageState,
                addLog,
            );
        } catch (err: unknown) {
            const time = new Date().toLocaleTimeString([], { hour12: false });
            addLog(
                `[${time}] [error] Execution failed: ${err instanceof Error ? err.message : String(err)}`,
            );
        } finally {
            setIsRunning(false);
        }
    }, [isRunning, workspace, selectedSpriteId, setStageState, addLog]);

    // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to Run
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRun();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRun]);

    const handleClearLogs = () => {
        setLogs([
            `[${new Date().toLocaleTimeString([], { hour12: false })}] [system] Console cleared.`,
        ]);
    };

    const handleResetStage = () => {
        setStageState((prev) => ({
            ...prev,
            sprites: prev.sprites.map((s) => {
                if (s.isStage) {
                    return s;
                }

                return {
                    ...s,
                    x: 0,
                    y: 0,
                    direction: 90,
                    size: 100,
                    visible: true,
                };
            }),
        }));
        addLog(
            `[${new Date().toLocaleTimeString([], { hour12: false })}] [stage] Sprites reset to origin (0, 0).`,
        );
    };

    const handleAddSprite = useCallback(() => {
        const name = `Sprite${stageState.sprites.filter((s) => !s.isStage).length + 1}`;
        addSprite(setStageState, name);
        addLog(
            `[${new Date().toLocaleTimeString([], { hour12: false })}] [stage] Created ${name}`,
        );
    }, [stageState.sprites, setStageState, addLog]);

    const handleDeleteSprite = useCallback(
        (id: string) => {
            const deleted = stageState.sprites.find((s) => s.id === id);
            setStageState((prev) => ({
                ...prev,
                sprites: prev.sprites.filter((s) => s.id !== id),
            }));

            if (selectedSpriteId === id) {
                setSelectedSpriteId(null);
            }

            if (deleted) {
                addLog(
                    `[${new Date().toLocaleTimeString([], { hour12: false })}] [stage] Deleted ${deleted.name}`,
                );
            }
        },
        [selectedSpriteId, stageState.sprites, setStageState, addLog],
    );

    const handleSpritePropertyChange = useCallback(
        (id: string, prop: keyof SpriteState, value: unknown) => {
            setStageState((prev) => ({
                ...prev,
                sprites: prev.sprites.map((s) =>
                    s.id === id ? { ...s, [prop]: value } : s,
                ),
            }));
        },
        [setStageState],
    );

    // Serialized AST representation
    const sb3Json = useMemo(() => {
        void blockCount;

        if (!workspace) {
            return '{}';
        }

        try {
            const state = Blockly.serialization.workspaces.save(workspace);

            return JSON.stringify(state, null, 2);
        } catch {
            return '// Unable to serialize current workspace';
        }
    }, [workspace, blockCount]);

    const handleCopy = (tab: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedTab(tab);
        setTimeout(() => setCopiedTab(null), 1800);
    };

    return (
        <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
            {/* Studio Top Control Ribbon */}
            <header className="flex h-13 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/60 px-4 select-none">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-block size-2 rounded-full ${isRunning ? 'animate-ping bg-amber-500' : 'bg-emerald-500'}`}
                        />
                        <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                            Studio Lab
                        </span>
                        <span className="rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            BLOCKLY ZELOS
                        </span>
                    </div>

                    <span className="hidden text-xs text-muted-foreground sm:inline">
                        /
                    </span>

                    {/* Active Target Sprite Selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="hidden text-muted-foreground md:inline">
                            Target:
                        </span>
                        <select
                            value={selectedSpriteId ?? ''}
                            onChange={(e) =>
                                setSelectedSpriteId(e.target.value)
                            }
                            className="h-7 rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            {stageState.sprites
                                .filter((s) => !s.isStage)
                                .map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.x}, {s.y})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <span className="hidden rounded border border-border/50 bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground lg:inline">
                        {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
                    </span>
                </div>

                {/* Actions Group */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleResetStage}
                        title="Reset sprite coordinates to (0, 0)"
                        className="flex h-8 items-center gap-1.5 rounded border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <RotateCcw className="size-3.5" />
                        <span className="hidden sm:inline">Reset Stage</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`flex h-8 items-center gap-1.5 rounded px-4 text-xs font-semibold shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isRunning
                                ? 'cursor-not-allowed bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                    >
                        {isRunning ? (
                            <>
                                <Square className="size-3.5 fill-current" />
                                <span>Running…</span>
                            </>
                        ) : (
                            <>
                                <Play className="size-3.5 fill-current" />
                                <span>Run</span>
                                <kbd className="ml-1 hidden font-mono text-[10px] opacity-75 md:inline">
                                    ⌘⏎
                                </kbd>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Studio Workbench Grid */}
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
                {/* Left 7-col: Blockly Zelos Workspace */}
                <div className="relative flex min-h-0 flex-col overflow-hidden border-b border-border lg:col-span-7 lg:border-r lg:border-b-0">
                    <BlocklyWorkspace
                        onCodeChange={setPythonCode}
                        onWorkspaceReady={setWorkspace}
                        onWorkspaceChange={handleWorkspaceChange}
                    />
                </div>

                {/* Right 5-col: Docked Stage & Live Output Studio */}
                <div className="flex min-h-0 flex-col overflow-hidden bg-card/20 lg:col-span-5">
                    {/* Upper Half: Stage & Sprite Config */}
                    <div className="flex shrink-0 flex-col border-b border-border">
                        {/* Stage Header */}
                        <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-4 py-2 font-mono text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Monitor className="size-3.5 text-primary" />
                                <span className="font-semibold text-foreground">
                                    Canvas Stage
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MousePointer className="size-3" />
                                    <span>
                                        x:{mouseCoords.x.toFixed(0)} y:
                                        {mouseCoords.y.toFixed(0)}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Canvas Stage View */}
                        <div className="flex items-center justify-center bg-background/50 p-3">
                            <StageComponent
                                state={stageState}
                                onMouseMove={(x, y) => setMouseCoords({ x, y })}
                                onSpriteClick={setSelectedSpriteId}
                            />
                        </div>

                        {/* Sprite Property Panel */}
                        <div className="border-t border-border/60">
                            <SpritePanel
                                stageState={stageState}
                                selectedSpriteId={selectedSpriteId}
                                onSelectSprite={setSelectedSpriteId}
                                onAddSprite={handleAddSprite}
                                onDeleteSprite={handleDeleteSprite}
                                onSpritePropertyChange={
                                    handleSpritePropertyChange
                                }
                            />
                        </div>
                    </div>

                    {/* Lower Half: Multi-tab Output & AST Studio */}
                    <div className="flex min-h-0 flex-1 flex-col bg-background">
                        {/* Tabs Navigation Header */}
                        <div className="flex h-9 items-center justify-between border-b border-border bg-muted/20 px-3 font-mono text-xs select-none">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('console')}
                                    className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-xs transition-colors ${
                                        activeTab === 'console'
                                            ? 'border border-border/60 bg-background font-semibold text-foreground shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Terminal className="size-3.5 text-emerald-500" />
                                    <span>Console ({logs.length})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('python')}
                                    className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-xs transition-colors ${
                                        activeTab === 'python'
                                            ? 'border border-border/60 bg-background font-semibold text-foreground shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Code2 className="size-3.5 text-blue-500" />
                                    <span>Python 3</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('sb3')}
                                    className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-xs transition-colors ${
                                        activeTab === 'sb3'
                                            ? 'border border-border/60 bg-background font-semibold text-foreground shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Layers className="size-3.5 text-amber-500" />
                                    <span>Blockly AST</span>
                                </button>
                            </div>

                            {/* Tab Actions */}
                            <div className="flex items-center gap-1">
                                {activeTab === 'console' && (
                                    <button
                                        type="button"
                                        onClick={handleClearLogs}
                                        title="Clear output console"
                                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}

                                {activeTab === 'python' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy('python', pythonCode)
                                        }
                                        className="flex h-6 items-center gap-1 rounded px-2 font-sans text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        {copiedTab === 'python' ? (
                                            <>
                                                <Check className="size-3 text-emerald-500" />
                                                <span className="text-emerald-500">
                                                    Copied
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="size-3" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {activeTab === 'sb3' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy('sb3', sb3Json)
                                        }
                                        className="flex h-6 items-center gap-1 rounded px-2 font-sans text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        {copiedTab === 'sb3' ? (
                                            <>
                                                <Check className="size-3 text-emerald-500" />
                                                <span className="text-emerald-500">
                                                    Copied
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="size-3" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Active Tab Body */}
                        <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs">
                            {activeTab === 'console' && (
                                <div className="flex flex-col gap-1 leading-relaxed">
                                    {logs.map((log, index) => {
                                        const isMotion =
                                            log.includes('[motion]');
                                        const isLooks = log.includes('[looks]');
                                        const isError = log.includes('[error]');
                                        const isDone = log.includes('[done]');
                                        const isWarn = log.includes('[warn]');

                                        return (
                                            <div
                                                key={index}
                                                className={`break-all ${
                                                    isError
                                                        ? 'font-semibold text-destructive'
                                                        : isDone
                                                          ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                                          : isMotion
                                                            ? 'text-blue-600 dark:text-blue-400'
                                                            : isLooks
                                                              ? 'text-purple-600 dark:text-purple-400'
                                                              : isWarn
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-muted-foreground'
                                                }`}
                                            >
                                                {log}
                                            </div>
                                        );
                                    })}
                                    <div ref={consoleBottomRef} />
                                </div>
                            )}

                            {activeTab === 'python' && (
                                <pre className="font-mono leading-relaxed whitespace-pre text-foreground selection:bg-primary/20">
                                    <code>{pythonCode}</code>
                                </pre>
                            )}

                            {activeTab === 'sb3' && (
                                <pre className="font-mono leading-relaxed whitespace-pre text-muted-foreground selection:bg-primary/20">
                                    <code>{sb3Json}</code>
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

TestBlockLab.layout = {
    breadcrumbs: [
        {
            title: 'Block Lab',
            href: '/test-block-lab',
        },
    ],
};
