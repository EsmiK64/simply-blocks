import { useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    Connection,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import BlockNode, { BlockNodeData } from './BlockNode';

const nodeTypes = {
    block: BlockNode,
};

const INITIAL_NODES: Node<BlockNodeData>[] = [
    {
        id: '1',
        type: 'block',
        position: { x: 250, y: 50 },
        data: {
            label: 'Move Steps',
            category: 'motion',
            color: '#4C97FF',
            hasTopConnector: false,
            hasBottomConnector: true,
            inputs: [{ name: 'steps', type: 'number' }],
        },
    },
    {
        id: '2',
        type: 'block',
        position: { x: 250, y: 150 },
        data: {
            label: 'If',
            category: 'logic',
            color: '#4C97FF',
            hasTopConnector: true,
            hasBottomConnector: true,
            inputs: [{ name: 'condition', type: 'boolean' }],
            outputs: [{ name: 'true', type: 'any' }, { name: 'false', type: 'any' }],
        },
    },
    {
        id: '3',
        type: 'block',
        position: { x: 250, y: 300 },
        data: {
            label: 'Print',
            category: 'text',
            color: '#FF6680',
            hasTopConnector: true,
            hasBottomConnector: false,
            inputs: [{ name: 'text', type: 'string' }],
        },
    },
];

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: '1', sourceHandle: 'bottom', target: '2', targetHandle: 'top' },
    { id: 'e2-3', source: '2', sourceHandle: 'bottom', target: '3', targetHandle: 'top' },
];

interface FlowEditorProps {
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[]) => void;
}

export default function FlowEditor({ onNodesChange, onEdgesChange }: FlowEditorProps) {
    const [nodes, setNodes, onNodesChangeInternal] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(INITIAL_EDGES);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge(connection, eds));
        },
        [setEdges]
    );

    const handleNodesChange = useCallback(
        (changes: any) => {
            onNodesChangeInternal(changes);
            if (onNodesChange) {
                onNodesChange(nodes);
            }
        },
        [onNodesChangeInternal, onNodesChange, nodes]
    );

    const handleEdgesChange = useCallback(
        (changes: any) => {
            onEdgesChangeInternal(changes);
            if (onEdgesChange) {
                onEdgesChange(edges);
            }
        },
        [onEdgesChangeInternal, onEdgesChange, edges]
    );

    return (
        <div className="w-full h-full bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                nodesConnectable={false}
                edgesUpdatable={false}
                elementsSelectable={true}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#999', strokeWidth: 2 },
                }}
                fitView
                className="bg-background"
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--muted-foreground)" />
                <Controls className="!bg-card !border-border" />
                <MiniMap
                    className="!bg-card !border-border"
                    nodeColor={(node) => (node.data as BlockNodeData).color || '#4C97FF'}
                />
            </ReactFlow>
        </div>
    );
}
