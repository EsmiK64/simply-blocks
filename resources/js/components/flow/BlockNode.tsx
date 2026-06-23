import { Handle, Position, NodeProps } from 'reactflow';

export interface BlockNodeData {
    label: string;
    category: 'motion' | 'logic' | 'loops' | 'math' | 'text' | 'variables';
    color: string;
    hasTopConnector?: boolean;
    hasBottomConnector?: boolean;
    inputs?: { name: string; type: string }[];
    outputs?: { name: string; type: string }[];
}

const CATEGORY_COLORS = {
    motion: '#4C97FF',
    logic: '#4C97FF',
    loops: '#FFAB19',
    math: '#59C059',
    text: '#FF6680',
    variables: '#FF8C1A',
};

export default function BlockNode({ data }: NodeProps<BlockNodeData>) {
    const color = data.color || CATEGORY_COLORS[data.category];
    const hasTop = data.hasTopConnector !== false;
    const hasBottom = data.hasBottomConnector !== false;

    return (
        <div
            className="relative px-4 py-3 shadow-sm min-w-[180px]"
            style={{
                backgroundColor: color,
                color: 'white',
                fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
                borderRadius: '8px',
            }}
        >
            {/* Top connector (like puzzle piece notch) */}
            {hasTop && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-4 !h-3 !bg-white !border-2 !rounded-sm"
                    style={{ borderColor: color, top: -6 }}
                />
            )}

            {/* Bottom connector (like puzzle piece notch) */}
            {hasBottom && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-4 !h-3 !bg-white !border-2 !rounded-sm"
                    style={{ borderColor: color, bottom: -6 }}
                />
            )}

            <div className="font-medium text-sm">{data.label}</div>

            {data.inputs && data.inputs.length > 0 && (
                <div className="mt-2 space-y-1">
                    {data.inputs.map((input, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Handle
                                type="target"
                                position={Position.Left}
                                className="!w-3 !h-3 !bg-white !border-2"
                                style={{ borderColor: color }}
                            />
                            <span className="text-xs opacity-90">{input.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {data.outputs && data.outputs.length > 0 && (
                <div className="mt-2 space-y-1">
                    {data.outputs.map((output, i) => (
                        <div key={i} className="flex items-center justify-end gap-2">
                            <span className="text-xs opacity-90">{output.name}</span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                className="!w-3 !h-3 !bg-white !border-2"
                                style={{ borderColor: color }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
