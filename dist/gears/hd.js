"use strict";
// 這個script放置與計算 human design 相關的函數
// 如 計算 On gate, On channel, On center
// 計算 人生角色 (X/Y 人), 幾分人
const _channelPairDict = {
    1: [8],
    2: [14],
    3: [60],
    4: [63],
    5: [15],
    6: [59],
    7: [31],
    9: [52],
    10: [20, 34, 57],
    11: [56],
    12: [22],
    13: [33],
    16: [48],
    17: [62],
    18: [58],
    19: [49],
    20: [34],
    21: [45],
    23: [43],
    24: [61],
    25: [51],
    26: [44],
    27: [50],
    28: [38],
    29: [46],
    30: [41],
    32: [54],
    34: [57],
    35: [36],
    37: [40],
    39: [55],
    42: [53],
    47: [64],
};
const _centerChannelDict = {
    root: [19, 38, 39, 41, 52, 53, 54, 58, 60],
    sacral: [3, 5, 9, 14, 27, 29, 34, 42, 59],
    solarPlexus: [6, 22, 30, 36, 37, 49, 55],
    spleen: [18, 28, 32, 44, 48, 50, 57],
    heart: [21, 26, 40, 51],
    g: [1, 2, 7, 10, 13, 15, 25, 46],
    throat: [8, 12, 16, 20, 23, 31, 33, 35, 45, 56, 62],
    ajna: [4, 11, 17, 24, 43, 47],
    head: [61, 63, 64]
};
const _centerIndex = {
    root: 9,
    sacral: 8,
    solarPlexus: 7,
    spleen: 6,
    heart: 5,
    g: 4,
    throat: 3,
    ajna: 2,
    head: 1
};
function getOnGatesFromIchingObj(ichingObj) {
    let gateArray = new Array(64).fill(0);
    for (const value of Object.values(ichingObj)) {
        let ind = parseInt(value) - 1;
        gateArray[ind] = 1;
    }
    return gateArray;
}
function getLifeRoleFromIchingObj(personalitySunIchingNumber, designSunIchingNumber) {
    let personality = personalitySunIchingNumber % 1;
    let design = designSunIchingNumber % 1;
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
function getLifeProfile(centersObj, channelsObj) {
    //只保留 on 的 centers, 用array儲存, 且使用center index, (用數字 1 ~ 9 表示不同center)
    let onCenters = [];
    for (const [key, value] of Object.entries(centersObj)) {
        if (value) {
            onCenters.push(_centerIndex[key]);
        }
    }
    //需要sorting, 且在javascript中, 數字排序需要自己寫comparison
    onCenters.sort((a, b) => a - b);
    console.log('onCenters: ', onCenters);
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
    //建立 connectedObject
    let connectedObj = {};
    connectedCenterPairs.forEach(pair => connectedObj[pair[0]] = []);
    connectedCenterPairs.forEach(pair => connectedObj[pair[0]].push(pair[1]));
    console.log('connectedObj: ', connectedObj);
    console.log('onCenters: ', onCenters);
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
        }
        onCenters = onCenters.filter(e => e != x);
    }
    return numConnected;
}
module.exports = {
    getOnGatesFromIchingObj,
    getLifeRoleFromIchingObj,
    getOnChannelsFromOnGates,
    getOnCentersFromOnChannel,
    getLifeProfile
};
