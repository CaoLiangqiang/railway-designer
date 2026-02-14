# 轨道线路图设计器 - 设计文档

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层 (Electron)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Toolbar     │  │ DesignCanvas │  │  TaskPanel   │       │
│  │  (工具栏)     │  │  (设计画布)   │  │  (任务面板)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                           │                                 │
│  ┌────────────────────────┴────────────────────────┐       │
│  │              TrainSimulation                     │       │
│  │               (列车模拟)                          │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      状态管理层 (Zustand)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  gameStore.ts                        │   │
│  │  - 项目管理 (currentProject)                         │   │
│  │  - 选中状态 (selectedTool, selectedElementId)        │   │
│  │  - 线路数据 (lines: Line[])                          │   │
│  │  - 站点数据 (stations: Station[])                    │   │
│  │  - 任务系统 (tasks, achievements)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      数据持久化层                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              localStorage (自动保存)                 │   │
│  │  - 项目数据持久化                                     │   │
│  │  - 任务进度持久化                                     │   │
│  │  - 成就状态持久化                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 数据流

```
用户操作 → 组件事件 → Store Action → 状态更新 → 组件重渲染
                ↓
         localStorage (自动保存)
```

## 2. 数据模型

### 2.1 核心类型定义

```typescript
// 项目
interface DesignProject {
  id: string;
  name: string;
  style: LineStyle;      // 城市风格
  lines: Line[];
  stations: Station[];
  canvasOffset: Position;
  zoom: number;
  createdAt: Date;
  updatedAt: Date;
}

// 线路
interface Line {
  id: string;
  name: string;
  color: string;
  style: LineStyle;
  stations: string[];     // 站点ID列表
  paths: LinePath[];      // 轨道路径
  startStationId: string | null;
  endStationId: string | null;
  isLoop: boolean;
}

// 轨道路径
interface LinePath {
  id: string;
  points: Position[];     // 路径点坐标
  type: 'straight' | 'single-bend' | 'double-bend';
}

// 站点
interface Station {
  id: string;
  name: string;
  position: Position;
  style: StationStyle;
  lines: string[];        // 所属线路ID列表
  isTransfer: boolean;
  isTerminus: boolean;
}

// 坐标
interface Position {
  x: number;
  y: number;
}
```

### 2.2 数据关系

```
Project 1 ─── N Line
  │              │
  │              ├── N LinePath
  │              │
  │              └── N Station (通过 stations 数组关联)
  │
  └── N Station
```

## 3. 组件设计

### 3.1 组件层次结构

```
App.tsx
├── Toolbar (左侧工具栏)
│   ├── 线路管理区域
│   ├── 站点类型选择
│   ├── 轨道建设按钮
│   └── 选中元素操作
│
├── DesignCanvas (中间画布)
│   ├── SVG 画布
│   │   ├── 网格背景
│   │   ├── 线路渲染 (renderLine)
│   │   ├── 轨道渲染 (renderAllPaths)
│   │   └── 站点渲染 (renderStation)
│   └── 交互层
│       ├── 点击添加站点
│       ├── 拖拽移动站点
│       ├── 选中轨道
│       └── 键盘事件处理
│
├── TaskPanel (右侧面板)
│   ├── 任务列表
│   ├── 成就列表
│   └── 统计信息
│
└── TrainSimulation (列车模拟)
    └── 列车动画渲染
```

### 3.2 组件职责

| 组件 | 职责 |
|------|------|
| Toolbar | 提供线路、站点管理功能，显示选中元素操作 |
| DesignCanvas | 渲染画布，处理鼠标/键盘交互 |
| TaskPanel | 显示任务进度、成就状态、项目统计 |
| TrainSimulation | 列车动画模拟 |

## 4. 状态管理

### 4.1 Store 结构

```typescript
interface GameState {
  // 项目数据
  currentProject: DesignProject | null;
  
  // 选中状态
  selectedTool: ToolType | null;
  selectedElementId: string | null;
  selectedElementType: 'station' | 'line' | 'path' | null;
  selectedLineId: string | null;
  
  // 运行状态
  isPlaying: boolean;
  
  // 任务成就
  tasks: Task[];
  achievements: Achievement[];
  unlockedItems: string[];
}
```

### 4.2 核心 Actions

| Action | 功能 |
|--------|------|
| createProject | 创建新项目 |
| addLine | 添加线路 |
| removeLine | 删除线路 |
| addStation | 添加站点 |
| removeStation | 删除站点（同时删除相连轨道）|
| moveStation | 移动站点（同时更新相连轨道）|
| addLinePath | 添加轨道 |
| removeLinePath | 删除轨道 |
| updateLinePath | 更新轨道形状 |
| selectElement | 选中元素 |
| startSimulation | 开始模拟 |
| stopSimulation | 停止模拟 |

## 5. 核心算法

### 5.1 轨道形状计算

#### 直线
```
起点 ──────────────── 终点
points = [start, end]
```

#### 一次折线
```
起点 ───────┐
            │
            └────── 终点

如果 |dx| > |dy|:
  points = [start, (end.x, start.y), end]
否则:
  points = [start, (start.x, end.y), end]
```

#### 两次折线
```
起点 ───┐
        │
        ├─── 中点 ───┐
        │            │
        └────────────┘
                       └────── 终点

中点 = ((start.x + end.x) / 2, (start.y + end.y) / 2)

如果 |dx| > |dy|:
  points = [start, (mid.x, start.y), (mid.x, end.y), end]
否则:
  points = [start, (start.x, mid.y), (end.x, mid.y), end]
```

### 5.2 多条轨道线条粗细计算

```typescript
const pathCount = getPathCountBetweenStations(startPos, endPos);
const lineWidth = Math.max(3, baseLineWidth - (pathCount - 1) * 2);
```

### 5.3 列车路径计算

1. 获取线路的所有轨道路径
2. 按顺序连接路径点
3. 计算总长度和每段长度
4. 根据运行时间和速度计算当前位置

## 6. 交互设计

### 6.1 鼠标交互

| 操作 | 功能 |
|------|------|
| 左键点击空白处 | 添加站点（选中站点工具时）|
| 左键点击站点 | 选中站点 |
| 左键拖拽站点 | 移动站点 |
| 左键点击轨道 | 选中轨道 |
| 中键拖拽 | 平移画布 |
| 滚轮 | 缩放画布 |

### 6.2 键盘交互

| 按键 | 功能 |
|------|------|
| Delete / Backspace | 删除选中的站点或轨道 |
| Esc | 取消选择 |

## 7. 视觉设计

### 7.1 城市风格配置

```typescript
interface CityStyle {
  id: string;
  name: string;
  lineWidth: number;
  stationSize: number;
  colors: string[];
}
```

### 7.2 站点样式

- **普通站**：圆形，白色填充，灰色边框
- **换乘站**：双圆环，白色填充，灰色边框

### 7.3 选中状态

- 站点：蓝色边框加粗
- 轨道：蓝色高亮，线条加粗

## 8. 性能优化

### 8.1 渲染优化
- 使用 SVG 渲染，硬件加速
- 轨道线条使用 `pointer-events: stroke` 优化点击检测

### 8.2 状态更新优化
- 使用 Zustand 的细粒度更新
- 避免不必要的状态复制

### 8.3 存储优化
- localStorage 自动保存，防抖处理

## 9. 错误处理

### 9.1 数据校验
- 线路名称唯一性校验
- 站点名称唯一性校验
- 轨道重复性校验

### 9.2 用户提示
- 使用 alert 显示错误信息
- 选中状态视觉反馈

## 10. 扩展性设计

### 10.1 新增城市风格
1. 在 `cityStyles.ts` 添加配置
2. 在任务系统中添加解锁条件

### 10.2 新增轨道形状
1. 在类型定义中添加新形状
2. 在 `handleChangePathShape` 中添加计算逻辑

### 10.3 新增任务/成就
1. 在 `gameStore.ts` 初始状态中添加
2. 在相应操作中添加进度更新逻辑
