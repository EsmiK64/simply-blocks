import { Head } from '@inertiajs/react';
import { Blocks, Code2, Play, Terminal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BlockWorkspace from '@/blocks/BlockWorkspace';

export default function TestBlockLab() {
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = () => {
        setIsRunning(true);
        setOutput(['print("Hello from ReactFlow!")', 'Hello from ReactFlow!']);
        setTimeout(() => setIsRunning(false), 500);
    };

    const handleClear = () => {
        setOutput([]);
    };

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

                <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.25fr_1fr]">
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
                        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            <CardHeader className="border-b px-4 py-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Code2 className="size-4 text-primary" />
                                    Python
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto p-4">
                                <pre className="font-mono text-sm text-muted-foreground">
                                    # Python code generation coming soon...
                                </pre>
                            </CardContent>
                        </Card>

                        <Card className="flex min-h-[12rem] flex-col overflow-hidden">
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
