// 人類圖需要下列星體的 longitude 位置
// SUN, EARTH, MOON, NORTH NODE (TRUE NODE), SOUTH NODE, 
// MERCURY (水星), VENUS (金星), MARS (火星), JUPITER (木星), SATURN (土星), 
// URANUS (天王星), NEPTUNE (海王星), PLUTO (冥王星)

var swisseph = require ('swisseph');
var calcuFlag = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH; // for SWIEPH (compressed data);  "|": logical or (需要換成01進制) // var flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH; // for Moshier (analytical formula)
swisseph.swe_set_ephe_path('./ephe_data'); // set path to ephemeris data

function getOppositePlanetPosition(pos){
	return (180 + pos) % 360  // pos in decimal degree
}


function getPlanetPositionFromJulianDay(julianDayUT, planetFlag, calcuFlag){
	let body = swisseph.swe_calc_ut(julianDayUT, planetFlag, calcuFlag)
	return body.longitude //in degree
}

function getZodiacFromJulianDay(julianDayUT, planetFlag, calcuFlag){
	let body = swisseph.swe_calc_ut(julianDayUT, planetFlag, calcuFlag)
	return swisseph.swe_split_deg(body.longitude, swisseph.SE_SPLIT_DEG_ZODIACAL)
}

function getAllPlanetsPositionfromDate(date){

	let julday_ut = swisseph.swe_julday(date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL)

	let sun = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_SUN, calcuFlag) 	// Sun position
	let earth = getOppositePlanetPosition(sun) 	// Earth position (人類學中, 太陽的對面就是地球 (180度差))
	let moon = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_MOON, calcuFlag) 	// Moon position
	let northNode = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_TRUE_NODE, calcuFlag) 	// North Node position
	let southNode = getOppositePlanetPosition(northNode) 	// South Node position (人類學中, NorthNode的對面就是South Node (180度差))

	let mercury = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_MERCURY, calcuFlag) //水星
	let venus = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_VENUS, calcuFlag) //金星
	let mars = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_MARS, calcuFlag) //火星
	let jupiter = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_JUPITER, calcuFlag) //木星
	let saturn = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_SATURN, calcuFlag) //土星
	let uranus = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_URANUS, calcuFlag) //天王星
	let neptune = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_NEPTUNE, calcuFlag) //海王星
	let pluto = getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_PLUTO, calcuFlag) //冥王星

	return { sun, earth, moon, northNode, southNode, 
		mercury, venus, mars, jupiter, saturn, 
		uranus, neptune, pluto }
}

function calculateSunPos(date){
	let julday_ut = swisseph.swe_julday(date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL)
	return getPlanetPositionFromJulianDay(julday_ut, swisseph.SE_SUN, calcuFlag) 	// Sun position
}

function findDesignDate(bornDate){

	//用search scan 法找到最接近 88度 的日子
	let sunPos = calculateSunPos(bornDate)

	let utcBornTime = (new Date(Date.UTC(bornDate.year, bornDate.month - 1, 
    bornDate.day, bornDate.hour))).getTime()/1000/60/60; // 轉成以小時為單位, month是用 monthIndex 要減 1, 轉成UTC時間比較簡單

	let ds = 83*24
	let de = 93*24
	let scanRange = [...Array(de-ds+1).keys()].map(p=>p+ds)
	let cost = Infinity;
	let designDate = {}
	for(let i=0;i<scanRange.length;i++){
		let x = utcBornTime - scanRange[i]
		let rePattern = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):/gi
		let reMatch = rePattern.exec(new Date(x*1000*60*60).toISOString())

		let year = parseInt(reMatch[1])
		let month = parseInt(reMatch[2])
		let day = parseInt(reMatch[3])
		let hour = parseInt(reMatch[4])
		let sunPosTmp = calculateSunPos({year, month, day, hour})
		let diff = Math.abs ( ( (sunPos > sunPosTmp) ? (sunPos - sunPosTmp) : (360 - sunPosTmp + sunPos) ) - 88 )
		if(diff<cost){
			cost = diff
			designDate = {year, month, day, hour}
		}
	}
	
	return designDate
}




module.exports = {
	getAllPlanetsPositionfromDate,
	findDesignDate
}