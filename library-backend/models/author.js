const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
  },
  books: [{ type: String }],
})

module.exports = mongoose.model("Author", schema)
