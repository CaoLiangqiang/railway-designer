# 轨道线路图设计器 - 开发文档

## 版本: v1.1.0

## 环境要求

- Node.js 18+ (推荐 LTS 版本)
- npm 9+
- Git

## 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd railway-designer

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# Electron 开发模式
npm run electron:dev
```

## 项目结构

```
railway-designer/
├── docs/                    # 项目文档
│   ├── REQUIREMENTS.md      # 需求文档
│   ├── DESIGN.md            # 设计文档
│   ├── USER_MANUAL.md       # 用户手册
│   ├── PROJECT_SUMMARY.md   # 项目概览
│   └── DEVELOPMENT.md       # 开发文档
├── electron/                # Electron 主进程
│   └── main.cjs            # 主进程入口
├── public/                 # 静态资源
│   └── tutorial.html       # 教程页面
├── src/
│   ├── components/         # React 组件
│   │   ├── DesignCanvas.tsx    # 设计画布
│   │   ├── TaskPanel.tsx       # 任务面板
│   │   ├── Toolbar.tsx         # 工具栏
│   │   └── TrainSimulation.tsx # 列车模拟
│   ├── constants/          # 常量配置
│   │   └── cityStyles.ts       # 城市风格配置
│   ├── store/              # 状态管理
│   │   └── gameStore.ts        # Zustand 存储
│   ├── types/              # TypeScript 类型
│   │   └── index.ts            # 类型定义
│   ├── App.tsx            # 主应用组件
│   ├── App.css            # 应用样式
│   ├── index.css          # 全局样式
│   └── main.tsx           # 应用入口
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2 | 前端框架 |
| TypeScript | 5.9 | 类型系统 |
| Vite | 7.3 | 构建工具 |
| Zustand | 5.0 | 状态管理 |
| Tailwind CSS | 4.1 | 样式 |
| Lucide React | 0.564 | 图标库 |
| Electron | 40.4 | 桌面打包 |

## 开发命令

```bash
# 开发
npm run dev              # 启动 Vite 开发服务器
npm run electron:dev     # 启动 Electron 开发模式

# 构建
npm run build            # 构建 Web 版本
npm run preview          # 预览构建结果

# 打包
npm run electron:build:win    # 打包 Windows 应用
npm run electron:build:mac    # 打包 macOS 应用
npm run electron:build:linux  # 打包 Linux 应用

# 代码质量
npm run lint             # ESLint 检查
```

## 核心组件说明

### DesignCanvas.tsx
设计画布组件，负责：
- 站点的渲染和交互
- 轨道的渲染和选择
- 画布缩放和平移
- 站点拖拽移动
- 列车模拟动画容器

### Toolbar.tsx
左侧工具栏组件，包含四个Tab：
- **工具Tab**: 选择、平移、缩放、模拟控制
- **线路Tab**: 城市风格选择、线路管理、终点站设置
- **站点Tab**: 站点类型选择、轨道建设、元素操作
- **总览Tab**: 线路站点列表、高亮显示

### TaskPanel.tsx
右侧任务面板，负责：
- 任务列表显示和进度追踪
- 成就系统显示和解锁
- 统计信息展示

### TrainSimulation.tsx
列车模拟组件，负责：
- 列车沿轨道移动动画
- 往返和环线运行逻辑
- Canvas 渲染优化

## 状态管理

使用 Zustand 进行状态管理，主要状态包括：

```typescript
interface GameStore {
  // 项目状态
  currentProject: DesignProject | null;
  
  // 选择状态
  selectedTool: ToolType | null;
  selectedElementId: string | null;
  selectedElementType: 'station' | 'line' | 'path' | null;
  selectedLineId: string | null;
  highlightedLineId: string | null;
  
  // 模拟状态
  isPlaying: boolean;
  
  // 游戏进度
  tasks: Task[];
  achievements: Achievement[];
  unlockedItems: string[];
  simulationCount: number;
  terminusSetCount: number;
  stylesUsed: string[];
  
  // Actions...
}
```

## 核心算法

### 智能终点站识别
```typescript
// 位置: src/store/gameStore.ts
autoDetectTerminus(lineId: string) {
  // 1. 统计每个站点连接的轨道数
  // 2. 连接数为1的站点是端点
  // 3. 按坐标排序确定起点/终点
}
```

### 列车路径计算
```typescript
// 位置: src/components/TrainSimulation.tsx
getPointOnPath(path: LinePath, progress: number) {
  // 1. 计算轨道总长度
  // 2. 根据进度计算目标位置
  // 3. 在轨道段上进行线性插值
}
```

## 打包配置

项目使用 electron-builder 进行打包，配置在 package.json 中：

```json
{
  "build": {
    "appId": "com.railway.designer",
    "productName": "轨道线路图设计器",
    "win": {
      "target": ["nsis", "portable"],
      "artifactName": "${productName}_v${version}_${arch}.${ext}"
    },
    "nsis": {
      "artifactName": "${productName}_v${version}_安装版.${ext}"
    },
    "portable": {
      "artifactName": "${productName}_v${version}_便携版.${ext}"
    }
  }
}
```

## 发布流程

1. 更新版本号（package.json）
2. 更新文档（README.md, docs/）
3. 运行测试和 lint
4. 构建应用
5. 测试便携版和安装版
6. 提交代码并打 tag

## 注意事项

- Electron 主进程使用 CommonJS (.cjs)
- 渲染进程使用 ES Modules
- 状态持久化使用 localStorage
- 跨平台打包需要在对应系统上运行
