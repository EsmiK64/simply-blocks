/* global Sk */

import { pythonGenerator } from 'blockly/python';

let skulptExecutionActive = false;

export function runPythonInSandbox(pythonCode, workspace, outputCallback) {
    skulptExecutionActive = true;

    // Prepend visual block highlights to statements
    pythonGenerator.STATEMENT_PREFIX = 'track_execution_block_id(%1)\n';
    pythonGenerator.addReservedWords('track_execution_block_id');

    const stepDebuggerCallback = (id) => {
        if (!skulptExecutionActive) {
            throw new Error('Execution stopped by user.');
        }

        // Update the visual block highlight state in the workspace
        workspace.highlightBlock(id);

        // Yield control back to the thread using a Skulpt suspension
        const suspension = new Sk.misceval.Suspension();
        suspension.resume = () => Sk.builtin.none.none$;
        suspension.data = { type: 'BREAKPOINT', blockId: id };

        throw suspension;
    };

    Sk.configure({
        output: outputCallback,
        read: (filename) => {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
                throw new Error(`Virtual file read error: ${filename}`);
            }

            return Sk.builtinFiles["files"][filename];
        },
        python3: true,
        yieldLimit: 100 // Prevent browser freezing in infinite loops [cite: 23]
    });

    // Register trace functions to track visual block states in the sandbox [cite: 24]
    Sk.builtins.track_execution_block_id = new Sk.builtin.func((id) => stepDebuggerCallback(id.v));

    Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, pythonCode, true))
        .then(() => {
            skulptExecutionActive = false;
        })
        .catch((err) => {
            skulptExecutionActive = false;
            outputCallback(`\nRuntime Error: ${err.toString()}`);
        });
}