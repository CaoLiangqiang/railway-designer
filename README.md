# 轨道线路图设计器

一个专为小朋友设计的地铁线路图创作工具，支持多种城市风格，可自由绘制线路、添加站点，并运行列车模拟。

![版本](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 功能特性

### 核心功能
- **多城市风格支持**：上海、北京、广州、港铁、东京等多种地铁风格
- **线路管理**：创建多条线路，每条线路独立设置颜色和名称
- **站点设计**：支持普通站和换乘站两种类型
- **轨道建设**：支持直线、一次折线、两次折线三种轨道形状
- **终点站设置**：支持往返线和环线两种运行模式
- **列车模拟**：实时观看列车在线路上运行
- **项目导出/导入**：保存和分享你的设计作品

### 任务与成就系统
- **任务系统**：6个渐进式任务，引导用户学习各项功能
  - 初识线路：创建包含3个站点的线路
  - 设置终点站：为线路设置起点和终点站
  - 运行模拟：成功运行列车模拟
  - 换乘枢纽：创建一个换乘站
  - 环线设计：创建一条环线
  - 多线路运营：创建3条线路

- **成就系统**：8个成就等待解锁
  - 设计新手、轨道工程师、换乘专家、环线大师
  - 多线路运营、模拟运行、城市设计师、终点站规划师

- **奖励机制**：完成任务解锁新的城市风格

## 快速开始

### 方式一：直接运行（推荐）

下载 `轨道线路图设计器_v1.0.0_便携版.exe`，双击即可运行，无需安装。

### 方式二：安装版

下载 `轨道线路图设计器 Setup 1.0.0.exe`，按照向导安装后使用。

### 方式三：开发环境运行

#### 环境要求
- [Node.js](https://nodejs.org/) 18+ (推荐 LTS 版本)
- npm 9+

#### 安装与运行

1. 克隆或下载本项目
2. 进入项目目录
3. 安装依赖：

```bash
npm install
```

4. 启动开发服务器：

```bash
# 浏览器开发模式
npm run dev

# Electron 桌面应用开发模式
npm run electron:dev
```

5. 浏览器会自动打开应用，或手动访问 `http://localhost:5173/`

## 使用指南

### 1. 创建项目
- 点击"新建"按钮
- 输入项目名称
- 选择喜欢的城市风格

### 2. 添加线路
- 在"线路"标签页点击"添加线路"
- 输入线路名称（不能重复）
- 从预设颜色中选择线路颜色

### 3. 添加站点
- 在"站点"标签页选择站点类型
- 在画布上点击放置站点
- 使用"自动连接至前一站点"开关控制是否自动连线
- 站点名称在整个项目中不能重复

### 4. 建设轨道
- 在"站点"标签页点击"建设轨道"
- 选择起点站点、终点站点和所属线路
- 同一线路在两个站点间只能有一条轨道

### 5. 编辑轨道
- 使用"选择"工具点击轨道
- 在"轨道形状"区域切换形状（直线/一次折线/两次折线）
- 按 Delete 键删除选中的轨道

### 6. 设置终点站
- 点击线路的"设置终点站"按钮
- 选择起点站和终点站
- 可选择设置为环线

### 7. 运行模拟
- 点击"开始模拟"按钮
- 观看列车在线路上运行

### 8. 查看任务进度
- 右侧面板显示当前任务和成就进度
- 完成任务自动解锁奖励

### 快捷键

| 按键 | 功能 |
|------|------|
| Delete / Backspace | 删除选中的站点或轨道 |
| Esc | 取消选择 |
| 滚轮 | 缩放画布 |
| 鼠标中键拖拽 | 平移画布 |

## 技术实现

### 技术栈
- **前端框架**: React 19 + TypeScript 5.9
- **构建工具**: Vite 7
- **状态管理**: Zustand (持久化存储)
- **样式**: Tailwind CSS 4
- **图标**: Lucide React
- **桌面打包**: Electron 40 + electron-builder

### 架构设计
- **组件化设计**：UI 拆分为独立组件，职责单一
- **状态集中管理**：使用 Zustand 管理全局状态，支持持久化
- **类型安全**：TypeScript 严格模式，类型定义完整
- **响应式布局**：适配不同屏幕尺寸

### 核心算法
- **任务进度追踪**：监听用户操作，自动更新任务进度
- **成就解锁检测**：在关键操作时检查成就条件
- **列车路径计算**：基于线路路径点计算列车运行轨迹
- **画布坐标转换**：支持缩放、平移后的坐标映射
- **轨道形状计算**：根据起点终点计算直线、折线路径

## 项目结构

```
railway-designer/
├── docs/                    # 项目文档
│   ├── REQUIREMENTS.md      # 需求文档
│   ├── DESIGN.md            # 设计文档
│   ├── USER_MANUAL.md       # 用户手册
│   └── DEVELOPMENT.md       # 开发文档
├── electron/                # Electron 主进程
│   └── main.cjs            # 主进程入口 (CommonJS)
├── public/                 # 静态资源
│   └── vite.svg            # 应用图标
├── src/
│   ├── components/         # React 组件
│   │   ├── DesignCanvas.tsx    # 设计画布 (核心交互)
│   │   ├── TaskPanel.tsx       # 任务面板 (任务/成就/统计)
│   │   ├── Toolbar.tsx         # 工具栏 (线路/站点/操作)
│   │   └── TrainSimulation.tsx # 列车模拟
│   ├── constants/          # 常量配置
│   │   └── cityStyles.ts       # 城市风格配置
│   ├── store/              # 状态管理
│   │   └── gameStore.ts        # Zustand 状态存储
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

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# Electron 开发模式
npm run electron:dev

# 构建生产版本
npm run build

# 打包 Windows 应用
npm run electron:build:win

# 打包 macOS 应用
npm run electron:build:mac

# 打包 Linux 应用
npm run electron:build:linux

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Edge
- Safari

## 许可证

MIT License

## 致谢

本项目灵感来源于 [Rail Map Toolkit](https://railmapgen.github.io/)
