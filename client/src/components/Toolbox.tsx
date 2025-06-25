import React from 'react';
import './Toolbox.css';
import { FaRegSquare, FaImage } from 'react-icons/fa';

export interface Tool {
    id: string;
    name: string;
    icon: React.ReactNode;
}

const tools: Tool[] = [
    { id: 'textbox', name: 'Textbox', icon: <FaRegSquare /> },
    { id: 'image', name: 'Image', icon: <FaImage /> },
];

interface ToolboxProps {
    onDragStart: (tool: Tool) => void;
}

function Toolbox({ onDragStart }: ToolboxProps) {
    return (
        <div className='toolbox-container'>
            <h3 className='toolbox-title'>Toolbox</h3>
            <ul className='tool-list'>
                {tools.map((tool) => (
                    <li 
                        key={tool.id} 
                        className='tool-item'
                        draggable
                        onDragStart={() => onDragStart(tool)}
                    >
                        <span className='tool-icon'>{tool.icon}</span>
                        <span className='tool-name'>{tool.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Toolbox;