const http = require('http')
const crypto = require('crypto')
const { spawn } = require('child_process')
const sendMail = require('./sendMail')

function sign(body) {
  const SECRET = '123456'
  return 'sha1=' + crypto.createHmac('sha1', SECRET).update(body).digest('hex')
}

const server = http.createServer((req, res) => {
  console.log(req.method, req.url)
  if (req.method == 'POST' && req.url == '/webhook') {
    const buffers1 = []
    req.on('data', buffer => {
      buffers1.push(buffer)
    })

    req.on('end', buffer => {
      const body = Buffer.concat(buffers1)
      // github发送请求进来，要传递请求体body，还会传一个signature，需验证签名正确与否
      const { 'x-github-event': event, 'x-hub-signature': signature } = req.headers
      if (signature !== sign(body)) return res.end('Not Allowed')
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true }))
      if (event !== 'push') return
      // 开始布署
      const {
        repository: { name: repoName } = {},
        pusher: { name: pusherName, email: pusherEmail } = {},
        head_commit: { message: commitMsg } = {}
      } = JSON.parse(body)
      const child = spawn('sh', [`./${repoName}.sh`])
      const buffers2 = []
      child.stdout.on('data', (buffer) => {
        buffers2.push(buffer)
      })
      child.stdout.on('end', (buffer) => {
        const logs = Buffer.concat(buffers2).toString()
        sendMail(
         `<h1>部署日期: ${new Date()}</h1>
          <h2>部署人: ${pusherName}</h2>
          <h2>部署邮箱: ${pusherEmail}</h2>
          <h2>提交信息: ${commitMsg}</h2>
          <h2>布署日志: ${logs.replace('\r\n', '<br/>')}</h2>`
        )
      })
    })
  } else {
    res.end('Not Found')
  }
})

server.listen(4000, () => {
  console.log('webhook服务已在4000端口启动')
})
