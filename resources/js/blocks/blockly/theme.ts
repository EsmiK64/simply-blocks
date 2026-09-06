import * as Blockly from 'blockly/core';

/**
 * Creative Studio Dark Theme for Google Blockly Zelos.
 * Accurately calibrated to match Simply Blocks' dark mode palette.
 */
export const SimplyBlocksDarkTheme = Blockly.Theme.defineTheme(
    'simplyBlocksDark',
    {
        name: 'simplyBlocksDark',
        base: Blockly.Themes.Zelos,
        componentStyles: {
            workspaceBackgroundColour: '#090d16',
            toolboxBackgroundColour: '#0d1322',
            toolboxForegroundColour: '#e2e8f0',
            flyoutBackgroundColour: '#090d16',
            flyoutForegroundColour: '#f1f5f9',
            flyoutOpacity: 0.98,
            scrollbarColour: '#334155',
            scrollbarOpacity: 0.45,
            insertionMarkerColour: '#38bdf8',
            insertionMarkerOpacity: 0.6,
            markerColour: '#38bdf8',
            cursorColour: '#38bdf8',
            selectedGlowColour: '#60a5fa',
            selectedGlowOpacity: 0.7,
        },
        fontStyle: {
            family: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
            weight: '600',
            size: 11,
        },
    },
);
