import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Html, Line } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import { Vector3} from 'three'
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'
import BasicExample from './navbar'
import './App.css'

function BlenderModel({ path, onLoad }) {
  const { scene } = useGLTF(path)
  
  useEffect(() => {
    if (onLoad) onLoad(scene)
  }, [scene, onLoad])
  
  return <primitive object={scene} />
}

// Room data will be populated from Blender empties
let rooms = [
  { name: 'Room 101', position: [2, 0, 2] },
  { name: 'Room 102', position: [-2, 0, 2] },
  { name: 'Room 103', position: [2, 0, -2] },
  { name: 'Lobby', position: [0, 0, 0] }
]

// Waypoint graph - define connections between waypoints
// Update this with your actual waypoint names and their connections
const waypointConnections = {
  'lobby': ['mid_hallway', 'mid_hallway001'],
  'mid_hallway': ['lobby', 'door_701'],
  'mid_hallway001': ['lobby', 'door_703', 'mid_hallway003'],
  'mid_hallway003': ['mid_hallway001', 'door_705', 'mid_hallway002'],
  'mid_hallway002': ['mid_hallway003', 'door_706'],
  'door_706': ['mid_hallway002'],
  'door_705': ['mid_hallway003'],
  'door_703': ['mid_hallway001'],
  'door_701': ['mid_hallway'],
  // Add more connections as needed
}

let waypointGraph = {
  'lobby': { position: [0, 0, 0], connections: ['hallway1', 'hallway2'] },
  'hallway1': { position: [1, 0, 0], connections: ['lobby', 'room101'] },
  'hallway2': { position: [-1, 0, 0], connections: ['lobby', 'room102'] },
  'room101': { position: [2, 0, 2], connections: ['hallway1'] },
  'room102': { position: [-2, 0, 2], connections: ['hallway2'] }
}

function extractRoomsFromScene(scene) {
  const extractedRooms = []
  const extractedWaypoints = {}
  
  scene.traverse((child) => {
    // Look for objects with names starting with "Room_" or "room_"
    if (child.name.toLowerCase().startsWith('room_')) {
      extractedRooms.push({
        name: child.name.replace(/_/g, ' '),
        position: [child.position.x, child.position.y, child.position.z]
      })
    }
    // Look for waypoints with names starting with "waypoint_" or "wp_"
    if (child.name.toLowerCase().startsWith('waypoint_') || child.name.toLowerCase().startsWith('wp_')) {
      const wpName = child.name.toLowerCase().replace('waypoint_', '').replace('wp_', '')
      extractedWaypoints[wpName] = {
        position: [child.position.x, child.position.y, child.position.z],
        connections: [] // You'll need to define connections in userData or a separate config
      }
    }
  })
  
  if (Object.keys(extractedWaypoints).length > 0) {
    // Apply connections from waypointConnections config
    for (const [name, wp] of Object.entries(extractedWaypoints)) {
      wp.connections = waypointConnections[name] || []
    }
    waypointGraph = extractedWaypoints
  }
  
  return extractedRooms.length > 0 ? extractedRooms : rooms
}

// A* pathfinding algorithm
function findPath(startPos, endPos, graph) {
  // Find nearest waypoints to start and end
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
  
  // Simple BFS pathfinding
  const queue = [[startWp]]
  const visited = new Set([startWp])
  
  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]
    
    if (current === endWp) {
      // Convert waypoint names to positions
      const positions = [startPos]
      for (const wpName of path) {
        positions.push(graph[wpName].position)
      }
      positions.push(endPos)
      return positions
    }
    
    const connections = graph[current]?.connections || []
    for (const next of connections) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push([...path, next])
      }
    }
  }
  
  // No path found, return direct line
  return [startPos, endPos]
}

function RoomLabel({ room, isSelected, onClick }) {
  return (
    <Html position={[room.position[0], 1.5, room.position[2]]} center style={{ pointerEvents: 'auto' }}>
      <div className="room-label" onClick={(e) => { e.stopPropagation(); onClick() }}>
        {room.name}
      </div>
    </Html>
  )
}

function PathLine({ start, end }) {
  if (!start || !end) return null
  
  // Find path through waypoints
  const pathPositions = findPath(start, end, waypointGraph)
  const points = pathPositions.map(pos => new Vector3(pos[0], 0.1, pos[2]))
  
  return (
    <Line
      points={points}
      color="#E12726"
      lineWidth={3}
    />
  )
}

function SafePointerLockControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    const controls = new PointerLockControlsImpl(camera, gl.domElement)
    controlsRef.current = controls

    const handleClick = () => {
      try {
        controls.lock()
      } catch (e) {
        // Silently catch errors
      }
    }

    gl.domElement.addEventListener('click', handleClick)

    return () => {
      gl.domElement.removeEventListener('click', handleClick)
      try {
        controls.unlock()
      } catch (e) {
        // Silently catch errors
      }
      controls.dispose()
    }
  }, [camera, gl])

  return null
}

function WalkingControls() {
  const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, space: false })
  const velocity = useRef({ x: 0, y: 0, z: 0 })
  const onGround = useRef(true)
  
  useFrame((state) => {
    const speed = 0.1
    const gravity = -0.02
    const jumpForce = 0.3
    const groundLevel = 1
    const camera = state.camera
    const direction = new Vector3()
    
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()
    
    const right = new Vector3()
    right.crossVectors(camera.up, direction).normalize()
    
    // Horizontal movement
    if (keys.current.w || keys.current.ArrowUp) camera.position.addScaledVector(direction, speed)
    if (keys.current.s || keys.current.ArrowDown) camera.position.addScaledVector(direction, -speed)
    if (keys.current.a || keys.current.ArrowLeft) camera.position.addScaledVector(right, speed)
    if (keys.current.d || keys.current.ArrowRight) camera.position.addScaledVector(right, -speed)
    
    // Jump
    if (keys.current.space && onGround.current) {
      velocity.current.y = jumpForce
      onGround.current = false
    }
    
    // Apply gravity
    velocity.current.y += gravity
    camera.position.y += velocity.current.y
    
    // Ground collision
    if (camera.position.y <= groundLevel) {
      camera.position.y = groundLevel
      velocity.current.y = 0
      onGround.current = true
    }
  })
  
  useState(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        keys.current.space = true
        e.preventDefault()
      } else if (e.key in keys.current) {
        keys.current[e.key] = true
      }
    }
    const handleKeyUp = (e) => {
      if (e.key === ' ') {
        keys.current.space = false
      } else if (e.key in keys.current) {
        keys.current[e.key] = false
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  })
  
  return null
}

function Map() {
  const [isWalking, setIsWalking] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showLabels, setShowLabels] = useState(true)
  const [roomList, setRoomList] = useState(rooms)
  const [search, setSearch] = useState('')
  const [roomInfo, setRoomInfo] = useState(null)
  const [roomsWithInfo, setRoomsWithInfo] = useState(new Set())
  const [allRoomData, setAllRoomData] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/rooms')
      .then(res => res.json())
      .then(data => {
        setRoomsWithInfo(new Set(data.map(r => r.roomID)))
        setAllRoomData(data)
      })
      .catch(() => {})
  }, [])

  const filteredRooms = roomList.filter(room => {
    const roomId = room.name.toLowerCase().replace(/ /g, '_')
    const dbRoom = allRoomData.find(r => r.roomID === roomId)
    return (
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      (dbRoom?.lecturer && dbRoom.lecturer.toLowerCase().includes(search.toLowerCase()))
    )
  })

  const isSearching = search.trim().length > 0

  const handleRoomSelect = async (room) => {
    if (selectedRoom?.name === room.name) {
      setSelectedRoom(null)
      setRoomInfo(null)
      return
    }
    setSelectedRoom(room)
    try {
      const roomId = room.name.toLowerCase().replace(/ /g, '_')
      const res = await fetch(`http://localhost:3001/api/rooms/${roomId}`)
      if (res.ok) {
        const data = await res.json()
        setRoomInfo(data)
      } else {
        setRoomInfo(null)
      }
    } catch (err) {
      setRoomInfo(null)
    }
  }

  const handleSceneLoad = (scene) => {
    const extractedRooms = extractRoomsFromScene(scene)
    setRoomList(extractedRooms)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'v' || e.key === 'V') {
        if (document.pointerLockElement) {
          document.exitPointerLock()
          setTimeout(() => setIsWalking(prev => !prev), 100)
        } else {
          setIsWalking(prev => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="map-container">
      <div className="map-viewport">
        <button className="view-toggle-btn"
          onClick={() => {
            if (document.pointerLockElement) {
              document.exitPointerLock()
              setTimeout(() => setIsWalking(!isWalking), 100)
            } else {
              setIsWalking(!isWalking)
            }
          }}
        >
          {isWalking ? 'Orbit View' : 'Walking View'}
        </button>
        <button className="labels-toggle-btn" onClick={() => setShowLabels(!showLabels)}>
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
        <Canvas camera={{ position: isWalking ? [0, 1.6, 0] : [0, 2, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <BlenderModel path="/BushHouseFloor7.glb" onLoad={handleSceneLoad} />
            {showLabels && roomList.map((room, i) => <RoomLabel key={i} room={room} isSelected={selectedRoom?.name === room.name} onClick={() => handleRoomSelect(room)} />)}
            {selectedRoom && <PathLine start={[0, 0, 0]} end={selectedRoom.position} />}
            {isWalking ? (
              <>
                <SafePointerLockControls />
                <WalkingControls />
              </>
            ) : (
              <OrbitControls />
            )}
            <Environment preset="sunset" />
          </Suspense>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
        </Canvas>
      </div>
      <div className="search-panel">
        <div className="search-panel-title">Find a Room</div>
        <input
          className="search-input"
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {filteredRooms.length === 0 && (
          <div className="no-results">No rooms found</div>
        )}
        {filteredRooms.map((room, i) => {
          const isSelected = selectedRoom?.name === room.name
          const roomId = room.name.toLowerCase().replace(/ /g, '_')
          const hasInfo = roomsWithInfo.has(roomId)
          const isOpen = isSelected || (isSearching && hasInfo)
          return (
            <div key={i}>
              <button
                onClick={() => hasInfo ? handleRoomSelect(room) : setSelectedRoom(isSelected ? null : room)}
                className={`room-btn ${isSelected ? 'active' : ''}`}
              >
                {room.name}
                {hasInfo && <span className="room-btn-arrow">{isOpen ? '▲' : '▼'}</span>}
              </button>
              {isOpen && hasInfo && (
                <div className="room-info">
                  {(roomInfo && isSelected) ? (
                    <>
                      {roomInfo.lecturer && <div><strong>Lecturer:</strong> {roomInfo.lecturer}</div>}
                      {roomInfo.email && <div><strong>Email:</strong> {roomInfo.email}</div>}
                      {roomInfo.officeHours && <div><strong>Office Hours:</strong> {roomInfo.officeHours}</div>}
                      {roomInfo.description && <div><strong>Info:</strong> {roomInfo.description}</div>}
                    </>
                  ) : (
                    (() => {
                      const dbRoom = allRoomData.find(r => r.roomID === roomId)
                      return dbRoom ? (
                        <>
                          {dbRoom.lecturer && <div><strong>Lecturer:</strong> {dbRoom.lecturer}</div>}
                          {dbRoom.email && <div><strong>Email:</strong> {dbRoom.email}</div>}
                          {dbRoom.officeHours && <div><strong>Office Hours:</strong> {dbRoom.officeHours}</div>}
                          {dbRoom.description && <div><strong>Info:</strong> {dbRoom.description}</div>}
                        </>
                      ) : null
                    })()
                  )}
                </div>
              )}
            </div>
          )
        })}
        {selectedRoom && (
          <button className="clear-btn" onClick={() => { setSelectedRoom(null); setRoomInfo(null) }}>Clear Path</button>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <BasicExample />
      <Map />
    </>
  )
}