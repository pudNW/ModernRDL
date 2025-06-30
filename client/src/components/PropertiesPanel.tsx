import React, { useState } from 'react';
import type { CanvasItem, PageSettings } from '../App';
import './PropertiesPanel.css';
import { SketchPicker } from 'react-color';
import type { ColorResult } from 'react-color';

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  page: PageSettings;
  onItemChange: (item: CanvasItem) => void;
  onPageSettingsChange: (settings: Partial<PageSettings>) => void;
}

function PropertiesPanel({ item, page, onItemChange, onPageSettingsChange }: PropertiesPanelProps) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  if (!item) {
    return (
      <div className="panel-container">
        <h3 className='panel-title'>Report Settings</h3>
        <fieldset className='property-fieldset'>
          <legend className='fieldset-legend'>Page Layout</legend>
          <div className='property-row'>
            <label htmlFor="page-format" className='property-label'>Format</label>
            <select
              id="page-format"
              className='property-select'
              value={page.format}
              onChange={(e) => onPageSettingsChange({ format: e.target.value as 'A4' | 'Letter' })}
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </div>
          <div className='property-row'>
            <label htmlFor="page-orientation" className='property-label'>Orientation</label>
            <select
              id="page-orientation"
              className='property-select'
              value={page.orientation}
              onChange={(e) => onPageSettingsChange({ orientation: e.target.value as 'portrait' | 'landscape' })}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className='property-row-double'>
            <div className="property-group-half">
              <label htmlFor="header-height" className="property-label">
                Header
              </label>
              <input
                id="header-height"
                type="number"
                className="property-input"
                value={page.headerHeight}
                min="0"
                onChange={(e) => onPageSettingsChange({ headerHeight: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="property-group-half">
              <label htmlFor="footer-height" className="property-label">
                Footer
              </label>
              <input
                id="footer-height"
                type="number"
                className="property-input"
                value={page.footerHeight}
                min="0"
                onChange={(e) => onPageSettingsChange({ footerHeight: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
        </fieldset>
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
