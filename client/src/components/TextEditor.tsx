import React, { useState, useEffect, useRef } from 'react';
import type { CanvasItem } from '../App';
import Konva from 'konva';

interface TextEditorProps {
    stageRef: React.RefObject<Konva.Stage | null>;
    item: CanvasItem;
    onFinishEdit: (newText: string | null) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ stageRef, item, onFinishEdit }) => {
    const [text, setText] = useState(item.text || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        const stage = stageRef.current;
        if (!textarea || !stage) return;

        const node = stage.findOne(`#${item.id}`);
        if (!node) return;

        const textPosition = node.getAbsolutePosition();
        const stageBox = stage.container().getBoundingClientRect();
        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
        };

        textarea.style.position = 'absolute';
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${item.width * (item.scaleX || 1)}px`;
        textarea.style.height = `${(item.height ?? 1) * (item.scaleY || 1)}px`;
        textarea.style.fontSize = `${16 * (item.scaleY || 1)}px`;
        textarea.style.border = 'none';
        textarea.style.padding = '10px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = '1.5';
        textarea.style.fontFamily = 'sans-serif';
        textarea.style.transformOrigin = 'left top';
        textarea.style.transform = `rotate(${item.rotation || 0}deg)`;
        textarea.style.color = 'white';

        textarea.focus();
        textarea.select();
    }, [item, stageRef]);

    const handleBlur = () => {
        onFinishEdit(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            onFinishEdit(null);
        }
    };

    return(
        <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        />
    );
};

export default TextEditor;