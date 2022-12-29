"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*
  把user-related logic 整理成一個route檔案
*/
const { User } = require('../database/models'); //database modules
var express = require('express');
var router = express.Router();
const dotenv = require('dotenv'); //引入dotenv, 保護 credential
dotenv.config();
const { getHDParms } = require('../gears/hd');
// 定義取得 user 的GET接口 (沒有使用, 也許未來會需要)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.params.id;
    console.log(userID);
    // const user = await User.findOne({_id: userID})
    // res.send(user)
}));
// 定義第一次登入註冊接口, user第一次登入或user的local storage沒有cookie
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let address = req.body.address;
    const user = yield User.findOne({ address });
    // 如果user不存在, 創建一個. 如果存在, load user data
    if (!user) {
        //(TODO Luke): 在後端 創建一個userObj, 包含nickname, humand design profile
        console.log('user does not exist, create one');
        let hddataWeb3 = getHDParms(); //給一個空的object, 等於使用server time now
        let newUser = yield User.create({ address, hddataWeb3, nickname: 'nickname' });
        res.send(newUser);
    }
    else {
        console.log('user exists, return user data to front end');
        res.send(user);
    }
}));
//TODO(luke): 可以用 get 取代
// 定義自動登入接口; user 已經登入成功過, 並且有把invite code存在local storage
router.post('/autoLogin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let address = req.body.address;
    let hddataWeb3 = getHDParms(); //給一個空的argument = get today's human design (Web3先用today's 代替)
    let user = yield User.findOneAndUpdate({ address }, { hddataWeb3 }, { new: true });
    // const user = await User.findOne({
    //   address
    // })
    // 校驗username
    if (!user) {
        return res.status(422).send('User不存在'); //422錯誤: 查無此username (TODO Luke): 要讓User同意創建一個user
    }
    else {
        yield user.save();
        res.send(user);
    }
}));
//定義 user update information 的POST接口
router.post('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { address, birthPlace, birthTime } = req.body;
    // calculate hd params using birthPlace and birthTime
    let hddataReality = getHDParms({ birthPlace, birthTime }); //給一個空的object, 等於使用server time now
    let user = yield User.findOneAndUpdate({ address }, { birthPlace, birthTime, hddataReality }, { new: true });
    yield user.save();
    res.send(user);
}));
//定義 user update information 的POST接口
router.post('/gethd', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { address, birthPlace, birthTime } = req.body;
    // calculate hd params using birthPlace and birthTime
    let hddataWeb3 = getHDParms({ birthPlace, birthTime }); //給一個空的object, 等於使用server time now
    let user = yield User.findOneAndUpdate({ address }, { hddataWeb3 }, { new: true });
    yield user.save();
    res.send(user);
}));
module.exports = router;
