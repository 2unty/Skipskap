import { Handle, Position, type NodeProps } from '@xyflow/react';

import { type HostNode } from './types';

export function BTNode({
  data,
}: NodeProps<BTNode>) {

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="BTNodes">
      <div>ID: {data.label[0]}</div>
      <div>MAC: {data.label[1]}</div>
      <div>COMPANY: {data.label[2]}</div>
      <div>LOCALNAME: {data.label[3]}</div>
      <div>VENDOR: {data.label[7]}</div>
      <div>RSSI: {data.label[4] ? data.label[4] : "--"} dBm</div>
      <div>LAST AD: {(new Date(data.label[5] * 1000)).toString()}</div>
      <div>FIRST AD: {(new Date(data.label[6] * 1000)).toString()}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
