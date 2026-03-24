require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Room = require('./models/Room')
const Lecturer = require('./models/Lecturer')

const PORT = process.env.PORT || 3001
const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// Debug: get all lecturers
app.get('/api/lecturers', async (req, res) => {
  try {
    const lecturers = await Lecturer.find()
    res.json(lecturers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all rooms for floor 7 of Bush House with lecturer info
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({ floor_id: 'FLR-007' }).lean()
    const lecturers = await Lecturer.find().lean()
    const lecturersByRoom = {}
    for (const l of lecturers) {
      if (!lecturersByRoom[l.roomID]) lecturersByRoom[l.roomID] = []
      lecturersByRoom[l.roomID].push(l)
    }
    const result = rooms.map(r => ({ ...r, lecturers: lecturersByRoom[r.roomID] || [] }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get lecturer info by room display name (e.g. 7.01N)
app.get('/api/rooms/:roomName', async (req, res) => {
  try {
    const room = await Room.findOne({ name: req.params.roomName })
    if (!room) return res.status(404).json({ error: 'Room not found' })
    const lecturer = await Lecturer.findOne({ room_id: room.name })
    res.json({ ...room.toObject(), lecturer: lecturer || null })
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
