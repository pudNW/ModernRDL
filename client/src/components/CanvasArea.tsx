import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Transformer, Text, Group, Line } from 'react-konva';
import type { CanvasItem, PageSettings, TableItem, TextboxItem } from '../App';
import './CanvasArea.css';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

interface CanvasAreaProps {
  items: CanvasItem[];
  page: PageSettings;
  stageRef: React.RefObject<Konva.Stage | null>;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onItemDragEnd: (e: KonvaEventObject<DragEvent>, id: string) => void;

  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onTransformEnd: (id: string, newAttrs: Partial<CanvasItem>) => void;

  onSetEditingItem: (id: string) => void;
}

const TextboxComponent = ({
  item,
  isSelected,
  selectedNodeRef,
}: {
  item: TextboxItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onSetEditingItem: (id: string) => void;
  selectedNodeRef: React.RefObject<Konva.Rect>;
}) => (
  <>
    <Rect
      ref={isSelected ? selectedNodeRef : null}
      width={item.width}
      height={item.height}
      fill={item.fill}
      cornerRadius={item.cornerRadius}
    />
    <Text
      text={item.text}
      width={item.width}
      height={item.height}
      padding={10}
      align="center"
      verticalAlign="middle"
      fontSize={16}
      fill="white"
      listening={false}
    />
  </>
);

const TableComponent = ({
  item,
  isSelected,
  selectedNodeRef,
}: {
  item: TableItem;
  isSelected: boolean;
  selectedNodeRef: React.RefObject<Konva.Rect>;
}) => {
  const cells = [];
  let currentY = 0;
  for (let i = 0; i < item.rowCount; i++) {
    let currentX = 0;
    for (let j = 0; j < item.columnCount; j++) {
      cells.push(
        <>
          <Rect
            key={`cell-${i}-${j}`}
            x={currentX}
            y={currentY}
            width={item.columnWidths[j]}
            height={item.rowHeights[i]}
            stroke="black"
            strokeWidth={1}
          />
          <Text
            key={`text-${i}-${j}`}
            x={currentX + 5}
            y={currentY + 5}
            text={item.tableData[i][j]}
            width={item.columnWidths[j] - 10}
            height={item.rowHeights[i] - 10}
            verticalAlign="middle"
          />
        </>
      );
      currentX += item.columnWidths[j];
    }
    currentY += item.rowHeights[i];
  }

  return (
    <>
      {/* Add a reference rectangle for the transformer to attach to */}
      <Rect
        ref={isSelected ? selectedNodeRef : null}
        width={item.width}
        height={item.height}
        listening={false}
      />
      {cells}
    </>
  );
};

function CanvasArea({
  items,
  page,
  stageRef,
  onDrop,
  onDragOver,
  onItemDragEnd,
  selectedId,
  onSelect,
  onTransformEnd,
  onSetEditingItem,
}: CanvasAreaProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedNodeRef = useRef<Konva.Rect>(null) as React.RefObject<Konva.Rect>;

  useEffect(() => {
    if (selectedId && transformerRef.current && selectedNodeRef.current) {
      transformerRef.current.nodes([selectedNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [selectedId]);

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('page-background');
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  const [stageState, setStageState] = useState({
    scale: 0.8,
    x: 0,
    y: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const initialScale = 0.8;

      setStageState({
        scale: initialScale,
        x: (containerWidth - page.width * initialScale) / 2,
        y: (containerHeight - page.height * initialScale) / 2,
      });
    }
  }, [page.width, page.height]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isPanningRef.current = true;
        if (stageRef.current) stageRef.current.container().style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isPanningRef.current = false;
        if (stageRef.current) stageRef.current.container().style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [stageRef]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // How much to scale based on mouse wheel direction
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Calculate new position to zoom towards the pointer
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStageState({ scale: newScale, ...newPos });
  };

  return (
    <div className="canvas-container" ref={containerRef} onDrop={onDrop} onDragOver={onDragOver}>
      <Stage
        ref={stageRef}
        width={containerRef.current?.offsetWidth || 0}
        height={containerRef.current?.offsetHeight || 0}
        onWheel={handleWheel}
        scaleX={stageState.scale}
        scaleY={stageState.scale}
        x={stageState.x}
        y={stageState.y}
        draggable
        onDragStart={() => {
          if (isPanningRef.current && stageRef.current) {
            stageRef.current.container().style.cursor = 'grabbing';
          }
        }}
        onDragEnd={(e) => {
          // Only update state if we were panning
          if (isPanningRef.current) {
            setStageState({ ...stageState, x: e.target.x(), y: e.target.y() });
          }
          if (stageRef.current) {
            stageRef.current.container().style.cursor = isPanningRef.current ? 'grab' : 'default';
          }
        }}
        dragBoundFunc={(pos) => {
          return isPanningRef.current ? pos : stageRef.current!.absolutePosition();
        }}
        onClick={checkDeselect}
        onTap={checkDeselect}
      >
        <Layer>
          {/* Paper and Guides */}
          <Rect
            x={0}
            y={0}
            width={page.width}
            height={page.height}
            fill="white"
            shadowBlur={10}
            shadowOpacity={0.3}
            shadowOffsetX={5}
            shadowOffsetY={5}
            name="page-background"
          />
          {page.headerHeight > 0 && (
            <Line
              points={[0, page.headerHeight, page.width, page.headerHeight]}
              stroke="#007bff"
              strokeWidth={1}
              dash={[10, 5]}
              listening={false}
            />
          )}
          {page.footerHeight > 0 && (
            <Line
              points={[
                0,
                page.height - page.footerHeight,
                page.width,
                page.height - page.footerHeight,
              ]}
              stroke="#007bff"
              strokeWidth={1}
              dash={[10, 5]}
              listening={false}
            />
          )}

          <Group
            clipFunc={(ctx) => {
              ctx.rect(0, 0, page.width, page.height);
            }}
          >
            {/* Render all items */}
            {items.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <Group
                  key={item.id}
                  id={item.id}
                  x={item.x}
                  y={item.y}
                  rotation={item.rotation}
                  scaleX={item.type === 'textbox' ? item.scaleX : 1}
                  scaleY={item.type === 'textbox' ? item.scaleY : 1}
                  draggable
                  onDragEnd={(e) => onItemDragEnd(e, item.id)}
                  onClick={() => onSelect(item.id)}
                  onTap={() => onSelect(item.id)}
                  onDblClick={() => onSetEditingItem(item.id)}
                  onDblTap={() => onSetEditingItem(item.id)}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const newAttrs = {
                      x: node.x(),
                      y: node.y(),
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    };
                    onTransformEnd?.(item.id, newAttrs);
                  }}
                >
                  {/* Conditional Rendering based on item type */}
                  {item.type === 'textbox' && (
                    <TextboxComponent
                      item={item}
                      isSelected={isSelected}
                      onSelect={() => onSelect(item.id)}
                      onSetEditingItem={() => onSetEditingItem(item.id)}
                      selectedNodeRef={selectedNodeRef}
                    />
                  )}
                  {item.type === 'table' && (
                    <TableComponent
                      item={item}
                      isSelected={isSelected}
                      selectedNodeRef={selectedNodeRef}
                    />
                  )}
                </Group>
              );
            })}
            <Transformer ref={transformerRef} />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasArea;
