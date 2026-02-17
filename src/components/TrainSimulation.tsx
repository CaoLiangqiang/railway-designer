import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Station, Line, Position, LinePath } from '../types';

interface TrainSimulationProps {
  lines: Line[];
  stations: Station[];
  zoom: number;
  viewOffset: Position;
}

interface Train {
  id: string;
  lineId: string;
  currentPathIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
  position: Position;
  angle: number;
}

const getDistance = (p1: Position, p2: Position): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const calculatePathLength = (points: Position[]): number => {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    length += getDistance(points[i], points[i + 1]);
  }
  return length;
};

const getPointOnPath = (path: LinePath, progress: number): { position: Position; angle: number } => {
  const points = path.points;
  if (points.length < 2) {
    return { position: points[0] || { x: 0, y: 0 }, angle: 0 };
  }

  const totalLength = calculatePathLength(points);
  const targetLength = totalLength * progress;
  
  let currentLength = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = getDistance(points[i], points[i + 1]);
    
    if (currentLength + segmentLength >= targetLength) {
      const segmentProgress = (targetLength - currentLength) / segmentLength;
      const position = {
        x: points[i].x + (points[i + 1].x - points[i].x) * segmentProgress,
        y: points[i].y + (points[i + 1].y - points[i].y) * segmentProgress
      };
      const angle = Math.atan2(
        points[i + 1].y - points[i].y,
        points[i + 1].x - points[i].x
      ) * 180 / Math.PI;
      return { position, angle };
    }
    
    currentLength += segmentLength;
  }
  
  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2];
  return {
    position: lastPoint,
    angle: Math.atan2(
      lastPoint.y - secondLastPoint.y,
      lastPoint.x - secondLastPoint.x
    ) * 180 / Math.PI
  };
};

const TrainSimulation: React.FC<TrainSimulationProps> = ({ lines, stations, zoom, viewOffset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const trainsRef = useRef<Train[]>([]);
  const hasInitialized = useRef(false);
  const { isPlaying } = useGameStore();

  const getOrderedPaths = useCallback((line: Line): LinePath[] => {
    if (!line.startTerminus || !line.endTerminus || line.paths.length === 0) {
      return line.paths;
    }

    const startStation = stations.find(s => s.id === line.startTerminus);
    const endStation = stations.find(s => s.id === line.endTerminus);
    
    if (!startStation || !endStation) {
      return line.paths;
    }

    const ordered: LinePath[] = [];
    let currentPos = startStation.position;
    const usedPaths = new Set<string>();

    while (true) {
      const nextPath = line.paths.find(path => {
        if (usedPaths.has(path.id)) return false;
        const startPoint = path.points[0];
        const endPoint = path.points[path.points.length - 1];
        return (
          (Math.abs(startPoint.x - currentPos.x) < 1 && Math.abs(startPoint.y - currentPos.y) < 1) ||
          (Math.abs(endPoint.x - currentPos.x) < 1 && Math.abs(endPoint.y - currentPos.y) < 1)
        );
      });

      if (!nextPath) break;

      usedPaths.add(nextPath.id);
      
      const startPoint = nextPath.points[0];
      const isReversed = Math.abs(startPoint.x - currentPos.x) < 1 && Math.abs(startPoint.y - currentPos.y) < 1;
      
      if (isReversed) {
        ordered.push(nextPath);
        const endPoint = nextPath.points[nextPath.points.length - 1];
        currentPos = endPoint;
      } else {
        const reversedPath: LinePath = {
          ...nextPath,
          points: [...nextPath.points].reverse()
        };
        ordered.push(reversedPath);
        currentPos = nextPath.points[0];
      }

      if (Math.abs(currentPos.x - endStation.position.x) < 1 && 
          Math.abs(currentPos.y - endStation.position.y) < 1) {
        break;
      }

      if (usedPaths.size >= line.paths.length) break;
    }

    return ordered;
  }, [stations]);

  useEffect(() => {
    if (isPlaying && lines.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;

      const newTrains: Train[] = [];
      lines.forEach((line, index) => {
        const orderedPaths = getOrderedPaths(line);
        
        if (orderedPaths.length > 0) {
          const firstPath = orderedPaths[0];
          const { position, angle } = getPointOnPath(firstPath, 0);
          
          newTrains.push({
            id: `train-${line.id}`,
            lineId: line.id,
            currentPathIndex: 0,
            progress: 0,
            speed: 0.003 + index * 0.0005,
            direction: 1,
            position,
            angle
          });
        }
      });

      trainsRef.current = newTrains;
    }

    if (!isPlaying) {
      hasInitialized.current = false;
      trainsRef.current = [];
    }
  }, [isPlaying, lines, getOrderedPaths]);

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

        const orderedPaths = getOrderedPaths(line);
        if (orderedPaths.length === 0) return train;

        let newProgress = train.progress + train.speed * train.direction;
        let newPathIndex = train.currentPathIndex;
        let newDirection = train.direction;

        if (newProgress >= 1) {
          newProgress = 0;
          newPathIndex++;

          if (newPathIndex >= orderedPaths.length) {
            if (line.isLoop) {
              newPathIndex = 0;
            } else {
              newPathIndex = orderedPaths.length - 1;
              newDirection = -1;
              newProgress = 1;
            }
          }
        } else if (newProgress < 0) {
          newProgress = 1;
          newPathIndex--;

          if (newPathIndex < 0) {
            if (line.isLoop) {
              newPathIndex = orderedPaths.length - 1;
            } else {
              newPathIndex = 0;
              newDirection = 1;
              newProgress = 0;
            }
          }
        }

        const currentPath = orderedPaths[newPathIndex];
        if (!currentPath) return train;

        const { position, angle } = getPointOnPath(currentPath, newProgress);

        return {
          ...train,
          currentPathIndex: newPathIndex,
          progress: newProgress,
          direction: newDirection,
          position,
          angle
        };
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(viewOffset.x, viewOffset.y);
      ctx.scale(zoom, zoom);

      trainsRef.current.forEach(train => {
        const line = lines.find(l => l.id === train.lineId);
        if (!line) return;

        ctx.save();
        ctx.translate(train.position.x, train.position.y);
        ctx.rotate((train.angle * Math.PI) / 180);

        ctx.fillStyle = line.color;
        ctx.beginPath();
        ctx.roundRect(-10, -6, 20, 12, 3);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-6, -4, 8, 8, 2);
        ctx.fill();

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
  }, [isPlaying, lines, stations, zoom, viewOffset, getOrderedPaths]);

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
