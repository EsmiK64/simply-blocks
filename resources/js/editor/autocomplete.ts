import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { autocompletion } from '@codemirror/autocomplete';
import type { Extension} from '@codemirror/state';
import { Compartment } from '@codemirror/state';

export const suggestConfigCompartment = new Compartment();

export function createDynamicSuggestions(keywords: string[]): Extension {
    const customCompletionSource = async (context: CompletionContext): Promise<CompletionResult | null> => {
        const activeWord = context.matchBefore(/\w*/);

        if (!activeWord || (activeWord.from === activeWord.to && !context.explicit)) {
            return null;
        }

        return {
            from: activeWord.from,
            options: keywords.map((word) => ({
                label: word,
                type: 'function',
                info: `Block library function: ${word}()`
            }))
        };
    };

    return suggestConfigCompartment.of(autocompletion({ override: [customCompletionSource] }));
}