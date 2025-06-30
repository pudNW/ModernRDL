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
  text?: string;
  section: 'header' | 'body' | 'footer';
}

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
      text: 'Double-click to edit',
      section: 'body',
    },
  ],
  selectedId: null,
  editingItemId: null,
  page: { // Set default page settings
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

    if (!draggedItemRef.current || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const position = stageRef.current.getPointerPosition(); 

    if (!position) return;

    let section: CanvasItem['section'] = 'body';
    if (position.y < page.headerHeight) {
      section = 'header';
    } else if (position.y > page.height - page.footerHeight) {
      section = 'footer';
    }

    const newItem: CanvasItem = {
      id: `item_${Date.now()}`,
      x: position.x,
      y: position.y,
      width: 150,
      height: 100,
      cornerRadius: 10,
      fill: '#28a745',
      text: 'New Textbox',
      section: section,
    };

    setState({ ...state, items: [...items, newItem], selectedId: newItem.id, editingItemId: null });
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

  const handleItemChange = (updatedItem: CanvasItem) => {
    const newItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    setState({ ...state, items: newItems });
  };

  const handleStartEditing = (id: string | null) => {
    setState({ ...state, editingItemId: id }, true);
  };

  const handleFinishEditing = (newText: string | null) => {
    if (newText !== null && editingItemId) {
      const newItems = items.map(item => {
        if (item.id === editingItemId) {
          return { ...item, text: newText }
        }
        return item;
      });

      setState({ ...state, items: newItems, editingItemId: null });
    } else {
      setState({ ...state, editingItemId:null }, true);
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
      console.error("Failed to save project:", error);
      alert("Error: Could not save the project.");
    }
  };

  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not readable");

        const loadedState = JSON.parse(text) as AppState;

        if ('items' in loadedState && 'selectedId' in loadedState) {
          setState(loadedState);
        } else {
          throw new Error("Invalid project file format.");
        }
      } catch (error) {
        console.error("Failed to laod project:", error);
        alert("Error: The selected file is not a valid project file.");
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const handlePageSettingsChange = (newSettings: Partial<PageSettings>) => {
    const newPage = { ...page, ...newSettings };

    // Swap width and height if orientation changes
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
  const itemToEdit = items.find(item => item.id === editingItemId);

  return (
    <div ref={appLayoutRef} className="app-container" tabIndex={0} onKeyDown={handleKeyDown}>
      <TopBar onSave={handleSaveProject} onLoad={handleLoadProject} />
      <div className='main-content'>
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
          <TextEditor
            stageRef={stageRef}
            item={itemToEdit}
            onFinishEdit={handleFinishEditing}
          />
        )}
      </div>
    </div>
  );
}

export default App;