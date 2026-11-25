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
      <div>BSSID: {data.label[2]}</div>
      <div>VENDOR: {data.label[3]}</div>
      <div>RSSI: {data.label[6]!=0 ? data.label[6] : "--"} dBm</div>
      <div>TOTAL PROBE COUNT: {data.label[5]}</div>
      <div>HOSTS: {data.label[4]}</div>
      <div>COMMENT: {data.label[9]}</div>
      <div>LAST BEACON: {(new Date(data.label[7] * 1000)).toString()}</div>
      <div>FIRST BEACON: {(new Date(data.label[8] * 1000)).toString()}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
