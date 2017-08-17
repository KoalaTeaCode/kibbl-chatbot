"use strict";

// const Restify = require('restify');
// const server = Restify.createServer({
//   name: 'KoalaTeaBot',
// });
var Habitica = require('habitica');
var api = new Habitica({
  id: '206039c6-24e4-4b9f-8a31-61cbb9aa3f66',
  apiToken: 'ac76a3d2-3b9c-4955-b9e6-b2f60c29b4ba',
  // endpoint: 'http://custom-url.com/', // defaults to https://habitica.com/
  // platform: 'Your-Integration-Name' // defaults to Habitica-Node
});

const express = require('express')
const server = express();
var bodyParser = require('body-parser')
const PORT = process.env.PORT || 3001;

server.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
server.use(bodyParser.json());

const config = require('./config');

const FBeamer = require('./library/fbeamer');
const f = new FBeamer(config);

const matcher = require('./matcher');
const weather = require('./weather');
const {currentWeather, forecastWeather} = require('./parser');


server.get('/', (req, res, next) => {
  f.registerHook(req, res);
  return next();
});

server.post('/', (req, res, next) => {
  f.incoming(req, res, msg => {
    console.log(msg);
    // f.txt(msg.sender, 'Hey, you');
    // f.image(msg.sender, 'http://myhealthoc.org/wp-content/uploads/2017/01/rainy-day-cover-photo.jpg');
    if (msg.message.text) {
      matcher(msg.message.text, data => {
        switch (data.intent) {
          case 'Hello':
            console.log(`Hello! ${data.entities.greeting}`);
            f.txt(msg.sender, `Hello, Gryphon`);
            f.image(msg.sender, 'https://d2afqr2xdmyzvu.cloudfront.net/assets/habitica_lockup2_desat.png');
            break;
          // case 'Exit':
          //   console.log('Goodbye!');
          //   process.exit();
          //   break;
          case 'CurrentWeather':
            weather(data.entities.city, 'current')
              .then(response => {
                let parseResult = currentWeather(response);
                console.log(parseResult);
                f.txt(msg.sender, parseResult);
              })
              .catch(error => {
                // rl.prompt();
              })
            break;
          case 'WeatherForecast':
            weather(data.entities.city)
              .then(response => {
                let parseResult = forecastWeather(responsem, data.entities);
                console.log(parseResult);
                f.txt(msg.sender, parseResult);
              })
              .catch(error => {
                // rl.prompt();
              })
            break;
          case 'ShowTasks':
            api.get('/tasks/user?type=todos').then((res) => {
              let tasks = res.data;
              let message = '';
              let count = 1;

              tasks.forEach(task => {
                message += `${count} ${task.text}\n`;
                count += 1;
              })
              f.txt(msg.sender, message);
            });
            break;
          default:
            console.log("Idk what");
            f.txt(msg.sender, 'Idk what');
        }
      });
    }
  });
  return next();
});

server.listen(PORT, () => console.log("Ready"));
