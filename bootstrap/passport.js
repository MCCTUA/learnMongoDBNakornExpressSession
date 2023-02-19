const passport = require('passport')
const bcrypt = require('bcrypt')
const Users = require('../models/Users')
const uploadFileFromUrl = require('../utils/uploadFileFromUrl')

const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy

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

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['displayName', 'email', 'picture.type(large)']
    },
    async (accessToken, refreshToken, profile, next) => {
      try {
        const avatarUrlFromFacebook = profile?._json?.picture?.data?.url
        const id = profile?._json?.id
        let avatarUrl
        // console.log(profile._json)
        // console.log('profile id ', profile._json.id, profile.id)
        if (!id) {
          return next(null, false, 'พบปัญหาในการเข้าสู่ระบบผ่าน Facebook')
        }

        const existsUser = await Users.findOne({
          'oauth.facebook': profile?._json?.id
        })
        if (existsUser) {
          return next(null, existsUser)
        }
        if (avatarUrlFromFacebook) {
          avatarUrl = await uploadFileFromUrl(
            `fb_${profile._json.id}.jpg`,
            avatarUrlFromFacebook
          )
          // console.log(avatarUrl)
        }
        if (!profile?._json.email) {
          return next(
            null,
            false,
            'กรุณายินยอมให้เรารับข้อมูล Email ของคุณผ่านทาง Facebook'
          )
        }
        // console.log(profile._json.email)
        const user = await Users.create({
          email: profile._json.email,
          avatarUrl,
          oauth: {
            // เราควรยืนยันผ่าน id เสมอ
            facebook: profile._json.id
          }
        })
        // next(null, false, 'ทดสอบ')
        next(null, user)
      } catch (error) {
        return next(error)
      }
    }
  )
)

// serialize (เอาข้อมูลไป save to session): เมื่อได้ข้อมูลมาแล้ว ต้องทำ serialize ต่อ ซึ่งก็คือการจำแนกข้อมูลว่าเราจะเอาข้อมูลอะไรบ้าง
passport.serializeUser((user, next) => {
  try {
    // ในบรรทัดนี้ บันทึกข้อมูลใน redisเพิ่ม เพื่อให้ deserailize ได้เร็วไม่ต้องไปต่อฐานข้อมูลบ่อยๆ แต่ข้อเสียคือหากฐานข้อมูลเปลี่ยน ข้อมูลที่ user ได้ไปจะไม่ถูก update
    next(null, user._id) // save to session
  } catch (error) {
    next(error)
  }
})

// deserialize (เอาข้อมูลจาก session (ต้อง save ลง session ก่อนทุกครั้ง) ไปค้นใน database ): เมื่อเราได้ทำการ serialize ข้อมูลแล้ว (ในที่นี้คือ id) เราจะต้องเอาข้อมูลจากการทำ serialize นี้ไปถอดข้อมูลออกมาเพื่อ response กลับไปหา user
// ผลของการ deserialize เวลาที่ database มีการเปลี่่ยนแปลง จะทำให้ค่าใน session ถูกเปลี่ยนแปลงไปด้วยอัตโนมัติ ทำให้ user ได้ค่าใหม่ที่ถูกก update ไปด้วย (ข้อดี) ส่วนข้อเสีย คือถ้า user เข้า web หลายๆ รอบจะทำให้มีการเรียก load ข้อมูลจาก database ใหม่หลายรอบ ซึ่งเราอาจแก้ไขด้วยการทำ caching หรือไม่ก็เก็บข้อมูลไว้ใน redis แทนได้ กรณีของ redis ให้ไปทำในจังหวะที่ทำ serialize (.bootstrap/passport.js) เราจะให้ไปเก็บข้อมูลใน redis แทน และในส่วนของ deserialze เราก็ไป get ข้อมูลจาก redis แทน mongoDB แทน

passport.deserializeUser(async (id, next) => {
  try {
    // ในบรรทัดนี้ สามารถให้อ่านข้อมูลจาก redisเพื่อให้เร็วขึ้นแทนได้
    const user = await Users.findById(id)
    return next(null, user) // next(null, object) จะส่ง object ออกไปให้ express และ express จะรับเป็น req.object ซึ่งในทีนี้คือ req.user นั่นเอง
  } catch (error) {
    return next(error)
  }
})
