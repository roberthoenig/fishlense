import {data, idToNode, augmentNode, augmentEdge} from './data.js';
import suspicion_scores from '../data/suspicion_scores.json';
import { Algorithm } from './g6.min.js';

import expandIcon from './icons/network.png';
import focusIcon from './icons/focus.png';
import clusterIcon from './icons/cluster.png';
// import branchIcon from './icons/branch.png';
import showEdgesIcon from './icons/show.png';
import hideEdgesIcon from './icons/hide.png';
import removeIcon from './icons/remove.png';
import groupIcon from './icons/group.png';
import illegalIcon from './icons/illegal.png';
import legalIcon from './icons/legal.png';

const menuItems = [
  { text: 'Expand', icon: expandIcon },
  { text: 'Focus', icon: focusIcon },
  { text: 'Cluster', icon: clusterIcon },
  // { text: 'Branch', icon: branchIcon },
  { text: 'Show Edges', icon: showEdgesIcon },
  { text: 'Hide Edges', icon: hideEdgesIcon },
  { text: 'Remove', icon: removeIcon },
  { text: 'Group', icon: groupIcon },
  { text: 'Label Illegal', icon: illegalIcon },
  { text: 'Label Legal', icon: legalIcon },
];

function dataToRadial(data) {
    const graph = window.parent.graph;
    graph.data({nodes: [], edges: []});
    graph.render();
    graph.destroyLayout();
    let connectedNodes = new Set();
    data.nodes.forEach((node) => {
      connectedNodes.add(node.id);
    });
    const centerX = 0;
    const centerY = 0;
    const node_diam = graph.get("defaultNode").size;
    let radius = node_diam * connectedNodes.size * 0.2;
    radius = Math.max(radius, 55);
    const angleStep = (2 * Math.PI) / (connectedNodes.size);
    let counter = -1;
    connectedNodes = [...connectedNodes]
    
    connectedNodes.sort((a,b)=>suspicion_scores[a]-suspicion_scores[b]);
    connectedNodes.forEach((nodeId) => {
        const node = data.nodes.find((n) => n.id === nodeId);
        const angle = counter * angleStep - 0.5*Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        let newNodeData = {
            ...node,
            x, y,
        }
        graph.addItem('node', newNodeData);
        graph.setItemState(newNodeData.id, 'selected', true);
        counter--;
    });
    data.edges.forEach((edge) => {
      graph.addItem('edge', edge);
    });
    graph.fitView();
}
window.parent.dataToRadial = dataToRadial;

export function radialExpansionAroundSelection(graph) {
    const selectedNodes = graph.findAllByState('node', 'selected');
    if (selectedNodes.length == 0) {
        return;
    }
    const nodes = graph.getNodes();
    const nodeIds = new Set(nodes.map(node => node.get('id')));
    let connectedNodes = new Set();
    const connectedEdges = new Set();
    selectedNodes.forEach((node) => {
        data.edges.forEach((edge) => {
            let added = false
            if (edge.source === node.get('id') && !nodeIds.has(edge.target)) {
                connectedNodes.add(edge.target);
                added = true
            }
            if (edge.target === node.get('id') && !nodeIds.has(edge.source)) {
                connectedNodes.add(edge.source);
                added = true
            }
            if (added) {
                connectedEdges.add(edge)
            }
        });
    });
    const centerX = selectedNodes.reduce((acc, val) => acc + val.getModel().x, 0);
    const centerY = selectedNodes.reduce((acc, val) => acc + val.getModel().y, 0);
    window.parent.selectedNodes = selectedNodes;
    // calculate the radius of the circle based on the number of nodes
    const node_diam = graph.get("defaultNode").size
    let radius = node_diam * connectedNodes.size * 0.2;
    radius = Math.max(radius, 55);
    const angleStep = (2 * Math.PI) / (connectedNodes.size);
    let counter = -1;
    connectedNodes = [...connectedNodes]
    
    connectedNodes.sort((a,b)=>suspicion_scores[a]-suspicion_scores[b]);
    connectedNodes.forEach((nodeId) => {
        const node = data.nodes.find((n) => n.id === nodeId);
        const angle = counter * angleStep - 0.5*Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        let newNodeData = {
            ...node,
            x, y,
        }
        newNodeData = augmentNode(newNodeData);
        graph.addItem('node', newNodeData);
        graph.setItemState(newNodeData.id, 'selected', true);
        counter--;
    });
    // connectedEdges.forEach((edge) => {
    //   if (!graph.findById(edge.id)) {
    //     let newEdge = augmentEdge(edge)
    //     graph.addItem('edge', newEdge);
    //   }
    // });
    // graph.layout();
    // graph.refreshPositions();
    // graph.render();
}

function louvainOutputToGraphData(inputData) {
    let data = {
      combos: [],
      nodes: [],
      edges: [],
    };
  
    inputData.clusters.forEach((cluster) => {
      // Create a combo for each cluster
      data.combos.push({
        id: cluster.id,
        // label: `Cluster ${cluster.id}`, // or any other label you want
      });
  
      // Create nodes for each node in the cluster
      cluster.nodes.forEach((node) => {
        data.nodes.push({
          id: node.id,
          comboId: cluster.id,
          country: idToNode[node.id].country,
          type: idToNode[node.id].type
        });
      });
    });
  
    return data;
  }

let comboIdCtr = 0;
function findLouvainCommunitiesAndApplyForceClustering(graph) {
    const selectedNodes = graph.findAllByState('node', 'selected');
    const selectedNodeIds = selectedNodes.map(node => node.get('id'));
    const graphData = {
        nodes: data.nodes.filter(node => selectedNodeIds.includes(node.id)),
        edges: data.edges.filter(edge => selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)),
    }
    let louvainOutput = Algorithm.louvain(graphData);
    const newGraphData = louvainOutputToGraphData(louvainOutput);
    newGraphData.edges = graphData.edges.map(augmentEdge);
    newGraphData.nodes = newGraphData.nodes.map(augmentNode);
    const numClusteredNodes = newGraphData.nodes.length;
    const oldData = JSON.parse(JSON.stringify(graph.save()));
    graph.changeData(newGraphData);
    const newLayout = {
        type: 'comboCombined',
        center: [ 200, 200 ],     // The center of the graph by default
        outerLayout: new G6.Layout['circular']({
          type: 'circular',
          center: [200, 200], // The center of the graph by default
          startRadius: numClusteredNodes * 10,
          endRadius: numClusteredNodes * 10,
          workerEnabled: true
        }),
        onLayoutEnd: () => {
            graph.fitView();
            const clusterData = JSON.parse(JSON.stringify(graph.save()));
            const oldDataCpy = structuredClone(oldData);
            graph.destroyLayout();
            graph.fitView();
            graph.changeData(oldData);
            graph.fitView();
            selectedNodeIds.forEach(id => graph.setItemState(id, 'selected', true));
            clusterData.combos.forEach(combo => {
                const comboId = combo.id + comboIdCtr;
                const newCombo = graph.addItem('combo', {
                    id: comboId
                });
                graph.setItemState(newCombo, 'selected', true);
            });
            const clusterNodeIds = new Set(clusterData.nodes.map(n => n.id));
            const newEdges = oldDataCpy.edges.filter(e =>
                clusterNodeIds.has(e.source) ||
                clusterNodeIds.has(e.target)).map(e => structuredClone(e));
            clusterData.nodes.forEach(node => {
                const nodeToUpdate = structuredClone(graph.findById(node.id).getModel());
                graph.removeItem(node.id);
                graph.addItem('node', {...nodeToUpdate, x: node.x, y: node.y, comboId: node.comboId + comboIdCtr});
                graph.setItemState(node.id, 'selected', true);
            });
            newEdges.forEach(edge =>
                graph.addItem('edge', edge));
            graph.fitView();
            comboIdCtr += 1;
        }
    }
    graph.updateLayout(newLayout);
}

function addComboForSelection(graph) {
  // Create a new combo
  const comboId = `combo-${Math.random().toString(36).substr(2, 9)}`; // Create a unique id for the combo
  graph.addItem('combo', { id: comboId });

  // Get all selected nodes
  const selectedNodes = graph.findAllByState('node', 'selected');

  // For each selected node, remove it and re-add it with the new comboId
  selectedNodes.forEach(node => {
    const nodeData = structuredClone(node.getModel()); // Get node data
    graph.removeItem(node); // Remove node from graph
    nodeData.comboId = comboId; // Set the comboId property of the node data to the id of the new combo
    graph.addItem('node', nodeData); // Re-add node to graph
  });
}

function fillEdgesForSelection(graph) {
    const selectedNodes = graph.findAllByState('node', 'selected');
    const nodeIds = new Set(selectedNodes.map(node => node.get('id')));
    const existingEdgeIds = new Set(graph.getEdges().map(edge => edge.getModel().customId))
    const newEdges = data.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target) && !existingEdgeIds.has(edge.customId))
    newEdges.forEach(edge => graph.addItem('edge', augmentEdge(edge)));
}

function removeEdgesForSelection(graph) {
    const selectedNodes = graph.findAllByState('node', 'selected');
    const nodeIds = new Set(selectedNodes.map(node => node.get('id')));
    graph.getEdges().filter(edge => nodeIds.has(edge.getModel().source) && nodeIds.has(edge.getModel().target)).forEach(id => graph.removeItem(id));
}

function removeNodesForSelection(graph) {
    const selectedNodes = graph.findAllByState('node', 'selected');
    selectedNodes.forEach(node => graph.removeItem(node.get('id')));
}

function addEdgesForSelection(graph) {
    const selectedNodes = graph.findAllByState('node', 'selected');
    const nodeIds = new Set(selectedNodes.map(node => node.get('id')));
    const graphNodes = graph.getNodes();
    const graphIds = new Set(graphNodes.map(node => node.get('id')))
    const existingEdgeIds = new Set(graph.getEdges().map(edge => edge.getModel().customId))
    const newEdges = data.edges.filter((edge) => 
        ((nodeIds.has(edge.source) && graphIds.has(edge.target)) ||
        (nodeIds.has(edge.target) && graphIds.has(edge.source))) &&
        !existingEdgeIds.has(edge.customId));
    newEdges.forEach(edge => graph.addItem('edge', augmentEdge(edge)));
}

function filterNodesToSelection(graph) {
    const nodesToRemove = graph.getNodes().filter(node => !node.getStates().includes('selected'));
    nodesToRemove.forEach(node => graph.removeItem(node));
}

export const menu = new G6.Menu({
    offsetX: 10,
    offsetY: 20,
    itemTypes: ['node'],
    getContent(e, graph) {
      const outDiv = document.createElement('div');
      outDiv.setAttribute('id', 'contextMenu')
      if (graph.findAllByState('node', 'selected').length == 0) {
        outDiv.innerHTML = `To apply node operations,<br> first select some nodes.`
      } else {
        // outDiv.innerHTML = `<ul id="contextMenu">
        // </ul>`
        menuItems.forEach(item => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<img src="${item.icon}" alt="${item.text} logo">${item.text}`;
          outDiv.appendChild(listItem);
        });
      }
      return outDiv
    },
    handleMenuClick(target, item, _) {
      const graph = menu.get("graph");
      function isType(str) {
        return target.innerHTML.includes(str) || (target.alt != undefined && target.alt.includes(str))
      }
      if(isType('Expand')) {
        radialExpansionAroundSelection(graph);
        graph.fitView();
      } else if (isType('Focus')) {
        filterNodesToSelection(graph);
        graph.fitView();
      } else if (isType('Cluster')) {
        findLouvainCommunitiesAndApplyForceClustering(graph);
        graph.fitView();
      } else if (isType('Show Edges')) {
        fillEdgesForSelection(graph);
      } else if (isType('Hide Edges')) {
        removeEdgesForSelection(graph);
      } else if (isType('Remove')) {
        removeNodesForSelection(graph);
      } else if (isType('Branch')) {
        addEdgesForSelection(graph);
      } else if (isType('Group')) {
        addComboForSelection(graph);
        graph.fitView();
      } else if (isType('Label Illegal')) {
        const newIllegalIds = graph.findAllByState('node', 'selected').map(node => node.get('id'));
        window.parent.setIllegalIds(ids => [...ids, ...newIllegalIds]);
      } else if (isType('Label Legal')) {
        const newLegalIds = graph.findAllByState('node', 'selected').map(node => node.get('id'));
        window.parent.setIllegalIds(ids => ids.filter(id => !newLegalIds.includes(id)));
      }
    },
  });