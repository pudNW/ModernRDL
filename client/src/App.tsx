import React, { useState, useRef, useEffect } from 'react';
import Toolbox, { type Tool } from './components/Toolbox';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
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
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

function App() {
  const [items, setItems] = useState<CanvasItem[]>([
    {
      id: 'rect1',
      x: 150,
      y: 150,
      width: 150,
      height: 100,
      fill: '#007bff',
      cornerRadius: 10,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const handleDeleteItem = () => {
    if (!selectedId) return;

    const newItems = items.filter(item => item.id !== selectedId);
    setItems(newItems);

    setSelectedId(null);
  };

  const handlekeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      handleDeleteItem();
    }
  };

  const appLayoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    appLayoutRef.current?.focus();
  }, []);

  const handleItemChange = (updatedItem: CanvasItem) => {
    const newItems = items.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(newItems);
  };

  const selectedItem = items.find(item => item.id === selectedId);

  const handleTransformEnd = (id: string, newAttrs: Partial<CanvasItem>) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, ...newAttrs };
      }
      return item;
    });
    setItems(newItems);
  };

  return (
    <div
      ref={appLayoutRef}
      className="app-layout"
      tabIndex={0}
      onKeyDown={handlekeyDown}
    >
      <Toolbox onDragStart={handleDragStart} />
      <CanvasArea
        items={items}
        stageRef={stageRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onItemDragEnd={handleItemDragEnd}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onTransformEnd={handleTransformEnd}
      />
      <PropertiesPanel
        item={selectedItem}
        onItemChange={handleItemChange} 
      />
    </div>
  );
}

export default App;