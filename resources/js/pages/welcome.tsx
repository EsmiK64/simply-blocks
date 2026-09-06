import { Head, Link } from '@inertiajs/react';
import {
    Terminal,
    ArrowRight,
    Github,
    Cpu,
    Layers,
    PlayCircle,
    Sparkles,
} from 'lucide-react';

export default function Welcome() {
    return (
        <>
            <Head title="Simply Blocks - Visual Logic to Real Code" />
            <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
                {/* Top Utilitarian Status Bar */}
                <header className="flex items-center justify-between border-b border-border bg-card/40 px-6 py-3 font-mono text-xs backdrop-blur">
                    <div className="flex items-center gap-3">
                        <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
                        <span className="font-semibold tracking-wider text-foreground uppercase">
                            SIMPLY_BLOCKS // v0.2.1-ALPHA
                        </span>
                        <span className="hidden text-muted-foreground sm:inline">
                            |
                        </span>
                        <span className="hidden text-muted-foreground sm:inline">
                            CLIENT-FIRST AST ENGINE
                        </span>
                    </div>

                    <nav className="flex items-center gap-4">
                        <Link
                            href="/test-block-lab"
                            className="flex items-center gap-1 font-medium transition-colors hover:text-primary"
                        >
                            Open Lab <span aria-hidden="true">→</span>
                        </Link>
                        <a
                            href="https://github.com/EsmiK64/simply-blocks"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Github className="size-3.5" />
                            GitHub
                        </a>
                    </nav>
                </header>

                {/* Main Content Hero */}
                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-12 md:py-16">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                        {/* Left Editorial / Spec Column */}
                        <div className="flex flex-col gap-6 lg:col-span-7">
                            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                                <span className="font-bold text-primary">
                                    ●
                                </span>{' '}
                                Educational Visual IDE
                            </div>

                            <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                Visual logic that compiles to{' '}
                                <span className="underline decoration-primary decoration-4 underline-offset-4">
                                    real code
                                </span>
                                .
                            </h1>

                            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                                Simply Blocks connects visual puzzle-piece
                                programming with real text syntax. Build logic
                                with Scratch 3.0 blocks, observe instantaneous
                                AST generation, and compile into Python,
                                TypeScript, and WebAssembly.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link
                                    href="/test-block-lab"
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <PlayCircle className="size-4" />
                                    Launch Block Lab
                                    <ArrowRight className="size-4" />
                                </Link>

                                <a
                                    href="https://github.com/EsmiK64/simply-blocks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <Github className="size-4" />
                                    Architecture & Source
                                </a>
                            </div>

                            {/* Spec Sheet Badges */}
                            <div className="grid grid-cols-3 gap-4 border-t border-border/80 pt-6 font-mono text-xs">
                                <div>
                                    <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                        Format
                                    </div>
                                    <div className="mt-0.5 font-semibold text-foreground">
                                        Scratch 3.0 .sb3
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                        Runtime
                                    </div>
                                    <div className="mt-0.5 font-semibold text-foreground">
                                        Client-Side Canvas
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                        Language
                                    </div>
                                    <div className="mt-0.5 font-semibold text-foreground">
                                        CPython 3 / TS
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Interactive Specimen / Visual Preview */}
                        <div className="lg:col-span-5">
                            <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                                {/* Window Header Bar */}
                                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5 font-mono text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block size-2.5 rounded-full bg-red-500/80" />
                                        <span className="inline-block size-2.5 rounded-full bg-amber-500/80" />
                                        <span className="inline-block size-2.5 rounded-full bg-emerald-500/80" />
                                        <span className="ml-2 text-muted-foreground">
                                            live_stack.ast
                                        </span>
                                    </div>
                                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        SYNCHRONIZED
                                    </span>
                                </div>

                                {/* Simulated Block Stack Visual */}
                                <div className="flex flex-col gap-2 bg-background/50 p-6 font-sans select-none">
                                    {/* Hat Block */}
                                    <div className="flex w-fit items-center gap-2 rounded-t-xl rounded-br-md border-b-2 border-black/20 bg-[#FFBF00] px-4 py-2.5 text-xs font-bold text-black shadow-xs">
                                        <span>when</span>
                                        <span className="inline-block size-2.5 rounded-full bg-emerald-600" />
                                        <span>clicked</span>
                                    </div>

                                    {/* Motion Block */}
                                    <div className="-mt-1 flex w-fit items-center gap-2 rounded-md bg-[#4C97FF] px-4 py-2 text-xs font-semibold text-white shadow-xs">
                                        <span>move</span>
                                        <span className="rounded bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-black">
                                            25
                                        </span>
                                        <span>steps</span>
                                    </div>

                                    {/* Turn Block */}
                                    <div className="-mt-1 flex w-fit items-center gap-2 rounded-md bg-[#4C97FF] px-4 py-2 text-xs font-semibold text-white shadow-xs">
                                        <span>turn ↻</span>
                                        <span className="rounded bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-black">
                                            15
                                        </span>
                                        <span>degrees</span>
                                    </div>

                                    {/* Looks Block */}
                                    <div className="-mt-1 flex w-fit items-center gap-2 rounded-md bg-[#9966FF] px-4 py-2 text-xs font-semibold text-white shadow-xs">
                                        <span>say</span>
                                        <span className="rounded bg-white px-2 py-0.5 font-mono text-[11px] text-black">
                                            &ldquo;Hello World!&rdquo;
                                        </span>
                                    </div>
                                </div>

                                {/* Live Code Preview Output */}
                                <div className="border-t border-border bg-card p-4 font-mono text-xs">
                                    <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Terminal className="size-3.5" />
                                            <span>Compiled Target</span>
                                        </div>
                                        <span className="text-primary">
                                            python3
                                        </span>
                                    </div>
                                    <pre className="overflow-x-auto rounded bg-muted/30 p-3 text-[12px] leading-relaxed text-foreground">
                                        <code>
                                            <span className="text-amber-500">
                                                def
                                            </span>{' '}
                                            <span className="text-blue-500">
                                                on_green_flag
                                            </span>
                                            (): sprite.
                                            <span className="text-emerald-500">
                                                forward
                                            </span>
                                            (
                                            <span className="text-purple-500">
                                                25
                                            </span>
                                            ) sprite.
                                            <span className="text-emerald-500">
                                                right
                                            </span>
                                            (
                                            <span className="text-purple-500">
                                                15
                                            </span>
                                            ) sprite.
                                            <span className="text-emerald-500">
                                                say
                                            </span>
                                            (
                                            <span className="text-amber-600 dark:text-amber-300">
                                                &quot;Hello World!&quot;
                                            </span>
                                            )
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Architectural Pillars Section */}
                    <div className="mt-16 grid grid-cols-1 gap-8 border-t border-border pt-12 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary uppercase">
                                <Layers className="size-4" />
                                01 / Modular Grammar
                            </div>
                            <h2 className="text-base font-semibold text-foreground">
                                Scratch 3.0 Compatible AST
                            </h2>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Complete opcode specifications across Motion,
                                Looks, Sound, Control, and Math. Imports and
                                exports standard .sb3 project archives.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary uppercase">
                                <Cpu className="size-4" />
                                02 / In-Browser Sandbox
                            </div>
                            <h2 className="text-base font-semibold text-foreground">
                                Client-First Stage Canvas
                            </h2>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                480×360 Scratch coordinate system with 60fps
                                canvas rendering, matrix transforms, ghost
                                effects, and responsive coordinate mapping.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary uppercase">
                                <Sparkles className="size-4" />
                                03 / Dual-Mode Evolution
                            </div>
                            <h2 className="text-base font-semibold text-foreground">
                                From Blocks to Real Code
                            </h2>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Teaches authentic programming constructs without
                                artificial abstractions. Code compiles live to
                                clean Python and TypeScript syntax.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Technical Colophon */}
                <footer className="flex flex-col items-center justify-between gap-2 border-t border-border px-6 py-4 font-mono text-xs text-muted-foreground sm:flex-row">
                    <div>
                        <span>
                            SIMPLY_BLOCKS // MIT LICENSE // COPYRIGHT 2026
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/test-block-lab"
                            className="transition-colors hover:text-foreground"
                        >
                            Block Lab
                        </Link>
                        <a
                            href="https://github.com/EsmiK64/simply-blocks"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-foreground"
                        >
                            Source Code
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
