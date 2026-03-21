import { Html } from '@react-three/drei'

export default function RoomLabel({ room, isSelected, onClick }) {
  return (
    <Html position={[room.position[0], 1.5, room.position[2]]} center style={{ pointerEvents: 'auto' }}>
      <div className="room-label" onClick={(e) => { e.stopPropagation(); onClick() }}>
        {room.name}
      </div>
    </Html>
  )
}
