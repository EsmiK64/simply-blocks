export interface BlockField {
    name: string;
    type: 'number' | 'string' | 'dropdown' | 'boolean' | 'color' | 'sprite' | 'broadcast' | 'effect' | 'key' | 'mathop' | 'stopOption';
    value?: string | number | boolean;
    options?: { label: string; value: string }[];
}

export type BlockShape = 'stack' | 'reporter' | 'boolean' | 'hat' | 'end';

export type BlockCategory =
    | 'motion' | 'looks' | 'sound' | 'events' | 'control'
    | 'sensing' | 'operators' | 'variables' | 'lists' | 'myblocks'
    | 'logic' | 'loops' | 'math' | 'text' | 'pen';

export interface BlockDefinition {
    type: string;
    label: string;
    category: BlockCategory;
    color: string;
    shape?: BlockShape;    // defaults to 'stack' if not set
    sb3Opcode?: string;    // Scratch 3 opcode if different from type
    hasNotch?: boolean;    // Top puzzle piece notch (stack blocks)
    hasTab?: boolean;      // Bottom puzzle piece tab (stack blocks)
    isHat?: boolean;       // Start block (no notch, hat shape)
    isEnd?: boolean;       // End block (no tab)
    hasContainer?: boolean; // C-shaped container for nested blocks
    hasElse?: boolean;     // E-shaped block with an extra else branch
    fields?: BlockField[];
    inputs?: string[];     // Names of input slots
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
