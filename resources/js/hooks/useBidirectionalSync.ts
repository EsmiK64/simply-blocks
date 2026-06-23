import type { EditorView } from '@codemirror/view';
import * as Blockly from 'blockly/core';
import { useEffect, useRef, useState } from 'react';

type ChangeSource = 'BLOCKS' | 'TEXT' | 'SYSTEM';

interface SyncModel {
    code: string;
    xml: string;
    source: ChangeSource;
}

export const useBidirectionalSync = () => {
    const [syncState, setSyncState] = useState<SyncModel>({
        code: '',
        xml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
        source: 'SYSTEM'
    });

    const blocklyWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
    const codeMirrorEditorRef = useRef<EditorView | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const updateFromBlockly = (generatedCode: string, generatedXml: string) => {
        if (debounceTimerRef.current) {
clearTimeout(debounceTimerRef.current);
}

        debounceTimerRef.current = setTimeout(() => {
            setSyncState((prev) => {
                if (prev.xml === generatedXml) {
return prev;
}

                // Push the changes to CodeMirror if the update originated from Blockly
                if (codeMirrorEditorRef.current && prev.source !== 'TEXT') {
                    const docLength = codeMirrorEditorRef.current.state.doc.length;
                    const transaction = codeMirrorEditorRef.current.state.update({
                        changes: { from: 0, to: docLength, insert: generatedCode }
                    });
                    codeMirrorEditorRef.current.dispatch(transaction);
                }

                return { code: generatedCode, xml: generatedXml, source: 'BLOCKS' };
            });
        }, 150); // Set latency budget for code generation from blocks
    };

    const updateFromEditor = (textCode: string, parseToXml: (code: string) => string) => {
        if (debounceTimerRef.current) {
clearTimeout(debounceTimerRef.current);
}

        debounceTimerRef.current = setTimeout(() => {
            setSyncState((prev) => {
                if (prev.code === textCode) {
return prev;
}

                try {
                    const equivalentXml = parseToXml(textCode);

                    if (blocklyWorkspaceRef.current && prev.source !== 'BLOCKS') {
                        blocklyWorkspaceRef.current.clear();
                        const xmlDom = Blockly.utils.xml.textToDom(equivalentXml);
                        Blockly.Xml.domToWorkspace(xmlDom, blocklyWorkspaceRef.current);
                    }

                    return { code: textCode, xml: equivalentXml, source: 'TEXT' };
                } catch (e) {
                    // If the edited text is syntactically incomplete, do not force-render XML
                    return { ...prev, code: textCode, source: 'TEXT' };
                }
            });
        }, 250); // Higher latency budget for syntax tree compilation
    };

    return { syncState, updateFromBlockly, updateFromEditor, blocklyWorkspaceRef, codeMirrorEditorRef };
};