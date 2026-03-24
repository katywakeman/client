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

try {
  const result = await Lecturer.insertMany(lecturers);
  console.log("Inserted:", result);
} catch (err) {
  console.log("Failed at index:", err.index);
  console.log("Error message:", err.message);
  console.log("Failed document:", err.op);
  console.log("Full error:", err);
}