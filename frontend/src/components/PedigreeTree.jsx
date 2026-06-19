import React, { useState, useEffect } from 'react'
import { pigeonApi } from '../api'

const MAX_DEPTH = 5

function PedigreeNode({ pigeonId, depth, visited, relation }) {
  const visitedKey = [...visited].sort((a, b) => a - b).join(',')
  const [pigeon, setPigeon] = useState(null)
  const [loading, setLoading] = useState(() => !!pigeonId && depth < MAX_DEPTH && !visited.has(pigeonId))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!pigeonId || depth >= MAX_DEPTH || visited.has(pigeonId)) {
      setPigeon(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setFailed(false)
    pigeonApi
      .getById(pigeonId)
      .then((res) => {
        if (!cancelled) {
          setPigeon(res.data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [pigeonId, depth, visitedKey])

  const relationLabel = relation === '父' ? '♂ 父' : relation === '母' ? '♀ 母' : '本鸽'

  if (!pigeonId) {
    return (
      <div className="pedigree-leaf">
        <span className="pedigree-relation pedigree-relation-unknown">{relationLabel}</span>
        <div className="pedigree-card pedigree-card-unknown">
          <span className="pedigree-empty">未录入</span>
        </div>
      </div>
    )
  }

  if (depth >= MAX_DEPTH) {
    return (
      <div className="pedigree-leaf">
        <span className="pedigree-relation">{relationLabel}</span>
        <div className="pedigree-card pedigree-card-truncated">
          <span className="pedigree-empty">…已达最大代数（{MAX_DEPTH}代）</span>
        </div>
      </div>
    )
  }

  if (visited.has(pigeonId)) {
    return (
      <div className="pedigree-leaf">
        <span className="pedigree-relation">{relationLabel}</span>
        <div className="pedigree-card pedigree-card-cycle">
          <span className="pedigree-empty">循环引用已忽略</span>
        </div>
      </div>
    )
  }

  if (loading || (!pigeon && !failed)) {
    return (
      <div className="pedigree-leaf">
        <span className="pedigree-relation">{relationLabel}</span>
        <div className="pedigree-card pedigree-card-loading">
          <span className="pedigree-empty">加载中…</span>
        </div>
      </div>
    )
  }

  if (failed) {
    return (
      <div className="pedigree-leaf">
        <span className="pedigree-relation">{relationLabel}</span>
        <div className="pedigree-card pedigree-card-unknown">
          <span className="pedigree-empty">数据缺失</span>
        </div>
      </div>
    )
  }

  const childVisited = new Set(visited)
  childVisited.add(pigeonId)
  const isMale = pigeon.gender === '雄' || pigeon.gender === '公'
  const cardClass = isMale ? 'pedigree-card-male' : 'pedigree-card-female'

  return (
    <div className="pedigree-branch">
      <span className={`pedigree-relation ${relation === '父' ? 'relation-male' : relation === '母' ? 'relation-female' : ''}`}>
        {relationLabel}
      </span>
      <div className={`pedigree-card ${cardClass}`}>
        <div className="pedigree-card-ring">{pigeon.ringNumber}</div>
        <div className="pedigree-card-name">{pigeon.name}</div>
        <div className="pedigree-card-meta">
          <span>{pigeon.gender}</span>
          {pigeon.strain && <span>· {pigeon.strain}</span>}
          {pigeon.color && <span>· {pigeon.color}</span>}
        </div>
        <div className="pedigree-card-gen">第 {depth + 1} 代</div>
      </div>
      <div className="pedigree-children">
        <PedigreeNode
          pigeonId={pigeon.fatherId || null}
          depth={depth + 1}
          visited={childVisited}
          relation="父"
        />
        <PedigreeNode
          pigeonId={pigeon.motherId || null}
          depth={depth + 1}
          visited={childVisited}
          relation="母"
        />
      </div>
    </div>
  )
}

export default function PedigreeTree({ rootPigeon }) {
  if (!rootPigeon) return null
  const rootVisited = new Set()
  return (
    <div className="pedigree-tree">
      <div className="pedigree-legend">
        <span className="legend-item"><span className="legend-dot dot-male" />雄</span>
        <span className="legend-item"><span className="legend-dot dot-female" />雌</span>
        <span className="legend-item legend-hint">最多展示 {MAX_DEPTH} 代，无父/母数据时自动停止</span>
      </div>
      <div className="pedigree-canvas">
        <PedigreeNode pigeonId={rootPigeon.id} depth={0} visited={rootVisited} relation="root" />
      </div>
    </div>
  )
}
