import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CheckCircle2, Circle, Trophy, Star, MapPin, Train, X, Sparkles } from 'lucide-react';

interface Notification {
  id: string;
  type: 'task' | 'achievement';
  title: string;
  message: string;
}

const TaskPanel: React.FC = () => {
  const { tasks, achievements, currentProject, unlockedItems } = useGameStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevCompletedTasksRef = useRef<string[]>([]);
  const prevUnlockedAchievementsRef = useRef<string[]>([]);

  const completedTasks = tasks.filter(t => t.completed).length;
  const completedAchievements = achievements.filter(a => a.unlocked).length;

  const stats = {
    lines: currentProject?.lines.length || 0,
    stations: currentProject?.stations.length || 0,
    transfers: currentProject?.stations.filter(s => s.isTransfer).length || 0
  };

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    const currentCompletedTaskIds = tasks.filter(t => t.completed).map(t => t.id);
    const prevIds = prevCompletedTasksRef.current;
    const newCompletedTasks = currentCompletedTaskIds.filter(id => !prevIds.includes(id));

    newCompletedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        addNotification({
          id: `task-${taskId}-${Date.now()}`,
          type: 'task',
          title: '任务完成！',
          message: `${task.title} - 已解锁新奖励`
        });
      }
    });

    prevCompletedTasksRef.current = currentCompletedTaskIds;
  }, [tasks, addNotification]);

  useEffect(() => {
    const currentUnlockedIds = achievements.filter(a => a.unlocked).map(a => a.id);
    const prevIds = prevUnlockedAchievementsRef.current;
    const newUnlocked = currentUnlockedIds.filter(id => !prevIds.includes(id));

    newUnlocked.forEach(achievementId => {
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        addNotification({
          id: `achievement-${achievementId}-${Date.now()}`,
          type: 'achievement',
          title: '成就解锁！',
          message: `${achievement.icon} ${achievement.name}`
        });
      }
    });

    prevUnlockedAchievementsRef.current = currentUnlockedIds;
  }, [achievements, addNotification]);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden h-screen">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            任务与成就
          </h2>
          <div className="flex gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedTasks}/{tasks.length}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-600">
              <Trophy className="w-4 h-4" />
              <span>{completedAchievements}/{achievements.length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentProject && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Train className="w-4 h-4" />
                项目统计
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.lines}</div>
                  <div className="text-xs text-blue-500">线路</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-600">{stats.stations}</div>
                  <div className="text-xs text-green-500">站点</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-600">{stats.transfers}</div>
                  <div className="text-xs text-purple-500">换乘</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              当前任务
            </h3>
            <div className="space-y-3">
              {tasks.map((task) => {
                const progress = task.requirements[0];
                const progressPercent = progress ? Math.min(100, (progress.current / progress.target) * 100) : 0;

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          task.completed ? 'text-green-800' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(task.difficulty)}`}>
                            {getDifficultyLabel(task.difficulty)}
                          </span>
                          {!task.completed && progress && (
                            <span className="text-xs text-gray-500">
                              {progress.current}/{progress.target}
                            </span>
                          )}
                          {task.completed && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              已完成
                            </span>
                          )}
                        </div>
                        {!task.completed && progress && progress.target > 0 && (
                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              成就
            </h3>
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-2 rounded-lg flex items-center gap-3 transition-all ${
                    achievement.unlocked
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${
                      achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {unlockedItems.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                已解锁奖励
              </h3>
              <div className="flex flex-wrap gap-1">
                {unlockedItems.map((item, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                  >
                    {item === 'all' ? '全部风格' : item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed top-4 right-80 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in min-w-[280px] ${
              notification.type === 'task'
                ? 'bg-green-500 text-white'
                : 'bg-yellow-500 text-white'
            }`}
          >
            {notification.type === 'task' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <Trophy className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TaskPanel;
