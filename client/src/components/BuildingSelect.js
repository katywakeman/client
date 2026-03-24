import { useState, useEffect } from 'react'

export default function BuildingSelect({ onSelect }) {
  const [buildings, setBuildings] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/buildings')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBuildings(data) })
      .catch(() => {})
  }, [])

  return (
    <div className="building-select">
      <h1 className="building-select-title">Select a Building</h1>
      <div className="building-grid">
        {buildings.map(b => (
          <button key={b._id} className="building-btn" onClick={() => onSelect(b)}>
            {b.name}
          </button>
        ))}
        {buildings.length === 0 && (
          <p className="building-none">No buildings found</p>
        )}
      </div>
    </div>
  )
}
