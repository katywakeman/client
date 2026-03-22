import { Html } from '@react-three/drei'

export default function BathroomMarker({ position }) {
  return (
    <Html position={[position[0], 1.5, position[2]]} center>
      <div style={{ fontSize: '20px', pointerEvents: 'none' }}>🚻</div>
    </Html>
  )
}
