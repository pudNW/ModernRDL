import React, { useState, useRef } from 'react';
import Toolbox, { type Tool } from './components/Toolbox';
import CanvasArea from './components/CanvasArea';
import './App.css';
import type { KonvaEventObject } from 'konva/lib/Node';

export interface CanvasItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  cornerRadius?: number;
}

function App() {
  const [items, setItems] = useState<CanvasItem[]>([
    {
      id: 'rect1',
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      fill: '#007bff',
      cornerRadius: 10,
    },
  ]);

  const draggedItemRef = useRef<Tool | null>(null);
  const stageRef = useRef<any>(null);

  const handleDragStart = (tool: Tool) => {
    draggedItemRef.current = tool;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!draggedItemRef.current || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const position = stageRef.current.getPointerPosition();

    const newItem: CanvasItem = {
      id: `item_${Date.now()}`,
      x: position.x,
      y: position.y,
      width: 150,
      height: 100,
      fill: '#28a745',
      cornerRadius: 10,
    };

    setItems((prevItems) => [...prevItems, newItem])

    draggedItemRef.current = null;
  };

  const handleItemDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, x: e.target.x(), y: e.target.y() };
      }
      return item;
    });
    setItems(newItems);
  };

  return (
    <div className="app-layout">
      <Toolbox onDragStart={handleDragStart} />
      <CanvasArea
        items={items}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onItemDragEnd={handleItemDragEnd}
        stageRef={stageRef}
      />
    </div>
  );
}

export default App;