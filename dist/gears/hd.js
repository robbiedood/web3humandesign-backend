"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHDParms = void 0;
// 這個script放置與計算 human design 相關的函數
// 如 計算 On gate, On channel, On center
// 計算 人生角色 (X/Y 人), 幾分人
// 計算 design
const { getAllPlanetsPositionfromDate, findDesignDate } = require('./ephemeris');
const { getIchingFromPlanetsPosObj } = require('./iching');
const { _channelPairDict, _centerChannelDict, _centerIndex, _motorCenters, _lifeDefinition } = require('../constants/hd');
function getHDParms(bornDate) {
    // bornDate = {year, month, day, hour}
    let designDate = findDesignDate(bornDate);
    console.log('design date: ', designDate);
    let bornPlanetsPos = getAllPlanetsPositionfromDate(bornDate);
    // find a design date around 80 ~ 95 days before the born date s.t. sun is 88 degree behind
    let designPlanetsPos = getAllPlanetsPositionfromDate(designDate);
    console.log('born sun pos: ', bornPlanetsPos.sun);
    console.log('design sun pos: ', designPlanetsPos.sun);
    console.log('born - design: ', bornPlanetsPos.sun - designPlanetsPos.sun);
    let bornIchingObj = getIchingFromPlanetsPosObj(bornPlanetsPos);
    let designIchingObj = getIchingFromPlanetsPosObj(designPlanetsPos);
    console.log('bornIchingObj: ', bornIchingObj);
    console.log('designIchingObj: ', designIchingObj);
    let lifeProfile = getLifeProfile(bornIchingObj, designIchingObj);
    let gatesArray = getOnGatesArray(bornIchingObj, designIchingObj);
    let channels = getOnChannelsFromOnGates(gatesArray);
    let centers = getOnCentersFromOnChannel(channels);
    let lifeDefinition = getLifeDefinition(centers, channels);
    let lifeType = getLifeType(centers, channels);
    return { gatesArray, channels, centers, lifeType, lifeProfile, lifeDefinition };
}
exports.getHDParms = getHDParms;
function getOnGatesArray(bornIchingObj, designIchingObj) {
    // 0: off, 1: red on (design), 2:gray on (personality/born), 3:both design&personality
    let gateArray = new Array(64).fill(0);
    for (const value of Object.values(designIchingObj)) {
        let ind = parseInt(value) - 1;
        gateArray[ind] = 1; // 1 means design on, 0 means the gate is off
    }
    for (const value of Object.values(bornIchingObj)) {
        let ind = parseInt(value) - 1;
        gateArray[ind] = gateArray[ind] ? 3 : 2; // 3 means both design & personality on, 2 means only personality on
    }
    return gateArray;
}
function getLifeProfile(bornIchingObj, designIchingObj) {
    let personality = 10 * (bornIchingObj.sun) % 10;
    let design = 10 * (designIchingObj.sun) % 10;
    return `${personality}/${design}`;
}
function getOnChannelsFromOnGates(gatesArray) {
    var channels = {};
    for (const [key, values] of Object.entries(_channelPairDict)) {
        for (const v of values) {
            if (gatesArray[key - 1] && gatesArray[v - 1]) {
                Object.assign(channels, { [`${key}-${v}`]: 1 });
            }
            else {
                Object.assign(channels, { [`${key}-${v}`]: 0 });
            }
        }
    }
    return channels;
}
function getOnCentersFromOnChannel(channelsObj) {
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
    };
    let onChannels = [];
    for (const [key, value] of Object.entries(channelsObj)) {
        if (value) {
            onChannels.push(key);
        }
    }
    for (let i = 0; i < onChannels.length; i++) {
        let gateStart = parseInt(onChannels[i].split('-')[0]); //這裡要把string轉成number
        let gateEnd = parseInt(onChannels[i].split('-')[1]); //這裡要把string轉成number
        for (const [key, values] of Object.entries(_centerChannelDict)) {
            if (values.includes(gateStart) || values.includes(gateEnd)) {
                onCentersObj[key] = 1;
            }
        }
    }
    return onCentersObj;
}
function calculateConnectedCenterPairs(centersObj, channelsObj) {
    //只保留 on 的 centers, 用array儲存, 且使用center index, (用數字 1 ~ 9 表示不同center)
    let onCenters = [];
    for (const [key, value] of Object.entries(centersObj)) {
        if (value) {
            onCenters.push(_centerIndex[key]);
        }
    }
    //需要sorting, 且在javascript中, 數字排序需要自己寫comparison
    onCenters.sort((a, b) => a - b);
    //只保留 on 的 channels, 用array儲存 string
    let onChannels = [];
    for (const [key, value] of Object.entries(channelsObj)) {
        if (value) {
            onChannels.push(key);
        }
    }
    //計算connected center pairs
    let connectedCenterPairs = [];
    for (let i = 0; i < onChannels.length; i++) {
        let gateStart = parseInt(onChannels[i].split('-')[0]);
        let gateEnd = parseInt(onChannels[i].split('-')[1]);
        for (const [key, values] of Object.entries(_centerChannelDict)) {
            if (values.includes(gateStart)) {
                var vs = _centerIndex[key];
            }
            if (values.includes(gateEnd)) {
                var ve = _centerIndex[key];
            }
        }
        // make sure 前者一定比後者小
        if (vs < ve) {
            connectedCenterPairs.push([vs, ve]);
        }
        else {
            connectedCenterPairs.push([ve, vs]);
        }
    }
    return { connectedCenterPairs, onCenters };
}
function getLifeType(centersObj, channelsObj) {
    //只保留 on 的 centers, 用array儲存, 且使用center index, (用數字 1 ~ 9 表示不同center)
    let { connectedCenterPairs, onCenters } = calculateConnectedCenterPairs(centersObj, channelsObj);
    //要確認 throat 有沒有跟 _motorCenters connected, 有的話就具有 "顯示" 的特性
    //注意: 可以透過 g-中心 連接, 這樣也算
    function checkThroatGConnected() {
        const isThroatG = (pair) => (pair[0] == _centerIndex['throat'] && pair[1] == _centerIndex['g']);
        return connectedCenterPairs.findIndex(isThroatG) != -1 ? true : false;
    }
    function checkManifesting() {
        if (centersObj.throat && !centersObj.g) {
            for (let i = 0; i < connectedCenterPairs.length; i++) {
                let pair = connectedCenterPairs[i];
                let c0 = Object.keys(_centerIndex)[pair[0] - 1];
                let c1 = Object.keys(_centerIndex)[pair[1] - 1];
                if ((c0 == 'throat' && _motorCenters.includes(c1)) || (c1 == 'throat' && _motorCenters.includes(c0))) {
                    return true;
                }
            }
        }
        else if (checkThroatGConnected()) {
            //透過 g 連結到 _motorCenters 也算
            for (let i = 0; i < connectedCenterPairs.length; i++) {
                let pair = connectedCenterPairs[i];
                let c0 = Object.keys(_centerIndex)[pair[0] - 1];
                let c1 = Object.keys(_centerIndex)[pair[1] - 1];
                if ((c0 == 'g' && _motorCenters.includes(c1)) || (c1 == 'g' && _motorCenters.includes(c0))) {
                    return true;
                }
            }
        }
        else {
            return false;
        }
    }
    let isManifesting = checkManifesting();
    if (onCenters.length == 0) {
        return 'Reflector';
    }
    else if (centersObj.sacral) {
        return isManifesting ? 'Manifesting Generator' : 'Generator';
    }
    else if (isManifesting) {
        return 'Manifestor';
    }
    else {
        return 'Projector';
    }
}
function getLifeDefinition(centersObj, channelsObj) {
    //只保留 on 的 centers, 用array儲存, 且使用center index, (用數字 1 ~ 9 表示不同center)
    let { connectedCenterPairs, onCenters } = calculateConnectedCenterPairs(centersObj, channelsObj);
    //建立 connectedObject
    let connectedObj = {};
    connectedCenterPairs.forEach(pair => connectedObj[pair[0]] = []);
    connectedCenterPairs.forEach(pair => {
        if (!connectedObj[pair[0]].includes(pair[1])) {
            connectedObj[pair[0]].push(pair[1]);
        }
    });
    console.log(connectedCenterPairs);
    console.log(connectedObj);
    console.log(onCenters);
    //計算number of connected subset using i) connectedObj & ii) onCenters
    let numConnected = 0;
    while (onCenters.length > 0) {
        numConnected += 1;
        let x = onCenters.shift();
        recursiveFunc(x); // 利用遞迴 !
    }
    // 利用遞迴, 注意函數內的 connectedObj & onCenters是用先前算出來的, 當成global varialbe給遞迴函數使用
    function recursiveFunc(x) {
        var _a;
        while (((_a = connectedObj[x]) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            let y = connectedObj[x].shift();
            recursiveFunc(y);
            onCenters = onCenters.filter(e => e != x);
        }
    }
    return _lifeDefinition[numConnected];
}
