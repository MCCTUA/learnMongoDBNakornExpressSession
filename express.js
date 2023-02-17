const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const ms = require('ms')
const path = require('path')

dotenv.config()

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URL, () => {
  console.log('Connected to MongoDB')
})

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, './views'))

app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    cookie: {
      maxAge: ms('5d')
    },
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: process.env.SECRET_KEY
  })
)

app.use(require('./routers/routers'))

const { PORT } = process.env
app.listen(PORT, console.log(`App started at http://localhost:${PORT}`))
