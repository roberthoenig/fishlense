import {getAllData} from '../detailedGraphView/data'

function change_panel() {
    const right_panel = window.parent.document.getElementById('right_panel');
    const left_panel = window.parent.document.getElementById('left_panel');
    right_panel.style.pointerEvents = 'all';  /* Disables pointer events like clicking */
    // @ts-ignore
    right_panel.style.opacity = 1.0;
    // @ts-ignore
    left_panel.style.pointerEvents = 'all';  /* Disables pointer events like clicking */
    // @ts-ignore
    left_panel.style.opacity = 1.0;
}

export function sync0() {
    // @ts-ignore
    var all_data = getAllData();
    var selected_nodes = window.parent.selected_nodes;
    var nodes = [];
    for (let i = 0; i < all_data.nodes.length; ++i) {
        for (let j = 0; j < selected_nodes.length; ++j) {
            if (parseInt(all_data.nodes[i].id.split('|')[1]) === parseInt(selected_nodes[j].substring(1))) {
                nodes.push(all_data.nodes[i]);
                break;
            }
        }
    }
    all_data.nodes = nodes;
    window.parent.dataToRadial(window.parent.nodeIndexesToData(window.parent.detailedView_selected_nodes));
}

window.parent.document.getElementById('detailed_button').addEventListener('click', () =>  change_panel());
document.getElementById('sync0').addEventListener('click', () =>  sync0());
