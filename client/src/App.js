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
import BathroomMarker from './components/BathroomMarker'
import { defaultRooms, extractRoomsFromScene } from './utils/wayfinding'
import './App.css'

function Map() {
  const [isWalking, setIsWalking] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showLabels, setShowLabels] = useState(true)
  const [roomList, setRoomList] = useState(defaultRooms)
  const [bathrooms, setBathrooms] = useState([])
  const [search, setSearch] = useState('')
  const [roomInfo, setRoomInfo] = useState(null)

  const [showInfo, setShowInfo] = useState(false)

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

  const handleSceneLoad = (scene) => {
    const { rooms, bathrooms } = extractRoomsFromScene(scene)
    setRoomList(rooms)
    setBathrooms(bathrooms)
  }

  const toggleWalking = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock()
      setTimeout(() => setIsWalking(prev => !prev), 100)
    } else {
      setIsWalking(prev => !prev)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'v' || e.key === 'V') toggleWalking()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="map-container">
      <div className="map-viewport">
        <button className="info-btn" onClick={() => setShowInfo(true)}>i</button>
        {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
        <button className="labels-toggle-btn" onClick={() => setShowLabels(!showLabels)}>
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
        <button className="view-toggle-btn" onClick={toggleWalking}>
          {isWalking ? 'Orbit View' : 'Walking View'}
        </button>
        <Canvas camera={{ position: isWalking ? [0, 1.6, 0] : [0, 2, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <BlenderModel path="/BushHouseFloor7.glb" onLoad={handleSceneLoad} />
            {showLabels && roomList.map((room, i) => (
              <RoomLabel key={i} room={room} isSelected={selectedRoom?.name === room.name} onClick={() => handleRoomSelect(room)} />
            ))}
            {showLabels && bathrooms.map((pos, i) => (
              <BathroomMarker key={i} position={pos} />
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
      </div>
      <SearchPanel
        filteredRooms={filteredRooms}
        search={search}
        setSearch={setSearch}
        selectedRoom={selectedRoom}
        roomInfo={roomInfo}
        allRoomData={allRoomData}
        roomsWithInfo={roomsWithInfo}
        isSearching={isSearching}
        onRoomSelect={handleRoomSelect}
        onClear={() => { setSelectedRoom(null); setRoomInfo(null) }}
      />
    </div>
  )
}

export default function App() {
  return (
    <>
      <Navigation />
      <Map />
    </>
  )
}
