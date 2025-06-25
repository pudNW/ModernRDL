import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import './CanvasArea.css';

function CanvasArea() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (containerRef.current) {
            setSize({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }
    }, []);

    return (
        <div className='canvas-container' ref={containerRef}>
            <Stage width={size.width} height={size.height}>
                <Layer>
                    <Rect
                        x={50}
                        y={50}
                        width={150}
                        height={100}
                        fill="#007bff"
                        cornerRadius={10}
                        draggable
                    />
                    <Text
                        x={60}
                        y={85}
                        text="Report Item"
                        fontSize={20}
                        fill="white"
                        listening={false}
                    />
                </Layer>
            </Stage>
        </div>
    );
}

export default CanvasArea;