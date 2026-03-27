import { Html } from '@react-three/drei'

export default function AmenityMarker({ position, emoji }) {
  return (
    <Html position={[position[0], 1.5, position[2]]} center zIndexRange={[0, 0]}>
      <div style={{ fontSize: '14px', pointerEvents: 'none', background: '#1a1f2e', borderRadius: '4px', padding: '0 2px' }}>{emoji}</div>
    </Html>
  )
}
