export type LineStyle = 'shmetro' | 'bjmetro' | 'gzmetro' | 'mtr' | 'tokyo';

export type StationStyle = 'shmetro-basic' | 'shmetro-int' | 'bjmetro-basic' | 'bjmetro-int' | 'gzmetro-basic' | 'gzmetro-int';

export interface Position {
  x: number;
  y: number;
}

export interface Line {
  id: string;
  name: string;
  color: string;
  style: LineStyle;
  stations: string[];
  paths: LinePath[];
  startTerminus: string | null;
  endTerminus: string | null;
  isLoop: boolean;
}

export interface LinePath {
  id: string;
  lineId: string;
  points: Position[];
  type: 'straight' | 'curve' | 'diagonal';
}

export interface Station {
  id: string;
  name: string;
  secondaryName?: string;
  position: Position;
  style: StationStyle;
  lines: string[];
  isTransfer: boolean;
  isTerminus: boolean;
  isUnderConstruction?: boolean;
}

export interface ColorPreset {
  name: string;
  color: string;
  city: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  requirements: TaskRequirement[];
  rewards: Reward[];
}

export interface TaskRequirement {
  type: 'create_line' | 'add_station' | 'set_terminus' | 'run_simulation' | 'create_transfer' | 'create_loop';
  target: number;
  current: number;
}

export interface Reward {
  type: 'line_style';
  itemId: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface DesignProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lines: Line[];
  stations: Station[];
  mapType: MapType;
  canvasOffset: Position;
  zoom: number;
}

export type MapType = 'modern' | 'future' | 'cartoon';

export interface GameState {
  currentProject: DesignProject | null;
  selectedTool: ToolType | null;
  selectedElementId: string | null;
  selectedElementType: 'station' | 'line' | 'path' | null;
  selectedLineId: string | null;
  isPlaying: boolean;
  tasks: Task[];
  achievements: Achievement[];
  unlockedItems: string[];
}

export type ToolType = 
  | { type: 'station'; style: StationStyle }
  | { type: 'select' }
  | { type: 'pan' };

export interface CityStyle {
  id: LineStyle;
  name: string;
  description: string;
  lineWidth: number;
  stationSize: number;
  colors: ColorPreset[];
}
