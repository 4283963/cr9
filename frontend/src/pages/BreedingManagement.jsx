import React, { useState, useEffect } from 'react'
import { breedingApi, pigeonApi } from '../api'

const STATUS_LIST = ['配对中', '已产蛋', '孵化中', '已出壳', '已完成', '配对失败']

const statusBadge = (status) => {
  const map = {
    配对中: 'badge-info',
    已产蛋: 'badge-warning',
    孵化中: 'badge-warning',
    已出壳: 'badge-success',
    已完成: 'badge-success',
    配对失败: 'badge-danger',
  }
  return map[status] || 'badge-info'
}

export default function BreedingManagement() {
  const [records, setRecords] = useState([])
  const [pigeons, setPigeons] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({
    fatherId: '',
    motherId: '',
    pairingDate: '',
    layDate: '',
    hatchDate: '',
    eggsLaid: '',
    chicksHatched: '',
    notes: '',
    status: '配对中',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [breedingRes, pigeonRes] = await Promise.all([
        breedingApi.getAll(),
        pigeonApi.getAll(),
      ])
      setRecords(breedingRes.data)
      setPigeons(pigeonRes.data.filter((p) => p.active))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        eggsLaid: formData.eggsLaid ? parseInt(formData.eggsLaid) : null,
        chicksHatched: formData.chicksHatched ? parseInt(formData.chicksHatched) : null,
      }
      if (editingRecord) {
        await breedingApi.update(editingRecord.id, payload)
      } else {
        await breedingApi.create(payload)
      }
      setShowModal(false)
      resetForm()
      loadData()
    } catch (err) {
      alert('保存失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setFormData({
      fatherId: record.fatherId,
      motherId: record.motherId,
      pairingDate: record.pairingDate || '',
      layDate: record.layDate || '',
      hatchDate: record.hatchDate || '',
      eggsLaid: record.eggsLaid || '',
      chicksHatched: record.chicksHatched || '',
      notes: record.notes || '',
      status: record.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除该繁育记录吗？')) return
    try {
      await breedingApi.delete(id)
      loadData()
    } catch (err) {
      alert('删除失败: ' + (err.response?.data?.error || err.message))
    }
  }

  const resetForm = () => {
    setFormData({
      fatherId: '',
      motherId: '',
      pairingDate: new Date().toISOString().split('T')[0],
      layDate: '',
      hatchDate: '',
      eggsLaid: '',
      chicksHatched: '',
      notes: '',
      status: '配对中',
    })
    setEditingRecord(null)
  }

  const males = pigeons.filter((p) => p.gender === '雄')
  const females = pigeons.filter((p) => p.gender === '雌')

  return (
    <div>
      <div className="page-header">
        <h2>💑 配对管理 / 繁育记录</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true) }}>
          + 新建配对
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>父鸽</th>
            <th>母鸽</th>
            <th>配对日期</th>
            <th>产蛋数</th>
            <th>出壳数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">暂无繁育记录</div>
              </td>
            </tr>
          ) : (
            records.map((r) => (
              <tr key={r.id}>
                <td>{r.fatherRingNumber}</td>
                <td>{r.motherRingNumber}</td>
                <td>{r.pairingDate}</td>
                <td>{r.eggsLaid || '-'}</td>
                <td>{r.chicksHatched || '-'}</td>
                <td>
                  <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(r)}>
                      编辑
                    </button>
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
            <h3>{editingRecord ? '编辑繁育记录' : '新建配对'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>父鸽 *</label>
                  <select
                    value={formData.fatherId}
                    onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                    required
                  >
                    <option value="">-- 请选择 --</option>
                    {males.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.ringNumber} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>母鸽 *</label>
                  <select
                    value={formData.motherId}
                    onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                    required
                  >
                    <option value="">-- 请选择 --</option>
                    {females.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.ringNumber} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>配对日期 *</label>
                  <input
                    type="date"
                    value={formData.pairingDate}
                    onChange={(e) => setFormData({ ...formData, pairingDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>产蛋日期</label>
                  <input
                    type="date"
                    value={formData.layDate}
                    onChange={(e) => setFormData({ ...formData, layDate: e.target.value })}
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
                  <label>产蛋数</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.eggsLaid}
                    onChange={(e) => setFormData({ ...formData, eggsLaid: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>出壳数</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.chicksHatched}
                    onChange={(e) => setFormData({ ...formData, chicksHatched: e.target.value })}
                  />
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
                  {editingRecord ? '保存修改' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
