import { useEffect, useRef } from 'react'

export default function InfoModal({ onClose }) {
  const closeRef = useRef()

  useEffect(() => {
    closeRef.current?.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="info-overlay" onClick={onClose} role="presentation">
      <div
        className="info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <button className="info-close" onClick={onClose} ref={closeRef} aria-label="Close help guide">✕</button>
        <h2 id="info-modal-title">How to Use the Map</h2>
        <ul>
          <li><strong>Orbit View:</strong> Click and drag to rotate, scroll to zoom</li>
          <li><strong>Walking View:</strong> Press V or click the button to toggle. Use WASD to move and mouse to view. Press esc to exit.</li>
          <li><strong>Find a Room:</strong> Search by room name or lecturer in the panel</li>
          <li><strong>Room Info:</strong> Click a room to see lecturer details and highlight a path</li>
          <li><strong>Labels:</strong> Toggle room labels with the Hide/Show Labels button</li>
          <li><strong>Symbols:</strong> Bathrooms, bins, and printers are shown by their relevant emojis</li>
        </ul>
      </div>
    </div>
  )
}
