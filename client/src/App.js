import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'
import Navigation from './navbar'
import BlenderModel from './components/BlenderModel'
import RoomLabel from './components/RoomLabel'
import PathLine from './components/PathLine'
import { SafePointerLockControls, WalkingControls } from './components/WalkingControls'
import SearchPanel from './components/SearchPanel'
import { useRoomData } from './hooks/useRoomData'
import InfoModal from './components/InfoModal'
import AmenityMarker from './components/AmenityMarker'
import BuildingSelect from './components/BuildingSelect'
import { extractRoomsFromScene } from './utils/wayfinding'
import './App.css'

const FLOORS_BY_BUILDING = {
  'BLD-001': [
    { number: 7, label: 'Floor 7', file: '/BushHouseFloor7.glb' },
  ]
}

function Map({ building, onBack, children }) {
  const FLOORS = FLOORS_BY_BUILDING[building._id] || [{ number: 1, label: 'Floor 1', file: null }]
  const [isWalking, setIsWalking] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showLabels, setShowLabels] = useState(true)
  const [roomList, setRoomList] = useState([])
  const [bathrooms, setBathrooms] = useState([])
  const [bins, setBins] = useState([])
  const [printers, setPrinters] = useState([])
  const [search, setSearch] = useState('')
  const [roomInfo, setRoomInfo] = useState(null)

  const [showInfo, setShowInfo] = useState(false)
  const [floorIndex, setFloorIndex] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const currentFloor = FLOORS[floorIndex]

  const { allRoomData, roomsWithInfo } = useRoomData()

  const isSearching = search.trim().length > 0

  const filteredRooms = roomList.filter(room => {
    const dbRoom = allRoomData.find(r => r.name === room.name)
    return (
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      (dbRoom?.lecturers?.some(l => l.name.toLowerCase().includes(search.toLowerCase())))
    )
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  const handleRoomSelect = (room) => {
    if (selectedRoom?.name === room.name) {
      setSelectedRoom(null)
      setRoomInfo(null)
      return
    }
    setSelectedRoom(room)
    const data = allRoomData.find(r => r.name === room.name) || null
    setRoomInfo(data)
  }

  const handleFloorChange = (dir) => {
    const next = floorIndex + dir
    if (next < 0 || next >= FLOORS.length) return
    setFloorIndex(next)
    setSelectedRoom(null)
    setRoomInfo(null)
    setRoomList([])
    setBathrooms([])
    setBins([])
    setPrinters([])
  }

  const handleSceneLoad = (scene) => {
    const { rooms, bathrooms, bins, printers } = extractRoomsFromScene(scene)
    setRoomList(rooms)
    setBathrooms(bathrooms)
    setBins(bins)
    setPrinters(printers)
  }

  const toggleWalking = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock()
    } else {
      setIsWalking(prev => !prev)
    }
  }

  useEffect(() => {
    const handleLockChange = () => {
      if (!document.pointerLockElement) {
        setIsWalking(false)
      }
    }
    document.addEventListener('pointerlockchange', handleLockChange)
    return () => document.removeEventListener('pointerlockchange', handleLockChange)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'v' || e.key === 'V') toggleWalking()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="map-container">
      <main className="map-viewport" aria-label={`${building.name} floor map`}>
        <button className="info-btn" onClick={() => setShowInfo(true)} aria-label="Open help guide">i</button>
        <button className="back-btn" onClick={onBack}>← Buildings</button>
        <div className="floor-controls" role="group" aria-label="Floor navigation">
          <button className="floor-btn" onClick={() => handleFloorChange(1)} disabled={floorIndex >= FLOORS.length - 1} aria-label="Go up a floor">▲</button>
          <button className="floor-btn" onClick={() => handleFloorChange(-1)} disabled={floorIndex <= 0} aria-label="Go down a floor">▼</button>
        </div>
        {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
        {children}
        <button className="labels-toggle-btn" onClick={() => setShowLabels(!showLabels)} aria-pressed={showLabels}>
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
        <button className="view-toggle" onClick={toggleWalking} aria-pressed={isWalking} aria-label={isWalking ? 'Switch to orbit view' : 'Switch to walking view'}>
          <span className={`view-toggle-label ${!isWalking ? 'active' : ''}`} aria-hidden="true">Orbit</span>
          <div className={`view-toggle-switch ${isWalking ? 'on' : ''}`} aria-hidden="true">
            <div className="view-toggle-knob" />
          </div>
          <span className={`view-toggle-label ${isWalking ? 'active' : ''}`} aria-hidden="true">Walk</span>
        </button>
        <Canvas camera={{ position: isWalking ? [0, 1.6, 0] : [0, 2, 5], fov: 50 }} gl={{ failIfMajorPerformanceCaveat: false }}>
          <Suspense fallback={<div className="canvas-loading" aria-live="polite">Loading map...</div>}>
            {currentFloor.file
              ? <BlenderModel key={currentFloor.file} path={currentFloor.file} onLoad={handleSceneLoad} />
              : null
            }
            {showLabels && roomList.map((room, i) => (
              <RoomLabel key={i} room={room} isSelected={selectedRoom?.name === room.name} onClick={() => handleRoomSelect(room)} />
            ))}
            {showLabels && bathrooms.map((pos, i) => (
              <AmenityMarker key={i} position={pos} emoji="🚻" label="Bathroom" />
            ))}
            {showLabels && bins.map((pos, i) => (
              <AmenityMarker key={i} position={pos} emoji="🗑️" label="Bin" />
            ))}
            {showLabels && printers.map((pos, i) => (
              <AmenityMarker key={i} position={pos} emoji="🖨️" label="Printer" />
            ))}
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
        <div className="floor-indicator" aria-live="polite" aria-atomic="true">{currentFloor.label}</div>
      </main>
      <button className="panel-toggle-btn" onClick={() => setShowPanel(p => !p)} aria-label={showPanel ? 'Close search panel' : 'Open search panel'} aria-expanded={showPanel}>
        {showPanel ? '✕' : '🔍'}
      </button>
      <SearchPanel
        filteredRooms={filteredRooms}
        search={search}
        setSearch={setSearch}
        selectedRoom={selectedRoom}
        roomInfo={roomInfo}
        allRoomData={allRoomData}
        roomsWithInfo={roomsWithInfo}
        isSearching={isSearching}
        onRoomSelect={(room) => { handleRoomSelect(room); setShowPanel(false) }}
        onClear={() => { setSelectedRoom(null); setRoomInfo(null) }}
        showPanel={showPanel}
      />
    </div>
  )
}

export default function App() {
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [showTutorial, setShowTutorial] = useState(false)

  const handleBuildingSelect = (b) => {
    setSelectedBuilding(b)
    if (b.name === 'Bush House') setShowTutorial(true)
  }

  return (
    <>
      <Navigation />
      {selectedBuilding ? (
        <Map building={selectedBuilding} onBack={() => setSelectedBuilding(null)}>
          {showTutorial && <InfoModal onClose={() => setShowTutorial(false)} />}
        </Map>
      ) : (
        <BuildingSelect onSelect={handleBuildingSelect} />
      )}
    </>
  )
}
