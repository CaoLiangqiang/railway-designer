# 轨道线路图设计器 - 开发文档

## 目录

1. [开发环境搭建](#1-开发环境搭建)
2. [项目结构](#2-项目结构)
3. [核心模块](#3-核心模块)
4. [开发规范](#4-开发规范)
5. [调试技巧](#5-调试技巧)
6. [构建与发布](#6-构建与发布)

---

## 1. 开发环境搭建

### 1.1 环境要求

- **Node.js**: 18+ (推荐 LTS 版本)
- **npm**: 9+
- **操作系统**: Windows 10+/macOS 10.15+/Linux

### 1.2 安装步骤

```bash
# 克隆项目
git clone <repository-url>
cd railway-designer

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 1.3 开发模式

**浏览器模式**（推荐用于 UI 开发）：
```bash
npm run dev
# 访问 http://localhost:5173/
```

**Electron 模式**（用于桌面功能测试）：
```bash
npm run electron:dev
```

---

## 2. 项目结构

```
railway-designer/
├── docs/                          # 项目文档
│   ├── REQUIREMENTS.md            # 需求文档
│   ├── DESIGN.md                  # 设计文档
│   ├── USER_MANUAL.md             # 用户手册
│   └── DEVELOPMENT.md             # 开发文档（本文档）
│
├── electron/                      # Electron 主进程
│   └── main.cjs                   # 主进程入口
│
├── public/                        # 静态资源
│   └── vite.svg                   # 应用图标
│
├── src/                           # 源代码
│   ├── components/                # React 组件
│   │   ├── DesignCanvas.tsx       # 设计画布（核心）
│   │   ├── Toolbar.tsx            # 工具栏
│   │   ├── TaskPanel.tsx          # 任务面板
│   │   └── TrainSimulation.tsx    # 列车模拟
│   │
│   ├── constants/                 # 常量配置
│   │   └── cityStyles.ts          # 城市风格配置
│   │
│   ├── store/                     # 状态管理
│   │   └── gameStore.ts           # Zustand Store
│   │
│   ├── types/                     # TypeScript 类型
│   │   └── index.ts               # 类型定义
│   │
│   ├── App.tsx                    # 主应用组件
│   ├── App.css                    # 应用样式
│   ├── index.css                  # 全局样式
│   └── main.tsx                   # 应用入口
│
├── index.html                     # HTML 模板
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript 配置
├── vite.config.ts                 # Vite 配置
├── tailwind.config.js             # Tailwind 配置
└── eslint.config.js               # ESLint 配置
```

---

## 3. 核心模块

### 3.1 状态管理 (gameStore.ts)

#### Store 结构

```typescript
interface GameState {
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
```

#### 核心 Actions

**项目管理**：
```typescript
createProject: (name: string, style: LineStyle) => void;
exportProject: () => void;
importProject: (file: File) => Promise<void>;
```

**线路管理**：
```typescript
addLine: (name: string, color: string, style: LineStyle) => void;
removeLine: (id: string) => void;
updateLine: (id: string, updates: Partial<Line>) => void;
setTerminus: (lineId: string, startId: string | null, endId: string | null, isLoop: boolean) => void;
```

**站点管理**：
```typescript
addStation: (station: Omit<Station, 'id'>, addToLine?: boolean) => void;
removeStation: (id: string) => void;
updateStation: (id: string, updates: Partial<Station>) => void;
moveStation: (id: string, position: Position) => void;
```

**轨道管理**：
```typescript
addLinePath: (lineId: string, points: Position[]) => void;
removeLinePath: (lineId: string, pathId: string) => void;
updateLinePath: (lineId: string, pathId: string, points: Position[]) => void;
```

### 3.2 设计画布 (DesignCanvas.tsx)

#### 主要功能

- **渲染**：SVG 画布，渲染网格、线路、轨道、站点
- **交互**：鼠标点击、拖拽、键盘事件
- **坐标转换**：屏幕坐标与画布坐标的转换

#### 核心函数

```typescript
// 屏幕坐标转画布坐标
const screenToCanvas = (screenX: number, screenY: number): Position

// 吸附到网格
const snapToGrid = (value: number): number

// 渲染站点
const renderStation = (station: Station) => JSX.Element

// 渲染所有轨道
const renderAllPaths = () => JSX.Element
```

### 3.3 工具栏 (Toolbar.tsx)

#### 主要功能

- 线路管理（添加、删除、切换）
- 站点类型选择
- 轨道建设
- 选中元素操作

#### 核心状态

```typescript
const [showAddLine, setShowAddLine] = useState(false);
const [newLineName, setNewLineName] = useState('');
const [showTrackDialog, setShowTrackDialog] = useState(false);
const [trackStartStation, setTrackStartStation] = useState('');
const [trackEndStation, setTrackEndStation] = useState('');
const [trackLineId, setTrackLineId] = useState('');
```

### 3.4 列车模拟 (TrainSimulation.tsx)

#### 主要功能

- 列车动画渲染
- 路径计算
- 运行状态管理

#### 核心算法

```typescript
// 计算列车位置
const calculateTrainPosition = (
  paths: LinePath[],
  progress: number
): Position => {
  // 1. 计算总路径长度
  // 2. 根据 progress 确定当前段
  // 3. 在段内插值计算位置
};
```

---

## 4. 开发规范

### 4.1 代码风格

- 使用 TypeScript 严格模式
- 使用函数式组件和 Hooks
- 组件文件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

### 4.2 类型定义

所有类型定义在 `src/types/index.ts`：

```typescript
// 命名规范
interface DesignProject { }  // 接口使用 PascalCase
type LineStyle = string;      // 类型别名使用 PascalCase
const MAX_LINES = 10;         // 常量使用 UPPER_SNAKE_CASE
```

### 4.3 组件规范

```typescript
// 组件结构
import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { Station } from '../types';

interface Props {
  station: Station;
}

export const StationComponent: React.FC<Props> = ({ station }) => {
  // 1. Hooks
  const { selectElement } = useGameStore();
  
  // 2. 事件处理
  const handleClick = () => {
    selectElement(station.id, 'station');
  };
  
  // 3. 渲染
  return (
    <div onClick={handleClick}>
      {station.name}
    </div>
  );
};
```

### 4.4 状态管理规范

```typescript
// Store 中的 Action 命名
addStation      // 添加
removeStation   // 删除
updateStation   // 更新
selectStation   // 选择
moveStation     // 移动

// 使用规范
const { addStation, removeStation } = useGameStore();

// 不要在组件中直接修改状态
// ❌ 错误
store.stations.push(newStation);

// ✅ 正确
addStation(newStation);
```

---

## 5. 调试技巧

### 5.1 浏览器开发者工具

**React DevTools**：
- 检查组件层次结构
- 查看 Props 和 State
- 追踪渲染性能

**Redux DevTools**（Zustand 兼容）：
- 查看状态变化历史
- 时间旅行调试

### 5.2 日志调试

```typescript
// 在关键位置添加日志
console.log('Current project:', currentProject);
console.log('Selected element:', selectedElementId, selectedElementType);
```

### 5.3 状态检查

在浏览器控制台中检查状态：

```javascript
// 获取完整状态
const state = JSON.parse(localStorage.getItem('railway-designer-storage'));
console.log(state);

// 检查特定项目
console.log(state.state.currentProject);
```

### 5.4 常见问题调试

**问题：状态不更新**
- 检查是否正确使用了 Store 的方法
- 检查组件是否正确订阅了状态

**问题：渲染异常**
- 检查 SVG 路径数据格式
- 检查坐标计算是否正确

**问题：性能问题**
- 使用 React DevTools Profiler
- 检查不必要的重渲染

---

## 6. 构建与发布

### 6.1 代码检查

```bash
# 运行 ESLint
npm run lint

# 修复自动修复的问题
npm run lint -- --fix
```

### 6.2 构建生产版本

```bash
# 构建前端
npm run build

# 输出目录：dist/
```

### 6.3 打包桌面应用

**Windows**：
```bash
npm run electron:build:win

# 输出：
# - dist-electron/轨道线路图设计器 Setup 1.0.0.exe
# - dist-electron/轨道线路图设计器_v1.0.0_便携版.exe
```

**macOS**：
```bash
npm run electron:build:mac

# 输出：dist-electron/轨道线路图设计器-1.0.0.dmg
```

**Linux**：
```bash
npm run electron:build:linux

# 输出：dist-electron/轨道线路图设计器-1.0.0.AppImage
```

### 6.4 发布检查清单

- [ ] 版本号已更新（package.json）
- [ ] 所有测试通过
- [ ] 代码检查无错误
- [ ] 文档已更新
- [ ] 构建成功
- [ ] 安装包可正常安装运行

---

## 7. 扩展开发

### 7.1 添加新城市风格

1. 在 `src/constants/cityStyles.ts` 添加配置：

```typescript
{
  id: 'newcity',
  name: '新城市',
  lineWidth: 8,
  stationSize: 12,
  colors: ['#FF0000', '#00FF00', '#0000FF']
}
```

2. 在任务系统中添加解锁条件

### 7.2 添加新轨道形状

1. 在类型定义中添加：

```typescript
type PathType = 'straight' | 'single-bend' | 'double-bend' | 'new-shape';
```

2. 在 `handleChangePathShape` 中添加计算逻辑

### 7.3 添加新任务/成就

1. 在 `gameStore.ts` 初始状态中添加：

```typescript
tasks: [
  ...existingTasks,
  {
    id: 'new-task',
    title: '新任务',
    description: '任务描述',
    completed: false,
    unlocked: false
  }
]
```

2. 在相应操作中添加进度更新逻辑

---

## 8. 参考资源

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Zustand 文档](https://docs.pmnd.rs/zustand)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Electron 文档](https://www.electronjs.org/docs)
- [Vite 文档](https://vitejs.dev/guide/)

---

## 9. 更新日志

### v1.0.0 (2024-02)
- 初始版本发布
- 实现所有核心功能
- 完整的文档体系
