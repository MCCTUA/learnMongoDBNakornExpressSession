const { Schema, model } = require('mongoose')

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      require: true
    }
  },
  { timestamps: true }
)

module.exports = model('Users', schema)
