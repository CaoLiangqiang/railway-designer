import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Position, Station, Line } from '../types';
import { getCityStyle } from '../constants/cityStyles';
import TrainSimulation from './TrainSimulation';

const GRID_SIZE = 20;
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;

const DesignCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingStation, setIsDraggingStation] = useState<string | null>(null);
  const [tempLine] = useState<Position[]>([]);
  const [showStationDialog, setShowStationDialog] = useState(false);
  const [newStationPos, setNewStationPos] = useState<Position | null>(null);
  const [stationName, setStationName] = useState('');
  const [isTransfer, setIsTransfer] = useState(false);

  const {
    currentProject,
    selectedTool,
    selectedElementId,
    selectedElementType,
    selectedLineId,
    isPlaying,
    addStation,
    selectElement,
    moveStation,
    setCanvasOffset
  } = useGameStore();

  const snapToGrid = useCallback((value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

  const screenToCanvas = useCallback((screenX: number, screenY: number): Position => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const zoom = currentProject?.zoom || 1;
    const offset = currentProject?.canvasOffset || { x: 0, y: 0 };
    return {
      x: (screenX - rect.left - offset.x) / zoom,
      y: (screenY - rect.top - offset.y) / zoom
    };
  }, [currentProject?.zoom, currentProject?.canvasOffset]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !currentProject || isPlaying) return;

    const pos = screenToCanvas(e.clientX, e.clientY);
    const snappedX = snapToGrid(pos.x);
    const snappedY = snapToGrid(pos.y);

    if (selectedTool?.type === 'station') {
      setNewStationPos({ x: snappedX, y: snappedY });
      setShowStationDialog(true);
      setStationName('');
      setIsTransfer(selectedTool.style.includes('int'));
    }
  }, [currentProject, selectedTool, isPlaying, screenToCanvas, snapToGrid]);

  const handleAddStation = () => {
    if (newStationPos && stationName.trim() && selectedLineId) {
      addStation({
        name: stationName.trim(),
        position: newStationPos,
        style: isTransfer ? 'shmetro-int' : 'shmetro-basic',
        lines: [selectedLineId],
        isTransfer,
        isTerminus: false
      });
      setShowStationDialog(false);
      setNewStationPos(null);
      setStationName('');
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && selectedTool?.type === 'pan')) {
      setIsDragging(true);
      const offset = currentProject?.canvasOffset || { x: 0, y: 0 };
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  }, [selectedTool, currentProject?.canvasOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (isDraggingStation && selectedElementId) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      moveStation(selectedElementId, { x: snapToGrid(pos.x), y: snapToGrid(pos.y) });
    }
  }, [isDragging, dragStart, isDraggingStation, selectedElementId, screenToCanvas, snapToGrid, moveStation, setCanvasOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingStation(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const { setZoom } = useGameStore.getState();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const currentZoom = currentProject?.zoom || 1;
    setZoom(Math.max(0.5, Math.min(3, currentZoom * delta)));
  }, [currentProject?.zoom]);

  const handleStationMouseDown = useCallback((e: React.MouseEvent, stationId: string) => {
    e.stopPropagation();
    if (selectedTool?.type === 'select') {
      selectElement(stationId, 'station');
      setIsDraggingStation(stationId);
    }
  }, [selectedTool, selectElement]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { removeStation, selectedElementId, selectedElementType } = useGameStore.getState();
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElementId && selectedElementType === 'station') {
        removeStation(selectedElementId);
      }
    } else if (e.key === 'Escape') {
      selectElement(null, null);
    }
  }, [selectElement]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderStation = (station: Station) => {
    const isSelected = selectedElementId === station.id && selectedElementType === 'station';
    const style = getCityStyle(currentProject?.lines.find(l => l.id === station.lines[0])?.style || 'shmetro');
    const size = style?.stationSize || 12;

    if (station.isTransfer) {
      return (
        <g
          key={station.id}
          transform={`translate(${station.position.x}, ${station.position.y})`}
          className="cursor-move"
          onMouseDown={(e) => handleStationMouseDown(e, station.id)}
        >
          <circle
            r={size + 4}
            fill="white"
            stroke={isSelected ? '#3B82F6' : '#374151'}
            strokeWidth={isSelected ? 3 : 2}
          />
          <circle
            r={size - 2}
            fill="white"
            stroke={isSelected ? '#3B82F6' : '#374151'}
            strokeWidth={2}
          />
          <text
            y={size + 15}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700"
            style={{ fontSize: '11px' }}
          >
            {station.name}
          </text>
          {station.secondaryName && (
            <text
              y={size + 28}
              textAnchor="middle"
              className="text-xs fill-gray-500"
              style={{ fontSize: '9px' }}
            >
              {station.secondaryName}
            </text>
          )}
        </g>
      );
    }

    return (
      <g
        key={station.id}
        transform={`translate(${station.position.x}, ${station.position.y})`}
        className="cursor-move"
        onMouseDown={(e) => handleStationMouseDown(e, station.id)}
      >
        <circle
          r={size}
          fill="white"
          stroke={isSelected ? '#3B82F6' : '#374151'}
          strokeWidth={isSelected ? 3 : 2}
        />
        <text
          y={size + 15}
          textAnchor="middle"
          className="text-xs font-medium fill-gray-700"
          style={{ fontSize: '11px' }}
        >
          {station.name}
        </text>
        {station.secondaryName && (
          <text
            y={size + 28}
            textAnchor="middle"
            className="text-xs fill-gray-500"
            style={{ fontSize: '9px' }}
          >
            {station.secondaryName}
          </text>
        )}
      </g>
    );
  };

  const renderLine = (line: Line) => {
    const style = getCityStyle(line.style);
    const lineWidth = style?.lineWidth || 8;

    const lineStations = line.stations
      .map(id => currentProject?.stations.find(s => s.id === id))
      .filter((s): s is Station => s !== undefined);

    // 如果没有站点，不渲染线路
    if (lineStations.length === 0) return null;

    // 构建路径数据
    let pathData = '';
    if (lineStations.length === 1) {
      // 只有一个站点时，画一个小圆点表示起点
      const s = lineStations[0];
      pathData = `M ${s.position.x - 5} ${s.position.y} L ${s.position.x + 5} ${s.position.y}`;
    } else {
      pathData = lineStations.reduce((acc, station, index) => {
        if (index === 0) return `M ${station.position.x} ${station.position.y}`;
        return `${acc} L ${station.position.x} ${station.position.y}`;
      }, '');
    }

    return (
      <g key={line.id}>
        <path
          d={pathData}
          fill="none"
          stroke={line.color}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {line.paths.map(path => (
          <path
            key={path.id}
            d={path.points.reduce((acc, point, index) => {
              if (index === 0) return `M ${point.x} ${point.y}`;
              return `${acc} L ${point.x} ${point.y}`;
            }, '')}
            fill="none"
            stroke={line.color}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
    );
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚇</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">欢迎使用轨道线路图设计器</h2>
          <p className="text-gray-500 mb-6">请先创建一个新项目开始设计</p>
          <div className="text-sm text-gray-400">
            <p>支持上海、北京、广州、港铁、东京等多种城市风格</p>
          </div>
        </div>
      </div>
    );
  }

  const zoom = currentProject.zoom || 1;
  const offset = currentProject.canvasOffset || { x: 0, y: 0 };

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      <svg
        ref={svgRef}
        className={`w-full h-full ${selectedTool?.type === 'pan' ? 'cursor-grab' : 'cursor-crosshair'} ${isDragging ? 'cursor-grabbing' : ''}`}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <pattern
            id="grid"
            width={GRID_SIZE}
            height={GRID_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
          </pattern>
        </defs>
        
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
          {/* Grid Background */}
          <rect
            x={-CANVAS_WIDTH}
            y={-CANVAS_HEIGHT}
            width={CANVAS_WIDTH * 3}
            height={CANVAS_HEIGHT * 3}
            fill="url(#grid)"
          />
          
          {/* Lines */}
          {currentProject.lines.map(renderLine)}
          
          {/* Stations */}
          {currentProject.stations.map(renderStation)}
          
          {/* Temp Line */}
          {tempLine.length > 0 && (
            <path
              d={tempLine.reduce((acc, point, index) => {
                if (index === 0) return `M ${point.x} ${point.y}`;
                return `${acc} L ${point.x} ${point.y}`;
              }, '')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={4}
              strokeDasharray="5,5"
            />
          )}
        </g>
      </svg>

      {/* Info Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium">当前线路:</span>
          {selectedLineId && (
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: currentProject.lines.find(l => l.id === selectedLineId)?.color
                }}
              />
              <span>
                {currentProject.lines.find(l => l.id === selectedLineId)?.name}
              </span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          快捷键: Delete-删除 | R-旋转 | Esc-取消选择
        </div>
      </div>

      {/* Station Dialog */}
      {showStationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">添加站点</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  站点名称
                </label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="输入站点名称"
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTransfer}
                    onChange={(e) => setIsTransfer(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">换乘站</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowStationDialog(false);
                  setNewStationPos(null);
                  setStationName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddStation}
                disabled={!stationName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Train Simulation */}
      {currentProject && (
        <TrainSimulation
          lines={currentProject.lines}
          stations={currentProject.stations}
          zoom={zoom}
          viewOffset={offset}
        />
      )}
    </div>
  );
};

export default DesignCanvas;
