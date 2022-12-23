"use strict";
// - 把各地的時間轉成 UT 時間, 並考慮日光節約時間
// -
// Latest version - v3.0.0
const { find } = require('geo-tz');
const Country = require('country-state-city').Country;
const State = require('country-state-city').State;
const City = require('country-state-city').City;
const allCountries = Country.getAllCountries();
function getCountryObj(countryName) {
    for (let i = 0; i < allCountries.length; i++) {
        if (allCountries[i].name.toUpperCase() == countryName.toUpperCase()) {
            return allCountries[i];
        }
    }
}
function getStateObj(stateName, countryObj) {
    let allStatesOfCountry = State.getStatesOfCountry(countryObj.isoCode);
    for (let i = 0; i < allStatesOfCountry.length; i++) {
        if (allStatesOfCountry[i].name.toUpperCase() == stateName.toUpperCase()) {
            return allStatesOfCountry[i];
        }
    }
}
function getCityObj(cityName, countryObj, stateObj) {
    let allCitiesofState = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
    for (let i = 0; i < allCitiesofState.length; i++) {
        if (allCitiesofState[i].name.toUpperCase() == cityName.toUpperCase()) {
            return allCitiesofState[i];
        }
    }
}
function getTimeZoneOfPlace(placeObj) {
    let { country, state, city } = placeObj;
    let countryObj = getCountryObj(country);
    // check 國家是否只有一個時區, 如果是直接返回國家coordinator
    console.log('country: ', countryObj);
    if (countryObj.timezones.length == 1) {
        return countryObj.timezones[0].zoneName;
    }
    else {
        if (state) {
            //小地方, e.g. Taiwan, 直接用 State 即可.
            //大地方, 要track到 city (比如美國, 有可能一個州含有兩個時區) ref: search "How many states are in more than one time zone?" 總共 13個美國州被分成兩個時區
            let stateObj = getStateObj(state, countryObj);
            console.log('State: ', stateObj);
            if (city) {
                let cityObj = getCityObj(city, countryObj, stateObj);
                console.log('City: ', cityObj);
                return find(cityObj.latitude, cityObj.longitude);
            }
            else {
                return find(stateObj.latitude, stateObj.longitude);
            }
        }
        else {
            return find(countryObj.latitude, countryObj.longitude);
        }
    }
    /**
     * // find(43.839319, 87.526148)) = [ 'Asia/Urumqi', 'Asia/Shanghai' ] 特例: 新疆烏魯木其有兩個時間, 漢人用上海時間, 新疆人用烏魯木齊時間
     */
}
function dateWithTimeZone(timeZone, date) {
    // 計算 timzone 與 "UTC" 時區的差距
    let dateNow = new Date();
    let utcDate = new Date(dateNow.toLocaleString('en-US', { timeZone: "UTC" }));
    let tzDate = new Date(dateNow.toLocaleString('en-US', { timeZone: timeZone }));
    let gmtOffset = utcDate.getTime() - tzDate.getTime();
    //以UTC初始化 input date
    let dateLocalTime = new Date(Date.UTC(date.year, date.month - 1, date.day, date.hour)); //這裡的month要用index所以必須 -1;
    //把 offset補回來
    dateLocalTime.setTime(dateLocalTime.getTime() + gmtOffset);
    let rePattern = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):/gi;
    let reMatch = rePattern.exec(dateLocal.toISOString()); // toISOString() 轉成 UTC time string
    return { year: parseInt(reMatch[1]), month: parseInt(reMatch[2]), day: parseInt(reMatch[3]), hour: parseInt(reMatch[4]) };
}
;
function getUTCFromBirthDayAndPlace(birthday, birthplace) {
    let timeZone = getTimeZoneOfPlace(birthplace);
    let dateUTC = dateWithTimeZone(timeZone[0], birthday);
    return dateUTC;
}
/**
 * testing code
let birthplace = {country: 'united states', state: 'california', city: 'san francisco'}
let birthday = {year: 2010, month:12, day:5, hour:15}
let dateUTC = getUTCFromBirthDayAndPlace(birthday, birthplace)
console.log(dateUTC)
 */
module.exports = {
    getUTCFromBirthDayAndPlace
};
