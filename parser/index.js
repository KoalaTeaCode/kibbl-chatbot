'use strict';

// const colors = require('colors');
const dictionary = require('./dictionary');
const moment = require('moment');

let getFeel = temp => {
  if (temp < 5) {
    return "shivering cold";
  } else if (temp >= 5 && temp < 15) {
    return "pretty cold";
  } else if (temp >= 15 && temp < 25) {
    return "moderately cold";
  } else if (temp >= 25 && temp < 32) {
    return "quite warm";
  } else if (temp >= 32 && temp < 40) {
    return "very hot";
  } else {
    return 'super hot';
  }
}

let getPrefix = (conditionCode, tense = 'present') => {
  let findPrefix = dictionary[tense].find(item => {
    if (item.codes.indexOf(Number(conditionCode)) !== -1) return true;
  });

  return findPrefix.prefix || "";
}

let currentWeather = response => {
  if (response.query.results) {
    let resp = response.query.results.channel;
    let location = `${resp.location.city}, ${resp.location.country}`;

    let {text, temp, code} = resp.item.condition;

    return `Right now, ${getPrefix(code)} ${text.toLowerCase()} in ${location}.
      It is ${getFeel(Number(temp))} at ${temp} Celsius`;
  } else {
    return "Having trouble...";
  }
}

let getDate = day => {
  let dayStr = day.toLowerCase().trim();
  switch (dayStr) {
    case 'tomorrow':
      return moment().add(1, 'd').format('DD MM YYYY');
      break;
    case 'day after tomorrow':
      return moment().add(2, 'd').format('DD MM YYYY');
      break;
    default:
      return moment().format('DD MM YYYY');
  }
}

let forecastWeather = (response, data) => {
  if (response.query.results) {
    let parseDate = getDate(data.time);
    let resp = response.query.results.channel;
    let getForecast = resp.item.forecast.filter(item => {
      return item.date === parseDate;
    })[0];
    let location = `${resp.location.city}, ${resp.location.country}`;
    let regEx = new RegExp(data.weather, 'i');
    let textConditions = regEx.test(getForecast.text);
    return `${textConditions ? 'Yes': 'No'}, ${getPrefix(Number(getForecast.code, 'future'))} ${getForecast.text} ${data.time} in ${location}`;
  } else {
    return "Having trouble...";
  }
}

module.exports = {
  currentWeather,
  forecastWeather,
}
