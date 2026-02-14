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
  LinePath
} from '../types';
import { getDefaultLineColor } from '../constants/cityStyles';

interface GameStore {
  currentProject: DesignProject | null;
  selectedTool: ToolType | null;
  selectedElementId: string | null;
  selectedElementType: 'station' | 'line' | null;
  selectedLineId: string | null;
  isPlaying: boolean;
  tasks: Task[];
  achievements: Achievement[];
  unlockedItems: string[];

  // 项目操作
  createProject: (name: string, mapType: MapType, style: LineStyle) => void;
  loadProject: (project: DesignProject) => void;
  saveCurrentProject: () => void;
  exportProject: () => string;
  importProject: (json: string) => boolean;

  // 线路操作
  addLine: (name: string, color: string, style: LineStyle) => void;
  updateLine: (id: string, updates: Partial<Line>) => void;
  removeLine: (id: string) => void;
  selectLine: (id: string | null) => void;
  setTerminus: (lineId: string, startStationId: string | null, endStationId: string | null, isLoop: boolean) => void;

  // 站点操作
  addStation: (station: Omit<Station, 'id'>) => void;
  updateStation: (id: string, updates: Partial<Station>) => void;
  removeStation: (id: string) => void;
  moveStation: (id: string, position: Position) => void;

  // 线路路径操作
  addLinePath: (lineId: string, points: Position[]) => void;
  removeLinePath: (lineId: string, pathId: string) => void;

  // 选择操作
  selectTool: (tool: ToolType | null) => void;
  selectElement: (id: string | null, type: 'station' | 'line' | null) => void;

  // 画布操作
  setCanvasOffset: (offset: Position) => void;
  setZoom: (zoom: number) => void;

  // 模拟控制
  startSimulation: () => void;
  stopSimulation: () => void;

  // 任务和成就
  completeTask: (taskId: string) => void;
  unlockAchievement: (achievementId: string) => void;

  // 撤销/重做
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
  }
];

const initialAchievements: Achievement[] = [
  {
    id: 'achievement-1',
    name: '设计新手',
    description: '创建第一个设计项目',
    icon: 'star',
    unlocked: false
  },
  {
    id: 'achievement-2',
    name: '轨道工程师',
    description: '创建一条包含5个站点的线路',
    icon: 'train',
    unlocked: false
  },
  {
    id: 'achievement-3',
    name: '换乘专家',
    description: '创建3个换乘站',
    icon: 'link',
    unlocked: false
  },
  {
    id: 'achievement-4',
    name: '环线大师',
    description: '创建一条环线',
    icon: 'circle',
    unlocked: false
  },
  {
    id: 'achievement-5',
    name: '多线路运营',
    description: '创建3条或以上线路',
    icon: 'subway',
    unlocked: false
  },
  {
    id: 'achievement-6',
    name: '模拟运行',
    description: '成功运行列车模拟',
    icon: 'gamepad',
    unlocked: false
  },
  {
    id: 'achievement-7',
    name: '城市设计师',
    description: '使用3种不同城市风格',
    icon: 'city',
    unlocked: false
  },
  {
    id: 'achievement-8',
    name: '终点站规划师',
    description: '为5条线路设置终点站',
    icon: 'target',
    unlocked: false
  }
];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      selectedTool: null,
      selectedElementId: null,
      selectedElementType: null,
      selectedLineId: null,
      isPlaying: false,
      tasks: initialTasks,
      achievements: initialAchievements,
      unlockedItems: [],

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
        set({
          currentProject: newProject,
          selectedTool: null,
          selectedElementId: null,
          selectedElementType: null,
          selectedLineId: defaultLine.id
        });
      },

      loadProject: (project: DesignProject) => {
        set({
          currentProject: project,
          selectedTool: null,
          selectedElementId: null,
          selectedElementType: null,
          selectedLineId: project.lines[0]?.id || null
        });
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
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      addLine: (name: string, color: string, style: LineStyle) => {
        const { currentProject } = get();
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

        set({
          currentProject: {
            ...currentProject,
            lines: [...currentProject.lines, newLine],
            updatedAt: new Date()
          },
          selectedLineId: newLine.id
        });
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
      },

      selectLine: (id: string | null) => {
        set({ selectedLineId: id });
      },

      setTerminus: (lineId: string, startStationId: string | null, endStationId: string | null, isLoop: boolean) => {
        const { currentProject } = get();
        if (!currentProject) return;

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
      },

      addStation: (station: Omit<Station, 'id'>) => {
        const { currentProject, selectedLineId } = get();
        if (!currentProject || !selectedLineId) return;

        const newStation: Station = {
          ...station,
          id: generateId(),
          lines: [selectedLineId]
        };

        set({
          currentProject: {
            ...currentProject,
            stations: [...currentProject.stations, newStation],
            lines: currentProject.lines.map(line =>
              line.id === selectedLineId
                ? { ...line, stations: [...line.stations, newStation.id] }
                : line
            ),
            updatedAt: new Date()
          }
        });
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

        set({
          currentProject: {
            ...currentProject,
            stations: currentProject.stations.filter(station => station.id !== id),
            lines: currentProject.lines.map(line => ({
              ...line,
              stations: line.stations.filter(stationId => stationId !== id)
            })),
            updatedAt: new Date()
          },
          selectedElementId: null
        });
      },

      moveStation: (id: string, position: Position) => {
        const { currentProject } = get();
        if (!currentProject) return;

        set({
          currentProject: {
            ...currentProject,
            stations: currentProject.stations.map(station =>
              station.id === id ? { ...station, position } : station
            ),
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

      selectTool: (tool: ToolType | null) => {
        set({ selectedTool: tool });
      },

      selectElement: (id: string | null, type: 'station' | 'line' | null) => {
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
        set({ isPlaying: true });
      },

      stopSimulation: () => {
        set({ isPlaying: false });
      },

      completeTask: (taskId: string) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, completed: true } : task
          )
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

      undo: () => {
        // 撤销逻辑
      },

      redo: () => {
        // 重做逻辑
      }
    }),
    {
      name: 'railway-designer-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        achievements: state.achievements,
        unlockedItems: state.unlockedItems
      })
    }
  )
);
