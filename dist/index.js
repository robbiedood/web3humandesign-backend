"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const network_1 = require("./utils/network"); //check host ip 區別出 AWS server(s)
const port = 4210;
const domainName = 'web3humandesign.com';
const cors = require('cors'); //需要這個才能避免跨域問題
const rateLimit = require('express-rate-limit'); // 控制 api 被呼叫次數限制
const apiLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const app = (0, express_1.default)();
app.use(express_1.default.json()); //需要這個才能解碼 req.body 成json格式
app.use(cors());
// user 測試接口
const userAPI = require('./routes/user'); // user-related api route
// Apply the rate limiting to users 接口, **順序很重要, 要放在 API 前面
app.use('/user', apiLimiter);
app.use('/user', userAPI);
app.get("/", (req, res) => {
    res.send("Hello World from Express + TS !");
});
// 利用hostIP位置判斷是在own server (用http) or cloud server (需要https)
console.log(`the server ip is ${network_1.hostIP[0]}`);
if ((network_1.hostIP === null || network_1.hostIP === void 0 ? void 0 : network_1.hostIP[0].includes('10.0.0.')) || (network_1.hostIP === null || network_1.hostIP === void 0 ? void 0 : network_1.hostIP.includes('172.31.15.151'))) {
    // 監聽自定義port number
    app.listen(port, () => {
        console.log(`${network_1.hostIP === null || network_1.hostIP === void 0 ? void 0 : network_1.hostIP[0]}:${port}`);
    });
}
else {
    //創建 https server
    const https = require('https'); // https server
    const fs = require('fs'); //在AWS server上需要這一行, 才能讀取pem, 使用https
    const sslServer = https.createServer({
        key: fs.readFileSync(`/etc/letsencrypt/live/${domainName}/privkey.pem`),
        cert: fs.readFileSync(`/etc/letsencrypt/live/${domainName}/fullchain.pem`)
    }, app);
    sslServer.listen(port, () => {
        console.log(`https://${domainName}.com:` + port);
    });
}
