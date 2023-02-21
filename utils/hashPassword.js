const bcrypt = require('bcrypt')

module.exports = async (password) => {
  // Note async คือ promise อย่างหนึ่ง ดังนั้น ต้องมี resolve และ reject โดยทั้ง 2 สามารถแทนด้วย return และ throw ได้ตามลำดับ
  const hash = await bcrypt.hash(password, +process.env.SALT_ROUND)
  return hash // Note return มีความหมาย = resolve promise
  // Note และ throw มีความหมายเท่ากับ = reject promise
}
