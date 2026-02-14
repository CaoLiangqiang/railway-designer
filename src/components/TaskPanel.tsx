import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CheckCircle2, Circle, Trophy, Star, MapPin, Train } from 'lucide-react';

const TaskPanel: React.FC = () => {
  const { tasks, achievements, currentProject } = useGameStore();

  const completedTasks = tasks.filter(t => t.completed).length;
  const completedAchievements = achievements.filter(a => a.unlocked).length;

  const stats = {
    lines: currentProject?.lines.length || 0,
    stations: currentProject?.stations.length || 0,
    transfers: currentProject?.stations.filter(s => s.isTransfer).length || 0
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden h-screen">
      {/* Header */}
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
        {/* Project Stats */}
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

        {/* Tasks */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            当前任务
          </h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  task.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : task.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {task.difficulty === 'easy' ? '简单' : task.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                      {!task.completed && task.requirements.map((req, idx) => (
                        <span key={idx} className="text-xs text-gray-400">
                          {req.current}/{req.target}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
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
                    ? 'bg-yellow-50'
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
      </div>
    </div>
  );
};

export default TaskPanel;
