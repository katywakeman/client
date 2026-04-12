function highlight(text, term) {
  if (!term || !text) return text
  const idx = text.toLowerCase().indexOf(term.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  )
}

export default function SearchPanel({ filteredRooms, search, setSearch, selectedRoom, roomInfo, allRoomData, roomsWithInfo, isSearching, onRoomSelect, onClear, showPanel }) {
  return (
    <section className={`search-panel ${showPanel ? 'search-panel-open' : ''}`} aria-label="Room search">
      <div className="search-panel-title" id="search-panel-title">Find a Room</div>
      <input
        className="search-input"
        type="search"
        placeholder="Search rooms or lecturers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        aria-label="Search rooms or lecturers"
        aria-controls="room-results"
      />
      <div id="room-results" role="list" aria-live="polite" aria-atomic="false">
        {filteredRooms.length === 0 && search && <div className="no-results" role="status">No rooms found</div>}
        {filteredRooms.map((room, i) => {
          const isSelected = selectedRoom?.name === room.name
          const hasInfo = roomsWithInfo.has(room.name)
          const isOpen = isSelected || (isSearching && hasInfo)
          const displayData = (roomInfo && isSelected) ? roomInfo : allRoomData.find(r => r.name === room.name)

          return (
            <div key={i} role="listitem">
              <button
                onClick={() => onRoomSelect(room)}
                className={`room-btn ${isSelected ? 'active' : ''}`}
                aria-expanded={hasInfo ? isOpen : undefined}
                aria-pressed={isSelected}
              >
                {highlight(room.name, search)}
                {hasInfo && <span className="room-btn-arrow" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>}
              </button>
              {isOpen && hasInfo && displayData && (
                <div className="room-info" role="region" aria-label={`Details for ${room.name}`}>
                  {displayData.lecturers?.length > 0 && displayData.lecturers.map((l, i) => (
                    <div key={i} className="lecturer-info">
                      {i > 0 && <hr className="lecturer-divider" />}
                      {l.name && <div><strong>Lecturer:</strong> {highlight(l.name, search)}</div>}
                      {l._id && <div><strong>Email:</strong> {highlight(l._id, search)}</div>}
                      {l.office_hours && <div><strong>Office Hours:</strong> {l.office_hours}</div>}
                      {l.department && <div><strong>Department:</strong> {l.department}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {selectedRoom && (
        <button className="clear-btn" onClick={onClear} aria-label={`Clear path to ${selectedRoom.name}`}>Clear Path</button>
      )}
    </section>
  )
}
