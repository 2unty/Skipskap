import type { Node, BuiltInNode } from '@xyflow/react';

export type PositionLoggerNode = Node<{ label: string }, 'position-logger'>;
export type HostNode = Node<{ label: string }, 'host-node'>;
export type APNode = Node<{ label: string }, 'ap-node'>;
export type BTNode = Node<{ label: string }, 'bt-node'>;
export type AppNode = BuiltInNode | PositionLoggerNode | HostNode | APNode;

