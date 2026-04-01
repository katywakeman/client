import { render, screen, fireEvent } from '@testing-library/react'
import SearchPanel from '../components/SearchPanel'

const mockRooms = [
  { name: '7.01N', position: [0, 0, 0] },
  { name: '7.02N', position: [1, 0, 1] },
]

const mockAllRoomData = [
  { name: '7.01N', lecturers: [{ name: 'Stefan Zschaler', _id: 'stefan@kcl.ac.uk', office_hours: 'Friday 10-11', department: 'Informatics' }] },
  { name: '7.02N', lecturers: [] },
]

const defaultProps = {
  filteredRooms: mockRooms,
  search: '',
  setSearch: jest.fn(),
  selectedRoom: null,
  roomInfo: null,
  allRoomData: mockAllRoomData,
  roomsWithInfo: new Set(['7.01N']),
  isSearching: false,
  onRoomSelect: jest.fn(),
  onClear: jest.fn(),
  showPanel: false,
}

describe('SearchPanel', () => {
  test('renders all rooms', () => {
    render(<SearchPanel {...defaultProps} />)
    expect(screen.getByText('7.01N')).toBeInTheDocument()
    expect(screen.getByText('7.02N')).toBeInTheDocument()
  })

  test('shows no results message when filteredRooms is empty', () => {
    render(<SearchPanel {...defaultProps} filteredRooms={[]} />)
    expect(screen.getByText('No rooms found')).toBeInTheDocument()
  })

  test('calls onRoomSelect when a room button is clicked', () => {
    const onRoomSelect = jest.fn()
    render(<SearchPanel {...defaultProps} onRoomSelect={onRoomSelect} />)
    fireEvent.click(screen.getByText('7.01N'))
    expect(onRoomSelect).toHaveBeenCalledWith(mockRooms[0])
  })

  test('shows dropdown arrow for rooms with info', () => {
    render(<SearchPanel {...defaultProps} />)
    expect(screen.getByText('▼')).toBeInTheDocument()
  })

  test('shows lecturer info when room is selected', () => {
    render(<SearchPanel {...defaultProps} selectedRoom={mockRooms[0]} roomInfo={mockAllRoomData[0]} />)
    expect(screen.getByText('Stefan Zschaler')).toBeInTheDocument()
    expect(screen.getByText('stefan@kcl.ac.uk')).toBeInTheDocument()
    expect(screen.getByText('Friday 10-11')).toBeInTheDocument()
  })

  test('shows clear button when a room is selected', () => {
    render(<SearchPanel {...defaultProps} selectedRoom={mockRooms[0]} />)
    expect(screen.getByText('Clear Path')).toBeInTheDocument()
  })

  test('calls onClear when clear button is clicked', () => {
    const onClear = jest.fn()
    render(<SearchPanel {...defaultProps} selectedRoom={mockRooms[0]} onClear={onClear} />)
    fireEvent.click(screen.getByText('Clear Path'))
    expect(onClear).toHaveBeenCalled()
  })

  test('calls setSearch when input changes', () => {
    const setSearch = jest.fn()
    render(<SearchPanel {...defaultProps} setSearch={setSearch} />)
    fireEvent.change(screen.getByPlaceholderText('Search rooms or lecturers...'), { target: { value: 'Stefan' } })
    expect(setSearch).toHaveBeenCalledWith('Stefan')
  })

  test('highlights matching search term in room name', () => {
    render(<SearchPanel {...defaultProps} search="7.01" isSearching={true} />)
    const mark = document.querySelector('.search-highlight')
    expect(mark).toBeInTheDocument()
    expect(mark.textContent).toBe('7.01')
  })

  test('applies search-panel-open class when showPanel is true', () => {
    const { container } = render(<SearchPanel {...defaultProps} showPanel={true} />)
    expect(container.firstChild).toHaveClass('search-panel-open')
  })
})
