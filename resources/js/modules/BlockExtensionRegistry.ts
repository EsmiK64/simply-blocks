// frontend/src/modules/BlockExtensionRegistry.ts
import * as Blockly from 'blockly/core';

export interface BlockExtensionManifest {
    blockType: string;
    jsonDefinition: object;
    pythonGenerator: (block: Blockly.Block, generator: any) => string | [string, number];
    javascriptGenerator: (block: Blockly.Block, generator: any) => string | [string, number];
    runtimeExecutionBridge: (...args: any[]) => void;
}

export class ExtensionRegistry {
    private static registeredExtensions: Map<string, BlockExtensionManifest> = new Map();

    public static installExtension(extension: BlockExtensionManifest) {
        this.registeredExtensions.set(extension.blockType, extension);

        // 1. Register the block structure within Google Blockly [cite: 32]
        Blockly.defineBlocksWithJsonArray([extension.jsonDefinition]);

        // 2. Register standard code generators for compiling workspace structures [cite: 34]
        if (extension.pythonGenerator) {
            (Blockly as any).Python.forBlock[extension.blockType] = extension.pythonGenerator;
        }

        if (extension.javascriptGenerator) {
            (Blockly as any).JavaScript.forBlock[extension.blockType] = extension.javascriptGenerator;
        }
    }

    public static executeBridgedCall(blockType: string, argumentsArray: any[]) {
        const extension = this.registeredExtensions.get(blockType);

        if (extension?.runtimeExecutionBridge) {
            extension.runtimeExecutionBridge(...argumentsArray);
        }
    }
}