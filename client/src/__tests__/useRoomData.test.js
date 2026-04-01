import { renderHook, waitFor } from '@testing-library/react'
import { useRoomData } from '../hooks/useRoomData'

const mockRooms = [
  { name: '7.01N', roomID: 'ROM-001', lecturers: [{ name: 'Stefan Zschaler' }] },
  { name: '7.02N', roomID: 'ROM-002', lecturers: [] },
]

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('useRoomData', () => {
  test('returns empty allRoomData initially', () => {
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockRooms) })
    const { result } = renderHook(() => useRoomData())
    expect(result.current.allRoomData).toEqual([])
    expect(result.current.roomsWithInfo.size).toBe(0)
  })

  test('fetches and sets allRoomData', async () => {
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockRooms) })
    const { result } = renderHook(() => useRoomData())
    await waitFor(() => expect(result.current.allRoomData).toHaveLength(2))
    expect(result.current.allRoomData[0].name).toBe('7.01N')
    expect(result.current.allRoomData[1].name).toBe('7.02N')
  })

  test('sets roomsWithInfo only for rooms with lecturers', async () => {
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockRooms) })
    const { result } = renderHook(() => useRoomData())
    await waitFor(() => expect(result.current.roomsWithInfo.size).toBe(1))
    expect(result.current.roomsWithInfo.has('7.01N')).toBe(true)
    expect(result.current.roomsWithInfo.has('7.02N')).toBe(false)
  })

  test('does not set allRoomData if response is not an array', async () => {
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ error: 'failed' }) })
    const { result } = renderHook(() => useRoomData())
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(result.current.allRoomData).toEqual([])
  })

  test('handles fetch error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useRoomData())
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(result.current.allRoomData).toEqual([])
  })
})
