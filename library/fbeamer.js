'use strict'
const request = require('request');

class FBeamer {
  constructor (config) {
      if (!config || !config.PAGE_ACCESS_TOKEN || !config.VERIFY_TOKEN) {
        throw new Error('Unable to access tokens!');
      } else {
        this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
        this.VERIFY_TOKEN = config.VERIFY_TOKEN;
      }
  }

  registerHook (req, res) {
    if (!req.query['hub.mode']) {
      return res.send(403);
    }
    // let {mode, verify_token, challenge} = req.query.hub;
    let mode = req.query['hub.mode'];
    let verify_token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && verify_token === this.VERIFY_TOKEN) {
      return res.send(challenge);
    } else {
      console.log("WEbhook err");
      return res.send(403);
    }
  }

  incoming (req, res, cb) {
    let data = req.body;
    if (data.object === 'page') {
      data.entry.forEach(pageObj => {
        pageObj.messaging.forEach(messageEvent => {
          let messageObj = {
            sender: messageEvent.sender.id,
            timeOfMessage: messageEvent.timestamp,
            message: messageEvent.message,
          }
          cb(messageObj);
        });
      });
    }

    res.sendStatus(200);
  }

  sendMessage (payload) {
    return new Promise((resolve, reject) => {
      request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: this.PAGE_ACCESS_TOKEN,
        },
        method: 'POST',
        json: payload
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve({
            messageId: body.message,
          });
        } else {
          reject(error);
        }
      })
    });
  }

  txt(id, text) {
    let obj = {
      recipient: {
        id,
      },
      message: {
        text
      }
    }
    this.sendMessage(obj)
      .catch(error => console.log(error));
  }

  image(id, url) {
    let obj = {
      recipient: {
        id,
      },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url
          }
        }
      }
    }
    this.sendMessage(obj)
      .catch(error => console.log(error));
  }
}

module.exports = FBeamer;
