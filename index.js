var request_promise = require('request-promise-native')
var PollRequest = require('./../poll-request/index.js');

class TabScanner {

  constructor(apiKey) {
    this.request_options = {
      json: true,
      headers: {
        apiKey: apiKey
      }
    }
  }

  parseReceipt(image, test_mode = false) {
    this.image = image;
    var getToken = this.createFirstRequest(image, test_mode);
    return getToken.then(result => {
      console.log(result)
     return this.retrieveResults(result.token);
    })
  }

  retrieveResults(token) {
    console.log(token)
    var poll_request = new PollRequest(4000);
    let options = {
      url: "https://api.tabscanner.com/api/result/" + token,
      method: "GET"
    }
    let request = Object.assign({}, options, this.request_options);
    return poll_request.request(request, { callback: r => {
      return r.success == true && r.status == "done";
    }});
  }
  
  createFirstRequest(image_buffer, test_mode) {
    let options = {
      url: "https://api.tabscanner.com/api/process",
      method: "POST",
      formData: {
        testMode: test_mode.toString(),
        file: {
          value: image_buffer,
          options: {
            filename: "aldi.png",
            contentType: "image/png"
          }
        }
      }
    }

    let request = Object.assign({}, options, this.request_options);
    return request_promise.post(request)
  }
}
module.exports = TabScanner;