# Railway Designer 项目规则

## 项目概述
这是一个专为小朋友设计的地铁线路图创作工具，支持多种城市风格，可自由绘制线路、添加站点，并运行列车模拟。

## 技术栈
- **前端框架**: React 19 + TypeScript 5.9
- **构建工具**: Vite 7
- **状态管理**: Zustand (持久化存储)
- **样式**: Tailwind CSS 4
- **图标**: Lucide React
- **桌面打包**: Electron 40 + electron-builder

## 常用命令

### 开发
```bash
npm run dev              # 启动开发服务器
npm run electron:dev     # 启动 Electron 开发模式
```

### 构建与打包
```bash
npm run build                    # TypeScript 编译 + Vite 构建
npm run electron:build:win       # 打包 Windows 安装版和便携版
npm run electron:build:mac       # 打包 macOS 版本
npm run electron:build:linux     # 打包 Linux 版本
```

### 代码检查
```bash
npm run lint             # 运行 ESLint 检查
```

### 预览
```bash
npm run preview          # 预览生产构建
```

## 项目结构
```
railway-designer/
├── electron/              # Electron 主进程
│   └── main.cjs          # 主进程入口 (CommonJS 格式)
├── public/               # 静态资源
│   ├── tutorial.html     # 使用教程
│   └── vite.svg          # 应用图标
├── src/
│   ├── components/       # React 组件
│   │   ├── DesignCanvas.tsx    # 设计画布 (核心交互)
│   │   ├── TaskPanel.tsx       # 任务面板 (任务/成就/统计)
│   │   ├── Toolbar.tsx         # 工具栏 (线路/站点/操作)
│   │   └── TrainSimulation.tsx # 列车模拟
│   ├── constants/        # 常量配置
│   │   └── cityStyles.ts       # 城市风格配置
│   ├── store/            # 状态管理
│   │   └── gameStore.ts        # Zustand 状态存储
│   ├── types/            # TypeScript 类型
│   │   └── index.ts            # 类型定义
│   ├── App.tsx          # 主应用组件
│   ├── App.css          # 应用样式
│   ├── index.css        # 全局样式
│   └── main.tsx         # 应用入口
├── dist/                 # 前端构建输出
├── dist-electron/        # Electron 打包输出
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 代码规范
- 使用 TypeScript 严格模式
- 使用 ESLint 进行代码检查
- 组件使用函数式组件 + Hooks
- 状态管理使用 Zustand
- 样式使用 Tailwind CSS

## 类型定义
主要类型定义在 `src/types/index.ts` 中：
- `Line`: 线路
- `Station`: 站点
- `LineStyle`: 线路风格 (shmetro, bjmetro, gzmetro, mtr, tokyo)
- `StationStyle`: 站点风格
- `GameState`: 游戏状态
- `DesignProject`: 设计项目
- `Task`: 任务
- `Achievement`: 成就
- `TaskRequirement`: 任务要求

## 任务与成就系统
- 任务进度自动追踪，完成条件后自动完成
- 成就解锁后显示通知
- 奖励自动发放到 `unlockedItems`
- 数据持久化存储在 localStorage

## 注意事项
- 这是一个面向儿童的应用，UI 设计应简洁友好
- 支持多城市地铁风格（上海、北京、广州、港铁、东京）
- 支持项目导出/导入功能
- 打包时如遇签名问题，可设置 `signAndEditExecutable: false`

## 常见问题

### ES Module 兼容性问题
项目使用 `"type": "module"` 配置，但 Electron 主进程需要使用 CommonJS。
**解决方案**: 将主进程文件命名为 `.cjs` 扩展名（如 `main.cjs`），并在 `package.json` 中正确配置 `main` 入口。

### 打包文件被占用
如果打包时出现 "The process cannot access the file" 错误，说明之前的打包进程未完全退出。
**解决方案**: 
1. 终止所有 app-builder 和 electron 进程
2. 删除 `dist-electron` 目录
3. 重新运行打包命令
