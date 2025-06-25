import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import type { CanvasItem } from '../App';
import './CanvasArea.css';
import type { KonvaEventObject } from 'konva/lib/Node';

interface CanvasAreaProps {
    items: CanvasItem[];
    stageRef: React.RefObject<any>;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onItemDragEnd: (e: KonvaEventObject<DragEvent>, id: string) => void;
}

function CanvasArea({ items, stageRef, onDrop, onDragOver, onItemDragEnd }: CanvasAreaProps) {
    return (
        <div
            className='canvas-container'
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <Stage
                ref={stageRef}
                width={window.innerWidth - 220}
                height={window.innerHeight}
            >
                <Layer>
                    {items.map((item) => (
                        <Rect
                            key={item.id}
                            id={item.id}
                            x={item.x}
                            y={item.y}
                            width={item.width}
                            height={item.height}
                            fill={item.fill}
                            cornerRadius={item.cornerRadius}
                            draggable
                            onDragEnd={(e) => onItemDragEnd(e, item.id)}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}

export default CanvasArea;