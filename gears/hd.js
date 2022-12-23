// 這個script放置與計算 human design 相關的函數
// 如 計算 On gate, On channel, On center
// 計算 人生角色 (X/Y 人), 幾分人
// 計算 design
const { getAllPlanetsPositionfromDate, findDesignDate } = require('./ephemeris')
const { getIchingFromPlanetsPosObj } = require('./iching')
const { getNumofConnected } = require('../utils/graph')
const { getUTCFromBirthDayAndPlace } = require('../utils/timezone')
const {_channelPairDict, _centerChannelDict, _centerIndex, _motorCenters, _lifeDefinition} = require('../constants/hd')

function getHDParms(birthObj){
  let { birthDate, birthPlace} = birthObj
  
  let birthUCT = getUTCFromBirthDayAndPlace(birthDate, birthPlace)

  let designDate = findDesignDate(birthUCT)
  console.log('design date: ', designDate)

  let bornPlanetsPos = getAllPlanetsPositionfromDate(birthUCT)
  // find a design date around 80 ~ 95 days before the born date s.t. sun is 88 degree behind
  let designPlanetsPos = getAllPlanetsPositionfromDate(designDate)

  console.log('born sun pos: ', bornPlanetsPos.sun)
  console.log('design sun pos: ', designPlanetsPos.sun)
  console.log('born - design: ', bornPlanetsPos.sun - designPlanetsPos.sun)

  let bornIchingObj = getIchingFromPlanetsPosObj(bornPlanetsPos)
  let designIchingObj = getIchingFromPlanetsPosObj(designPlanetsPos)

  console.log('bornIchingObj: ', bornIchingObj)
  console.log('designIchingObj: ', designIchingObj)
  
  let lifeProfile = getLifeProfile(bornIchingObj, designIchingObj)
  let gatesArray = getOnGatesArray(bornIchingObj, designIchingObj)
  let channels = getOnChannelsFromOnGates(gatesArray)
  let centers = getOnCentersFromOnChannel(channels)
  let lifeDefinition = getLifeDefinition(centers, channels)
  let lifeType = getLifeType(centers, channels)
  let authorityType = getAuthorityType(centers)

  return {gatesArray, channels, centers, lifeType, lifeProfile, lifeDefinition, authorityType}

}

function getOnGatesArray(bornIchingObj, designIchingObj){
  // 0: off, 1: red on (design), 2:gray on (personality/born), 3:both design&personality
  let gateArray = new Array(64).fill(0);
  
  for(const value of Object.values(designIchingObj)){
    let ind = parseInt(value) -1
    gateArray[ind] = 1 // 1 means design on, 0 means the gate is off
  }

  for(const value of Object.values(bornIchingObj)){
    let ind = parseInt(value) -1
    gateArray[ind] = gateArray[ind] ? 3 : 2 // 3 means both design & personality on, 2 means only personality on
  }

  return gateArray
}

function getLifeProfile(bornIchingObj, designIchingObj){
  let personality = 10*(bornIchingObj.sun) % 10 ;
  let design = 10*(designIchingObj.sun) % 10;
  return `${personality}/${design}`
}

function getOnChannelsFromOnGates(gatesArray){
  var channels = {};
  for (const [key, values] of Object.entries(_channelPairDict) ){
      for(const v of values){
          if(gatesArray[key-1] && gatesArray[v-1]){
              Object.assign(channels, {[`${key}-${v}`]:1})
          }else{
              Object.assign(channels, {[`${key}-${v}`]:0})
          }
      }
  }
  return channels
}

function getOnCentersFromOnChannel(channelsObj){
  let onCentersObj = {
    root: 0,
    sacral: 0,
    solarPlexus: 0,
    spleen: 0,
    heart: 0,
    g: 0,
    throat: 0,
    ajna: 0,
    head: 0
  }
  
  let onChannels = []
  for (const [key, value] of Object.entries(channelsObj)){
    if(value){
      onChannels.push(key)
    }
  }
  for (let i=0; i<onChannels.length; i++){
    let gateStart = parseInt(onChannels[i].split('-')[0]) //這裡要把string轉成number
    let gateEnd = parseInt(onChannels[i].split('-')[1]) //這裡要把string轉成number
    for (const [key, values] of Object.entries(_centerChannelDict)){
      if(values.includes(gateStart) || values.includes(gateEnd)){
        onCentersObj[key] = 1
      }
    }
  }

  return onCentersObj
}

function calculateConnectedCenterPairs(centersObj, channelsObj){
    //只保留 on 的 centers, 用array儲存, 且使用center index, (用數字 1 ~ 9 表示不同center)
    let onCenters = []
    for (const [key, value] of Object.entries(centersObj)){
      if(value){onCenters.push(_centerIndex[key])}
    }
    //需要sorting, 且在javascript中, 數字排序需要自己寫comparison
    onCenters.sort((a,b) => a - b)
    
    //只保留 on 的 channels, 用array儲存 string
    let onChannels = []
    for (const [key, value] of Object.entries(channelsObj)){
      if(value){onChannels.push(key)}
    }
  
    //計算connected center pairs
    let connectedCenterPairs = []
    for (let i=0; i<onChannels.length; i++){
      let gateStart = parseInt(onChannels[i].split('-')[0])
      let gateEnd = parseInt(onChannels[i].split('-')[1])
      for (const [key, values] of Object.entries(_centerChannelDict)){
        if(values.includes(gateStart)){
          var vs = _centerIndex[key]
        }
        if(values.includes(gateEnd)){
          var ve = _centerIndex[key]
        }
      }
      // make sure 沒有重複
      let isRepeat = false
      connectedCenterPairs.forEach(pair => {
        if( (pair[0] == vs && pair[1] ==ve) || (pair[0] == ve && pair[1] == vs)){
          isRepeat = true          
        }
      })

      if(!isRepeat){
        // make sure 前者一定比後者小
        if(vs<ve){
          connectedCenterPairs.push([vs, ve])
        }else{
          connectedCenterPairs.push([ve, vs])
        }
      }

    }

    return {connectedCenterPairs, onCenters}
}

function getLifeType(centersObj, channelsObj){
  //只保留 on 的 centers, 用array儲存, 且使用center index, (用數字 1 ~ 9 表示不同center)
  let {connectedCenterPairs, onCenters} = calculateConnectedCenterPairs(centersObj, channelsObj)
  //要確認 throat 有沒有跟 _motorCenters connected, 有的話就具有 "顯示" 的特性
  //注意: 可以透過 g-中心 連接, 這樣也算
  function checkThroatGConnected(){
    const isThroatG = (pair) => (pair[0] == _centerIndex['throat'] && pair[1] == _centerIndex['g'])
    return connectedCenterPairs.findIndex(isThroatG) != -1 ? true : false
  }

  function checkManifesting(){
    if(centersObj.throat && !centersObj.g){
      for(let i=0; i<connectedCenterPairs.length; i++){
        let pair = connectedCenterPairs[i]
        let c0 = Object.keys(_centerIndex)[pair[0]-1]
        let c1 = Object.keys(_centerIndex)[pair[1]-1]
        if( (c0 == 'throat' && _motorCenters.includes(c1)) || (c1 == 'throat' && _motorCenters.includes(c0)) ){
          return true
        }
      }
    }else if( checkThroatGConnected() ){
      //透過 g 連結到 _motorCenters 也算
      for(let i=0; i<connectedCenterPairs.length; i++){
        let pair = connectedCenterPairs[i]
        let c0 = Object.keys(_centerIndex)[pair[0]-1]
        let c1 = Object.keys(_centerIndex)[pair[1]-1]
        if( (c0 == 'g' && _motorCenters.includes(c1)) || (c1 == 'g' && _motorCenters.includes(c0)) ){
          return true
        }
      }
    }else{
      return false
    }
  }

  let isManifesting = checkManifesting()

  if(onCenters.length==0){
    return 'Reflector'
  }else if(centersObj.sacral){
    return isManifesting ? 'Manifesting Generator' : 'Generator'
  }else if(isManifesting){
    return 'Manifestor'
  }else{
    return 'Projector'
  }
}

function getLifeDefinition(centersObj, channelsObj){
  //只保留 on 的 centers, 用array儲存, 且使用center index, (用數字 1 ~ 9 表示不同center)
  let {connectedCenterPairs, onCenters} = calculateConnectedCenterPairs(centersObj, channelsObj)
  if(onCenters.length==0){
    return _lifeDefinition[0] // reflector的情況, 那life definition就是 "Undefined"
  }else{
    //計算number of connected subset using BFS-based graph algorithm (undirect connected components)
    //**Warning: 根據目前的graph library要求, 要把 onCenters & connectedCenterPairs 重新排列&命名, 0, 1, 2...
    let numOfV = onCenters.length;
    let renamingTable = {}
    onCenters.forEach( (c, ind) => renamingTable[c] = ind )
    let edgePairs = []
    connectedCenterPairs.forEach( pair => edgePairs.push( [renamingTable[pair[0]], renamingTable[pair[1]]] ))
    let numOfConnectedSubset = getNumofConnected(numOfV, edgePairs)

    return _lifeDefinition[numOfConnectedSubset]
  }
}

function getAuthorityType(centersObj){
  if(centersObj.solarPlexus){
    return 'Solar Plexus:Emotional'
  }else if(centersObj.sacral){
    return 'Sacral:Sacral'
  }else if(centersObj.spleen){
    return 'Spleen:Splenic'
  }else if(centersObj.heart){
    return 'Heart:Ego'
  }else if(centersObj.g){
    return 'G:Self-Projected'
  }else if(centersObj.ajna || centersObj.head){
    return 'Environment'
  }else{
    return 'Lunar Cycle'
  }
}

export {
  getHDParms
}
