const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')

const options = {
  key: fs.readFileSync('./https-pem/private.pem'),
  cert: fs.readFileSync('./https-pem/cert.crt'),
}

//创建web服务器
const app = express()
//托管静态资源
app.use(express.static('./web'))

http.createServer(app).listen(80, () => {
  console.log('http服务器-----http://127.0.0.1')
})
https.createServer(options, app).listen(443, () => {
  console.log('https服务器-----https://127.0.0.1')
})
