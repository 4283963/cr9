import React, { useState, useEffect } from 'react'
import { pigeonApi } from '../api'
import PedigreeTree from '../components/PedigreeTree'

export default function PigeonManagement() {
  const [pigeons, setPigeons] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPigeon, setEditingPigeon] = useState(null)
  const [pedigreePigeon, setPedigreePigeon] = useState(null)
  const [formData, setFormData] = useState({
    ringNumber: '',
    name: '',
    gender: '雄',
    color: '',
    hatchDate: '',
    fatherId: '',
    motherId: '',
    strain: '',
    notes: '',
    active: true,
  })

  useEffect(() => {
    loadPigeons()
  }, [])

  const loadPigeons = async () => {
    try {
      const res = await pigeonApi.getAll()
      setPigeons(res.data)
    } catch (err) {
      alert('加载鸽子列表失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      if (!payload.fatherId) delete payload.fatherId
      if (!payload.motherId) delete payload.motherId

      if (editingPigeon) {
        await pigeonApi.update(editingPigeon.id, payload)
      } else {
        await pigeonApi.create(payload)
      }
      setShowModal(false)
      resetForm()
      loadPigeons()
    } catch (err) {
      alert('保存失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleEdit = (pigeon) => {
    setEditingPigeon(pigeon)
    setFormData({
      ringNumber: pigeon.ringNumber,
      name: pigeon.name,
      gender: pigeon.gender,
      color: pigeon.color || '',
      hatchDate: pigeon.hatchDate || '',
      fatherId: pigeon.fatherId || '',
      motherId: pigeon.motherId || '',
      strain: pigeon.strain || '',
      notes: pigeon.notes || '',
      active: pigeon.active,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这只鸽子吗？')) return
    try {
      await pigeonApi.delete(id)
      loadPigeons()
    } catch (err) {
      alert('删除失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const resetForm = () => {
    setFormData({
      ringNumber: '',
      name: '',
      gender: '雄',
      color: '',
      hatchDate: '',
      fatherId: '',
      motherId: '',
      strain: '',
      notes: '',
      active: true,
    })
    setEditingPigeon(null)
  }

  const activePigeons = pigeons.filter((p) => p.active)

  return (
    <div>
      <div className="page-header">
        <h2>🦅 鸽子管理 / 足环录入</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true) }}>
          + 录入新鸽子
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>足环号</th>
            <th>名称</th>
            <th>性别</th>
            <th>羽色</th>
            <th>血统</th>
            <th>父亲</th>
            <th>母亲</th>
            <th>出壳日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {activePigeons.length === 0 ? (
            <tr>
              <td colSpan={9}>
                <div className="empty-state">暂无鸽子数据，请点击右上角录入</div>
              </td>
            </tr>
          ) : (
            activePigeons.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.ringNumber}</strong></td>
                <td>{p.name}</td>
                <td>{p.gender}</td>
                <td>{p.color || '-'}</td>
                <td>{p.strain || '-'}</td>
                <td>{p.fatherRingNumber || '-'}</td>
                <td>{p.motherRingNumber || '-'}</td>
                <td>{p.hatchDate || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-primary btn-sm" onClick={() => setPedigreePigeon(p)}>
                      血统
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>
                      编辑
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
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
            <h3>{editingPigeon ? '编辑鸽子信息' : '录入新鸽子'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>足环号 *</label>
                  <input
                    type="text"
                    value={formData.ringNumber}
                    onChange={(e) => setFormData({ ...formData, ringNumber: e.target.value })}
                    required
                    placeholder="如：CHN2024-01-000001"
                  />
                </div>
                <div className="form-group">
                  <label>名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>性别 *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="雄">雄</option>
                    <option value="雌">雌</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>羽色</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="如：雨点、灰、红绛"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>血统</label>
                  <input
                    type="text"
                    value={formData.strain}
                    onChange={(e) => setFormData({ ...formData, strain: e.target.value })}
                    placeholder="如：詹森、杨阿腾"
                  />
                </div>
                <div className="form-group">
                  <label>出壳日期</label>
                  <input
                    type="date"
                    value={formData.hatchDate}
                    onChange={(e) => setFormData({ ...formData, hatchDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>父亲（ID）</label>
                  <select
                    value={formData.fatherId}
                    onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                  >
                    <option value="">-- 请选择 --</option>
                    {activePigeons
                      .filter((p) => p.gender === '雄' && (!editingPigeon || p.id !== editingPigeon.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.ringNumber} - {p.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>母亲（ID）</label>
                  <select
                    value={formData.motherId}
                    onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                  >
                    <option value="">-- 请选择 --</option>
                    {activePigeons
                      .filter((p) => p.gender === '雌' && (!editingPigeon || p.id !== editingPigeon.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.ringNumber} - {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>备注</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPigeon ? '保存修改' : '确认录入'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pedigreePigeon && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setPedigreePigeon(null)}>
          <div className="modal" style={{ maxWidth: 900 }}>
            <h3>🕊️ 血统谱系 — {pedigreePigeon.ringNumber} ({pedigreePigeon.name})</h3>
            <PedigreeTree rootPigeon={pedigreePigeon} />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPedigreePigeon(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
