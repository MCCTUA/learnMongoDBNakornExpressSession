const passport = require('passport')
const bcrypt = require('bcrypt')
const Users = require('../models/Users')
const LocalStrategy = require('passport-local').Strategy

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // req.body.email => (email) (email / password คือ name attribute ที่อยู่ใน input tag ของ form login (ดูใน html form))
      passwordField: 'password', // req.body.password => (email, password)
      // passReqToCallback: true, // กรณีที่เราต้องการ req ของ express มาใช้งานต่อเช่น cookies, header เป็นต้น
      session: true
    },
    async (email, password, next) => {
      /* การ Next เราทำได้หลายกรณีคือ
      (argument ของ next จะมีทั้งหมด 3 ตัวคือ error (null | error), ข้อมูล(false | Object) และ ข้อความแจ้ง(message))
       * Case1 success: แบบที่ไม่มี Error โดยใน next( null, userOjbect ) จะมี 2 argument คือ null และ userObject ถูกส่งออกไป
       * Case2 Warning: มี Error กรณีที่ หา User ไม่เจอ หรือ password ไม่ถูกต้อง โดย next( null, false, errorMessage ) จะมี 3 argument คือ null, false, errorMessage
       * Case3 Error : เป็นกรณีที่ Error รุ่นแรง โดยจะส่ง next(error)
       */

      try {
        // case2
        const nextWithError = () => {
          return next(null, false, 'Email หรือ Password ไม่ถูกต้อง')
        }
        const user = await Users.findOne({ email })
        if (!user) {
          return nextWithError()
        }
        // Compare password ที่ส่งเข้ามากับใน Database ผ่าน bcrypt ว่าถูกต้องหรือไม่
        const result = await bcrypt.compare(password, user.password)
        if (!result) {
          return nextWithError()
        }
        // case1
        return next(null, user)
      } catch (error) {
        // case3
        next(error)
      }
    }
  )
)

// serialize (เอาข้อมูลไป save to session): เมื่อได้ข้อมูลมาแล้ว ต้องทำ serialize ต่อ ซึ่งก็คือการจำแนกข้อมูลว่าเราจะเอาข้อมูลอะไรบ้าง
passport.serializeUser((user, next) => {
  try {
    next(null, user._id) // save to session
  } catch (error) {
    next(error)
  }
})

// deserialize (เอาข้อมูลจาก session (ต้อง save ลง session ก่อนทุกครั้ง) ไปค้นใน database ): เมื่อเราได้ทำการ serialize ข้อมูลแล้ว (ในที่นี้คือ id) เราจะต้องเอาข้อมูลจากการทำ serialize นี้ไปถอดข้อมูลออกมาเพื่อ response กลับไปหา user
// ผลของการ deserialize เวลาที่ database มีการเปลี่่ยนแปลงค่า user จะได้ค่าใหม่ไป update ด้วย

passport.deserializeUser(async (id, next) => {
  try {
    const user = await Users.findById(id)
    return next(null, user) // next(null, object) จะส่ง object ออกไปให้ express และ express จะรับเป็น req.object ซึ่งในทีนี้คือ req.user นั่นเอง
  } catch (error) {
    return next(error)
  }
})
