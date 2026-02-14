import React, { useState } from 'react';
import {
  PlusCircle,
  FolderOpen,
  Download,
  Play,
  Square as Stop,
  Trash2,
  HelpCircle,
  MousePointer2,
  Hand,
  Minus,
  Plus,
  Train,
  X,
  Route
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { LineStyle, StationStyle, Station, Position } from '../types';
import { cityStyles, getDefaultLineColor } from '../constants/cityStyles';

const stationStyles: { style: StationStyle; label: string; icon: string }[] = [
  { style: 'shmetro-basic', label: '普通站', icon: '●' },
  { style: 'shmetro-int', label: '换乘站', icon: '◎' },
];

const Toolbar: React.FC = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<LineStyle>('shmetro');
  const [showAddLine, setShowAddLine] = useState(false);
  const [newLineName, setNewLineName] = useState('');
  const [newLineColor, setNewLineColor] = useState('#3B82F6');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [activeTab, setActiveTab] = useState<'tools' | 'lines' | 'stations'>('tools');
  const [showTerminusDialog, setShowTerminusDialog] = useState(false);
  const [startTerminus, setStartTerminus] = useState<string>('');
  const [endTerminus, setEndTerminus] = useState<string>('');
  const [isLoopLine, setIsLoopLine] = useState(false);
  const [showTrackDialog, setShowTrackDialog] = useState(false);
  const [trackStartStation, setTrackStartStation] = useState<string>('');
  const [trackEndStation, setTrackEndStation] = useState<string>('');
  const [trackLineId, setTrackLineId] = useState<string>('');

  const {
    selectedTool,
    selectedElementId,
    selectedElementType,
    selectedLineId,
    isPlaying,
    currentProject,
    selectTool,
    createProject,
    addLine,
    removeLine,
    selectLine,
    setTerminus,
    removeStation,
    startSimulation,
    stopSimulation,
    exportProject,
    importProject,
    setZoom,
    addLinePath,
    removeLinePath,
    updateLinePath
  } = useGameStore();

  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProject(projectName.trim(), 'modern', selectedStyle);
      setProjectName('');
      setShowNewProject(false);
    }
  };

  const handleAddLine = () => {
    if (newLineName.trim() && currentProject) {
      // 检查是否已存在同名线路
      const existingLine = currentProject.lines.find(
        l => l.name.toLowerCase() === newLineName.trim().toLowerCase()
      );
      if (existingLine) {
        alert(`已存在名为"${newLineName.trim()}"的线路，请使用其他名称`);
        return;
      }

      const style = cityStyles.find(s => s.id === selectedStyle);
      const lineCount = currentProject.lines.length;
      const defaultColor = style ? getDefaultLineColor(style.id, lineCount) : newLineColor;

      addLine(newLineName.trim(), defaultColor, selectedStyle);
      setNewLineName('');
      setNewLineColor('#3B82F6');
      setShowAddLine(false);
    }
  };

  const handleExport = () => {
    const data = exportProject();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject?.name || 'project'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowExport(false);
  };

  const handleImport = () => {
    if (importData.trim()) {
      const success = importProject(importData.trim());
      if (success) {
        setImportData('');
        setShowImport(false);
      } else {
        alert('导入失败，请检查文件格式');
      }
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedElementId && selectedElementType === 'station') {
      removeStation(selectedElementId);
    } else if (selectedElementId && selectedElementType === 'path' && selectedLineId) {
      removeLinePath(selectedLineId, selectedElementId);
      selectElement(null, null);
    }
  };

  const handleChangePathShape = (shape: 'straight' | 'single-bend' | 'double-bend') => {
    if (!selectedElementId || !selectedLineId || !currentProject) return;

    const line = currentProject.lines.find(l => l.id === selectedLineId);
    const path = line?.paths.find(p => p.id === selectedElementId);
    if (!path || path.points.length < 2) return;

    const startPoint = path.points[0];
    const endPoint = path.points[path.points.length - 1];

    let newPoints: Position[] = [startPoint];

    if (shape === 'straight') {
      // 直线：只有起点和终点
      newPoints = [startPoint, endPoint];
    } else if (shape === 'single-bend') {
      // 一次折线：在中间某处转折
      // 判断是水平转折还是垂直转折
      const dx = Math.abs(endPoint.x - startPoint.x);
      const dy = Math.abs(endPoint.y - startPoint.y);

      if (dx > dy) {
        // 水平方向更长，先水平后垂直
        newPoints = [startPoint, { x: endPoint.x, y: startPoint.y }, endPoint];
      } else {
        // 垂直方向更长，先垂直后水平
        newPoints = [startPoint, { x: startPoint.x, y: endPoint.y }, endPoint];
      }
    } else if (shape === 'double-bend') {
      // 两次折线：在中间形成两个转折
      const midX = (startPoint.x + endPoint.x) / 2;
      const midY = (startPoint.y + endPoint.y) / 2;

      // 判断主要方向
      const dx = Math.abs(endPoint.x - startPoint.x);
      const dy = Math.abs(endPoint.y - startPoint.y);

      if (dx > dy) {
        // 水平为主，先水平到中点，垂直，再水平
        newPoints = [startPoint, { x: midX, y: startPoint.y }, { x: midX, y: endPoint.y }, endPoint];
      } else {
        // 垂直为主，先垂直到中点，水平，再垂直
        newPoints = [startPoint, { x: startPoint.x, y: midY }, { x: endPoint.x, y: midY }, endPoint];
      }
    }

    updateLinePath(selectedLineId, selectedElementId, newPoints);
  };

  const handleBuildTrack = () => {
    if (!currentProject || !trackStartStation || !trackEndStation || !trackLineId) return;

    // 检查是否已存在相同的轨道（相同的起点、终点和线路）
    const startStation = currentProject.stations.find(s => s.id === trackStartStation);
    const endStation = currentProject.stations.find(s => s.id === trackEndStation);
    const line = currentProject.lines.find(l => l.id === trackLineId);

    if (!startStation || !endStation || !line) return;

    // 检查是否已存在连接这两个站点的路径（同名同色检查）
    const existingPath = line.paths.find(path => {
      const pathPoints = path.points;
      if (pathPoints.length < 2) return false;
      const startMatch =
        (pathPoints[0].x === startStation.position.x && pathPoints[0].y === startStation.position.y) ||
        (pathPoints[0].x === endStation.position.x && pathPoints[0].y === endStation.position.y);
      const endMatch =
        (pathPoints[pathPoints.length - 1].x === startStation.position.x && pathPoints[pathPoints.length - 1].y === startStation.position.y) ||
        (pathPoints[pathPoints.length - 1].x === endStation.position.x && pathPoints[pathPoints.length - 1].y === endStation.position.y);
      return startMatch && endMatch;
    });

    if (existingPath) {
      alert(`【${line.name}】已存在连接这两个站点的轨道`);
      return;
    }

    // 检查站点是否已经在该线路中，如果不在则添加
    const startInLine = line.stations.includes(startStation.id);
    const endInLine = line.stations.includes(endStation.id);

    // 创建轨道连接
    addLinePath(trackLineId, [startStation.position, endStation.position]);

    // 将站点添加到线路中（如果不在的话）
    if (!startInLine || !endInLine) {
      const { updateLine } = useGameStore.getState();
      const updatedStations = [...line.stations];
      if (!startInLine) updatedStations.push(startStation.id);
      if (!endInLine) updatedStations.push(endStation.id);
      updateLine(line.id, { stations: updatedStations });
    }

    // 更新站点的线路列表（支持多线路）
    if (!startStation.lines.includes(trackLineId)) {
      const { updateStation } = useGameStore.getState();
      updateStation(startStation.id, { lines: [...startStation.lines, trackLineId] });
    }
    if (!endStation.lines.includes(trackLineId)) {
      const { updateStation } = useGameStore.getState();
      updateStation(endStation.id, { lines: [...endStation.lines, trackLineId] });
    }

    // 关闭对话框并重置状态
    setShowTrackDialog(false);
    setTrackStartStation('');
    setTrackEndStation('');
    setTrackLineId('');
  };

  const currentStyle = cityStyles.find(s => s.id === selectedStyle);

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Train className="w-5 h-5 text-blue-600" />
          轨道线路图设计器
        </h1>
      </div>

      {/* Project Section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">项目</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            新建
          </button>
          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            打开
          </button>
        </div>
        
        {currentProject && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">{currentProject.name}</p>
            <div className="flex gap-3 mt-1 text-xs text-blue-600">
              <span>{currentProject.lines.length} 条线路</span>
              <span>{currentProject.stations.length} 个站点</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowExport(true)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white hover:bg-gray-50 text-blue-600 rounded text-xs font-medium transition-colors border border-blue-200"
              >
                <Download className="w-3 h-3" />
                导出
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      {currentProject && (
        <div className="flex border-b border-gray-200">
          {(['tools', 'lines', 'stations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'tools' ? '工具' : tab === 'lines' ? '线路' : '站点'}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {currentProject && (
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tools' && (
            <div className="p-4 space-y-4">
              {/* Basic Tools */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">基础工具</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => selectTool({ type: 'select' })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      selectedTool?.type === 'select'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <MousePointer2 className="w-5 h-5" />
                    <span className="text-xs font-medium">选择</span>
                  </button>
                  <button
                    onClick={() => selectTool({ type: 'pan' })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      selectedTool?.type === 'pan'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Hand className="w-5 h-5" />
                    <span className="text-xs font-medium">平移</span>
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">缩放</h3>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setZoom((currentProject.zoom || 1) - 0.1)}
                    className="p-2 hover:bg-white rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">
                    {Math.round((currentProject.zoom || 1) * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((currentProject.zoom || 1) + 0.1)}
                    className="p-2 hover:bg-white rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Simulation Control */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">模拟</h3>
                <button
                  onClick={isPlaying ? stopSimulation : startSimulation}
                  disabled={currentProject.lines.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  {isPlaying ? (
                    <>
                      <Stop className="w-4 h-4" />
                      停止模拟
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      开始模拟
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'lines' && (
            <div className="p-4 space-y-4">
              {/* Style Selector */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">城市风格</h3>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as LineStyle)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cityStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {currentStyle?.description}
                </p>
              </div>

              {/* Line List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">线路列表</h3>
                  <button
                    onClick={() => setShowAddLine(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + 添加线路
                  </button>
                </div>
                <div className="space-y-2">
                  {currentProject.lines.map((line) => (
                    <div
                      key={line.id}
                      onClick={() => selectLine(line.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedLineId === line.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="text-sm font-medium flex-1">{line.name}</span>
                        {line.isLoop && <span className="text-xs text-purple-600">环线</span>}
                        {currentProject.lines.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLine(line.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {line.stations.length} 个站点
                        {line.startTerminus && line.endTerminus && (
                          <span className="ml-2 text-blue-500">
                            {line.stations.find(id => id === line.startTerminus) ? '起点✓' : ''}
                            {line.stations.find(id => id === line.endTerminus) ? ' 终点✓' : ''}
                          </span>
                        )}
                      </div>
                      {selectedLineId === line.id && line.stations.length >= 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTerminusDialog(true);
                            setStartTerminus(line.startTerminus || '');
                            setEndTerminus(line.endTerminus || '');
                            setIsLoopLine(line.isLoop);
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          设置终点站
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              {currentStyle && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">颜色预设</h3>
                  <div className="grid grid-cols-4 gap-1">
                    {currentStyle.colors.slice(0, 16).map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setNewLineColor(color.color)}
                        className="w-full aspect-square rounded-md border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="p-4 space-y-4">
              {/* Station Styles */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">站点类型</h3>
                <div className="space-y-2">
                  {stationStyles.map(({ style, label, icon }) => (
                    <button
                      key={style}
                      onClick={() => selectTool({ type: 'station', style })}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        selectedTool?.type === 'station' && selectedTool.style === style
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Build Track Button */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">轨道建设</h3>
                <button
                  onClick={() => {
                    setShowTrackDialog(true);
                    setTrackStartStation('');
                    setTrackEndStation('');
                    setTrackLineId(selectedLineId || '');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                >
                  <Route className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">建设轨道</span>
                </button>
              </div>

              {/* Selected Element Actions */}
              {selectedElementId && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">选中元素</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteSelected}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              )}

              {/* Selected Path Shape Control */}
              {selectedElementId && selectedElementType === 'path' && currentProject && selectedLineId && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">轨道形状</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleChangePathShape('straight')}
                      className="w-full flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">➖</span>
                      <span className="text-sm">直线</span>
                    </button>
                    <button
                      onClick={() => handleChangePathShape('single-bend')}
                      className="w-full flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">└</span>
                      <span className="text-sm">一次折线</span>
                    </button>
                    <button
                      onClick={() => handleChangePathShape('double-bend')}
                      className="w-full flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">├</span>
                      <span className="text-sm">两次折线</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button 
          onClick={() => window.open('/tutorial.html', '_blank', 'width=1000,height=800')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          查看教程
        </button>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">创建新项目</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="输入项目名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择城市风格
                </label>
                <div className="space-y-2">
                  {cityStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedStyle === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.name}</div>
                      <div className="text-xs text-gray-500">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Line Modal */}
      {showAddLine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">添加新线路</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  线路名称
                </label>
                <input
                  type="text"
                  value={newLineName}
                  onChange={(e) => setNewLineName(e.target.value)}
                  placeholder="例如：2号线"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  线路颜色
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newLineColor}
                    onChange={(e) => setNewLineColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{newLineColor}</span>
                </div>
              </div>
              {currentStyle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预设颜色
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {currentStyle.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setNewLineColor(color.color)}
                        className="w-full aspect-square rounded-md border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddLine(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddLine}
                disabled={!newLineName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">导出项目</h3>
            <p className="text-sm text-gray-600 mb-4">
              将项目导出为 JSON 文件，可以在其他设备上导入或备份。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExport(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                下载文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">导入项目</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择文件
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  或粘贴 JSON 数据
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="粘贴项目 JSON 数据..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportData('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium"
              >
                导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminus Setting Modal */}
      {showTerminusDialog && selectedLineId && currentProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">设置终点站</h3>
            {(() => {
              const line = currentProject.lines.find(l => l.id === selectedLineId);
              const lineStations = line?.stations.map(id => currentProject.stations.find(s => s.id === id)).filter((s): s is Station => s !== undefined) || [];
              return (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={isLoopLine}
                        onChange={(e) => setIsLoopLine(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">环线（起点和终点相同）</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isLoopLine ? '起点/终点站' : '起点站'}
                    </label>
                    <select
                      value={startTerminus}
                      onChange={(e) => setStartTerminus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择站点</option>
                      {lineStations.map((station) => (
                        <option key={station.id} value={station.id}>{station.name}</option>
                      ))}
                    </select>
                  </div>
                  {!isLoopLine && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        终点站
                      </label>
                      <select
                        value={endTerminus}
                        onChange={(e) => setEndTerminus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">请选择站点</option>
                        {lineStations.map((station) => (
                          <option key={station.id} value={station.id}>{station.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {isLoopLine
                      ? '环线：列车将按站点顺序循环运行'
                      : '往返线：列车将在起点和终点之间往返运行'}
                  </p>
                </div>
              );
            })()}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowTerminusDialog(false);
                  setStartTerminus('');
                  setEndTerminus('');
                  setIsLoopLine(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (startTerminus) {
                    setTerminus(selectedLineId, startTerminus, isLoopLine ? startTerminus : endTerminus, isLoopLine);
                    setShowTerminusDialog(false);
                  }
                }}
                disabled={!startTerminus || (!isLoopLine && !endTerminus)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Build Track Modal */}
      {showTrackDialog && currentProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">建设轨道</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  起点站点
                </label>
                <select
                  value={trackStartStation}
                  onChange={(e) => setTrackStartStation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择起点站点</option>
                  {currentProject.stations.map((station) => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  终点站点
                </label>
                <select
                  value={trackEndStation}
                  onChange={(e) => setTrackEndStation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择终点站点</option>
                  {currentProject.stations.map((station) => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属线路
                </label>
                <select
                  value={trackLineId}
                  onChange={(e) => setTrackLineId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择线路</option>
                  {currentProject.lines.map((line) => (
                    <option key={line.id} value={line.id}>{line.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowTrackDialog(false);
                  setTrackStartStation('');
                  setTrackEndStation('');
                  setTrackLineId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleBuildTrack}
                disabled={!trackStartStation || !trackEndStation || !trackLineId}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium"
              >
                建设
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
