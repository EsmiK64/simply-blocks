export interface BlockField {
    name: string;
    type: 'number' | 'string' | 'dropdown' | 'boolean';
    value?: string | number | boolean;
    options?: { label: string; value: string }[];
}

export interface BlockDefinition {
    type: string;
    label: string;
    category: 'motion' | 'logic' | 'loops' | 'math' | 'text' | 'variables' | 'events' | 'control';
    color: string;
    hasNotch?: boolean; // Top puzzle piece notch
    hasTab?: boolean; // Bottom puzzle piece tab
    isHat?: boolean; // Start block (no notch)
    isEnd?: boolean; // End block (no tab)
    hasContainer?: boolean; // C-shaped container for nested blocks
    hasElse?: boolean; // E-shaped block with an extra else branch
    fields?: BlockField[];
    inputs?: string[]; // Names of input slots
}

export interface BlockInstance {
    id: string;
    definition: BlockDefinition;
    fields: Record<string, string | number | boolean>;
    inputs: Record<string, BlockInstance | null>;
    next: BlockInstance | null; // Block below in stack
    children: BlockInstance[]; // Nested blocks in first container
    elseChildren: BlockInstance[]; // Nested blocks in else container (E-blocks)
    x: number;
    y: number;
}
