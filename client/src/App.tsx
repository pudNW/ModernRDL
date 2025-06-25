import React, { useRef, useEffect } from 'react';
import { useHistory } from './hooks/useHistory';
import Toolbox, { type Tool } from './components/Toolbox';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
import './App.css';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

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

interface AppState {
  items: CanvasItem[];
  selectedId: string | null;
}

const initialState: AppState = {
  items: [
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
  ],
  selectedId: null,
};

function App() {
  const { state, setState, undo, redo } = useHistory<AppState>(initialState);
  const { items, selectedId } = state;

  const draggedItemRef = useRef<Tool | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const appLayoutRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (tool: Tool) => {
    draggedItemRef.current = tool;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!draggedItemRef.current || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const position = stageRef.current.getPointerPosition();

    if (!position) return;

    const newItem: CanvasItem = {
      id: `item_${Date.now()}`,
      x: position.x,
      y: position.y,
      width: 150,
      height: 100,
      fill: '#28a745',
      cornerRadius: 10,
    };

    setState({ ...state, items: [...items, newItem], selectedId: null });

    draggedItemRef.current = null;
  };

  const handleItemDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, x: e.target.x(), y: e.target.y() };
      }
      return item;
    });
    setState({ ...state, items: newItems });
  };

  const handleTransformEnd = (id: string, newAttrs: Partial<CanvasItem>) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, ...newAttrs };
      }
      return item;
    });
    setState({ ...state, items: newItems });
  };

  const handleSelectItem = (id: string | null) => {
    setState({ ...state, selectedId: id }, true);
  };

  const handleDeleteItem = () => {
    if (!selectedId) return;
    const newItems = items.filter((item) => item.id !== selectedId);
    setState({ items: newItems, selectedId: null });
  };

  const handlekeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      handleDeleteItem();
      return;
    }
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key === 'z') {
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
    if (isCtrlOrCmd && e.key === 'y') {
      redo();
    }
  };

  useEffect(() => {
    appLayoutRef.current?.focus();
  }, []);

  const selectedItem = items.find((item) => item.id === selectedId);

  const handleItemChange = (updatedItem: CanvasItem) => {
    const newItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    setState({ ...state, items: newItems });
  };

  return (
    <div ref={appLayoutRef} className="app-layout" tabIndex={0} onKeyDown={handlekeyDown}>
      <Toolbox onDragStart={handleDragStart} />
      <CanvasArea
        items={items}
        stageRef={stageRef}
        selectedId={selectedId}
        onSelect={handleSelectItem}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onItemDragEnd={handleItemDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      <PropertiesPanel item={selectedItem} onItemChange={handleItemChange} />
    </div>
  );
}

export default App;
