const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  roomID: { type: String },
  floor_id: { type: String },
  name: { type: String }
})

module.exports = mongoose.model('Room', roomSchema, 'rooms')
