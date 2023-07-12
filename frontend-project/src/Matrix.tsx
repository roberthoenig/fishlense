// @ts-nocheck 
import React, { useState } from 'react';
import { Drawer, Button, Tooltip, Alert, Box } from '@mui/material';

import './Matrix.css'; // This is the css file you would add for styling

export 
function Matrix({ matrix, cellSize, cellSpacing, labels }) {
  // Convert weight (0 to 1) to grayscale (0 to 255)
  const weightToGrayscale = (weight) => {
    const grayscale = Math.floor((1 - weight) * 255);
    return `rgb(${grayscale}, ${grayscale}, ${grayscale})`;
  };

  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState(new Set());

  const handleMouseDown = (i, j, e) => {
    // Start selection
    setIsSelecting(true);
    setStartCell([i, j]);
    // If shift key is down, add the range of cells to the selected cells
    if (e.shiftKey) {
    } else {
      setSelectedCells(new Set([`${i}-${j}`]));
    }
  }

  const handleMouseUp = (i, j) => {
    setIsSelecting(false);
    handleRangeSelection(i, j);
  }

  const handleMouseEnter = (i, j) => {
    if (!isSelecting) return;
    handleRangeSelection(i, j);
  }

  const handleRangeSelection = (endI, endJ) => {
    if (startCell == undefined || startCell == null) {
        return;
    } 
    let [startI, startJ] = startCell;
    let newSelectedCells = new Set(selectedCells);
    // Select all cells in the rectangular area from startCell to (endI, endJ)
    for (let i = Math.min(startI, endI); i <= Math.max(startI, endI); i++) {
      for (let j = Math.min(startJ, endJ); j <= Math.max(startJ, endJ); j++) {
        newSelectedCells.add(`${i}-${j}`);
      }
    }
    setSelectedCells(newSelectedCells);
  }

  const logSelectedEdges = () => {
    if (matrix == undefined) {
      console.warn("matrix undefined! Not focusing graph to selection.");
      return;
    }
    let selectedEdgeIds = Array.from(selectedCells).map(cell => {
      let [i, j] = cell.split('-').map(Number);
      return matrix[i][j].customId;
    });
    const selectedEdges = window.data.edges.filter(edge => selectedEdgeIds.includes(edge.customId));
    const selectedNodes = window.data.nodes.filter(node => selectedEdges.some(edge => node.id===edge.source || node.id===edge.target));
    const newData = {
        nodes: selectedNodes.map(window.augmentNode),
        edges: selectedEdges.map(window.augmentEdge)
    }
    window.dataToRadial(newData);
  }

  return (
    <div className="matrix">
      <Tooltip title="Focus graph to selection.">
        <Button variant="contained" color="primary" onClick={logSelectedEdges}
                  style={{ marginBottom: '10px' }}
                  >
          Focus
        </Button>
      </Tooltip>
      <table cellSpacing={cellSpacing}>
        <thead>
          <tr>
            <th style={{ width: `${cellSize}px`, height: `${cellSize}px` }}></th>
            {labels.map((label, i) => (
              <th
                key={i} className="label-cell">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="label-cell">{labels[i]}</td>
              {row.map((cell, j) => (
                <td 
                  key={j} 
                  className={`matrix-cell ${selectedCells.has(`${i}-${j}`) ? 'selected' : ''}`}
                  style={{ 
                    width: `${cellSize}px`, 
                    height: `${cellSize}px`, 
                    backgroundColor: (cell.weight === undefined ? 'rgb(255, 255, 255)' : weightToGrayscale(cell.weight)),
                  }}
                  onMouseDown={e => handleMouseDown(i, j, e)}
                  onMouseUp={e => handleMouseUp(i, j)}
                  onMouseEnter={() => handleMouseEnter(i, j)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}