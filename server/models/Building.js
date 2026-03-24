const mongoose = require('mongoose')

const buildingSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String }
})

module.exports = mongoose.model('Building', buildingSchema, 'building')
