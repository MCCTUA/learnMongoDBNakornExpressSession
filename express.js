const dotenv = require('dotenv')
const express = require('express')
const path = require('path')

dotenv.config()
const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, './views'))

app.use(express.urlencoded({ extended: false }))
app.use(require('./routers/routers'))

const { PORT } = process.env
app.listen(PORT, console.log(`App started at http://localhost:${PORT}`))
