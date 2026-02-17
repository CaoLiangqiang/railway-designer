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
  const [autoConnect, setAutoConnect] = useState(true);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [existingStation, setExistingStation] = useState<Station | null>(null);

  const {
    currentProject,
    selectedTool,
    selectedElementId,
    selectedElementType,
    selectedLineId,
    highlightedLineId,
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
    if (newStationPos && stationName.trim() && selectedLineId && currentProject) {
      const trimmedName = stationName.trim();

      // 检查整个项目中是否已有同名站点（不限于当前线路）
      const duplicateStation = currentProject.stations.find(
        s => s.name === trimmedName
      );

      if (duplicateStation) {
        // 发现同名站点，显示连接确认对话框
        setExistingStation(duplicateStation);
        setShowConnectDialog(true);
        return;
      }

      // 获取当前线路的最后一个站点（用于自动连接）
      const currentLine = currentProject.lines.find(l => l.id === selectedLineId);
      const lastStationId = currentLine?.stations[currentLine.stations.length - 1];
      const lastStation = lastStationId ? currentProject.stations.find(s => s.id === lastStationId) : null;

      // 没有同名站点，正常添加
      // 根据自动连接开关决定是否将站点加入线路
      addStation({
        name: trimmedName,
        position: newStationPos,
        style: isTransfer ? 'shmetro-int' : 'shmetro-basic',
        lines: [selectedLineId],
        isTransfer,
        isTerminus: false
      }, autoConnect);

      // 如果开启自动连接且存在前一个站点，则创建路径
      if (autoConnect && lastStation) {
        const { addLinePath } = useGameStore.getState();
        addLinePath(selectedLineId, [lastStation.position, newStationPos]);
      }

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
    if (selectedTool?.type === 'select' && !isPlaying) {
      selectElement(stationId, 'station');
      setIsDraggingStation(stationId);
    }
  }, [selectedTool, selectElement, isPlaying]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { removeStation, removeLinePath, selectedElementId, selectedElementType, currentProject, isPlaying } = useGameStore.getState();

    if (isPlaying) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElementId && selectedElementType === 'station') {
        removeStation(selectedElementId);
      } else if (selectedElementId && selectedElementType === 'path' && currentProject) {
        const lineWithPath = currentProject.lines.find(line =>
          line.paths.some(path => path.id === selectedElementId)
        );
        if (lineWithPath) {
          removeLinePath(lineWithPath.id, selectedElementId);
          selectElement(null, null);
        }
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
    
    const isOther = highlightedLineId && !station.lines.includes(highlightedLineId);

    if (station.isTransfer) {
      return (
        <g
          key={station.id}
          transform={`translate(${station.position.x}, ${station.position.y})`}
          className={isPlaying ? 'cursor-not-allowed' : 'cursor-move'}
          opacity={isOther ? 0.2 : 1}
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
        className={isPlaying ? 'cursor-not-allowed' : 'cursor-move'}
        opacity={isOther ? 0.2 : 1}
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

  // 计算两个站点之间的所有轨道（用于确定线条粗细）
  const getPathCountBetweenStations = (startPos: Position, endPos: Position) => {
    if (!currentProject) return 1;

    let count = 0;
    currentProject.lines.forEach(line => {
      line.paths.forEach(path => {
        const pathStart = path.points[0];
        const pathEnd = path.points[path.points.length - 1];
        const startMatch =
          (pathStart.x === startPos.x && pathStart.y === startPos.y) ||
          (pathStart.x === endPos.x && pathStart.y === endPos.y);
        const endMatch =
          (pathEnd.x === startPos.x && pathEnd.y === startPos.y) ||
          (pathEnd.x === endPos.x && pathEnd.y === endPos.y);
        if (startMatch && endMatch) {
          count++;
        }
      });
    });
    return Math.max(1, count);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderLine = (_line: Line) => {
    // 只渲染线路的标识，不渲染自动连线
    // 所有的轨道都通过 renderAllPaths 渲染
    return null;
  };

  const renderAllPaths = () => {
    if (!currentProject) return null;

    return currentProject.lines.map(line => {
      const style = getCityStyle(line.style);
      const baseLineWidth = style?.lineWidth || 8;
      const isOther = highlightedLineId && highlightedLineId !== line.id;

      return line.paths.map(path => {
        const isSelected = selectedElementId === path.id && selectedElementType === 'path';
        const startPos = path.points[0];
        const endPos = path.points[path.points.length - 1];

        const pathCount = getPathCountBetweenStations(startPos, endPos);
        const lineWidth = Math.max(3, baseLineWidth - (pathCount - 1) * 2);

        return (
          <path
            key={path.id}
            d={path.points.reduce((acc, point, index) => {
              if (index === 0) return `M ${point.x} ${point.y}`;
              return `${acc} L ${point.x} ${point.y}`;
            }, '')}
            fill="none"
            stroke={isSelected ? '#3B82F6' : line.color}
            strokeWidth={isSelected ? lineWidth + 4 : lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isOther ? 0.2 : 1}
            className={isPlaying ? '' : 'cursor-pointer hover:opacity-80'}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool?.type === 'select' && !isPlaying) {
                selectElement(path.id, 'path');
              }
            }}
            style={{ pointerEvents: 'stroke' }}
          />
        );
      });
    });
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

          {/* Paths (单独渲染，用于处理多条轨道的情况) */}
          {renderAllPaths()}

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
              {/* iOS Style Toggle for Auto Connect */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">自动连接至前一站点</span>
                <button
                  onClick={() => setAutoConnect(!autoConnect)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoConnect ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoConnect ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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

      {/* Connect to Existing Station Dialog */}
      {showConnectDialog && existingStation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">站点名称已存在</h3>
            </div>
            <p className="text-gray-600 mb-4">
              已存在名为"<span className="font-semibold text-gray-800">{existingStation.name}</span>"的站点。
            </p>
            <p className="text-gray-600 mb-6">
              请使用其他名称创建站点。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowConnectDialog(false);
                  setExistingStation(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                知道了
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
