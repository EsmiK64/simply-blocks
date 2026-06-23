import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Simply Blocks" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-8 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <div className="w-full max-w-lg text-center">
                    <div className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Work in Progress
                    </div>

                    <h1 className="mb-4 text-4xl font-bold tracking-tight">
                        Simply Blocks
                    </h1>

                    <p className="mb-8 text-base text-[#706f6c] dark:text-[#A1A09A]">
                        An open-source, modular and expandable visual programming environment that grows with the learner — from drag-and-drop blocks to real Python, JavaScript, TypeScript, and HTML code.
                    </p>

                    <div className="mb-10 rounded-lg border border-[#e3e3e0] bg-white p-6 text-left text-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-3 font-medium">What's being built:</p>
                        <ul className="space-y-2 text-[#706f6c] dark:text-[#A1A09A]">
                            <li>— Scratch-style puzzle-piece block editor</li>
                            <li>— Side-by-side code view with live sync</li>
                            <li>— Python, JS, TS, and HTML code generation</li>
                            <li>— Modular block libraries</li>
                            <li>— In-browser execution engine</li>
                        </ul>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <a
                            href="/test-block-lab"
                            className="inline-block rounded-sm border border-[#19140035] bg-[#1b1b18] px-5 py-2 text-sm text-white hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                        >
                            Open Block Lab
                        </a>
                        <a
                            href="https://github.com/EsmiK64/simply-blocks"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-sm border border-[#19140035] px-5 py-2 text-sm hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
