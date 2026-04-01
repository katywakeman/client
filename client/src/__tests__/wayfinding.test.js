import { findPath, extractRoomsFromScene } from '../utils/wayfinding'

const mockGraph = {
  a: { position: [0, 0, 0], connections: ['b'] },
  b: { position: [1, 0, 0], connections: ['a', 'c'] },
  c: { position: [2, 0, 0], connections: ['b'] },
  isolated: { position: [10, 0, 10], connections: [] },
}

const makeChild = (name, x = 0, y = 0, z = 0) => ({
  name,
  position: { x, y, z }
})

const makeScene = (children) => ({
  traverse: (fn) => children.forEach(fn)
})

describe('findPath', () => {
  test('returns straight line when graph is empty', () => {
    const result = findPath([0, 0, 0], [1, 0, 1], {})
    expect(result).toEqual([[0, 0, 0], [1, 0, 1]])
  })

  test('finds path between two connected waypoints', () => {
    const result = findPath([0, 0, 0], [2, 0, 0], mockGraph)
    expect(result.length).toBeGreaterThan(2)
    expect(result[0]).toEqual([0, 0, 0])
    expect(result[result.length - 1]).toEqual([2, 0, 0])
  })

  test('returns straight line when no path exists to isolated node', () => {
    const result = findPath([0, 0, 0], [10, 0, 10], mockGraph)
    expect(result).toEqual([[0, 0, 0], [10, 0, 10]])
  })

  test('path includes intermediate waypoints', () => {
    const result = findPath([0, 0, 0], [2, 0, 0], mockGraph)
    // start + a + b + c + end
    expect(result.length).toBe(5)
  })
})

describe('extractRoomsFromScene', () => {
  test('extracts rooms with correct name and id', () => {
    const scene = makeScene([
      makeChild('room_7_01N', 1, 0, 2),
      makeChild('room_7_02N', 3, 0, 4),
    ])
    const { rooms } = extractRoomsFromScene(scene)
    expect(rooms).toHaveLength(2)
    expect(rooms[0].name).toBe('7.01N')
    expect(rooms[0].id).toBe('room_7_01n')
  })

  test('extracts bathroom waypoints', () => {
    const scene = makeScene([
      makeChild('waypoint_bathroom', 1, 0, 1),
      makeChild('waypoint_bathroom2', 2, 0, 2),
    ])
    const { bathrooms } = extractRoomsFromScene(scene)
    expect(bathrooms).toHaveLength(2)
  })

  test('extracts bin waypoints', () => {
    const scene = makeScene([makeChild('waypoint_bin', 1, 0, 1)])
    const { bins } = extractRoomsFromScene(scene)
    expect(bins).toHaveLength(1)
  })

  test('extracts printer waypoints', () => {
    const scene = makeScene([makeChild('waypoint_printer', 1, 0, 1)])
    const { printers } = extractRoomsFromScene(scene)
    expect(printers).toHaveLength(1)
  })

  test('amenity waypoints are not added to pathfinding graph', () => {
    const scene = makeScene([
      makeChild('waypoint_bin', 1, 0, 1),
      makeChild('waypoint_bathroom', 2, 0, 2),
      makeChild('waypoint_lobby', 0, 0, 0),
    ])
    extractRoomsFromScene(scene)
    const { waypointGraph } = require('../utils/wayfinding')
    expect(waypointGraph['lobby']).toBeDefined()
    expect(waypointGraph['bin']).toBeUndefined()
    expect(waypointGraph['bathroom']).toBeUndefined()
  })

  test('ignores non-room non-waypoint objects', () => {
    const scene = makeScene([
      makeChild('Cube', 0, 0, 0),
      makeChild('Light', 1, 0, 0),
    ])
    const { rooms, bathrooms, bins, printers } = extractRoomsFromScene(scene)
    expect(rooms).toHaveLength(0)
    expect(bathrooms).toHaveLength(0)
    expect(bins).toHaveLength(0)
    expect(printers).toHaveLength(0)
  })

  test('waypoint_room_ objects are treated as waypoints not rooms', () => {
    const scene = makeScene([
      makeChild('waypoint_room_7_13N', 1, 0, 1),
    ])
    const { rooms } = extractRoomsFromScene(scene)
    expect(rooms).toHaveLength(0)
  })
})
