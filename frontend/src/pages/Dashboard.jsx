import React, { useState, useEffect } from 'react'
import { pigeonApi, breedingApi, raceApi } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    pigeonCount: 0,
    breedingCount: 0,
    raceCount: 0,
    activeRaceCount: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [pigeons, breeding, races] = await Promise.all([
        pigeonApi.getAll(),
        breedingApi.getAll(),
        raceApi.getAll(),
      ])
      setStats({
        pigeonCount: pigeons.data.filter((p) => p.active).length,
        breedingCount: breeding.data.length,
        raceCount: races.data.length,
        activeRaceCount: races.data.filter((r) => r.status === '进行中').length,
      })
    } catch (err) {
      console.error('加载统计数据失败', err)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>数据概览</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>在养鸽子总数</h3>
          <p>{stats.pigeonCount}</p>
        </div>
        <div className="stat-card">
          <h3>繁育记录数</h3>
          <p>{stats.breedingCount}</p>
        </div>
        <div className="stat-card">
          <h3>比赛总数</h3>
          <p>{stats.raceCount}</p>
        </div>
        <div className="stat-card">
          <h3>进行中比赛</h3>
          <p>{stats.activeRaceCount}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, color: '#1e3a5f' }}>系统说明</h3>
        <ul style={{ lineHeight: 2, color: '#4a5568' }}>
          <li>🦅 <strong>足环录入 / 鸽子管理</strong>：录入每只鸽子的足环号、血统谱系、性别、羽色等信息</li>
          <li>💑 <strong>配对管理 / 繁育记录</strong>：管理种鸽配对、产蛋、孵化等繁育过程</li>
          <li>🏁 <strong>比赛管理</strong>：创建比赛，设置放飞地点、距离、时间等信息</li>
          <li>⏱️ <strong>比赛计时 / 排名</strong>：扫码或模拟鸽子归巢时间，自动计算飞翔速度并排名</li>
        </ul>
      </div>
    </div>
  )
}
