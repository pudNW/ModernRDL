import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Transformer, Text, Group } from 'react-konva';
import type { CanvasItem, PageSettings } from '../App';
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
  const selectedNodeRef = useRef<Konva.Rect>(null);

  useEffect(() => {
    if (selectedId && transformerRef.current && selectedNodeRef.current) {
      transformerRef.current.nodes([selectedNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [selectedId]);

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  const keepNodeInside = (node: Konva.Node) => {
    const box = node.getClientRect();
    const absPos = node.absolutePosition();
    const offsetX = box.x - absPos.x;
    const offsetY = box.y - absPos.y;

    const newAbsPos = { ...absPos };
    if (box.x < 0) {
      newAbsPos.x = -offsetX;
    }
    if (box.y < 0) {
      newAbsPos.y = -offsetY;
    }
    if (box.x + box.width > page.width) {
      newAbsPos.x = page.width - box.width - offsetX;
    }
    if (box.y + box.height > page.height) {
      newAbsPos.y = page.height - box.height - offsetY;
    }
    return newAbsPos;
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
  }, [page.width, page.height]); // Rerun if page size changes

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isPanningRef.current = true;
        if(stageRef.current) stageRef.current.container().style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isPanningRef.current = false;
        if(stageRef.current) stageRef.current.container().style.cursor = 'default';
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
          if (isPanningRef.current) {
            if(stageRef.current) stageRef.current.container().style.cursor = 'grabbing';
          }
        }}
        onDragEnd={(e) => {
          // Only update state if we were panning
          if (isPanningRef.current) {
            setStageState({ ...stageState, x: e.target.x(), y: e.target.y() });
          }
          if(stageRef.current) stageRef.current.container().style.cursor = 'grab';
        }}
        dragBoundFunc={(pos) => {
          return isPanningRef.current ? pos : stageRef.current!.absolutePosition();
        }}
        onClick={checkDeselect}
        onTap={checkDeselect}
      >
        <Layer>
          {/* Paper Rectangle */}
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
          />

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
                scaleX={item.scaleX}
                scaleY={item.scaleY}
                onDragEnd={(e) => onItemDragEnd(e, item.id)}
                onClick={() => onSelect(item.id)}
                onTap={() => onSelect(item.id)}
                onDblClick={() => onSetEditingItem(item.id)}
                onDblTap={() => onSetEditingItem(item.id)}
                draggable
                dragBoundFunc={(pos) => {
                  const node = stageRef.current?.findOne(`#${item.id}`);
                  if (node) {
                    node.absolutePosition(pos);
                    return keepNodeInside(node);
                  }
                  return pos;
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  node.absolutePosition(keepNodeInside(node));
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
              </Group>
            );
          })}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasArea;
