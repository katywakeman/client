import { useState, useEffect } from 'react'

const LOCKED_BUILDINGS = ['Strand', "King's"]

export default function BuildingSelect({ onSelect }) {
  const [buildings, setBuildings] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/buildings')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBuildings(data) })
      .catch(() => {})
  }, [])

  const handleClick = (b) => {
    if (LOCKED_BUILDINGS.includes(b.name)) return
    onSelect(b)
  }

  return (
    <div className="building-select">
      <h1 className="building-select-title">Select a Building</h1>
      <div className="building-grid">
        {buildings.map(b => {
          const locked = LOCKED_BUILDINGS.includes(b.name)
          return (
            <button
              key={b._id}
              className={`building-btn ${locked ? 'building-btn-locked' : ''}`}
              onClick={() => handleClick(b)}
              disabled={locked}
            >
              {locked && <span className="building-lock">🔒</span>}
              {b.name}
            </button>
          )
        })}
        {buildings.length === 0 && (
          <p className="building-none">No buildings found</p>
        )}
      </div>
    </div>
  )
}
