import React, { useState, useEffect } from 'react'
import { raceApi } from '../api'

const raceStatusBadge = (status) => {
  const map = {
    未开始: 'badge-info',
    进行中: 'badge-warning',
    已结束: 'badge-success',
  }
  return map[status] || 'badge-info'
}

export default function RaceManagement() {
  const [races, setRaces] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingRace, setEditingRace] = useState(null)
  const [formData, setFormData] = useState({
    raceName: '',
    location: '',
    distanceKm: '',
    releaseTime: '',
    description: '',
    status: '未开始',
  })

  useEffect(() => {
    loadRaces()
  }, [])

  const loadRaces = async () => {
    try {
      const res = await raceApi.getAll()
      setRaces(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        distanceKm: parseFloat(formData.distanceKm),
      }
      if (editingRace) {
        await raceApi.update(editingRace.id, payload)
      } else {
        await raceApi.create(payload)
      }
      setShowModal(false)
      resetForm()
      loadRaces()
    } catch (err) {
      alert('保存失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleEdit = (race) => {
    setEditingRace(race)
    setFormData({
      raceName: race.raceName,
      location: race.location,
      distanceKm: race.distanceKm,
      releaseTime: race.releaseTime?.replace('T', ' ').slice(0, 16) || '',
      description: race.description || '',
      status: race.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除该比赛吗？')) return
    try {
      await raceApi.delete(id)
      loadRaces()
    } catch (err) {
      alert('删除失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleEndRace = async (id) => {
    if (!confirm('确定要结束该比赛吗？结束后将锁定排名。')) return
    try {
      await raceApi.endRace(id)
      loadRaces()
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const resetForm = () => {
    setFormData({
      raceName: '',
      location: '',
      distanceKm: '',
      releaseTime: '',
      description: '',
      status: '未开始',
    })
    setEditingRace(null)
  }

  return (
    <div>
      <div className="page-header">
        <h2>🏁 比赛管理</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true) }}>
          + 创建比赛
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>比赛名称</th>
            <th>放飞地点</th>
            <th>放飞距离(km)</th>
            <th>放飞时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {races.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">暂无比赛数据</div>
              </td>
            </tr>
          ) : (
            races.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.raceName}</strong></td>
                <td>{r.location}</td>
                <td>{r.distanceKm} km</td>
                <td>{r.releaseTime?.replace('T', ' ') || '-'}</td>
                <td>
                  <span className={`badge ${raceStatusBadge(r.status)}`}>{r.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(r)}>
                      编辑
                    </button>
                    {r.status !== '已结束' && (
                      <button className="btn btn-success btn-sm" onClick={() => handleEndRace(r.id)}>
                        结束比赛
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>{editingRace ? '编辑比赛' : '创建比赛'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>比赛名称 *</label>
                <input
                  type="text"
                  value={formData.raceName}
                  onChange={(e) => setFormData({ ...formData, raceName: e.target.value })}
                  required
                  placeholder="如：2024春季500公里大奖赛"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>放飞地点 *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="如：河南郑州"
                  />
                </div>
                <div className="form-group">
                  <label>放飞距离(km) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                    required
                    placeholder="如：500"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>放飞时间 *</label>
                <input
                  type="datetime-local"
                  value={formData.releaseTime}
                  onChange={(e) => setFormData({ ...formData, releaseTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>比赛状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="未开始">未开始</option>
                  <option value="进行中">进行中</option>
                  <option value="已结束">已结束</option>
                </select>
              </div>

              <div className="form-group">
                <label>比赛说明</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRace ? '保存修改' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
