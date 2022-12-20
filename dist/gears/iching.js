"use strict";
// 由星體的角度位置找到對應的易經卦象位置 (共64卦, 非順序排列)
const ichingOffset = 1.75; // in degree  從25卦開始, 36卦結束, 25卦原點在 -1.75度 (or 358.25度) 上, 以逆時鐘進行 (原文是寫: 有1degree45min落在Pisces星座上, 之後才在Aries星座上. 而Aries的起點是0星盤度)
const ichingEachInterval = 360 / 64; // = 5.625 度
const ichingInsideInterval = ichingEachInterval / 6; // = 0.9375度
const ichingToPosOrdering = [
    25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8,
    20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46,
    18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34,
    9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41,
    19, 13, 49, 30, 55, 37, 63, 22, 36, // 結束在 358.25度
];
function calculateIchingNumber(planetPos) {
    let offsetDegree = (planetPos + ichingOffset) % 360; // ensure within [0, 360)
    let ind = parseInt(offsetDegree / ichingEachInterval);
    let firstOrder = ichingToPosOrdering[ind];
    let secondOrder = (parseInt((offsetDegree - ind * ichingEachInterval) / ichingInsideInterval) + 1) / 10; // second order is in [0.1, 0.2, 0.3, ...0.6]
    return (firstOrder + secondOrder);
}
function getIchingFromPlanetsPosObj(planetsPosObj) {
    // planetObj contains decimal degree of each planet required by human design chart (total 13 planets)
    // let { sun, earth, moon, northNode, southNode, 
    // 	mercury, venus, mars, jupiter, saturn, 
    // 	uranus, neptune, pluto } = planetObj
    let ret = {};
    for (const [key, value] of Object.entries(planetsPosObj)) {
        ret[key] = calculateIchingNumber(value);
    }
    return ret;
}
module.exports = {
    getIchingFromPlanetsPosObj
};
