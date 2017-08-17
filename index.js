"use strict"

const Readline = require('readline');
const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
const matcher = require('./matcher');
const weather = require('./weather');
const {currentWeather, forecastWeather} = require('./parser');

rl.setPrompt('> ');
rl.prompt();
rl.on('line', reply => {
  matcher(reply, data => {
    switch (data.intent) {
      case 'Hello':
        console.log(`Hello! ${data.entities.greeting}`);
        rl.prompt();
        break;
      case 'Exit':
        console.log('Goodbye!');
        process.exit();
        break;
      case 'CurrentWeather':
        weather(data.entities.city, 'current')
          .then(response => {
            let parseResult = currentWeather(response);
            console.log(parseResult);
            rl.prompt();
          })
          .catch(error => {
            rl.prompt();
          })
        break;
      case 'WeatherForecast':
        weather(data.entities.city)
          .then(response => {
            let parseResult = forecastWeather(responsem, data.entities);
            console.log(parseResult);
            rl.prompt();
          })
          .catch(error => {
            rl.prompt();
          })
        break;
      default:
        console.log("Idk what");
        rl.prompt();
    }
  });
});
