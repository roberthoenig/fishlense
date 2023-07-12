import { scaleLinear } from 'd3-scale';

import d from '../data/MC1_preprocessed.json'
import suspicion_scores from '../data/suspicion_scores.json';

import {FISHEYE_ID, targetIDs} from './ids.js';
import nodeIconUnknown from './icons/unknown.png';
import nodeIconVessel from './icons/vessel.png';
import nodeIconPoliticalOrganization from './icons/political_organization.png';
import nodeIconPerson from './icons/person.png';
import nodeIconOrganization from './icons/organization.png';
import nodeIconMovement from './icons/movement.png';
import nodeIconLocation from './icons/location.png';
import nodeIconFisheye from './icons/fisheye.png';
import nodeIconEvent from './icons/event.png';
import nodeIconCompany from './icons/company.png';
import nodeIconTip from './icons/rhombus.png';

export const data = d;

export const idToNode = Object.fromEntries( data.nodes.map( x => [x.id, x]) );

export const iconMapping = {
  'unknown': nodeIconUnknown,
  'vessel': nodeIconVessel,
  'political_organization': nodeIconPoliticalOrganization,
  'person': nodeIconPerson,
  'organization': nodeIconOrganization,
  'movement': nodeIconMovement,
  'location': nodeIconLocation,
  'fisheye': nodeIconFisheye,
  'event': nodeIconEvent,
  'company': nodeIconCompany,
  'tip': nodeIconTip,
  // add other icon mappings as needed
};

window.parent.iconMapping = iconMapping;

export const typeToStroke = {
    'ownership': '#56B4E9',
    'partnership': '#009E73',
    'family_relationship': '#A05213',
    'membership': '#0072B2',
}

export function augmentNode(node) {
    suspicion_score = suspicion_scores[node.id];
    // Create a custom color scale using d3-scale
    const colorScale = scaleLinear()
    .domain([0, 1])
    .range(['white', 'red']);
    let type = node.type ?? "unknown"
    if (node.id == FISHEYE_ID) {
        type = "fisheye"
    }
    const fill = colorScale(suspicion_score);
    let shape = 'circle';
    let size = 30;
    if (targetIDs.includes(node.id)) {
        shape = 'diamond'
        size = 50
    } else if (node.id == FISHEYE_ID) {
        shape = 'star'
    }
    const augmentedNode = {
        ...node,
        typeSemantic: node.type,
        size: size,
        style: {
            fill: fill,
        },
        type: shape,
        icon: {
            show: true,
            width: 22,
            height: 22,
            img: iconMapping[type]
        },
        stateStyles: {
            selected: {
              fill: fill, 
              lineWidth: 3, 
              stroke: '#111111'
            },
        },
    }
    return augmentedNode;
}

export function augmentEdge(edge) {
    let augmentedEdge = {
        source: edge.source,
        target: edge.target,
        key: edge.key,
        customId: edge.customId,
        typeSemantic: edge.type,
        // label: edge.type[0].toUpperCase(),
        // labelCfg: {
        //     style: {
        //         fill: "#fff"
        //     }
        // },
        style: {
            lineWidth: edge.weight * 1.5,
            stroke: typeToStroke[edge.type],
        },
        type: 'quadratic',
        legendType: edge.type,
    }
    if (edge.type === 'ownership' || edge.type === 'membership') {
        augmentedEdge.style.endArrow = {
            path: 'M 0,0 L 6,3, M 0,0 L 6,-3'
        }
    }
    return augmentedEdge;
}

export function getNodeData(nodeId) {
  const newData = new Object();
  newData.nodes = data.nodes.filter(node => node.id === nodeId);
  newData.nodes[0].x = 0;
  newData.nodes[0].y = 0;
  newData.nodes[0] = augmentNode(newData.nodes[0], )
  newData.edges = [];
  return newData;
}

export function getNodeDatas(nodeIds) {
  const newData = new Object();
  newData.nodes = data.nodes.filter(node => nodeIds.includes(node.id));
  for (var i = 0; i < newData.nodes.length; i++) { 
    newData.nodes[i].x = i * 100;
    newData.nodes[i].y = i * 100;
    newData.nodes[i] = augmentNode(newData.nodes[i], )
  }
  newData.edges = [];
  console.log("newData", newData);
  return newData;
}

function nodeIndexesToData(nodeIds) {
  nodeIds = new Set(nodeIds);
  const newNodes =   data.nodes.filter(node => nodeIds.has(parseInt(node.id.split("|")[1]))).map(augmentNode);
  const newData = {
    nodes: newNodes,
    edges: [],
  };
  return newData;
}
window.parent.nodeIndexesToData = nodeIndexesToData;

export function getAllData() {
  const newData = new Object();
  newData.nodes = data.nodes;
  newData.nodes[0].x = 0;
  newData.nodes[0].y = 0;
  newData.nodes[0] = augmentNode(newData.nodes[0], )
  newData.edges = [];
  return newData;
}

window.parent.augmentNode = augmentNode;
window.parent.augmentEdge = augmentEdge;
window.parent.suspicion_scores = suspicion_scores;