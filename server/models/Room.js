const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  roomID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lecturer: { type: String },
  email: { type: String },
  officeHours: { type: String },
  description: { type: String }
})

module.exports = mongoose.model('Room', roomSchema)
