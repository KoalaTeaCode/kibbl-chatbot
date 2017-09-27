'use strict'
const request = require('request');
const rp = require('request-promise');

class FBeamer {
  constructor (config) {
      if (!config || !config.PAGE_ACCESS_TOKEN || !config.VERIFY_TOKEN) {
        throw new Error('Unable to access tokens!');
      } else {
        this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
        this.VERIFY_TOKEN = config.VERIFY_TOKEN;
      }
  }

  setGreeting () {
    let options = {
      method: 'POST',
      uri: `https://graph.facebook.com/v2.6/me/thread_settings?access_token=${this.PAGE_ACCESS_TOKEN}`,
      body: {
        setting_type: 'greeting',
        greeting: {
          text: "A bot that will help you find adoptable pets"
        },
      },
      json: true,
    };

    return rp(options)
      .then(function (parsedBody) {
        console.log(parsedBody)
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  setWhiteListIps () {
    let options = {
      method: 'POST',
      uri: `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${this.PAGE_ACCESS_TOKEN}`,
      body: {
        "whitelisted_domains":[
          "http://kibbl.io",
          "https://d2afqr2xdmyzvu.cloudfront.net",
        ]
      },
      json: true,
    };

    return rp(options)
      .then(function (parsedBody) {
        // console.log(parsedBody)
      })
      .catch(function (err) {
        // console.error(Object.keys(err));
        // console.log(err.error)
      });
  }

  setGettingStarted () {
    let options = {
      method: 'POST',
      uri: `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${this.PAGE_ACCESS_TOKEN}`,
      body: {
        "get_started": {
          payload: "get_started"
        },
      },
      json: true,
    };

    return rp(options)
      .then(function (parsedBody) {
        console.log(parsedBody)
      })
      .catch(function (err) {
        // console.error(Object.keys(err));
        console.log(err.error)
      });
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
      // console.log("WEbhook err");
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
        text,
        // quick_replies:[
        //   {
        //     "content_type":"text",
        //     "title":"Search",
        //     // "payload":"<POSTBACK_PAYLOAD>",
        //     // "image_url":"http://example.com/img/red.png"
        //   },
        // ],
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

  sendButtonTemplate(id) {
    let obj = {
      recipient: {
        id,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'What do you want to do next?',
            buttons: [
              {
                type: 'web_url',
                url: "https://www.messenger.com",
                title: "Find Pets"
              },
              {
                type: 'web_url',
                url: "https://www.messenger.com",
                title: "Find Events"
              },
              {
                type: 'web_url',
                url: "https://www.messenger.com",
                title: "Find Shelters"
              },
            ],
          }
        }
      }
    }
    this.sendMessage(obj)
      .catch(error => console.log(error));
  }

  sendListTemplate(id, list, payload) {
    // {
    //   "title": "Classic T-Shirt Collection",
    //   "subtitle": "See all our colors",
    //   "image_url": "https://d2afqr2xdmyzvu.cloudfront.net/assets/habitica_lockup2_desat.png",
    //   "buttons": [
    //     {
    //       "title": "View",
    //       "type": "web_url",
    //       "url": "https://d2afqr2xdmyzvu.cloudfront.net/assets/habitica_lockup2_desat.png",
    //       "messenger_extensions": true,
    //       "webview_height_ratio": "tall",
    //       "fallback_url": ""
    //     }
    //   ]
    // },
    // {
    //   "title": "Classic White T-Shirt",
    //   "subtitle": "See all our colors",
    //   "default_action": {
    //     "type": "web_url",
    //     "url": "https://d2afqr2xdmyzvu.cloudfront.net/assets/habitica_lockup2_desat.png",
    //     "messenger_extensions": true,
    //     "webview_height_ratio": "tall",
    //     "fallback_url": ""
    //   }
    // },


    let obj = {
      recipient: {
        id,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'list',
            top_element_style: 'compact',
            elements: list,
            buttons: [
              {
                "title": "View More",
                "type": "postback",
                payload: JSON.stringify(payload),
              }
            ],
          },
        }
      }
    }

    this.sendMessage(obj)
      .then(success => console.log("succes", success))
      .catch(error => console.error("error", error));
  }

}

module.exports = FBeamer;
