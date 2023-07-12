import {getNodeData, getNodeDatas} from './data.js';
import {menu} from './menu.js';
import {legend} from './legend.js';
import {tooltip} from './tooltip.js';
import {showContextMenu} from './comboMenu.js';
import {data, augmentEdge} from './data.js';
import {createLegend} from './newLegend.js';
import { targetIDs } from './ids.js';
import { radialExpansionAroundSelection } from './menu.js';

const graph = new G6.Graph({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
  fitCenter: true,
  fitView: true,
  fitViewPadding: [200, 200, 200, 200],
  modes: {
    default: ['drag-node', 'drag-canvas', 'zoom-canvas', 'brush-select', 'click-select', 'drag-combo'],
  },
//   animate: true,
  autoPaint: true,
  defaultNode: {
    size: 40,
    type: 'circle',
    style: {
      fill: '#9EC9FF',
      stroke: '#111111',
    },
    labelCfg: {
      style: {
        fill: '#000',
        fontSize: 12,
      },
      position: 'bottom',
    },
  },
  defaultEdge: {
    type: 'quadratic',
    style: {
      stroke: '#5B8FF9',
      lineWidth: 2,
    },
  },
  plugins: [menu, tooltip]
});

function setViewToNode(nodeId) {
  const nodeData = getNodeData(nodeId);
  graph.data(nodeData);
  graph.render();
  graph.destroyLayout();
  graph.getNodes().forEach(node => {node.setState('selected', true)});
  radialExpansionAroundSelection(graph);
  graph.getNodes().forEach(node => {node.setState('selected', false)});
  graph.fitView();
}
window.parent.setViewToNode = setViewToNode

function setViewToNodes(nodeIds) {
  const nodeData = getNodeDatas(nodeIds);
  console.log("nodeData", nodeData);
  graph.data(nodeData);
  graph.render();
  // graph.destroyLayout();
  // graph.getNodes().forEach(node => {node.setState('selected', true)});
  // graph.getNodes().forEach(node => {node.setState('selected', false)});
  graph.fitView();
}

function main() {
  setViewToNodes(targetIDs);

  window.parent.graph = graph;
  window.parent.saveView(1, `All tips.`, 
  'This view shows all tips.')
  window.parent.data = data;
  // window.parent.savedGraphs[0] = JSON.parse(JSON.stringify(graph.save()));
}

graph.on('combo:contextmenu', (evt) => {
  evt.preventDefault();
  evt.stopPropagation();
  
  // Get mouse position
  const { clientX, clientY } = evt.originalEvent;
  // Display context menu
  showContextMenu(clientX, clientY, evt.item);
});
document.addEventListener('click', () => {
  let contextMenu = document.getElementById('contextMenuCombo');
  if (contextMenu) {
    contextMenu.style.display = 'none';
  }
});

graph.on('node:mouseenter', (evt) => {
  const node = evt.item;
  const nodeId = node.getModel().id;


  const graphNodes = graph.getNodes();
  const graphIds = new Set(graphNodes.map(node => node.get('id')))
  const newEdges = data.edges.filter((edge) => 
      ((nodeId==edge.source) && graphIds.has(edge.target)) ||
      (nodeId==edge.target) && graphIds.has(edge.source));
  newEdges.forEach(edge => graph.addItem('edge', {
    ...augmentEdge(edge),
    customId: edge.customId + "_hover_" + nodeId,
    id: edge.customId + "_hover_" + nodeId
  }));
});

graph.on('node:mouseleave', (evt) => {
  const node = evt.item;
  if (!node.destroyed) {
    setTimeout(() => {  
      const nodeId = node.getModel().id;
      const edges = node.getEdges();
      const edgeIdsToRemove = edges.filter(edge => (typeof edge.getModel().customId=== 'string') && edge.getModel().customId.endsWith("_hover_"+nodeId)).map(edge => edge.getModel().id);
      edgeIdsToRemove.forEach(id => graph.removeItem(id));
    }, 20);
  }
});

createLegend();
main();
