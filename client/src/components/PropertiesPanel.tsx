import React from 'react';
import type { CanvasItem } from '../App';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  onItemChange: (item: CanvasItem) => void;
}

function PropertiesPanel({ item, onItemChange }: PropertiesPanelProps) {
  if (!item) {
    return (
      <div className="panel-container">
        <div className="placeholder">Select an item to see its properties.</div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onItemChange({ ...item, [e.target.name]: e.target.value });
  };

  return (
    <div className="panel-container">
      <h3 className="panel-title">Properties</h3>
      <div className="property-group">
        <label htmlFor="fill" className="property-label">
          Fill Color
        </label>
        <input
          id="fill"
          name="fill"
          type="text"
          className="property-input"
          value={item.fill}
          onChange={handleChange}
        />
      </div>
      <div className="property-group">
        <label htmlFor="x" className="property-label">
          Position X
        </label>
        <input
          id="x"
          name="x"
          type="number"
          className="property-input"
          value={item.x}
          onChange={handleChange}
        />
      </div>
      <div className="property-group">
        <label htmlFor="y" className="property-label">
          Position Y
        </label>
        <input
          id="y"
          name="y"
          type="number"
          className="property-input"
          value={item.y}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default PropertiesPanel;
