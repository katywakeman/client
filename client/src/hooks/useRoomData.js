import { useState, useEffect } from 'react'
import API_URL from '../utils/api'

export function useRoomData() {
  const [allRoomData, setAllRoomData] = useState([])
  const [roomsWithInfo, setRoomsWithInfo] = useState(new Set())

  useEffect(() => {
    fetch(`${API_URL}/api/rooms`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return
        setAllRoomData(data)
        setRoomsWithInfo(new Set(data.filter(r => r.lecturers?.length > 0).map(r => r.name)))
      })
      .catch(() => {})
  }, [])

  return { allRoomData, roomsWithInfo }
}
