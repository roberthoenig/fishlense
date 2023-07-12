import {graphNodes, select_by_rect, update_selected_nodes, is_querying} from "./graph";

// @ts-ignore
const parentWindow: Window & typeof globalThis = window.parent;

const right_panel = parentWindow.document.getElementById('right_panel') as HTMLDivElement;
const left_panel = parentWindow.document.getElementById('left_panel') as HTMLDivElement;
const overview_button = parentWindow.document.getElementById('overview_button') as HTMLDivElement;
const detailed_button = parentWindow.document.getElementById('detailed_button') as HTMLDivElement;
const tip_button = parentWindow.document.getElementById('user_tip') as HTMLDivElement;

function check_overview_status() {
    // @ts-ignore
    overview_button.style.visibility = is_querying ? 'hidden' : 'visible';
    // detailed_button.style.visibility = is_querying ? 'hidden' : 'visible';
}

setInterval(check_overview_status, 100);

function set_selected_nodes(uids: string[]) {
    // @ts-ignore
    parentWindow.selected_nodes = uids;
    //@ts-ignore
    parentWindow.detailedView_selected_nodes = uids.map(uid => parseInt(uid.slice(1),10));
    update_selected_nodes(graphNodes.filter((n) => uids.indexOf(n.id) > -1));
}

function sync1() {
    // @ts-ignore
    right_panel.style.pointerEvents = 'none';  /* Disables pointer events like clicking */
    // @ts-ignore
    right_panel.style.opacity = 0.5;
    // @ts-ignore
    left_panel.style.pointerEvents = 'none';  /* Disables pointer events like clicking */
    // @ts-ignore
    left_panel.style.opacity = 0.5;
    // @ts-ignore
    let data = parentWindow.graph.save();
    let nodes = data.nodes;
    let uids: string[] = [];
    nodes.forEach((n: any) => {
        uids.push('U' + n.id.split('|')[1].padStart(4, '0'));
    })
    set_selected_nodes(uids);
}

overview_button.addEventListener('click', () =>  sync1());

function sync1_tip() {
    // @ts-ignore
    right_panel.style.pointerEvents = 'none';  /* Disables pointer events like clicking */
    // @ts-ignore
    right_panel.style.opacity = 0.5;
    // @ts-ignore
    left_panel.style.pointerEvents = 'none';  /* Disables pointer events like clicking */
    // @ts-ignore
    left_panel.style.opacity = 0.5;
    // @ts-ignore
}

tip_button.addEventListener('click', () =>  sync1_tip());

// Define canvas and context
const canvas = document.getElementById("overlay") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
let selected_nodes: any = [];


// Define variables
let isDrawing = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

// Add event listeners
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);

// Handle mouse down event
function handleMouseDown(event: MouseEvent) {
    isDrawing = true;
    startX = event.clientX - canvas.offsetLeft;
    startY = event.clientY - canvas.offsetTop;
}

// Handle mouse move event
function handleMouseMove(event: MouseEvent) {
    if (!isDrawing) {
        return;
    }

    endX = event.clientX - canvas.offsetLeft;
    endY = event.clientY - canvas.offsetTop;

    // Clear canvas
    // @ts-ignore
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rectangle
    // @ts-ignore
    ctx.strokeStyle = '#1f77b4ff';
    // ctx.lineWidth = 2;
    // @ts-ignore
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
}

// Handle mouse up event
function handleMouseUp(event: MouseEvent) {
    endX = event.clientX - canvas.offsetLeft;
    endY = event.clientY - canvas.offsetTop;

    isDrawing = false;
    // @ts-ignore
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Perform any actions you want with the selected region
    selected_nodes = select_by_rect(Math.min(startX, endX), Math.min(startY, endY), Math.max(startX, endX), Math.max(startY, endY));
    let uids: string[] = [];
    selected_nodes.forEach((n: any) => {
        uids.push(n.id);
    })
    set_selected_nodes(uids);
}
