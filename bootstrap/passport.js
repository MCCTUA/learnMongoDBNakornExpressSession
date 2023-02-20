const passport = require('passport')
const bcrypt = require('bcrypt')
const Users = require('../models/Users')
const uploadFileFromUrl = require('../utils/uploadFileFromUrl')

const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

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

const callbackOAuth =
  (serviceName) => async (req, accessToken, refreshToken, profile, next) => {
    try {
      const id = profile?.id
      const email = profile?.emails?.[0]?.value
      const avatarUrlFromOAuth = profile?.photo?.[0]?.value

      let avatarUrl
      if (!id) {
        return next(null, false, `พบปัญหาในการเข้าสู่ระบบผ่าน ${serviceName}`)
      }
      if (!email) {
        return next(
          null,
          false,
          `กรุณายินยอมให้เรารับข้อมูล Email ของคุณผ่านทาง ${serviceName}`
        )
      }

      const existsUser = await Users.findOne({
        [`oauth.${serviceName}`]: id
      })
      if (req.user) {
        if (existsUser) {
          return next(null, false, 'บัญชีนี้ได้ผูกกับบัญชีอื่นไปแล้ว')
        }
        req.user.oauth[serviceName] = id
        await req.user.save()
        return next(null, req.user)
      }
      if (existsUser) {
        return next(null, existsUser)
      }
      if (avatarUrlFromOAuth) {
        avatarUrl = await uploadFileFromUrl(
          `${serviceName}_${profile._json.id}.jpg`,
          avatarUrlFromOAuth
        )
        // console.log(avatarUrl)
      }
      // console.log(profile._json.email)
      const exitsEmail = await Users.findOne({ email })
      if (exitsEmail) {
        return next(
          null,
          false,
          `ไม่สามารถสร้างบัญชีใหม่ได้ เพราะพบที่อยู่อีเมลซ้ำกับในระบบ กรุณาเลือกวิธีการเข้าสู่ระบบที่คุณเคยเข้าด้วย ${email}`
        )
      }
      const user = await Users.create({
        email,
        avatarUrl,
        oauth: {
          // เราควรยืนยันผ่าน id เสมอ
          [serviceName]: id
        }
      })
      // next(null, false, 'ทดสอบ')
      next(null, user)
    } catch (error) {
      return next(error)
    }
  }

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['displayName', 'email', 'picture.type(large)'],
      passReqToCallback: true
    },
    callbackOAuth('facebook')
  )
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      passReqToCallback: true
    },
    callbackOAuth('google')
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
