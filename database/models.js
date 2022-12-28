const mongoose = require('mongoose')
const dotenv = require('dotenv') //引入dotenv, 保護 credential
dotenv.config()
mongoose.connect(process.env.DATABASE_ACCESS, ()=>console.log("Database connected"))

//定義 HumanDesignData 的模型約束 (可把計算channel on 交給前端用戶去計算)
const HumanDesignSchema = new mongoose.Schema({
  centers: {type: Map, of: Number},
  gatesArray: [{type: Number}],
  channels: {type: Map, of: String},
  lifeType: {type: String},
  lifeProfile: {type: String},
  lifeDefinition: {type: String},
  authorityType: {type: String}
})

//定義 BirthPlaceData 的模型約束 (可把計算channel on 交給前端用戶去計算)
const BirthPlaceSchema = new mongoose.Schema({
  countryCode: {type: String},
  stateCode: {type: String},
  latitude: {type: Number},
  longitude: {type: Number},
})

//定義 User 的模型約束
const UserSchema = new mongoose.Schema({
  address: {type: String},
  nickname: {type: String},
  jointime: {type: String},
  birthPlace: BirthPlaceSchema,
  birthTime: {type: Map, of: Number},
  hddataWeb3:HumanDesignSchema,
  hddataReality:HumanDesignSchema
})

const User = mongoose.model('User', UserSchema)

//輸出模型
module.exports = {
  User,
}