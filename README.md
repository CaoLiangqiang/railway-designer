# 轨道线路图设计器

一个专为小朋友设计的地铁线路图创作工具，支持多种城市风格，可自由绘制线路、添加站点，并运行列车模拟。

![版本](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 功能特性

- **多城市风格支持**：上海、北京、广州、港铁、东京等多种地铁风格
- **线路管理**：创建多条线路，每条线路独立设置颜色和名称
- **站点设计**：支持普通站和换乘站两种类型
- **终点站设置**：支持往返线和环线两种运行模式
- **列车模拟**：实时观看列车在线路上运行
- **项目导出/导入**：保存和分享你的设计作品

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) (推荐 LTS 版本)

### 安装与运行

1. 克隆或下载本项目
2. 进入项目目录
3. 运行启动脚本：

```bash
# Windows
.\start.bat

# 或使用 PowerShell
.\启动地铁设计师.ps1
```

4. 浏览器会自动打开应用，或手动访问 `http://localhost:5173/`

### 首次运行

首次运行时会自动安装依赖，这可能需要 2-5 分钟，请保持网络连接。

## 使用指南

### 1. 创建项目
- 点击"新建"按钮
- 输入项目名称
- 选择喜欢的城市风格

### 2. 添加线路
- 在"线路"标签页点击"添加线路"
- 输入线路名称
- 从预设颜色中选择线路颜色

### 3. 添加站点
- 在"站点"标签页选择站点类型
- 在画布上点击放置站点
- 站点会自动关联到当前选中的线路

### 4. 设置终点站
- 点击线路的"设置终点站"按钮
- 选择起点站和终点站
- 可选择设置为环线

### 5. 运行模拟
- 点击"开始模拟"按钮
- 观看列车在线路上运行

### 快捷键

| 按键 | 功能 |
|------|------|
| Delete / Backspace | 删除选中的站点 |
| Esc | 取消选择 |
| 滚轮 | 缩放画布 |
| 鼠标中键拖拽 | 平移画布 |

## 项目结构

```
railway-designer/
├── public/                 # 静态资源
│   └── tutorial.html      # 使用教程
├── src/
│   ├── components/        # React 组件
│   │   ├── DesignCanvas.tsx    # 设计画布
│   │   ├── TaskPanel.tsx       # 任务面板
│   │   ├── Toolbar.tsx         # 工具栏
│   │   └── TrainSimulation.tsx # 列车模拟
│   ├── constants/         # 常量配置
│   │   └── cityStyles.ts  # 城市风格配置
│   ├── store/             # 状态管理
│   │   └── gameStore.ts   # 游戏状态
│   ├── types/             # TypeScript 类型
│   │   └── index.ts       # 类型定义
│   ├── App.tsx           # 主应用组件
│   ├── App.css           # 应用样式
│   ├── index.css         # 全局样式
│   └── main.tsx          # 应用入口
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
├── start.bat             # Windows 启动脚本
└── README.md             # 项目说明
```

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **状态管理**: Zustand
- **样式**: Tailwind CSS 4
- **图标**: Lucide React

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

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
