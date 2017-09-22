"use strict";
require('dotenv').config()
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
// const api = new Habitica({
//   id: '',
//   apiToken: '',
//   // endpoint: 'http://custom-url.com/', // defaults to https://habitica.com/
//   // platform: 'Your-Integration-Name' // defaults to Habitica-Node
// });

const botDescription = "I'm your friendly kibbl bot. I can help you find rescues, pets and events";

function searchForPets (params, msg) {
  let parsedParams = {};

  if (typeof params === 'string') {
    try {
      parsedParams = JSON.parse(params);
    } catch (e) {
      console.log(e);
    }
  } else {
    parsedParams = params;
  }

  let {
    age,
    gender,
    item,
    near,
    location,
  } = parsedParams;

  let qs = {};
  if (parsedParams.pagingDate) {
    qs.lastUpdatedBefore = parsedParams.pagingDate;
  }

  if (['dog', 'dogs'].indexOf(item) !== -1) {
    qs.type = 'Dog';
  }

  if (['cat', 'cats'].indexOf(item) !== -1) {
    qs.type = 'Cat';
  }

  if (['male', 'boy'].indexOf(item) !== -1) {
    qs.gender = 'Male';
  }

  if (['girl', 'female'].indexOf(item) !== -1) {
    qs.gender = 'Female';
  }

  if (location) {
    qs.location = location;
  }

  switch (age) {
    case 'baby':
      qs.age = 'Baby';
      break;
    case 'young':
      qs.age = 'Young';
      break;
    case 'adult':
      qs.age = 'Adult';
      break;
    case 'senior':
      qs.age = 'Senior';
      break;
    case 'old':
      qs.age = 'Senior';
      break;
    case 'older':
      qs.age = 'Senior';
      break;
  }

  let payloadData = {
    age,
    gender,
    item,
    near,
    location,
  };

  let options = {
    method: 'GET',
    uri: `https://kibbl.io/api/v1/pets`,
    qs,
    json: true,
  };
  return rp(options)
    .then((results) => {
      return parsePetResults(results, msg, payloadData);
    });
}

function parsePetResults (results, msg, params) {
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
  params.pagingDate = pagingDate;

  f.sendListTemplate(msg.sender, responseList.slice(0, 4), params);
}

function getTasks() {
  // api.get('/tasks/user?type=todos').then((res) => {
  //   let tasks = res.data;
  //   let message = '';
  //   let count = 1;
  //
  //   tasks.forEach(task => {
  //     message += `${count} ${task.text}\n`;
  //     count += 1;
  //   })
  //   f.txt(msg.sender, message);
  // });
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
