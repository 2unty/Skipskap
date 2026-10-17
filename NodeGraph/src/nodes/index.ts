import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import { HostNode } from './HostNode';
import { APNode } from './APNode';
import { BTNode } from './BTNode';
import { AppNode } from './types';

export const initialNodes: AppNode[] = [
  { id: 'a', type: 'input', position: { x: 0, y: 0 }, data: { label: 'wire' } },
  { id: 'b', position: { x: 100, y: 100 }, data: { label: 'your ideas' } },
  {
    id: 'c',
    type: 'output',
    position: { x: 0, y: 200 },
    data: { label: 'with React Flow' },
  },
];

export const nodeTypes = {
  'host-node': HostNode,
  'ap-node': APNode,
  'bt-node': BTNode

  // Add any of your custom nodes here!
} satisfies NodeTypes;
