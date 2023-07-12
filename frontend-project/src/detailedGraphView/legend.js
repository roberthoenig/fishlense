import {typeToStroke} from './data.js'

const typeConfigs = {
    'type1': {
        type: 'circle',
        style: {
          width: 20,
          lineWidth: 1,
          stroke: '#000'
        }
      },
    'ownership': {
      type: 'line',
      style: {
        width: 30,
        lineWidth: 10,
        stroke: typeToStroke['ownership'],
      }
    },
    'partnership': {
        type: 'line',
        style: {
          width: 30,
          lineWidth: 10,
          stroke: typeToStroke['partnership'],
        }
    },
    'family_relationship': {
        type: 'line',
        style: {
          width: 30,
          lineWidth: 10,
          stroke: typeToStroke['family_relationship'],
        }
    },
    'membership': {
        type: 'line',
        style: {
          width: 30,
          lineWidth: 10,
          stroke: typeToStroke['membership'],
        }
    }
  }
const legendData = {
    nodes: [{
      id: 'type1',
      label: 'Node',
      order: 4,
      ...typeConfigs['type1']
    }],
    edges: [{
      id: 'ownership',
      label: 'Ownership',
      order: 2,
      ...typeConfigs['ownership']
    }, {
      id: 'partnership',
      label: 'Partnership',
      ...typeConfigs['partnership']
    }, {
      id: 'family_relationship',
      label: 'Family relationship',
      ...typeConfigs['family_relationship']
    }, {
      id: 'membership',
      label: 'Membership',
      ...typeConfigs['membership']
    }]
  }

export const legend = new G6.Legend({
    data: legendData,
    align: 'center',
    layout: 'horizontal', // vertical
    position: 'top-right',
    vertiSep: 12,
    horiSep: 24,
    offsetY: 24,
    offsetX: -44,
    padding: [4, 16, 8, 16],
    containerStyle: {
      fill: '#ccc',
      lineWidth: 1
    },
    title: ' ',
    titleConfig: {
      position: 'center',
      offsetX: 0,
      offsetY: -15,
    },
    filter: {
      enable: true,
      multiple: true,
      trigger: 'click',
      graphActiveState: 'selected',
      graphInactiveState: 'inactiveByLegend',
      filterFunctions: {
        'type1': (d) => {
          if (d.legendType === 'type1') return true;
          return false
        },
        'type2': (d) => {
          if (d.legendType === 'type2') return true;
          return false
        },
        'type3': (d) => {
          if (d.legendType === 'type3') return true;
          return false
        },
        'ownership': (d) => {
          if (d.legendType === 'ownership') return true;
          return false
        },
        'partnership': (d) => {
          if (d.legendType === 'partnership') return true;
          return false
        },
        'family_relationship': (d) => {
          if (d.legendType === 'family_relationship') return true;
          return false
        },
        'membership': (d) => {
          if (d.legendType === 'membership') return true;
          return false
        },
      }
    }
  });