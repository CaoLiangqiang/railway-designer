import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Station, Line, Position } from '../types';

interface TrainSimulationProps {
  lines: Line[];
  stations: Station[];
  zoom: number;
  viewOffset: Position;
}

interface Train {
  id: string;
  position: Position;
  angle: number;
  lineId: string;
  currentStationIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1; // 1: 正向, -1: 反向
}

const TrainSimulation: React.FC<TrainSimulationProps> = ({ lines, stations, zoom, viewOffset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const trainsRef = useRef<Train[]>([]);
  const hasInitialized = useRef(false);
  const { isPlaying } = useGameStore();

  // 获取线路的站点顺序（根据终点站设置）
  const getOrderedStations = (line: Line): Station[] => {
    const lineStations = line.stations
      .map(id => stations.find(s => s.id === id))
      .filter((s): s is Station => s !== undefined);

    if (lineStations.length < 2) return lineStations;

    // 如果有终点站设置，按终点站排序
    if (line.startTerminus && line.endTerminus) {
      const startIdx = lineStations.findIndex(s => s.id === line.startTerminus);
      const endIdx = lineStations.findIndex(s => s.id === line.endTerminus);

      if (startIdx !== -1 && endIdx !== -1) {
        // 重新排序站点，使起点站在前，终点站在后
        const ordered: Station[] = [];
        let currentIdx = startIdx;

        // 从起点开始，按顺序收集站点
        while (currentIdx !== endIdx) {
          ordered.push(lineStations[currentIdx]);
          currentIdx = (currentIdx + 1) % lineStations.length;
          // 防止无限循环
          if (ordered.length > lineStations.length) break;
        }
        ordered.push(lineStations[endIdx]);
        return ordered;
      }
    }

    return lineStations;
  };

  // 初始化列车
  useEffect(() => {
    if (isPlaying && lines.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;

      // 为每条有站点的线路创建一列列车
      const newTrains: Train[] = [];
      lines.forEach((line, index) => {
        const orderedStations = getOrderedStations(line);

        if (orderedStations.length >= 2) {
          newTrains.push({
            id: `train-${line.id}`,
            position: { ...orderedStations[0].position },
            angle: 0,
            lineId: line.id,
            currentStationIndex: 0,
            progress: 0,
            speed: 0.008 + index * 0.002,
            direction: 1
          });
        }
      });

      trainsRef.current = newTrains;
    }

    if (!isPlaying) {
      hasInitialized.current = false;
      trainsRef.current = [];
    }
  }, [isPlaying, lines, stations]);

  // 动画循环
  useEffect(() => {
    if (!isPlaying || lines.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      trainsRef.current = trainsRef.current.map(train => {
        const line = lines.find(l => l.id === train.lineId);
        if (!line) return train;

        const orderedStations = getOrderedStations(line);
        if (orderedStations.length < 2) return train;

        let newProgress = train.progress + train.speed * train.direction;
        let newStationIndex = train.currentStationIndex;
        let newPosition = { ...train.position };
        let newAngle = train.angle;
        let newDirection = train.direction;

        // 检查是否到达站点
        if (newProgress >= 1) {
          newProgress = 0;
          newStationIndex = train.currentStationIndex + 1;

          // 检查是否到达终点
          if (newStationIndex >= orderedStations.length - 1) {
            if (line.isLoop) {
              // 环线：继续到起点
              newStationIndex = 0;
            } else {
              // 往返线：反向运行
              newStationIndex = orderedStations.length - 1;
              newDirection = -1;
            }
          }

          const currentStation = orderedStations[train.currentStationIndex];
          const nextStation = orderedStations[newStationIndex];

          if (nextStation) {
            newPosition = { ...currentStation.position };
            newAngle = Math.atan2(
              nextStation.position.y - currentStation.position.y,
              nextStation.position.x - currentStation.position.x
            ) * 180 / Math.PI;
          }
        } else if (newProgress <= 0) {
          // 反向运行时到达起点
          newProgress = 0;
          newStationIndex = train.currentStationIndex - 1;

          if (newStationIndex <= 0) {
            newStationIndex = 0;
            newDirection = 1; // 转为正向
          }

          const currentStation = orderedStations[train.currentStationIndex];
          const nextStation = orderedStations[newStationIndex];

          if (nextStation) {
            newPosition = { ...currentStation.position };
            newAngle = Math.atan2(
              nextStation.position.y - currentStation.position.y,
              nextStation.position.x - currentStation.position.x
            ) * 180 / Math.PI;
          }
        } else {
          // 在当前区间平滑移动
          const currentStation = orderedStations[train.currentStationIndex];
          const nextStation = orderedStations[train.currentStationIndex + 1];

          if (currentStation && nextStation) {
            newPosition = {
              x: currentStation.position.x + (nextStation.position.x - currentStation.position.x) * newProgress,
              y: currentStation.position.y + (nextStation.position.y - currentStation.position.y) * newProgress
            };
            newAngle = Math.atan2(
              nextStation.position.y - currentStation.position.y,
              nextStation.position.x - currentStation.position.x
            ) * 180 / Math.PI;
          }
        }

        return {
          ...train,
          position: newPosition,
          angle: newAngle,
          currentStationIndex: newStationIndex,
          progress: newProgress,
          direction: newDirection
        };
      });

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 应用变换
      ctx.save();
      ctx.translate(viewOffset.x, viewOffset.y);
      ctx.scale(zoom, zoom);

      // 绘制列车
      trainsRef.current.forEach(train => {
        const line = lines.find(l => l.id === train.lineId);
        if (!line) return;

        ctx.save();
        ctx.translate(train.position.x, train.position.y);
        ctx.rotate((train.angle * Math.PI) / 180);

        // 列车主体
        ctx.fillStyle = line.color;
        ctx.beginPath();
        ctx.roundRect(-10, -6, 20, 12, 3);
        ctx.fill();

        // 车窗
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-6, -4, 8, 8, 2);
        ctx.fill();

        // 车灯
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(4, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(4, 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, lines, stations, zoom, viewOffset]);

  if (!isPlaying) return null;

  return (
    <canvas
      ref={canvasRef}
      width={2000}
      height={1500}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
};

export default TrainSimulation;
