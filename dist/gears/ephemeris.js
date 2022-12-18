"use strict";
// 人類圖需要下列星體的 longitude 位置
// SUN, EARTH, MOON, NORTH NODE (TRUE NODE), SOUTH NODE, 
// MERCURY (水星), VENUS (金星), MARS (火星), JUPITER (木星), SATURN (土星), 
// URANUS (天王星), NEPTUNE (海王星), PLUTO (冥王星)
var swisseph = require('swisseph');
var calcuFlag = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH; // for SWIEPH (compressed data);  "|": logical or (需要換成01進制) // var flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH; // for Moshier (analytical formula)
swisseph.swe_set_ephe_path('./ephe_data'); // set path to ephemeris data
function getPlanetPositionFromJulianDay(julianDayUT, planetFlag, calcuFlag) {
    var ret;
    // Sun position
    swisseph.swe_calc_ut(julianDayUT, planetFlag, calcuFlag, function (body) {
        swisseph.swe_split_deg(body.longitude, swisseph.SE_SPLIT_DEG_ROUND_MIN00000000000000000000000000000000000000, function (result) {
            console.log('Sun position:', result);
            ret = result;
        });
    });
    return ret;
}
function getAllPlanetsPositionfromDate(date) {
    let julday_ut = swisseph.swe_julday(date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL);
    console.log('Julian UT day for date:', julday_ut);
    // Sun position
    let sun = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_SUN, calcuFlag);
    // Moon position
    let moon = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_MOON, calcuFlag);
    // North Node position
    let northNode = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_TRUE_NODE, calcuFlag);
    // Earth position (人類學中, 太陽的對面就是地球 (180度差))
    return { sun, moon, northNode };
}
// // Julian day
// swisseph.swe_julday(date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL, function (julday_ut) {
// 	//assert.equal(julday_ut, 2455927.5);
// 	console.log('Julian UT day for date:', julday_ut);
// 	// Sun position
// 	let sunPos = getPlanetPosition(julday_ut, swisseph.SE_SUN, calcuFlag)
// 	// Moon position
// 	let moonPos = getPlanetPosition(julday_ut, swisseph.SE_MOON, calcuFlag)
// 	// North Node position
// 	let northNodePos = getPlanetPosition(julday_ut, swisseph.SE_TRUE_NODE, calcuFlag)
// 	// Earth position (人類學中, 太陽的對面就是地球 (180度差))
// });
module.exports = {
    getAllPlanetsPositionfromDate
};
