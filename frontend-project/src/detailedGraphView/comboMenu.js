import expandIcon from './icons/network.png';
import focusIcon from './icons/focus.png';

window.removeCombos = function() {
    const comboIds = getSelectedCombos();
    comboIds.forEach(comboId => {
        const combo = window.parent.graph.findById(comboId);
        const comboNodes = combo.getNodes();
        
        // uncombo and unselect the nodes
        comboNodes.forEach((node) => {
        window.parent.graph.updateItem(node, {
            comboId: null
        });
        window.parent.graph.setItemState(node, 'selected', false);
        });
        const graph = window.parent.graph;
        const comboNodeIds = new Set(comboNodes.map(n => n.getModel().id));
        const newEdges = graph.save().edges.filter(e =>
            comboNodeIds.has(e.source) ||
            comboNodeIds.has(e.target)).map(e => structuredClone(e));
        const nodesToReadd = [...comboNodeIds].map(nodeId => {
            return structuredClone(graph.findById(nodeId).getModel());
        });
        // then remove the combo
        window.parent.graph.removeItem(comboId);
        nodesToReadd.forEach(nodeToReadd => {
            graph.addItem('node', {...nodeToReadd, comboId: undefined});
        });
        newEdges.forEach(edge => graph.addItem('edge', edge));
    });
    
  };

window.selectNodesInCombos = function() {
  const comboIds = getSelectedCombos();
  comboIds.forEach(comboId => {
    const combo = window.parent.graph.findById(comboId);
    const comboNodes = combo.getNodes();
    comboNodes.forEach((node) => {
        window.parent.graph.setItemState(node, 'selected', true);
    });
  });
};

const menuItems = [
  { text: 'Ungroup', icon: expandIcon, action: window.removeCombos },
  { text: 'Select Nodes', icon: focusIcon, action: window.selectNodesInCombos },
];

function getSelectedCombos() {
    const graph = window.parent.graph;
    const allCombos = graph.getCombos();
    const selectedCombos = allCombos.filter(combo => {
      return combo.hasState('selected');
    });
  
    return selectedCombos.map(combo => combo.getID());
}

export function showContextMenu(x, y, combo) {
    // Create context menu if it doesn't exist
    let contextMenu = document.getElementById('contextMenuCombo');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenuCombo';
        contextMenu.classList.add("g6-component-contextmenu");
        document.body.appendChild(contextMenu);
    }
    contextMenu.innerHTML = ``;
    if (getSelectedCombos().length == 0) {
    contextMenu.innerHTML = `To apply combo operations,<br> first select a combo.`
    } else {
        menuItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<img src="${item.icon}" alt="${item.text} logo">${item.text}`;
            listItem.addEventListener('click', item.action);
            contextMenu.appendChild(listItem);
        });
        // Position the context menu
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        // // Show the context menu
        contextMenu.style.display = 'block';
        contextMenu.style.position = 'absolute';
    }
}