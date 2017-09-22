"use strict";
const rp = require('request-promise');
const Habitica = require('habitica');
const express = require('express')
const server = express();
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3001;
const config = require('./config');
const FBeamer = require('./library/fbeamer');
const f = new FBeamer(config);
const matcher = require('./matcher');
const weather = require('./weather');
const {currentWeather, forecastWeather} = require('./parser');
const api = new Habitica({
  id: '206039c6-24e4-4b9f-8a31-61cbb9aa3f66',
  apiToken: 'ac76a3d2-3b9c-4955-b9e6-b2f60c29b4ba',
  // endpoint: 'http://custom-url.com/', // defaults to https://habitica.com/
  // platform: 'Your-Integration-Name' // defaults to Habitica-Node
});

const botDescription = "I'm your friendly kibbl bot. I can help you find rescues, pets and events";

function searchForPets (params, msg) {
  let options = {
    method: 'GET',
    uri: `https://kibbl.io/api/v1/pets`,
    body: {},
    json: true,
  };
  return rp(options)
    .then((results) => {
      return parsePetResults(results, msg);
    });
}

function parsePetResults (results, msg) {
  let petnames = results.pets.map(result => {
    return result.name;
  });

  let responseList = results.pets.map(result => {
    let media = "https://kibbl.io/images/kibbl-logo-dog.png";
    if (result.media && result.media[0] && result.media[0].urlSecureThumbnail) {
      media = result.media[0].urlSecureThumbnail;
    }

    return {
      "title": result.name,
      // "subtitle": "See all our colors",
      "image_url": media,
      "buttons": [
        {
          "title": "View",
          "type": "web_url",
          "url": "https://kibbl.io/pets/" + result._id,
          "messenger_extensions": true,
          "webview_height_ratio": "tall",
          "fallback_url": ""
        }
      ]
    };
  });

  let pagingDate = results.pets[3].lastUpdate || new Date();

  f.sendListTemplate(msg.sender, responseList.slice(0, 4), pagingDate);
}

function getTasks() {
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
}

// On load
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
f.setWhiteListIps();

server.get('/', (req, res, next) => {
  f.registerHook(req, res);
  return next();
});

server.post('/', (req, res, next) => {
  if (req.body.entry[0].messaging[0].postback) {
    let sender = req.body.entry[0].messaging[0].sender.id;
    let payload = req.body.entry[0].messaging[0].postback.payload;

    if (payload) {
      f.txt(sender, 'Looking for more');
      searchForPets(payload, {sender});
    }
    return res.status(200).send();
  }

  // @TODO: Make this a promise
  f.incoming(req, res, msg => {
    if (!msg.message.text) return;

    matcher(msg.message.text, data => {
      switch (data.intent) {
        case 'Hello':
          f.txt(msg.sender, `Hello! ${botDescription}`);
          // f.image(msg.sender, 'https://d2afqr2xdmyzvu.cloudfront.net/assets/habitica_lockup2_desat.png');
          break;
        case 'GenericKibblSearch':
          let {
            age,
            gender,
            item,
            near,
            location,
          } = data.entities;

          f.txt(msg.sender, 'Searching for you....');

          switch (item) {
            default:
              searchForPets(data.entities, msg);
          }

          break;
        case 'FindEventRange':
          console.log(data.entities)
          f.txt(msg.sender, 'Searching for events....');
          break;
        case 'WhoAreYou':
          f.txt(msg.sender, botDescription);
          break;
        case 'ShowTasks':
          getTasks();
          break;
        default:
          console.log("Idk what");
          f.txt(msg.sender, 'Sorry, I have not learned that. Would you like one of these options?');
          // @TODO: Send default options
      }
    });
  });
  return next();
});

server.listen(PORT, () => console.log("Ready"));
