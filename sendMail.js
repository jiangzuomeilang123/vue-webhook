const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  // port: 465, // SMTP 端口
  // secureConnection: true, // 使用了 SSL
  auth: {
    user: '1107334911@qq.com',
    // 这里密码不是qq密码，是你设置的smtp授权码(登录qq邮箱，设置-》账户-》POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务-》开启服务-》POP3/SMTP服务)
    pass: 'sxlqkivyouzxiefc'
  }
})

function sendMail(message) {
  const mailOptions = {
    from: '"1107334911" <1107334911@qq.com>', // 发送地址
    to: '1107334911@qq.com', // 接收者
    subject: '部署通知', // 主题
    html: message // 内容主体
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message sent: %s', info.messageId)
  })
}

module.exports = sendMail
