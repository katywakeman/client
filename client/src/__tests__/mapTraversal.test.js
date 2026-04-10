import { findPath, waypointConnections } from '../utils/wayfinding'

const buildGraphFromConnections = () => {
  const keys = Object.keys(waypointConnections)
  const graph = {}
  keys.forEach((key, i) => {
    graph[key] = {
      position: [i * 2, 0, 0],
      connections: waypointConnections[key]
    }
  })
  return graph
}

const graph = buildGraphFromConnections()

const getPathWaypoints = (start, end) => {
  const startPos = graph[start]?.position
  const endPos = graph[end]?.position
  if (!startPos || !endPos) return []
  const result = findPath(startPos, endPos, graph)
  return result.slice(1, -1).map(pos =>
    Object.entries(graph).find(([, wp]) => wp.position === pos)?.[0]
  ).filter(Boolean)
}

describe('map traversal - corridor routes', () => {
  test('lobby connects to mid_hallway', () => {
    const path = getPathWaypoints('lobby', 'mid_hallway')
    expect(path).toContain('mid_hallway')
  })

  test('lobby connects to door_north', () => {
    const path = getPathWaypoints('lobby', 'door_north')
    expect(path).toContain('door_north')
  })

  test('path from door_north to door_north012 passes through door_north001 and door_north002', () => {
    const path = getPathWaypoints('door_north', 'door_north012')
    expect(path).toContain('door_north001')
    expect(path).toContain('door_north002')
  })

  test('path from lobby to door_north006 passes through door_north corridor', () => {
    const path = getPathWaypoints('lobby', 'door_north006')
    expect(path).toContain('door_north')
    expect(path).toContain('door_north001')
  })

  test('path from door_north to door024 is reachable', () => {
    const path = getPathWaypoints('door_north', 'door024')
    expect(path.length).toBeGreaterThan(0)
    expect(path).toContain('door024')
  })

  test('path from lobby to door_706 passes through mid_hallway corridor', () => {
    const path = getPathWaypoints('lobby', 'door_706')
    expect(path).toContain('mid_hallway001')
    expect(path).toContain('mid_hallway003')
    expect(path).toContain('mid_hallway002')
  })

  test('path from door_north006 to door001 is direct', () => {
    const path = getPathWaypoints('door_north006', 'door001')
    expect(path).toContain('door001')
  })

  test('path from door001 to door024 traverses the full corridor', () => {
    const path = getPathWaypoints('door001', 'door024')
    expect(path.length).toBeGreaterThan(3)
    expect(path).toContain('door024')
  })

  test('path from mid_hallway to door_702 passes through door_702001', () => {
    const path = getPathWaypoints('mid_hallway', 'door_702')
    expect(path).toContain('door_702001')
  })

  test('path from door003 to room_7_13n passes through door025 and door026', () => {
    const path = getPathWaypoints('door003', 'room_7_13n')
    expect(path).toContain('door025')
    expect(path).toContain('door026')
    expect(path).toContain('room_7_13n')
  })

  test('door_north_720 is reachable from lobby', () => {
    const path = getPathWaypoints('lobby', 'door_north_720')
    expect(path).toContain('door_north_720')
  })

  test('door_north_21 is reachable from lobby', () => {
    const path = getPathWaypoints('lobby', 'door_north_21')
    expect(path).toContain('door_north_21')
  })
})
