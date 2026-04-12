import { Html } from '@react-three/drei'

export default function RoomLabel({ room, isSelected, onClick }) {
  return (
    <Html position={[room.position[0], 1.5, room.position[2]]} center zIndexRange={[0, 0]} style={{ pointerEvents: 'auto', zIndex: 1 }}>
      <button
        className={`room-label ${isSelected ? 'room-label-selected' : ''}`}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        aria-pressed={isSelected}
        aria-label={`Select room ${room.name}`}
      >
        {room.name}
      </button>
    </Html>
  )
}
