import React from 'react';
import Toolbar from './components/Toolbar';
import DesignCanvas from './components/DesignCanvas';
import TaskPanel from './components/TaskPanel';
import './App.css';

function App() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      <Toolbar />
      <DesignCanvas />
      <TaskPanel />
    </div>
  );
}

export default App;
