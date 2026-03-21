import { Line } from '@react-three/drei'
import { Vector3 } from 'three'
import { findPath, waypointGraph } from '../utils/wayfinding'

export default function PathLine({ start, end }) {
  if (!start || !end) return null

  const pathPositions = findPath(start, end, waypointGraph)
  const points = pathPositions.map(pos => new Vector3(pos[0], 0.1, pos[2]))

  return <Line points={points} color="#E12726" lineWidth={3} />
}
