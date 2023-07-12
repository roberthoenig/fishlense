import $ from 'jquery';
import { iconMapping, typeToStroke } from './data';
import { targetIDs } from './ids'

// Replace the original legendData object with a simplified one
const legendData = [
  {
    type: 'node',
    id: 'tip',
    label: 'Tip',
    filter: d => targetIDs.includes(d.id),
  },
  {
    type: 'node',
    id: 'unknown',
    label: 'Unknown',
    filter: d => d.typeSemantic === undefined,
  },
  {
    type: 'node',
    id: 'vessel',
    label: 'Vessel',
    filter: d => d.typeSemantic === "vessel",
  },
  {
    type: 'node',
    id: 'political_organization',
    label: 'Political Organization',
    filter: d => d.typeSemantic === "political_organization",
  },
  {
    type: 'node',
    id: 'person',
    label: 'Person',
    filter: d => d.typeSemantic === "person",
  },
  {
    type: 'node',
    id: 'movement',
    label: 'Movement',
    filter: d => d.typeSemantic === "movement",
  },
  {
    type: 'node',
    id: 'location',
    label: 'Location',
    filter: d => d.typeSemantic === "location",
  },
  {
    type: 'node',
    id: 'fisheye',
    label: 'Fisheye',
    filter: d => d.typeSemantic === "fisheye",
  },
  {
    type: 'node',
    id: 'event',
    label: 'Event',
    filter: d => d.typeSemantic === "event",
  },
  {
    type: 'node',
    id: 'company',
    label: 'Company',
    filter: d => d.typeSemantic === "company",
  },
  {
    type: 'node',
    id: 'organization',
    label: 'Organization',
    filter: d => d.typeSemantic === "organization",
  },
  {
    id: 'ownership',
    label: 'Owner',
    filter: d => d.typeSemantic === 'ownership',
  },
  {
    id: 'partnership',
    label: 'Partner',
    filter: d => d.typeSemantic === 'partnership',
  },
  {
    id: 'family_relationship',
    label: 'Family',
    filter: d => d.typeSemantic === 'family_relationship',
  },
  {
    id: 'membership',
    label: 'Member',
    filter: d => d.typeSemantic === 'membership',
  },
]
export function createLegend() {
    const $legendContainer = $('<div>').attr('id', 'custom-legend');
    // Append the legend container to the body or any other container
    $('body').append($legendContainer);
    const $nodesSection = $('<div>').addClass('legend-section').append('<h3 class="title">Nodes</h3>');
    const $edgesSection = $('<div>').addClass('legend-section').append('<h3 class="title">Edges</h3>');
    // Add sections to the legend container
    $legendContainer.append($nodesSection, $edgesSection);
    // Create legend items
    for (const item of legendData) {
        let $item = undefined;
        if (item.type === 'node') {
            // Create node with image
            $item = $(`
                <button class="legend-item">
                <img src="${iconMapping[item.id]}" alt="${item.label}" />
                <span>${item.label}</span>
                </button>
            `);
            $nodesSection.append($item);
        } else {
            // Create edge with line
            $item = $(`
                <button class="legend-item">
                <div class="edge-line" style="background-color: ${typeToStroke[item.id]};"></div>
                <span>${item.label}</span>
                </button>
            `);
            $edgesSection.append($item);
        }

        // Add click handler to toggle active state
        $item.on('click', function() {
            $(this).toggleClass('active');
            const active = $(this).hasClass('active');
            const graph = window.parent.graph;
            // Apply filter to nodes
            graph.getNodes().forEach(node => {
            if (item.filter(node.getModel())) {
                // graph.setItemState
                node.setState('selected', active);
            }
            });
            // Apply filter to edges
            graph.getEdges().forEach(edge => {
                if (item.filter(edge.getModel())) {
                    edge.setState('selected', active);
                }
            });
        });
    }
    // Create gradient bar for 'Nodes' section
    const $gradientBar = $(`
    <div class="gradient-bar">
      <div class="gradient"></div>
      <div class="labels">
        <span class="gradient-bar-label">Illegal?</span>
        <span class="gradient-bar-label">Illegal!</span>
      </div>
    </div>
  `);

    $nodesSection.append($gradientBar);
}