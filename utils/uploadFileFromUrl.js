const https = require('https')
const fs = require('fs')
const path = require('path')

module.exports = (fileName, url) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../public', fileName)
    const file = fs.createWriteStream(filePath)
    const req = https.get(url, (res) => {
      res.pipe(file)
      res.on('error', reject) // กรณี res เกิด error เราจะให้ promise ส่ง Reject ออกไป
      file.on('error', reject) // กรณี file เกิด error เราจะให้ promise ส่ง Reject ออกไป
      file.on('finish', () => {
        resolve(`${process.env.BASE_URL}/${fileName}`)
        // จะ resolve http://localhost:3000/xxx.png(file รูปภาพ)
      })
    })
    req.on('error', reject) // กรณี req เกิด error เราจะให้ promise ส่ง Reject ออกไป
  })
}
