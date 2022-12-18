import express, { Express, Request, Response } from "express";
import { hostIP } from './utils/network' //check host ip 區別出 AWS server(s)

const port = 4210;

const cors = require('cors') //需要這個才能避免跨域問題
const rateLimit = require('express-rate-limit') // 控制 api 被呼叫次數限制

const apiLimiter = rateLimit({
	windowMs: 30 * 60 * 1000, // in milli-second
	max: 100, // Limit each IP to max requests per `window` (in localhost, we can set it higher, in cloud server, we have to set it lower)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app: Express = express();
app.use(express.json()) //需要這個才能解碼 req.body 成json格式
app.use(cors())

// user 測試接口
const userAPI = require('./routes/user') // user-related api route
// Apply the rate limiting to users 接口, **順序很重要, 要放在 API 前面
app.use('/user', apiLimiter)
app.use('/user', userAPI)

app.get("/", (req: Request, res: Response)=>{
  res.send("Hello World from Express + TS !")
});

// 利用hostIP位置判斷是在own server (用http) or cloud server (需要https)
console.log(`the server ip is ${hostIP[0]}`)
if(hostIP?.[0].includes('10.0.0.') || hostIP?.includes('172.31.15.151')){
  // 監聽自定義port number
  app.listen(port, () => {
    console.log(`${hostIP?.[0]}:${port}`);
  })
}else{
//創建 https server
  const https = require('https') // https server
  const fs = require('fs') //在AWS server上需要這一行, 才能讀取pem, 使用https
  const sslServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/chainhome.us/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/chainhome.us/fullchain.pem')
  }, app)

  sslServer.listen(port, ()=> {
    console.log('https://web3humandesign.org:'+port)
  })
}
