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
// 定義取得 user 的GET接口 (沒有使用, 也許未來會需要)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.params.id;
    console.log(userID);
    // const user = await User.findOne({_id: userID})
    // res.send(user)
}));
// 定義第一次登入註冊接口, user第一次登入或user的local storage沒有cookie
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({
        address: req.body.address
    });
    // 如果user不存在, 創建一個. 如果存在, load user data
    if (!user) {
        //(TODO Luke): 在後端 創建一個userObj, 包含nickname, humand design profile
    }
    else {
    }
    yield user.save();
    res.send(user);
}));
//TODO(luke): 可以用 get 取代
// 定義自動登入接口; user 已經登入成功過, 並且有把invite code存在local storage
router.post('/autoLogin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({
        address: req.body.address
    });
    // 校驗username
    if (!user) {
        return res.status(422).send('User不存在'); //422錯誤: 查無此username (TODO Luke): 要讓User同意創建一個user
    }
    res.send(user);
}));
/**
 * // 定義 update user history 的POST 接口
router.post('/updateHistory', async (req, res) => {
  const {_id, history} = req.body
  console.log(history)
  const user = await User.findById(_id)
  // 不允許有任何重複.  有重複的要刪除, 再增加
  //***注意: pop / push / shift / unshift 這四個操作不要連用, 不要與return連用.
  if(user.history){
    let histories = (user.history).filter(h => (h.displayAddress).toLowerCase() !== (history.displayAddress).toLowerCase()) // offer 用 "propertyAddress", history 裡用 "displayAddress"; 未來應該要整合
    histories.unshift(history) //加入最新的
    await User.findOneAndUpdate({_id}, {history: histories}, {new: true}) //用update的方式, 避免 version error
  }else{
    await User.findOneAndUpdate({_id}, {history: [history]}, {new :true})
  }
  // await user.save() //會有version error 問題, 這裡不使用 save
  console.log('updated history')
  res.send(true)
})
 */
module.exports = router;
