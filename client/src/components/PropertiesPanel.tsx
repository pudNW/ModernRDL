import React, { useState } from 'react';
import type { CanvasItem } from '../App';
import './PropertiesPanel.css';
import { SketchPicker } from 'react-color';
import type { ColorResult } from 'react-color';

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  onItemChange: (item: CanvasItem) => void;
}

function PropertiesPanel({ item, onItemChange }: PropertiesPanelProps) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  if (!item) {
    return (
      <div className="panel-container">
        <div className="placeholder">Select an item to see its properties.</div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;
    onItemChange({ ...item, [name]: newValue });
  };

  const handleColorChange = (color: ColorResult) => {
    onItemChange({ ...item, fill: color.hex });
  };

  const displayWidth = Math.round(item.width * (item.scaleX || 1));
  const displayHeight = Math.round(item.height * (item.scaleY || 1));

  return (
    <div className="panel-container">
      <h3 className="panel-title">Properties</h3>
      
      <fieldset className='property-fieldset'>
        <legend className='fieldset-legend'>Appearance</legend>
        <div className='property-row'>
          <label className='property-label'>Fill</label>
          <div className='color-picker-wrapper'>
            <div className='color-swatch' onClick={() => setDisplayColorPicker(!displayColorPicker)}>
              <div className='color-indicator' style={{ background: item.fill }} />
            </div>
            {displayColorPicker ? (
            <div className='color-popover'>
              <div className='color-cover' onClick={() => setDisplayColorPicker(false)} />
              <SketchPicker color={item.fill} onChangeComplete={handleColorChange} />
            </div>
          ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className='property-fieldset'>
          <legend className='fieldset-legend'>Geometry</legend>
          <div className='property-row'>
            <label htmlFor="x" className='property-label'>X</label>
            <input id='x' name='x' type="number" className='property-input' value={Math.round(item.x)} onChange={handleChange} />
          </div>
          <div className='property-row'>
            <label htmlFor="y" className='property-label'>Y</label>
            <input id='y' name='y' type="number" className='property-input' value={Math.round(item.y)} onChange={handleChange} />
          </div>
          <div className='property-row'>
            <label htmlFor="width" className='property-label'>Width</label>
            <input id='width' name='width' type="number" className='property-input' value={displayWidth} readOnly disabled />
          </div>
          <div className='property-row'>
            <label htmlFor="height" className='property-label'>Height</label>
            <input id='height' name='height' type="number" className='property-input' value={displayHeight} readOnly disabled />
          </div>
          <div className='property-row'>
            <label htmlFor="rotation" className='property-label'>Rotation</label>
            <input id='rotation' name='rotation' type="number" className='property-input' value={Math.round(item.rotation || 0)} onChange={handleChange} />
          </div>
      </fieldset>
    </div>
  );
}

export default PropertiesPanel;
