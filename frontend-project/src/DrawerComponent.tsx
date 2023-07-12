// @ts-nocheck 
import React, { useEffect, useState } from 'react';
import { Drawer, Button, Tooltip, Alert, Box } from '@mui/material';
import { Matrix } from './Matrix';

let pressedOnce = false;
var orderedIds = null;

const DrawerComponent = ({ drawerState, toggleDrawer }) => {
  const [matrix, setMatrix] = useState(null);

  const handleUpdateMatrix = async () => {
    pressedOnce = true;
    const nodeIds = window.graph.findAllByState('node', 'selected').map(node => node.getModel().id);
    if (window.graph === undefined) {
      setMatrix(undefined);
    } else if (nodeIds.length < 2) {
      setMatrix("too few nodes");
    } else if (nodeIds.length > 100) {
      setMatrix("too many nodes");
    } else {
      const [adjMat, orderedIdsRetr] = await createAdjacencyMatrix(nodeIds);
      orderedIds = JSON.parse(JSON.stringify(orderedIdsRetr));
      setMatrix(JSON.parse(JSON.stringify(adjMat)));
    }
  }

  const list = (anchor:any) => (
    <div>
       <Alert severity="info">Click "Visualize Connectivity" to display an intelligently ordered adjacency matrix of your selected nodes.</Alert>
      <Button onClick={handleUpdateMatrix}>Visualize Connectivity</Button>
      {renderContent()}
    </div>
  );

  const renderContent = () => {
    if (matrix === undefined || pressedOnce == false) {
      return "";
    } else if (matrix === "too few nodes") {
      return <Alert severity="warning">Please select at least 2 nodes.</Alert>;
    } else if (matrix === "too many nodes") {
      return <Alert severity="warning">Please select at most 100 nodes.</Alert>;
    } else {
      try {
        const nodeIds = orderedIds.map(id => window.graph.findById(id)).map(node => ({id: node.getModel().id, img: node.getModel().icon.img, color: node.getModel().style.fill}));
        return renderMatrix(nodeIds);
      } catch(err) {
        return undefined;
      }
    }
  };

  const renderMatrix = (nodeIds:any[]) => {
    return (
      <Matrix
        matrix={matrix}
        cellSize={20}
        cellSpacing={2}
        labels={nodeIds.map(({id, img, color}) => (
          <Tooltip title={id}>
            <img
              src={img}
              alt={id}
              style={{ width: `${20}px`, height: `${20}px`, maxWidth: 'none', backgroundColor: color}} // change these values as needed
            />
          </Tooltip>
        ))}
      />
    );
  };

  return (
    <Box anchor={"right"}>
      {list("right")}
    </Box>
  );
};

export default DrawerComponent;

async function reorderNodeIds(nodeIds) {
  const url = 'http://' + location.hostname + ':8000/api/v1/compute_node_info';
  try {
    const postData = { nodeIds: nodeIds }; // replace with your actual node ids
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData ),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data["reordering"];
  } catch (error) {
    console.error('Error:', error);
  }
}

async function createAdjacencyMatrix(nodeIds) {
  nodeIds = await reorderNodeIds(nodeIds);
  data = window.data;
  // Create a node-to-index mapping
  const idToIndex = new Map();
  nodeIds.forEach((id, index) => {
    idToIndex.set(id, index);
  });

  // Create an empty adjacency matrix
  const size = nodeIds.length;
  const matrix = new Array(size);
  for (let i = 0; i < size; i++) {
    matrix[i] = new Array(size).fill(0);
  }

  // Fill in the adjacency matrix using the edges
  data.edges.filter((edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)).forEach((edge) => {
    const sourceIndex = idToIndex.get(edge.source);
    const targetIndex = idToIndex.get(edge.target);
    matrix[sourceIndex][targetIndex] = {customId: edge.customId, weight: edge.weight};
  });

  return [matrix, nodeIds];
}