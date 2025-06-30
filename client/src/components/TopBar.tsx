import React from 'react';
import './TopBar.css';
import { FaSave, FaFolderOpen } from 'react-icons/fa';

interface TopBarProps {
    onSave: () => void;
    onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function TopBar({ onSave, onLoad }: TopBarProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className='topbar-container'>
            <div className='topbar-title'>ModernRDL</div>
            <div className='topbar-actions'>
                <button className='action-button' onClick={onSave}>
                    <FaSave />
                    Save
                </button>
                <button className='action-button' onClick={handleLoadClick}>
                    <FaFolderOpen />
                    Load
                </button>
                {/* Input for file selection is hidden but still works */}
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={onLoad}
                    style={{ display: 'none' }}
                    accept='.mrdl'
                />
            </div>
        </div>
    );
}

export default TopBar;