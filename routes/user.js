/* 
  把user-related logic 整理成一個route檔案
*/
const { User } = require('../database/models') //database modules
var express = require('express')
var router = express.Router()
const dotenv = require('dotenv') //引入dotenv, 保護 credential
dotenv.config()
const { getHDParms } = require('../gears/hd')

// 定義取得 user 的GET接口 (沒有使用, 也許未來會需要)
router.get('/:id', async(req, res)=>{
  const address = req.params.id
  const user = await User.findOne({address})
  console.log(user)
  // const user = await User.findOne({_id: userID})
  // res.send(user)
})

// 定義第一次登入註冊接口, 必須透過connect wallet 驗證身份, 如果user不存在創建一個user, 如果存在, load existing user data
// 注意: 由於有connect with wallet (e.g. metamask) 才能保證 user auth. 如果沒有, 則屬於enroll, 已經存在的address不該被接受
router.post('/signup', async(req, res)=> {
  console.log('i am here ')
  let address = req.body.address  
  const user = await User.findOne({address})
  // 如果user不存在, 創建一個. 如果存在, load user data
  if(!user){
    let hddataWeb3 = getHDParms() //給一個空的object, 等於使用server time now
    let newUser = await User.create({address, hddataWeb3, nickname:'nickname'})
    console.log('new user created')
    res.send(newUser)
  }else{
    console.log('user exists, return user data to front end')
    res.send(user)
  }
})

// 定義enroll接口, 無須透過connect wallet 驗證身份, 如果user不存在創建一個user, 
// 如果user已經存在, 則返回錯誤, 說已經enroll過. connect to wallet 直接getstarted
router.post('/enroll', async(req, res)=> {

  let address = req.body.address
  console.log('address: ', address)
  const user = await User.findOne({address})
  // 如果user不存在, 創建一個. 如果存在, load user data
  if(!user){
    let hddataWeb3 = getHDParms() //給一個空的object, 等於使用server time now
    let newUser = await User.create({address, hddataWeb3, nickname:'nickname'})
    console.log('new user created')
    res.send(newUser)
  }else{
    console.log('user exists, please use another address')
    res.status(422).send('address enrolled, please click "GetStarted" or enroll with another address')
  }
})

//TODO(luke): 可以用 get 取代
// 定義自動登入接口; user 已經登入成功過, 有把address存在local storage
router.post('/autoLogin', async(req, res)=>{
  console.log('i am in autoLogin')
  let address = req.body.address
  let hddataWeb3 = getHDParms() //給一個空的argument = get today's human design (Web3先用today's 代替)
  let user = await User.findOneAndUpdate({address}, {hddataWeb3}, {new: true})
  // 校驗username
  if(!user){
    return res.status(422).send('User不存在') //422錯誤: 查無此username (TODO Luke): 要讓User同意創建一個user
  }else{
    await user.save();    
    res.send(user);
  }
})

//定義 user update information 的POST接口
router.post('/update', async(req, res)=>{
  let {address, birthPlace, birthTime} = req.body
  // calculate hd params using birthPlace and birthTime
  let hddataReality = getHDParms({birthPlace, birthTime})
  let user = await User.findOneAndUpdate({address}, {birthPlace, birthTime, hddataReality}, {new: true})
  await user.save();
  res.send(user);
})

//定義 explorer information 的POST接口
router.post('/gethd', async(req, res)=>{
  console.log('i am in gethd')
  let {address, birthPlace, birthTime} = req.body;
  // calculate hd params using birthPlace and birthTime
  console.log('birthplace: ', birthPlace);
  let hddataWeb3 = getHDParms({birthPlace, birthTime});
  let user = await User.findOneAndUpdate({address}, {hddataWeb3}, {new: true});
  await user.save();
  res.send(user);
})

//定義 guest get my graph information 的POST接口
router.post('/guestMyGraph', async(req, res)=>{
  let {birthPlace, birthTime} = req.body
  // calculate hd params using birthPlace and birthTime
  let hddataReality = getHDParms({birthPlace, birthTime})
  res.send({birthPlace, birthTime, hddataReality});
})

//定義 guest get explore information 的POST接口
router.post('/guestExplore', async(req, res)=>{
  let {birthPlace, birthTime} = req.body
  // calculate hd params using birthPlace and birthTime
  let hddataWeb3 = getHDParms({birthPlace, birthTime})
  res.send({hddataWeb3});
})

module.exports = router