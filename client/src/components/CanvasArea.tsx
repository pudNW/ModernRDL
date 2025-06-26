import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Transformer, Text, Group } from 'react-konva';
import type { CanvasItem } from '../App';
import './CanvasArea.css';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

interface CanvasAreaProps {
  items: CanvasItem[];
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

  return (
    <div className="canvas-container" onDrop={onDrop} onDragOver={onDragOver}>
      <Stage
        ref={stageRef}
        width={window.innerWidth - 220 - 250} // 220 for Toolbox, 250 for Properties Panel
        height={window.innerHeight}
        onClick={checkDeselect}
        onTap={checkDeselect}
      >
        <Layer>
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <Group
                key={item.id}
                id={item.id}
                x={item.x}
                y={item.y}
                draggable
                rotation={item.rotation}
                scaleX={item.scaleX}
                scaleY={item.scaleY}
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
