require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Room = require('./models/Room')

const PORT = process.env.PORT || 3001
const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find()
    res.json(rooms)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single room by roomId
app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomID: req.params.roomId })
    if (!room) return res.status(404).json({ error: 'Room not found' })
    res.json(room)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create or update a room
app.post('/api/rooms', async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { roomID: req.body.roomId },
      req.body,
      { upsert: true, new: true }
    )
    res.json(room)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
