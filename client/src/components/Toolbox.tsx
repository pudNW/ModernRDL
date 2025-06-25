import './Toolbox.css';
import { FaRegSquare, FaImage } from 'react-icons/fa';

const tools = [
    { id: 'textbox', name: 'Textbox', icon: <FaRegSquare /> },
    { id: 'image', name: 'Image', icon: <FaImage /> },
];

function Toolbox() {
    return (
        <div className='toolbox-container'>
            <h3 className='toolbox-title'>Toolbox</h3>
            <ul className='tool-list'>
                {tools.map((tool) => (
                    <li key={tool.id} className='tool-item'>
                        <span className='tool-icon'>{tool.icon}</span>
                        <span className='tool-name'>{tool.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Toolbox;