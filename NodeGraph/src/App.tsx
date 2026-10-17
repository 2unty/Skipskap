import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges, edgeTypes } from './edges';
import { AppNode } from './nodes/types'

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const apList = useRef({}); 
  const hostList = useRef({});
  const btList = useRef({});
  const fetched = useRef(false);
  
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  useEffect(() => {
    async function updateNodes() {
      try {
        const res = await fetch('/api/fetch?param=recent');
        if (!res.ok) throw new Error('Failed to fetch');
	if (!fetched.current){
	  fetched.current = true;
          const json = await res.json();
	  const nodes: AppNode[] = [];
	  const edges: Edge[] = [];
	  let xIncrement = 0;
	  let mainIncrement = 0;
	  let yIncrement = 0;
	  json.LINKS.forEach(LINK => {
	    const apNameID = `AP${LINK[1]}`; // LINK.APID
	    let hostNameID = `HOST${LINK[2]}`; // LINK.HOSTID
	    if(!apList.current[apNameID]){ // Access point isn't a node yet
	      // If ap[0] (APID) === LINK[1] (APID) return ap (AP array) 
	      const APArray = json.APS.find(ap => {if(ap[0] === LINK[1]) return ap});
	      const xPos = xIncrement * 500;
	      let newEntry = {};
	      newEntry["id"] = apNameID;
	      newEntry["type"] = "ap-node";
	      newEntry["position"] = {x: xPos, y: 0};
	      newEntry["data"] = {label: [APArray[0], APArray[1], APArray[2], APArray[3], APArray[4], APArray[5], APArray[6], APArray[7], APArray[8], APArray[9]]};
	      apList.current[apNameID] = [0, xPos]; // Count & offset, position of AP on node graph
	      nodes[mainIncrement] = newEntry;
	      xIncrement++;
	      mainIncrement++;
	    }
	    if(apList.current[apNameID][0] < 500){ // Host isn't a node yet and AP has < 10 nodes
	      while(hostList.current[hostNameID]) hostNameID = hostNameID+"I";
	      const HOSTArray = json.HOSTS.find(host => {if(host[0] === LINK[2]) return host});
	      /*let xPosi = Math.ceil((indexList[apNameID][1]-70)+indexList[apNameID][0]*50);
	      let yPos = Math.sin((indexList[apNameID][0]*30) * (Math.PI / 180))*80;*/
	      const xPos = apList.current[apNameID][0]%2==0 ? apList.current[apNameID][1]-100 : apList.current[apNameID][1]+80; //Alternate columns
	      const yPos = 300+(Math.floor(apList.current[apNameID][0]/2)*280); // Down one row for every two entries
	      let newEntry = {};
	      let coordArray = [xPos, yPos];
	      newEntry["id"] = hostNameID;
	      newEntry["type"] = "host-node";
	      newEntry["data"] = {label: [HOSTArray[0], HOSTArray[1], HOSTArray[2], HOSTArray[3], HOSTArray[4], LINK[3], HOSTArray[5], HOSTArray[6], HOSTArray[7]]};
	      /*let found = false;
	      Object.values(hostList.current).map((HOST, index) => { // Holy shitty booty code
	        if(!found && HOSTArray[5] < HOST[1]){ // If the RSSI of this host is less then the one in the list
	          newEntry["position"] = {x: HOST[3][0], y: HOST[3][1]};
		  coordArray = [HOST[3][0], HOST[3][1]]
		  found = true;
		  return;
		}
		if(found){
		  if(index+1) {
		    const next = index+1 
		    HOST[3] = [next[3][0],next[3][1]];
		    nodes[HOST[2]]["position"] = {x: next[3][0], y: next[3][1]};
		  } else {
		    HOST[3] = [xPos, yPos];
		    nodes[HOST[2]]["position"] = {x: next[3][0], y: next[3][1]};
		  }
		}
	      })
	      newEntry["position"] = !found ? {x: coordArray[0], y: coordArray[1]} : newEntry["position"]; */
	      newEntry["position"] = {x: coordArray[0], y: coordArray[1]};
	      hostList.current[hostNameID] = [HOSTArray[0], HOSTArray[5], mainIncrement, coordArray];
	      apList.current[apNameID][0]++;
	      nodes[mainIncrement] = newEntry;
	      mainIncrement++;
	    }
	  })
	  xIncrement = 0;
	  json.BTS.forEach(BT => {
	    const BTCompany = BT[2]; // BT.COMPANY
	    const BTID = `BT${BT[0]}`
	    if(!btList.current[BTCompany]){
	      btList.current[BTCompany] = [0, xIncrement * 500]
	      xIncrement++;
	    }
	    if(btList.current[BTCompany][0] < 500){
	      let newEntry = {};
	      const xPos = btList.current[BTCompany][0]%2==0 ? btList.current[BTCompany][1]-100 : btList.current[BTCompany][1]+80; //Alternate columns
	      const yPos = -300+(Math.floor(btList.current[BTCompany][0]/2)*-280); 
	      newEntry["id"] = BTID;
	      newEntry["type"] = "bt-node";
	      newEntry["position"] = {x: xPos, y: yPos};
	      newEntry["data"] = {label: [BT[0], BT[1], BT[2], BT[3], BT[4], BT[5], BT[6], BT[7]]};
	      btList.current[BTCompany][0]++;
	      nodes[mainIncrement] = newEntry;
	      mainIncrement++;
	    }
	  })
	  setNodes(nodes);
	}
      } catch (err) {
        alert(`Couldnt't fetch database information: ${err.message}`);
      }
    }
    updateNodes();
  }, []);
  return (
    <ReactFlow
      colorMode="dark"
      nodes={nodes}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      maxZoom={2}
      minZoom={0.05}
      default={0.1}
      fitView
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
