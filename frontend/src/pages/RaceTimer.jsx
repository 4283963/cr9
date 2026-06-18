import React, { useState, useEffect, useRef } from 'react'
import { raceApi, raceResultApi } from '../api'

export default function RaceTimer() {
  const [races, setRaces] = useState([])
  const [selectedRace, setSelectedRace] = useState(null)
  const [results, setResults] = useState([])
  const [scanInput, setScanInput] = useState('')
  const [showSimulate, setShowSimulate] = useState(false)
  const [simulateData, setSimulateData] = useState({ ringNumber: '', arrivalTime: '' })
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  const scanRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    loadRaces()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (selectedRace) {
      loadResults(selectedRace.id)
      startTimer(selectedRace.releaseTime)
    }
  }, [selectedRace])

  const loadRaces = async () => {
    try {
      const res = await raceApi.getAll()
      setRaces(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadResults = async (raceId) => {
    try {
      const res = await raceResultApi.getByRace(raceId)
      setResults(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const startTimer = (releaseTime) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const updateTime = () => {
      const release = new Date(releaseTime)
      const now = new Date()
      let diff = Math.floor((now - release) / 1000)
      if (diff < 0) diff = 0
      const h = String(Math.floor(diff / 3600)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
      const s = String(diff % 60).padStart(2, '0')
      setElapsedTime(`${h}:${m}:${s}`)
    }
    updateTime()
    timerRef.current = setInterval(updateTime, 1000)
  }

  const handleScan = async (e) => {
    if (e) e.preventDefault()
    if (!selectedRace) {
      alert('请先选择一场比赛')
      return
    }
    if (!scanInput.trim()) return
    try {
      await raceResultApi.scanArrival({
        raceId: selectedRace.id,
        ringNumber: scanInput.trim(),
      })
      setScanInput('')
      scanRef.current?.focus()
      loadResults(selectedRace.id)
    } catch (err) {
      alert('扫码失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleSimulate = async (e) => {
    e.preventDefault()
    if (!selectedRace) {
      alert('请先选择一场比赛')
      return
    }
    try {
      await raceResultApi.simulateArrival({
        raceId: selectedRace.id,
        ringNumber: simulateData.ringNumber,
        arrivalTime: simulateData.arrivalTime,
      })
      setShowSimulate(false)
      setSimulateData({ ringNumber: '', arrivalTime: '' })
      loadResults(selectedRace.id)
    } catch (err) {
      alert('模拟失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <div>
      <div className="page-header">
        <h2>⏱️ 比赛计时 / 排名</h2>
      </div>

      <div className="card">
        <div className="form-group">
          <label>选择比赛</label>
          <select
            value={selectedRace?.id || ''}
            onChange={(e) => {
              const race = races.find((r) => r.id === Number(e.target.value))
              setSelectedRace(race || null)
            }}
          >
            <option value="">-- 请选择一场比赛 --</option>
            {races.map((r) => (
              <option key={r.id} value={r.id}>
                {r.raceName} ({r.location} - {r.distanceKm}km) [{r.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRace && (
        <>
          <div className="timer-section">
            <h3>{selectedRace.raceName} · {selectedRace.location} · {selectedRace.distanceKm}km</h3>
            <div className="time">{elapsedTime}</div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              放飞时间：{selectedRace.releaseTime?.replace('T', ' ')} · 状态：{selectedRace.status}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16, color: '#1e3a5f' }}>扫码归巢</h3>
            <form onSubmit={handleScan} className="scan-input">
              <input
                ref={scanRef}
                type="text"
                placeholder="请扫描或输入足环号，按回车确认..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                autoFocus
                disabled={selectedRace.status === '已结束'}
              />
              <button type="submit" className="btn btn-primary" disabled={selectedRace.status === '已结束'}>
                确认归巢
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSimulate(true)}
                disabled={selectedRace.status === '已结束'}
              >
                模拟归巢
              </button>
            </form>
            <p style={{ fontSize: 12, color: '#718096', marginTop: 8 }}>
              💡 提示：扫码归巢会使用当前系统时间作为归巢时间，自动计算飞翔速度
            </p>
          </div>

          <h3 style={{ marginBottom: 16, color: '#1e3a5f' }}>🏆 实时排名（已归巢 {results.length} 羽）</h3>
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>足环号</th>
                <th>鸽名</th>
                <th>归巢时间</th>
                <th>飞行时长(小时)</th>
                <th>分速(km/h)</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">暂无归巢记录</div>
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 20 }}>
                      <strong>{getRankBadge(r.rank)}</strong>
                    </td>
                    <td><strong>{r.ringNumber}</strong></td>
                    <td>{r.pigeonName}</td>
                    <td>{r.arrivalTime?.replace('T', ' ')}</td>
                    <td>{r.flightHours?.toFixed(2)}</td>
                    <td style={{ color: '#2c5282', fontWeight: 600 }}>
                      {r.speedKmh?.toFixed(2)} km/h
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {showSimulate && selectedRace && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSimulate(false)}>
          <div className="modal">
            <h3>模拟归巢时间</h3>
            <form onSubmit={handleSimulate}>
              <div className="form-group">
                <label>足环号 *</label>
                <input
                  type="text"
                  value={simulateData.ringNumber}
                  onChange={(e) => setSimulateData({ ...simulateData, ringNumber: e.target.value })}
                  required
                  placeholder="请输入鸽子足环号"
                />
              </div>
              <div className="form-group">
                <label>模拟归巢时间 *</label>
                <input
                  type="datetime-local"
                  value={simulateData.arrivalTime}
                  onChange={(e) => setSimulateData({ ...simulateData, arrivalTime: e.target.value })}
                  required
                />
                <p style={{ fontSize: 12, color: '#718096', marginTop: 6 }}>
                  放飞时间：{selectedRace.releaseTime?.replace('T', ' ')}，归巢时间必须晚于此时间
                </p>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSimulate(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  确认模拟
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
