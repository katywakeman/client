export const defaultRooms = [
  { name: 'Room 101', position: [2, 0, 2] },
  { name: 'Room 102', position: [-2, 0, 2] },
  { name: 'Room 103', position: [2, 0, -2] },
  { name: 'Lobby', position: [0, 0, 0] }
]

export const waypointConnections = {
  'lobby': ['mid_hallway', 'mid_hallway001'],
  'mid_hallway': ['lobby', 'door_701'],
  'mid_hallway001': ['lobby', 'door_703', 'mid_hallway003'],
  'mid_hallway003': ['mid_hallway001', 'door_705', 'mid_hallway002'],
  'mid_hallway002': ['mid_hallway003', 'door_706'],
  'door_706': ['mid_hallway002'],
  'door_705': ['mid_hallway003'],
  'door_703': ['mid_hallway001'],
  'door_701': ['mid_hallway'],
}

export let waypointGraph = {
  'lobby': { position: [0, 0, 0], connections: ['hallway1', 'hallway2'] },
  'hallway1': { position: [1, 0, 0], connections: ['lobby', 'room101'] },
  'hallway2': { position: [-1, 0, 0], connections: ['lobby', 'room102'] },
  'room101': { position: [2, 0, 2], connections: ['hallway1'] },
  'room102': { position: [-2, 0, 2], connections: ['hallway2'] }
}

export function extractRoomsFromScene(scene) {
  const extractedRooms = []
  const extractedWaypoints = {}

  scene.traverse((child) => {
    if (child.name.toLowerCase().startsWith('room_')) {
      const label = child.name.replace(/^room_/i, '').replace('_', '.')
      extractedRooms.push({
        name: label,
        id: child.name.toLowerCase(),
        position: [child.position.x, child.position.y, child.position.z]
      })
    }
    if (child.name.toLowerCase().startsWith('waypoint_') || child.name.toLowerCase().startsWith('wp_')) {
      const wpName = child.name.toLowerCase().replace('waypoint_', '').replace('wp_', '')
      extractedWaypoints[wpName] = {
        position: [child.position.x, child.position.y, child.position.z],
        connections: []
      }
    }
  })

  if (Object.keys(extractedWaypoints).length > 0) {
    for (const [name, wp] of Object.entries(extractedWaypoints)) {
      wp.connections = waypointConnections[name] || []
    }
    waypointGraph = extractedWaypoints
  }

  return extractedRooms.length > 0 ? extractedRooms : defaultRooms
}

export function findPath(startPos, endPos, graph) {
  const getNearestWaypoint = (pos) => {
    let nearest = null
    let minDist = Infinity
    for (const [name, wp] of Object.entries(graph)) {
      const dist = Math.sqrt(
        Math.pow(pos[0] - wp.position[0], 2) +
        Math.pow(pos[2] - wp.position[2], 2)
      )
      if (dist < minDist) {
        minDist = dist
        nearest = name
      }
    }
    return nearest
  }

  const startWp = getNearestWaypoint(startPos)
  const endWp = getNearestWaypoint(endPos)

  if (!startWp || !endWp) return [startPos, endPos]

  const queue = [[startWp]]
  const visited = new Set([startWp])

  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]

    if (current === endWp) {
      const positions = [startPos]
      for (const wpName of path) positions.push(graph[wpName].position)
      positions.push(endPos)
      return positions
    }

    for (const next of graph[current]?.connections || []) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push([...path, next])
      }
    }
  }

  return [startPos, endPos]
}
