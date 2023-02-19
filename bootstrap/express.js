/*
 * 1. นำเข้า Module ต่างๆ ที่ใช้งานใน application
 * 2. กำหนดใช้งาน dotenv
 */
// 1.
const dotenv = require('dotenv')
const express = require('express')
const session = require('express-session')
const redis = require('redis')
const connectRedis = require('connect-redis')
const connectFlash = require('connect-flash')
const passport = require('passport')
const ms = require('ms')
const mongoose = require('mongoose')
const path = require('path')
// 2.
dotenv.config()
// 3.
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URL, () => {
  console.log('Connected to MongoDB')
})
const RedisStore = connectRedis(session)
const redisClient = redis.createClient({
  legacyMode: true,
  url: process.env.REDIS_URL
})
redisClient.connect()

require('./passport')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../views'))

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    cookie: {
      maxAge: ms('5d')
    },
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: process.env.SECRET_KEY
  })
)
app.use(connectFlash())
app.use(passport.initialize()) // ทำให้เราได้ method ของ passport มาใช้เช่น req.user, req.login(), req.logout() เป็นต้น
app.use(passport.session())

app.use((req, res, next) => {
  // set global variable ใน express โดยใช้ res.locals
  res.locals.alertMessage = {
    error: req.flash('error'),
    success: req.flash('success')
  }
  next()
})

app.use(require('../routers/routers')) // จะรู้จักข้อมูลจากการทำ deserialize ของ passport เนื่องจากมีการประกาศใช้งาน passport.initialize และ passport.session ไว้แล้วด้านบน ทำให้รู้จัก req.user จากไฟล์ ./bootstrap/passports.js

const { PORT } = process.env
app.listen(PORT, console.log(`App started at http://localhost:${PORT}`))
