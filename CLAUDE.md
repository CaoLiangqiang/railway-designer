# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Browser Development
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Electron Desktop App
```bash
npm run electron:dev         # Start Electron with dev server
npm run electron:build        # Build all platforms
npm run electron:build:win    # Build Windows (NSIS + portable)
npm run electron:build:mac    # Build macOS (DMG)
npm run electron:build:linux  # Build Linux (AppImage)
```

### Configuration Notes
- Main process: `electron/main.cjs` (CommonJS required for Electron)
- Build output: `dist/` (Vite), `dist-electron/` (Electron)
- TypeScript project references: `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`

## Architecture Overview

This is a React-based metro/subway map design tool for children, built with:
- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Zustand** for state management (with persistence middleware)
- **Tailwind CSS 4** for styling
- **Electron 40** for desktop packaging

### Core State Management

All application state is centralized in [src/store/gameStore.ts](src/store/gameStore.ts). The store is persisted to localStorage with selective persistence of:
- Tasks and achievements progress
- Unlocked items (city styles)
- Simulation and terminus counters
- Used styles

Key state includes:
- `currentProject`: The active design project (lines, stations, canvas state)
- `selectedTool`: Currently selected tool (select/pan/station)
- `selectedLineId`: Active line for adding stations
- `isPlaying`: Train simulation state

### Component Structure

The app has three main UI sections:

1. **Toolbar** ([src/components/Toolbar.tsx](src/components/Toolbar.tsx))
   - Project management (create/load/export/import)
   - Three tabs: Tools (select, pan, zoom), Lines (add/manage), Stations (select type)
   - Line color presets based on city style
   - Terminus/loop configuration for lines

2. **DesignCanvas** ([src/components/DesignCanvas.tsx](src/components/DesignCanvas.tsx))
   - SVG-based canvas with grid snapping (20px grid)
   - Station placement, dragging, and deletion
   - Canvas panning and zooming (0.5x to 3x)
   - Renders lines as SVG paths connecting stations
   - Coordinate transformation functions: `screenToCanvas()`, `snapToGrid()`

3. **TaskPanel** ([src/components/TaskPanel.tsx](src/components/TaskPanel.tsx))
   - Displays 6 progressive tasks and 8 achievements
   - Shows project statistics

4. **TrainSimulation** ([src/components/TrainSimulation.tsx](src/components/TrainSimulation.tsx))
   - Animated trains running along line paths
   - Renders when `isPlaying` is true

### City Style System

City styles are defined in [src/constants/cityStyles.ts](src/constants/cityStyles.ts). Each style has:
- Line width (6-8px)
- Station size (10-12px)
- Color presets for line names

Available styles: `shmetro`, `bjmetro`, `gzmetro`, `mtr`, `tokyo`

### Type System

All types are in [src/types/index.ts](src/types/index.ts):
- `Station`: Position, style, transfer/terminus flags
- `Line`: Color, style, station IDs, terminus configuration, loop flag
- `LinePath`: Array of position points for custom routing
- `DesignProject`: Container with lines, stations, map type, canvas state
- `Task` / `Achievement`: Gamification system with requirements and rewards
- `ToolType`: Union type for tools (station with style, select, pan)

### Task & Achievement System

The store automatically tracks progress:
- Tasks unlock city styles as rewards
- Achievements are unlocked when conditions are met
- `checkProgress()` is called after state changes to update task progress
- `updateTaskProgress()` updates current values against targets

## Key Implementation Details

### Canvas Interaction
- Stations snap to 20px grid
- Zoom level clamped between 0.5 and 3.0
- Mouse wheel zooms, middle-click or pan tool drags canvas
- Delete key removes selected station
- Escape deselects elements

### Line & Station Relationship
- Stations are added to the currently selected line
- A station can belong to multiple lines (transfer stations)
- Lines render paths through their station positions
- Terminus stations define where trains start/stop (or loop)

### ID Generation
All entities use `Math.random().toString(36).substr(2, 9)` for ID generation.

### Known Issue
In [src/store/gameStore.ts:369](src/store/gameStore.ts#L369), there's a typo: `currentProject.stations` should be `currentProject.stations` (works due to store structure).
