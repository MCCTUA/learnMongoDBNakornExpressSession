const { Schema, model } = require('mongoose')

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: String,
    avatarUrl: String,
    oauth: {
      facebook: String,
      google: String
    },
    token: {
      activate: String,
      reset: String
    }
  },
  { timestamps: true }
)

module.exports = model('Users', schema)
