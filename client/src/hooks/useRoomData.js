import { useState, useEffect } from 'react'

export function useRoomData() {
  const [allRoomData, setAllRoomData] = useState([])
  const [roomsWithInfo, setRoomsWithInfo] = useState(new Set())

  useEffect(() => {
    fetch('http://localhost:3001/api/rooms')
      .then(res => res.json())
      .then(data => {
        setAllRoomData(data)
        setRoomsWithInfo(new Set(data.map(r => r.roomID)))
      })
      .catch(() => {})
  }, [])

  const fetchRoomInfo = async (roomId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/rooms/${roomId}`)
      if (res.ok) return await res.json()
    } catch {}
    return null
  }

  return { allRoomData, roomsWithInfo, fetchRoomInfo }
}
