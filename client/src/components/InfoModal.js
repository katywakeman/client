export default function InfoModal({ onClose }) {
  return (
    <div className="info-overlay" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <button className="info-close" onClick={onClose}>✕</button>
        <h2>How to Use the Map</h2>
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
