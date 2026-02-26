import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Task } from '../api';
import './DependencyGraph.css';

interface DependencyGraphProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ tasks, onTaskComplete }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Memoize the custom node component to prevent re-creation
  const CustomNode = useCallback(
    ({ data }: any) => {
      const task: Task = data.task;

      return (
        <div className="custom-node">
          <div className="node-header">
            <span className={`priority-badge priority-${task.priority}`}>
              {task.priority}
            </span>
            <span className={`status-badge status-${task.status}`}>
              {task.status}
            </span>
          </div>
          <div className="node-content">
            <p className="node-description">{task.description}</p>
            {task.errorMessage && (
              <p className="error-message">{task.errorMessage}</p>
            )}
            {task.dependencies.length > 0 && (
              <p className="dependencies">
                Depends on: {task.dependencies.join(', ')}
              </p>
            )}
          </div>
          {task.status === 'ready' && (
            <button
              className="complete-btn"
              onClick={() => data.onComplete(task.id)}
            >
              ✓ Mark Complete
            </button>
          )}
        </div>
      );
    },
    []
  );

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), [CustomNode]);

  // Convert tasks to React Flow nodes and edges - use useMemo to prevent recalculation
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    // Create nodes
    const newNodes: Node[] = tasks.map((task, index) => {
      let bgColor = '#fff';
      let borderColor = '#ddd';
      let textColor = '#000';

      switch (task.status) {
        case 'completed':
          bgColor = '#d1fae5';
          borderColor = '#10b981';
          textColor = '#065f46';
          break;
        case 'ready':
          bgColor = '#dbeafe';
          borderColor = '#3b82f6';
          textColor = '#1e40af';
          break;
        case 'blocked':
          bgColor = '#fef3c7';
          borderColor = '#f59e0b';
          textColor = '#92400e';
          break;
        case 'error':
          bgColor = '#fee2e2';
          borderColor = '#ef4444';
          textColor = '#991b1b';
          break;
      }

      return {
        id: task.id,
        type: 'custom',
        data: {
          label: task.description,
          task,
          onComplete: onTaskComplete,
        },
        position: {
          x: (index % 3) * 300,
          y: Math.floor(index / 3) * 200,
        },
        style: {
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: '8px',
          padding: '15px',
          width: 250,
          color: textColor,
        },
      };
    });

    // Create edges (dependencies)
    const newEdges: Edge[] = [];
    tasks.forEach((task) => {
      task.dependencies.forEach((depId) => {
        newEdges.push({
          id: `${depId}-${task.id}`,
          source: depId,
          target: task.id,
          type: 'smoothstep',
          animated: task.status === 'blocked',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            stroke: task.status === 'error' ? '#ef4444' : '#64748b',
            strokeWidth: 2,
          },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]); // onTaskComplete is stable (wrapped in useCallback in parent)

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
