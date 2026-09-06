import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/../css/app.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import TestBlockLab from '@/pages/test-block-lab';

// Initialize light/dark theme from localStorage/system
initializeTheme();

function StandaloneApp() {
    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
                <TestBlockLab />
                <Toaster />
            </div>
        </TooltipProvider>
    );
}

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <StandaloneApp />
        </React.StrictMode>,
    );
}
