import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Task,
  Achievement,
  DesignProject,
  MapType,
  Position,
  Station,
  Line,
  LineStyle,
  ToolType,
  LinePath,
  TaskRequirement
} from '../types';
import { getDefaultLineColor } from '../constants/cityStyles';

interface GameStore {
  currentProject: DesignProject | null;
  selectedTool: ToolType | null;
  selectedElementId: string | null;
  selectedElementType: 'station' | 'line' | 'path' | null;
  selectedLineId: string | null;
  highlightedLineId: string | null;
  isPlaying: boolean;
  tasks: Task[];
  achievements: Achievement[];
  unlockedItems: string[];
  simulationCount: number;
  terminusSetCount: number;
  stylesUsed: string[];

  createProject: (name: string, mapType: MapType, style: LineStyle) => void;
  loadProject: (project: DesignProject) => void;
  saveCurrentProject: () => void;
  exportProject: () => string;
  importProject: (json: string) => boolean;

  addLine: (name: string, color: string, style: LineStyle) => void;
  updateLine: (id: string, updates: Partial<Line>) => void;
  removeLine: (id: string) => void;
  selectLine: (id: string | null) => void;
  setTerminus: (lineId: string, startStationId: string | null, endStationId: string | null, isLoop: boolean) => void;
  autoDetectTerminus: (lineId: string) => { startId: string | null; endId: string | null };
  setHighlightedLine: (lineId: string | null) => void;

  addStation: (station: Omit<Station, 'id'>, addToLine?: boolean) => void;
  updateStation: (id: string, updates: Partial<Station>) => void;
  removeStation: (id: string) => void;
  moveStation: (id: string, position: Position) => void;

  addLinePath: (lineId: string, points: Position[]) => void;
  removeLinePath: (lineId: string, pathId: string) => void;
  updateLinePath: (lineId: string, pathId: string, points: Position[]) => void;
  removePathsByStation: (stationId: string) => void;

  selectTool: (tool: ToolType | null) => void;
  selectElement: (id: string | null, type: 'station' | 'line' | 'path' | null) => void;

  setCanvasOffset: (offset: Position) => void;
  setZoom: (zoom: number) => void;

  startSimulation: () => void;
  stopSimulation: () => void;

  completeTask: (taskId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  checkProgress: () => void;
  updateTaskProgress: (requirementType: TaskRequirement['type'], value?: number) => void;

  undo: () => void;
  redo: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: '初识线路',
    description: '创建一条包含3个站点的线路',
    difficulty: 'easy',
    completed: false,
    requirements: [{ type: 'add_station', target: 3, current: 0 }],
    rewards: [{ type: 'line_style', itemId: 'bjmetro' }]
  },
  {
    id: 'task-2',
    title: '设置终点站',
    description: '为线路设置起点和终点站',
    difficulty: 'easy',
    completed: false,
    requirements: [{ type: 'set_terminus', target: 1, current: 0 }],
    rewards: [{ type: 'line_style', itemId: 'gzmetro' }]
  },
  {
    id: 'task-3',
    title: '运行模拟',
    description: '成功运行列车模拟',
    difficulty: 'easy',
    completed: false,
    requirements: [{ type: 'run_simulation', target: 1, current: 0 }],
    rewards: [{ type: 'line_style', itemId: 'mtr' }]
  },
  {
    id: 'task-4',
    title: '换乘枢纽',
    description: '创建一个换乘站',
    difficulty: 'medium',
    completed: false,
    requirements: [{ type: 'create_transfer', target: 1, current: 0 }],
    rewards: [{ type: 'line_style', itemId: 'tokyo' }]
  },
  {
    id: 'task-5',
    title: '环线设计',
    description: '创建一条环线',
    difficulty: 'medium',
    completed: false,
    requirements: [{ type: 'create_loop', target: 1, current: 0 }],
    rewards: [{ type: 'line_style', itemId: 'shmetro' }]
  },
  {
    id: 'task-6',
    title: '多线路运营',
    description: '创建3条线路',
    difficulty: 'hard',
    completed: false,
    requirements: [{ type: 'create_line', target: 3, current: 0 }],
    rewards: [{ type: 'line_style', itemId: 'all' }]
  },
];

const initialAchievements: Achievement[] = [
  {
    id: 'achievement-1',
    name: '设计新手',
    description: '创建第一个设计项目',
    icon: '🌟',
    unlocked: false
  },
  {
    id: 'achievement-2',
    name: '轨道工程师',
    description: '创建一条包含5个站点的线路',
    icon: '🚃',
    unlocked: false
  },
  {
    id: 'achievement-3',
    name: '换乘专家',
    description: '创建3个换乘站',
    icon: '🔗',
    unlocked: false
  },
  {
    id: 'achievement-4',
    name: '环线大师',
    description: '创建一条环线',
    icon: '⭕',
    unlocked: false
  },
  {
    id: 'achievement-5',
    name: '多线路运营',
    description: '创建3条或以上线路',
    icon: '🚇',
    unlocked: false
  },
  {
    id: 'achievement-6',
    name: '模拟运行',
    description: '成功运行列车模拟',
    icon: '🎮',
    unlocked: false
  },
  {
    id: 'achievement-7',
    name: '城市设计师',
    description: '使用3种不同城市风格',
    icon: '🏙️',
    unlocked: false
  },
  {
    id: 'achievement-8',
    name: '终点站规划师',
    description: '为5条线路设置终点站',
    icon: '🎯',
    unlocked: false
  },
];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      selectedTool: null,
      selectedElementId: null,
      selectedElementType: null,
      selectedLineId: null,
      highlightedLineId: null,
      isPlaying: false,
      tasks: initialTasks,
      achievements: initialAchievements,
      unlockedItems: [],
      simulationCount: 0,
      terminusSetCount: 0,
      stylesUsed: [],

      createProject: (name: string, mapType: MapType, style: LineStyle = 'shmetro') => {
        const defaultLine: Line = {
          id: generateId(),
          name: '1号线',
          color: getDefaultLineColor(style, 0),
          style,
          stations: [],
          paths: [],
          startTerminus: null,
          endTerminus: null,
          isLoop: false
        };

        const newProject: DesignProject = {
          id: generateId(),
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
          lines: [defaultLine],
          stations: [],
          mapType,
          canvasOffset: { x: 0, y: 0 },
          zoom: 1
        };

        const { stylesUsed, achievements } = get();
        const newStylesUsed = [...new Set([...stylesUsed, style])];

        set({
          currentProject: newProject,
          selectedTool: null,
          selectedElementId: null,
          selectedElementType: null,
          selectedLineId: defaultLine.id,
          stylesUsed: newStylesUsed,
        });

        if (!achievements.find(a => a.id === 'achievement-1')?.unlocked) {
          get().unlockAchievement('achievement-1');
        }

        if (newStylesUsed.length >= 3 && !achievements.find(a => a.id === 'achievement-7')?.unlocked) {
          get().unlockAchievement('achievement-7');
        }

        get().checkProgress();
      },

      loadProject: (project: DesignProject) => {
        set({
          currentProject: project,
          selectedTool: null,
          selectedElementId: null,
          selectedElementType: null,
          selectedLineId: project.lines[0]?.id || null
        });
        get().checkProgress();
      },

      saveCurrentProject: () => {
        const { currentProject } = get();
        if (currentProject) {
          set({
            currentProject: {
              ...currentProject,
              updatedAt: new Date()
            }
          });
        }
      },

      exportProject: () => {
        const { currentProject } = get();
        if (!currentProject) return '';
        return JSON.stringify(currentProject, null, 2);
      },

      importProject: (json: string) => {
        try {
          const project: DesignProject = JSON.parse(json);
          if (project.id && project.name && project.lines) {
            set({
              currentProject: {
                ...project,
                updatedAt: new Date()
              },
              selectedTool: null,
              selectedElementId: null,
              selectedElementType: null,
              selectedLineId: project.lines[0]?.id || null
            });
            get().checkProgress();
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      addLine: (name: string, color: string, style: LineStyle) => {
        const { currentProject, stylesUsed, achievements } = get();
        if (!currentProject) return;

        const newLine: Line = {
          id: generateId(),
          name,
          color,
          style,
          stations: [],
          paths: [],
          startTerminus: null,
          endTerminus: null,
          isLoop: false
        };

        const newStylesUsed = [...new Set([...stylesUsed, style])];
        const newLines = [...currentProject.lines, newLine];

        set({
          currentProject: {
            ...currentProject,
            lines: newLines,
            updatedAt: new Date()
          },
          selectedLineId: newLine.id,
          stylesUsed: newStylesUsed,
        });

        if (newLines.length >= 3 && !achievements.find(a => a.id === 'achievement-5')?.unlocked) {
          get().unlockAchievement('achievement-5');
        }

        if (newStylesUsed.length >= 3 && !achievements.find(a => a.id === 'achievement-7')?.unlocked) {
          get().unlockAchievement('achievement-7');
        }

        get().updateTaskProgress('create_line');
        get().checkProgress();
      },

      updateLine: (id: string, updates: Partial<Line>) => {
        const { currentProject } = get();
        if (!currentProject) return;

        set({
          currentProject: {
            ...currentProject,
            lines: currentProject.lines.map(line =>
              line.id === id ? { ...line, ...updates } : line
            ),
            updatedAt: new Date()
          }
        });
      },

      removeLine: (id: string) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updatedLines = currentProject.lines.filter(line => line.id !== id);
        set({
          currentProject: {
            ...currentProject,
            lines: updatedLines,
            stations: currentProject.stations.map(station => ({
              ...station,
              lines: station.lines.filter(lineId => lineId !== id)
            })),
            updatedAt: new Date()
          },
          selectedLineId: updatedLines[0]?.id || null
        });
        get().checkProgress();
      },

      selectLine: (id: string | null) => {
        set({ selectedLineId: id });
      },

      autoDetectTerminus: (lineId: string): { startId: string | null; endId: string | null } => {
        const { currentProject } = get();
        if (!currentProject) return { startId: null, endId: null };

        const line = currentProject.lines.find(l => l.id === lineId);
        if (!line || line.stations.length < 2 || line.paths.length < 1) {
          return { startId: null, endId: null };
        }

        const stationConnectionCount = new Map<string, number>();
        line.stations.forEach(stationId => {
          stationConnectionCount.set(stationId, 0);
        });

        line.paths.forEach(path => {
          const startPos = path.points[0];
          const endPos = path.points[path.points.length - 1];
          
          line.stations.forEach(stationId => {
            const station = currentProject.stations.find(s => s.id === stationId);
            if (station) {
              if (Math.abs(station.position.x - startPos.x) < 1 && Math.abs(station.position.y - startPos.y) < 1) {
                stationConnectionCount.set(stationId, (stationConnectionCount.get(stationId) || 0) + 1);
              }
              if (Math.abs(station.position.x - endPos.x) < 1 && Math.abs(station.position.y - endPos.y) < 1) {
                stationConnectionCount.set(stationId, (stationConnectionCount.get(stationId) || 0) + 1);
              }
            }
          });
        });

        const endpoints: string[] = [];
        stationConnectionCount.forEach((count, stationId) => {
          if (count === 1) {
            endpoints.push(stationId);
          }
        });

        if (endpoints.length === 0) {
          return { startId: null, endId: null };
        }

        if (endpoints.length === 1) {
          return { startId: endpoints[0], endId: endpoints[0] };
        }

        if (endpoints.length === 2) {
          const station1 = currentProject.stations.find(s => s.id === endpoints[0]);
          const station2 = currentProject.stations.find(s => s.id === endpoints[1]);
          
          if (station1 && station2) {
            if (station1.position.y < station2.position.y || 
                (station1.position.y === station2.position.y && station1.position.x < station2.position.x)) {
              return { startId: endpoints[0], endId: endpoints[1] };
            } else {
              return { startId: endpoints[1], endId: endpoints[0] };
            }
          }
        }

        return { startId: endpoints[0] || null, endId: endpoints[1] || null };
      },

      setHighlightedLine: (lineId: string | null) => {
        set({ highlightedLineId: lineId });
      },

      setTerminus: (lineId: string, startStationId: string | null, endStationId: string | null, isLoop: boolean) => {
        const { currentProject, terminusSetCount, achievements } = get();
        if (!currentProject) return;

        const line = currentProject.lines.find(l => l.id === lineId);
        const wasLoop = line?.isLoop;
        const hadTerminus = line?.startTerminus && line?.endTerminus;

        set({
          currentProject: {
            ...currentProject,
            lines: currentProject.lines.map(line =>
              line.id === lineId
                ? { ...line, startTerminus: startStationId, endTerminus: endStationId, isLoop }
                : line
            ),
            updatedAt: new Date()
          }
        });

        if (!hadTerminus && startStationId && endStationId) {
          const newTerminusCount = terminusSetCount + 1;
          set({ terminusSetCount: newTerminusCount });

          get().updateTaskProgress('set_terminus');

          if (newTerminusCount >= 5 && !achievements.find(a => a.id === 'achievement-8')?.unlocked) {
            get().unlockAchievement('achievement-8');
          }
        }

        if (isLoop && !wasLoop) {
          get().updateTaskProgress('create_loop');
          if (!achievements.find(a => a.id === 'achievement-4')?.unlocked) {
            get().unlockAchievement('achievement-4');
          }
        }

        get().checkProgress();
      },

      addStation: (station: Omit<Station, 'id'>, addToLine: boolean = true) => {
        const { currentProject, selectedLineId, achievements } = get();
        if (!currentProject || !selectedLineId) return;

        const newStation: Station = {
          ...station,
          id: generateId(),
          lines: addToLine ? [selectedLineId] : []
        };

        const updatedLines = currentProject.lines.map(line =>
          line.id === selectedLineId && addToLine
            ? { ...line, stations: [...line.stations, newStation.id] }
            : line
        );

        set({
          currentProject: {
            ...currentProject,
            stations: [...currentProject.stations, newStation],
            lines: updatedLines,
            updatedAt: new Date()
          }
        });

        get().updateTaskProgress('add_station');

        const currentLine = updatedLines.find(l => l.id === selectedLineId);
        if (currentLine && currentLine.stations.length >= 5) {
          if (!achievements.find(a => a.id === 'achievement-2')?.unlocked) {
            get().unlockAchievement('achievement-2');
          }
        }

        if (station.isTransfer) {
          get().updateTaskProgress('create_transfer');

          const transferCount = [...currentProject.stations, newStation].filter(s => s.isTransfer).length;
          if (transferCount >= 3 && !achievements.find(a => a.id === 'achievement-3')?.unlocked) {
            get().unlockAchievement('achievement-3');
          }
        }

        get().checkProgress();
      },

      updateStation: (id: string, updates: Partial<Station>) => {
        const { currentProject } = get();
        if (!currentProject) return;

        set({
          currentProject: {
            ...currentProject,
            stations: currentProject.stations.map(station =>
              station.id === id ? { ...station, ...updates } : station
            ),
            updatedAt: new Date()
          }
        });
      },

      removeStation: (id: string) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const station = currentProject.stations.find(s => s.id === id);

        set({
          currentProject: {
            ...currentProject,
            stations: currentProject.stations.filter(station => station.id !== id),
            lines: currentProject.lines.map(line => ({
              ...line,
              stations: line.stations.filter(stationId => stationId !== id),
              // 同时删除与该站点相连的轨道
              paths: station ? line.paths.filter(path => {
                const startPoint = path.points[0];
                const endPoint = path.points[path.points.length - 1];
                const isConnectedToStation =
                  (startPoint.x === station.position.x && startPoint.y === station.position.y) ||
                  (endPoint.x === station.position.x && endPoint.y === station.position.y);
                return !isConnectedToStation;
              }) : line.paths
            })),
            updatedAt: new Date()
          },
          selectedElementId: null
        });
        get().checkProgress();
      },

      moveStation: (id: string, position: Position) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const oldStation = currentProject.stations.find(s => s.id === id);
        if (!oldStation) return;

        const oldPosition = oldStation.position;

        set({
          currentProject: {
            ...currentProject,
            stations: currentProject.stations.map(station =>
              station.id === id ? { ...station, position } : station
            ),
            // 更新与该站点相连的轨道的坐标
            lines: currentProject.lines.map(line => ({
              ...line,
              paths: line.paths.map(path => {
                // 检查路径的起点或终点是否与被移动站点相连
                const startPoint = path.points[0];
                const endPoint = path.points[path.points.length - 1];
                const isStartConnected = startPoint.x === oldPosition.x && startPoint.y === oldPosition.y;
                const isEndConnected = endPoint.x === oldPosition.x && endPoint.y === oldPosition.y;

                if (!isStartConnected && !isEndConnected) {
                  return path;
                }

                // 更新路径的坐标
                const newPoints = path.points.map((point, index) => {
                  if (index === 0 && isStartConnected) {
                    return position;
                  }
                  if (index === path.points.length - 1 && isEndConnected) {
                    return position;
                  }
                  // 中间的点如果是折线，也需要相应移动
                  // 这里简化处理，只移动起点和终点
                  return point;
                });

                return { ...path, points: newPoints };
              })
            })),
            updatedAt: new Date()
          }
        });
      },

      addLinePath: (lineId: string, points: Position[]) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const newPath: LinePath = {
          id: generateId(),
          lineId,
          points,
          type: 'straight'
        };

        set({
          currentProject: {
            ...currentProject,
            lines: currentProject.lines.map(line =>
              line.id === lineId
                ? { ...line, paths: [...line.paths, newPath] }
                : line
            ),
            updatedAt: new Date()
          }
        });
      },

      removeLinePath: (lineId: string, pathId: string) => {
        const { currentProject } = get();
        if (!currentProject) return;

        set({
          currentProject: {
            ...currentProject,
            lines: currentProject.lines.map(line =>
              line.id === lineId
                ? { ...line, paths: line.paths.filter(p => p.id !== pathId) }
                : line
            ),
            updatedAt: new Date()
          }
        });
      },

      updateLinePath: (lineId: string, pathId: string, points: Position[]) => {
        const { currentProject } = get();
        if (!currentProject) return;

        set({
          currentProject: {
            ...currentProject,
            lines: currentProject.lines.map(line =>
              line.id === lineId
                ? {
                    ...line,
                    paths: line.paths.map(p =>
                      p.id === pathId ? { ...p, points } : p
                    )
                  }
                : line
            ),
            updatedAt: new Date()
          }
        });
      },

      removePathsByStation: (stationId: string) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const station = currentProject.stations.find(s => s.id === stationId);
        if (!station) return;

        set({
          currentProject: {
            ...currentProject,
            lines: currentProject.lines.map(line => ({
              ...line,
              paths: line.paths.filter(path => {
                // 检查路径的起点或终点是否与被删除站点相连
                const startPoint = path.points[0];
                const endPoint = path.points[path.points.length - 1];
                const isConnectedToStation =
                  (startPoint.x === station.position.x && startPoint.y === station.position.y) ||
                  (endPoint.x === station.position.x && endPoint.y === station.position.y);
                return !isConnectedToStation;
              })
            })),
            updatedAt: new Date()
          }
        });
      },

      selectTool: (tool: ToolType | null) => {
        set({ selectedTool: tool });
      },

      selectElement: (id: string | null, type: 'station' | 'line' | 'path' | null) => {
        set({ selectedElementId: id, selectedElementType: type });
      },

      setCanvasOffset: (offset: Position) => {
        const { currentProject } = get();
        if (currentProject) {
          set({
            currentProject: {
              ...currentProject,
              canvasOffset: offset
            }
          });
        }
      },

      setZoom: (zoom: number) => {
        const { currentProject } = get();
        if (currentProject) {
          set({
            currentProject: {
              ...currentProject,
              zoom: Math.max(0.5, Math.min(3, zoom))
            }
          });
        }
      },

      startSimulation: () => {
        const { simulationCount, achievements } = get();
        set({ isPlaying: true, simulationCount: simulationCount + 1 });

        get().updateTaskProgress('run_simulation');

        if (!achievements.find(a => a.id === 'achievement-6')?.unlocked) {
          get().unlockAchievement('achievement-6');
        }

        get().checkProgress();
      },

      stopSimulation: () => {
        set({ isPlaying: false });
      },

      completeTask: (taskId: string) => {
        const { tasks, unlockedItems } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        const newUnlockedItems = [...unlockedItems];
        task.rewards.forEach(reward => {
          if (!newUnlockedItems.includes(reward.itemId)) {
            newUnlockedItems.push(reward.itemId);
          }
        });

        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? { ...t, completed: true } : t
          ),
          unlockedItems: newUnlockedItems
        }));
      },

      unlockAchievement: (achievementId: string) => {
        set(state => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId
              ? { ...achievement, unlocked: true, unlockedAt: new Date() }
              : achievement
          )
        }));
      },

      updateTaskProgress: (requirementType: TaskRequirement['type'], value?: number) => {
        const { currentProject } = get();
        if (!currentProject) return;

        let calculatedValue = value;

        if (calculatedValue === undefined) {
          switch (requirementType) {
            case 'add_station':
              calculatedValue = currentProject.stations.length;
              break;
            case 'create_line':
              calculatedValue = currentProject.lines.length;
              break;
            case 'create_transfer':
              calculatedValue = currentProject.stations.filter(s => s.isTransfer).length;
              break;
            case 'create_loop':
              calculatedValue = currentProject.lines.filter(l => l.isLoop).length;
              break;
            case 'set_terminus':
              calculatedValue = currentProject.lines.filter(l => l.startTerminus && l.endTerminus).length;
              break;
            case 'run_simulation':
              calculatedValue = get().simulationCount;
              break;
            default:
              calculatedValue = 0;
          }
        }

        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.completed) return task;

            const updatedRequirements = task.requirements.map(req => {
              if (req.type === requirementType) {
                return { ...req, current: calculatedValue! };
              }
              return req;
            });

            return { ...task, requirements: updatedRequirements };
          })
        }));
      },

      checkProgress: () => {
        const { tasks, currentProject } = get();
        if (!currentProject) return;

        const progressData = {
          add_station: currentProject.stations.length,
          create_line: currentProject.lines.length,
          create_transfer: currentProject.stations.filter(s => s.isTransfer).length,
          create_loop: currentProject.lines.filter(l => l.isLoop).length,
          set_terminus: currentProject.lines.filter(l => l.startTerminus && l.endTerminus).length,
          run_simulation: get().simulationCount,
        };

        Object.entries(progressData).forEach(([type, value]) => {
          get().updateTaskProgress(type as TaskRequirement['type'], value);
        });

        tasks.forEach(task => {
          if (!task.completed) {
            const allRequirementsMet = task.requirements.every(
              req => req.current >= req.target
            );
            if (allRequirementsMet) {
              get().completeTask(task.id);
            }
          }
        });
      },

      undo: () => {
      },

      redo: () => {
      }
    }),
    {
      name: 'railway-designer-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        achievements: state.achievements,
        unlockedItems: state.unlockedItems,
        simulationCount: state.simulationCount,
        terminusSetCount: state.terminusSetCount,
        stylesUsed: state.stylesUsed
      })
    }
  )
);
