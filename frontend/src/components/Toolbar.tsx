import React from 'react';
import { ToolType, TOOL_COLORS, STROKE_WIDTHS } from '../types';

interface ToolbarProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  onClear: () => void;
  onExport: () => void;
  userCount: number;
  roomName: string;
}

const tools: { type: ToolType; icon: string; label: string }[] = [
  { type: 'pencil', icon: '✏️', label: 'Pencil' },
  { type: 'rectangle', icon: '▭', label: 'Rectangle' },
  { type: 'circle', icon: '○', label: 'Circle' },
  { type: 'line', icon: '╱', label: 'Line' },
  { type: 'text', icon: 'T', label: 'Text' },
  { type: 'eraser', icon: '🧹', label: 'Eraser' },
  { type: 'select', icon: '👆', label: 'Select' },
];

const Toolbar: React.FC<ToolbarProps> = ({
  tool, setTool, color, setColor, strokeWidth, setStrokeWidth,
  onClear, onExport, userCount, roomName
}) => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-white border-r border-gray-200 shadow-sm h-full w-16 md:w-64 overflow-y-auto">
      <div className="hidden md:block">
        <h2 className="text-sm font-bold text-gray-700 mb-1 truncate">{roomName}</h2>
        <div className="text-xs text-green-600 mb-3 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          {userCount} active
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {tools.map((t) => (
          <button
            key={t.type}
            onClick={() => setTool(t.type)}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
              tool === t.type
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={t.label}
          >
            <span className="text-lg w-6 text-center">{t.icon}</span>
            <span className="hidden md:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="hidden md:block mt-2">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Color</label>
        <div className="grid grid-cols-5 gap-1">
          {TOOL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? 'border-gray-800 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:block mt-2">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Stroke Width</label>
        <div className="flex gap-1">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`flex-1 py-1 rounded text-xs transition-colors ${
                strokeWidth === w ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <div
                className="mx-auto rounded-full bg-current"
                style={{
                  width: Math.min(w * 2, 20),
                  height: Math.min(w * 2, 20),
                  backgroundColor: strokeWidth === w ? '#2563eb' : '#9ca3af',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={onClear}
          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
        >
          <span className="md:hidden">🗑️</span>
          <span className="hidden md:inline">Clear Board</span>
        </button>
        <button
          onClick={onExport}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
        >
          <span className="md:hidden">💾</span>
          <span className="hidden md:inline">Export PNG</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
