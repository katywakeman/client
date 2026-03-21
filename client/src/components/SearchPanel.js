export default function SearchPanel({ filteredRooms, search, setSearch, selectedRoom, roomInfo, allRoomData, roomsWithInfo, isSearching, onRoomSelect, onClear }) {
  return (
    <div className="search-panel">
      <div className="search-panel-title">Find a Room</div>
      <input
        className="search-input"
        type="text"
        placeholder="Search rooms or lecturers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filteredRooms.length === 0 && <div className="no-results">No rooms found</div>}
      {filteredRooms.map((room, i) => {
        const isSelected = selectedRoom?.name === room.name
        const roomId = room.name.toLowerCase().replace(/ /g, '_')
        const hasInfo = roomsWithInfo.has(roomId)
        const isOpen = isSelected || (isSearching && hasInfo)
        const displayData = (roomInfo && isSelected) ? roomInfo : allRoomData.find(r => r.roomID === roomId)

        return (
          <div key={i}>
            <button
              onClick={() => hasInfo ? onRoomSelect(room) : null}
              className={`room-btn ${isSelected ? 'active' : ''}`}
            >
              {room.name}
              {hasInfo && <span className="room-btn-arrow">{isOpen ? '▲' : '▼'}</span>}
            </button>
            {isOpen && hasInfo && displayData && (
              <div className="room-info">
                {displayData.lecturer && <div><strong>Lecturer:</strong> {displayData.lecturer}</div>}
                {displayData.email && <div><strong>Email:</strong> {displayData.email}</div>}
                {displayData.officeHours && <div><strong>Office Hours:</strong> {displayData.officeHours}</div>}
                {displayData.description && <div><strong>Info:</strong> {displayData.description}</div>}
              </div>
            )}
          </div>
        )
      })}
      {selectedRoom && (
        <button className="clear-btn" onClick={onClear}>Clear Path</button>
      )}
    </div>
  )
}
