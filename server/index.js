require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Room = require('./models/Room')
const Lecturer = require('./models/Lecturer')
const Building = require('./models/Building')

const PORT = process.env.PORT || 3001
const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// Get all buildings
app.get('/api/buildings', async (req, res) => {
  try {
    const buildings = await Building.find().lean()
    res.json(buildings)
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

app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
