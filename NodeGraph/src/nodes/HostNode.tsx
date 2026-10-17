import { Handle, Position, type NodeProps } from '@xyflow/react';

import { type HostNode } from './types';

export function HostNode({
  data,
}: NodeProps<HostNode>) {

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="regNodes">
      <div>ID: {data.label[0]}</div>
      <div>Alias: {data.label[4]}</div>
      <div>MAC: {data.label[1]}</div>
      <div>Vendor: {data.label[2]}</div>
      <div>RSSI: {data.label[6] ? data.label[6] : "--"} dBm</div>
      <div>AP PROBE COUNT: {data.label[5]}</div>
      <div>TOTAL PROBE COUNT: {data.label[3]}</div>
      <div>LAST PROBE: {(new Date(data.label[7] * 1000)).toString()}</div>
      <div>FIRST PROBE: {(new Date(data.label[8] * 1000)).toString()}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
