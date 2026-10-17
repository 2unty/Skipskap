import { Handle, Position, type NodeProps } from '@xyflow/react';

import { type APNode } from './types';

export function APNode({
  data,
}: NodeProps<APNode>) {
  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="regNodes">
      <div>ID: {data.label[0]}</div>
      <div>SSID: {data.label[1]}</div>
      <div>BSSID: {data.label[6]}</div>
      <div>VENDOR: {data.label[4]}</div>
      <div>RSSI: {data.label[5] ? data.label[5] : "--"} dBm</div>
      <div>TOTAL PROBE COUNT: {data.label[2]}</div>
      <div>HOSTS: {data.label[7]}</div>
      <div>COMMENT: {data.label[3]}</div>
      <div>LAST BEACON: {(new Date(data.label[8] * 1000)).toString()}</div>
      <div>FIRST BEACON: {(new Date(data.label[9] * 1000)).toString()}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
