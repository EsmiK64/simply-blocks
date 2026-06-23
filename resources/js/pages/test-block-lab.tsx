import { Head } from '@inertiajs/react';
import { Blocks, Code2, Play, Terminal, Trash2, Monitor } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BlockWorkspace from '@/blocks/BlockWorkspace';
import StageComponent, { useStageState, addSprite } from '@/stage/StageComponent';
import SpritePanel from '@/stage/SpritePanel';
import { SpriteState } from '@/stage/SpriteRuntime';

export default function TestBlockLab() {
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [stageState, setStageState] = useStageState();
    const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);
    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

    const handleRun = () => {
        setIsRunning(true);
        setOutput(['print("Hello from ReactFlow!")', 'Hello from ReactFlow!']);
        setTimeout(() => setIsRunning(false), 500);
    };

    const handleClear = () => {
        setOutput([]);
    };

    const handleAddSprite = useCallback(() => {
        const name = `Sprite${stageState.sprites.filter(s => !s.isStage).length + 1}`;
        addSprite(setStageState, name);
    }, [stageState.sprites, setStageState]);

    const handleDeleteSprite = useCallback((id: string) => {
        setStageState(prev => ({
            ...prev,
            sprites: prev.sprites.filter(s => s.id !== id),
        }));
        if (selectedSpriteId === id) setSelectedSpriteId(null);
    }, [selectedSpriteId, setStageState]);

    const handleSpritePropertyChange = useCallback(
        (id: string, prop: keyof SpriteState, value: unknown) => {
            setStageState(prev => ({
                ...prev,
                sprites: prev.sprites.map(s =>
                    s.id === id ? { ...s, [prop]: value } : s
                ),
            }));
        },
        [setStageState]
    );

    return (
        <>
            <Head title="Test Block Lab" />
            <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Blocks className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">Test Block Lab</h1>
                            <p className="text-muted-foreground text-sm">ReactFlow-based visual programming</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                            <Code2 className="size-3.5" />
                            Python
                        </Badge>
                        <Button variant="outline" size="sm" onClick={handleClear}>
                            <Trash2 className="size-4" />
                            Clear
                        </Button>
                        <Button size="sm" onClick={handleRun} disabled={isRunning}>
                            <Play className="size-4" />
                            {isRunning ? 'Running…' : 'Run'}
                        </Button>
                    </div>
                </header>

                <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <Card className="flex min-h-[24rem] flex-col overflow-hidden">
                        <CardHeader className="border-b px-4 py-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <Blocks className="size-4 text-primary" />
                                Blocks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative flex-1 p-0">
                            <BlockWorkspace />
                        </CardContent>
                    </Card>

                    <div className="flex min-h-0 flex-col gap-4">
                        {/* Stage */}
                        <Card className="flex flex-col overflow-hidden">
                            <CardHeader className="border-b px-4 py-2">
                                <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
                                    <span className="flex items-center gap-2">
                                        <Monitor className="size-4 text-primary" />
                                        Stage
                                    </span>
                                    <span className="text-xs font-normal text-muted-foreground font-mono">
                                        x:{mouseCoords.x.toFixed(0)} y:{mouseCoords.y.toFixed(0)}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <StageComponent
                                    state={stageState}
                                    onMouseMove={(x, y) => setMouseCoords({ x, y })}
                                    onSpriteClick={setSelectedSpriteId}
                                />
                            </CardContent>
                            <SpritePanel
                                stageState={stageState}
                                selectedSpriteId={selectedSpriteId}
                                onSelectSprite={setSelectedSpriteId}
                                onAddSprite={handleAddSprite}
                                onDeleteSprite={handleDeleteSprite}
                                onSpritePropertyChange={handleSpritePropertyChange}
                            />
                        </Card>

                        {/* Console */}
                        <Card className="flex min-h-[8rem] flex-1 flex-col overflow-hidden">
                            <CardHeader className="border-b px-4 py-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Terminal className="size-4 text-primary" />
                                    Console
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto p-0">
                                <div className="flex h-full flex-col gap-1 p-4 font-mono text-sm">
                                    {output.length === 0 ? (
                                        <span className="text-muted-foreground italic">
                                            Click Run to see output here…
                                        </span>
                                    ) : (
                                        output.map((line, index) => (
                                            <span key={index} className="whitespace-pre-wrap">
                                                {line}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

TestBlockLab.layout = {
    breadcrumbs: [
        {
            title: 'Test Block Lab',
            href: '/test-block-lab',
        },
    ],
};
