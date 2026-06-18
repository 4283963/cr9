import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import PigeonManagement from './pages/PigeonManagement.jsx'
import BreedingManagement from './pages/BreedingManagement.jsx'
import RaceManagement from './pages/RaceManagement.jsx'
import RaceTimer from './pages/RaceTimer.jsx'

export default function App() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1>🕊️ 信鸽管理系统</h1>
        <nav>
          <NavLink to="/" end className="nav-item">
            📊 数据概览
          </NavLink>
          <NavLink to="/pigeons" className="nav-item">
            🦅 足环录入 / 鸽子管理
          </NavLink>
          <NavLink to="/breeding" className="nav-item">
            💑 配对管理 / 繁育记录
          </NavLink>
          <NavLink to="/races" className="nav-item">
            🏁 比赛管理
          </NavLink>
          <NavLink to="/timer" className="nav-item">
            ⏱️ 比赛计时 / 排名
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pigeons" element={<PigeonManagement />} />
          <Route path="/breeding" element={<BreedingManagement />} />
          <Route path="/races" element={<RaceManagement />} />
          <Route path="/timer" element={<RaceTimer />} />
        </Routes>
      </main>
    </div>
  )
}
