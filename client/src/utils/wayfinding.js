export const waypointConnections = {
  'lobby': ['mid_hallway', 'mid_hallway001', 'door_north'],
  'door_north': ['lobby', 'door_north001'],
  'door_north001': ['door_north002', 'door_north', 'door024'],
  'door_north002': ['door_north_21', 'door_north012'],
  'door_north012': ['door_north_720', 'door_north011', 'door_north002'],
  'door_north011': ['door_north003', 'door_north004', 'door_north012'],
  'door_north004': ['door_north_014', 'door_north005', 'door_north011', 'door_north013'],
  'door_north005': ['door_north_015', 'door_north006', 'door_north004', 'door_north007'],
  'door_north006': ['door_north010', 'door_north005', 'door001'],
  'door_north_21': ['door_north002'],
  'door_north_720': ['door_north012'],
  'door_north003': ['door_north011'],
  'door_north010': ['door_north006'],
  'door_north013': ['door_north004'],
  'door_north007': ['door_north005'],
  'door_north014': ['door_north004'],
  'door_north_014': ['door_north004'],
  'door_north_015': ['door_north005'],
  'mid_hallway': ['lobby', 'door_701'],
  'mid_hallway001': ['lobby', 'door_703', 'mid_hallway003'],
  'mid_hallway003': ['mid_hallway001', 'door_705', 'mid_hallway002'],
  'mid_hallway002': ['mid_hallway003', 'door_706'],
  'door_706': ['mid_hallway002'],
  'door_705': ['mid_hallway003'],
  'door_703': ['mid_hallway001'],
  'door_701': ['mid_hallway'],
  'door001': ['door_north006', 'door002'],
  'door002': ['door001', 'door003'],
  'door003': ['door002', 'door004'],
  'door004': ['door003', 'door005', 'door007'],
  'door005': ['door004'],
  'door006': ['door007'],
  'door007': ['door004', 'door006', 'door008'],
  'door008': ['door009', 'door010', 'door007'],
  'door009': ['door008'],
  'door010': ['door008', 'door011'],
  'door011': ['door010', 'door012', 'door013'],
  'door012': ['door011'],
  'door013': ['door011', 'door014', 'door016'],
  'door014': ['door013'],
  'door015': ['door016'],
  'door016': ['door013', 'door015', 'door017', 'door019'],
  'door017': ['door016'],
  'door018': ['door019'],
  'door019': ['door016', 'door022', 'door018', 'door020'],
  'door020': ['door019'],
  'door021': ['door022'],
  'door022': ['door019', 'door024', 'door021', 'door023'],
  'door023': ['door022'],
  'door024': ['door022', 'door_north001'],
}

export let waypointGraph = {}

export function extractRoomsFromScene(scene) {
  const extractedRooms = []
  const extractedWaypoints = {}
  const extractedBathrooms = []
  const extractedBins = []
  const extractedPrinters = []

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
      if (wpName.startsWith('bathroom')) {
        extractedBathrooms.push([child.position.x, child.position.y, child.position.z])
      }
      if (wpName.startsWith('bin')) {
        extractedBins.push([child.position.x, child.position.y, child.position.z])
      }
      if (wpName.startsWith('printer')) {
        extractedPrinters.push([child.position.x, child.position.y, child.position.z])
      }
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

  return { rooms: extractedRooms, bathrooms: extractedBathrooms, bins: extractedBins, printers: extractedPrinters }
}

export function findPath(startPos, endPos, graph) {
  const dist2D = (a, b) => Math.sqrt(
    Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2)
  )

  const getNearestWaypoint = (pos) => {
    let nearest = null
    let minDist = Infinity
    for (const [name, wp] of Object.entries(graph)) {
      const d = dist2D(pos, wp.position)
      if (d < minDist) { minDist = d; nearest = name }
    }
    return nearest
  }

  const startWp = getNearestWaypoint(startPos)
  const endWp = getNearestWaypoint(endPos)

  if (!startWp || !endWp) return [startPos, endPos]

  const costs = { [startWp]: 0 }
  const prev = {}
  const unvisited = new Set(Object.keys(graph))

  while (unvisited.size > 0) {
    const current = [...unvisited].reduce((a, b) =>
      (costs[a] ?? Infinity) < (costs[b] ?? Infinity) ? a : b
    )

    if (current === endWp) break
    if ((costs[current] ?? Infinity) === Infinity) break

    unvisited.delete(current)

    for (const next of graph[current]?.connections || []) {
      if (!unvisited.has(next)) continue
      const newCost = costs[current] + dist2D(graph[current].position, graph[next].position)
      if (newCost < (costs[next] ?? Infinity)) {
        costs[next] = newCost
        prev[next] = current
      }
    }
  }

  if (!prev[endWp] && startWp !== endWp) return [startPos, endPos]

  const path = []
  let current = endWp
  while (current) { path.unshift(current); current = prev[current] }

  const positions = [startPos]
  for (const wpName of path) positions.push(graph[wpName].position)
  positions.push(endPos)
  return positions
}
