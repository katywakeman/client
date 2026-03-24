const mongoose = require('mongoose')

const lecturerSchema = new mongoose.Schema({
  _id: { type: String },
  room_id: { type: String },
  roomID: { type: String },
  name: { type: String },
  office_hours: { type: String },
  department: { type: String }
})

module.exports = mongoose.model('Lecturer', lecturerSchema, 'lecturer')
