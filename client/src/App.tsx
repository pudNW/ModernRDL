import React, { useRef, useEffect } from 'react';
import { useHistory } from './hooks/useHistory';
import Toolbox, { type Tool } from './components/Toolbox';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
import TextEditor from './components/TextEditor';
import TopBar from './components/TopBar';
import './App.css';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

export interface CanvasItemBase {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  section: 'header' | 'body' | 'footer';
}

export interface TextboxItem extends CanvasItemBase {
  type: 'textbox';
  width: number;
  height: number;
  fill: string;
  cornerRadius?: number;
  scaleX?: number;
  scaleY?: number;
  text?: string;
}

export interface TableItem extends CanvasItemBase {
  type: 'table';
  width: number;
  height: number;
  rowCount: number;
  columnCount: number;
  columnWidths: number[];
  rowHeights: number[];
  tableData: string[][];
}

export type CanvasItem = TextboxItem | TableItem;

export interface PageSettings {
  width: number;
  height: number;
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  headerHeight: number;
  footerHeight: number;
}

interface AppState {
  items: CanvasItem[];
  selectedId: string | null;
  editingItemId: string | null;
  page: PageSettings;
}

const PAGE_DIMENSIONS = {
  A4: { width: 794, height: 1123 },
  Letter: { width: 816, height: 1056 },
};

const initialState: AppState = {
  items: [
    {
      id: 'rect1',
      type: 'textbox',
      x: 150,
      y: 150,
      width: 150,
      height: 100,
      fill: '#007bff',
      cornerRadius: 10,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      text: 'Double-click to edit',
      section: 'body',
    },
  ],
  selectedId: null,
  editingItemId: null,
  page: {
    format: 'A4',
    orientation: 'portrait',
    width: PAGE_DIMENSIONS.A4.width,
    height: PAGE_DIMENSIONS.A4.height,
    headerHeight: 0,
    footerHeight: 0,
  },
};

function App() {
  const { state, setState, undo, redo } = useHistory<AppState>(initialState);
  const { items, selectedId, editingItemId, page } = state;

  const draggedItemRef = useRef<Tool | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const appLayoutRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (tool: Tool) => {
    draggedItemRef.current = tool;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const tool = draggedItemRef.current;
    if (!tool || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const position = stageRef.current.getPointerPosition();
    if (!position) return;

    let newItem: CanvasItem;

    if (tool.id === 'table') {
      // Create a default table item.
      const rowCount = 3;
      const columnCount = 3;
      const defaultColWidth = 100;
      const defaultRowHeight = 30;
      newItem = {
        id: `item_${Date.now()}`,
        type: 'table',
        x: position.x,
        y: position.y,
        width: defaultColWidth * columnCount,
        height: defaultRowHeight * rowCount,
        rowCount: rowCount,
        columnCount: columnCount,
        columnWidths: Array(columnCount).fill(defaultColWidth),
        rowHeights: Array(rowCount).fill(defaultRowHeight),
        tableData: Array(rowCount)
          .fill(null)
          .map(() => Array(columnCount).fill('Cell')),
        section: 'body',
      };
    } else {
      // Create a default textbox item.
      newItem = {
        id: `item_${Date.now()}`,
        type: 'textbox',
        x: position.x,
        y: position.y,
        width: 150,
        height: 100,
        cornerRadius: 10,
        fill: '#28a745',
        text: 'New Item',
        section: 'body',
      };
    }

    setState({
      ...state,
      items: [...items, newItem as CanvasItem],
      selectedId: newItem.id,
      editingItemId: null,
    });
  };

  const handleItemDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, x: e.target.x(), y: e.target.y() } as CanvasItem;
      }
      return item;
    });
    setState({ ...state, items: newItems });
  };

  const handleTransformEnd = (id: string, newAttrs: Partial<CanvasItem>) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        // Narrow the type to the specific item type
        if (item.type === 'textbox') {
          return { ...item, ...newAttrs } as TextboxItem;
        } else if (item.type === 'table') {
          return { ...item, ...newAttrs } as TableItem;
        }
      }
      return item;
    });
    setState({ ...state, items: newItems });
  };

  const handleSelectItem = (id: string | null) => {
    setState({ ...state, selectedId: id }, true);
  };

  const handleItemChange = (updatedItem: CanvasItem) => {
    const newItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    setState({ ...state, items: newItems });
  };

  const handleStartEditing = (id: string | null) => {
    setState({ ...state, editingItemId: id }, true);
  };

  const handleFinishEditing = (newText: string | null) => {
    if (newText !== null && editingItemId) {
      const newItems = items.map((item) => {
        if (item.id === editingItemId && item.type === 'textbox') {
          return { ...item, text: newText };
        }
        return item;
      });

      setState({ ...state, items: newItems, editingItemId: null });
    } else {
      setState({ ...state, editingItemId: null }, true);
    }
  };

  const handleDeleteItem = () => {
    if (!selectedId) return;
    const newItems = items.filter((item) => item.id !== selectedId);
    setState({ ...state, items: newItems, selectedId: null, editingItemId: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editingItemId) {
      return;
    }

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

  const handleSaveProject = () => {
    try {
      const stateToSave = JSON.stringify(state, null, 2);
      const blob = new Blob([stateToSave], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-${Date.now()}.mrdl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Error: Could not save the project.');
    }
  };

  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File is not readable');

        const loadedState = JSON.parse(text) as AppState;

        if ('items' in loadedState && 'selectedId' in loadedState && 'page' in loadedState) {
          setState(loadedState);
        } else {
          throw new Error('Invalid project file format.');
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        alert('Error: The selected file is not a valid project file.');
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const handlePageSettingsChange = (newSettings: Partial<PageSettings>) => {
    const newPage = { ...page, ...newSettings };

    const format = newPage.format as 'A4' | 'Letter';
    const dimensions = PAGE_DIMENSIONS[format];
    if (newPage.orientation === 'portrait') {
      newPage.width = dimensions.width;
      newPage.height = dimensions.height;
    } else {
      newPage.width = dimensions.height;
      newPage.height = dimensions.width;
    }

    setState({ ...state, page: newPage });
  };

  useEffect(() => {
    appLayoutRef.current?.focus();
  }, []);

  const selectedItem = items.find((item) => item.id === selectedId);
  const itemToEdit = items.find((item) => item.id === editingItemId && item.type === 'textbox');

  return (
    <div ref={appLayoutRef} className="app-container" tabIndex={0} onKeyDown={handleKeyDown}>
      <TopBar onSave={handleSaveProject} onLoad={handleLoadProject} />
      <div className="main-content">
        <Toolbox onDragStart={handleDragStart} />
        <CanvasArea
          items={items}
          page={page}
          stageRef={stageRef}
          selectedId={selectedId}
          onSelect={handleSelectItem}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onItemDragEnd={handleItemDragEnd}
          onTransformEnd={handleTransformEnd}
          onSetEditingItem={handleStartEditing}
        />
        <PropertiesPanel
          item={selectedItem}
          page={page}
          onItemChange={handleItemChange}
          onPageSettingsChange={handlePageSettingsChange}
        />

        {itemToEdit && stageRef.current && (
          <TextEditor stageRef={stageRef} item={itemToEdit} onFinishEdit={handleFinishEditing} />
        )}
      </div>
    </div>
  );
}

export default App;
