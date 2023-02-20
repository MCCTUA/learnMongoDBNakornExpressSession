const pug = require('pug')
const nodemailer = require('nodemailer')
const isDev = require('./isDev')

let transporter
if (!isDev) {
  transporter = nodemailer.createTransport({
    host: isDev ? 'smtp.ethereal.email' : process.env.SMTP_HOST,
    port: isDev ? 587 : process.env.SMTP_PORT,
    secure: isDev ? false : process.env.SMTP_SECURE === true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  })
}

module.exports = async ({ email, subject, pug: { file, options } }) => {
  if (isDev) {
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
  }
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject,
    html: pug.renderFile(file, options ?? {})
  })
  if (isDev) {
    const testUrl = nodemailer.getTestMessageUrl(info)
    console.log(`--> Test send mail: ${testUrl}`)
  }
}
