var request_promise = require('request-promise-native')
var PollRequest = require('poll-request');

/** Class representing a wrapper for the TabScanner API */
class TabScanner {

  /** 
   * Create an instance of the API
   * @param {string} apiKey - the API key provided by tabscanner.com to enable you to access the endpoint, this should be a string that is 64 characters long
   **/
  constructor(apiKey) {
    if (apiKey.length === 64 && typeof apiKey == "string") {
      this.request_options = {
        json: true,
        headers: {
          apiKey: apiKey
        }
      }
    }
    else {
      throw new Error("The apikey must be a string of 64 characters");
    }
  }

  /**
   * Give this method an image in the form of a Buffer, and tell it whether you wish to use the tabscanner.com test mode or not.
   * It will send the request to eh API endpoint and receive a token from the API. 
   * 
   * @param {Buffer} image - a buffer containing the binary data of the image of the receipt to parse
   * @param {boolean} test_mode - if this is true, then the tabscanner.com api will run in test mode 
   **/
  async parseReceipt(image, test_mode = false, transformer_functions) {
    this.image = image;
    let getToken = this.createFirstRequest(image, test_mode);
    
    let results = await getToken.then(result => {
      return this.retrieveResults(result.token);
    })
    
    if(transformer_functions) {
      
      transformer_functions.forEach(callback => {
        results = callback(results);
      })
    }
    return results;
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
  /**
   * This method polls the tabscanner.com API endpoint after 4000 milliseconds have passed, and then keeps polling it 
   * until a result is received. 
   * 
   * @param {string} - a string containing the token returned by the endpoint that identifies the receipt we are getting the results for
   **/
  retrieveResults(token) {
    var poll_request = new PollRequest(4000);
    let options = {
      url: "https://api.tabscanner.com/api/result/" + token,
      method: "GET"
    }
    let request = Object.assign({}, options, this.request_options);
    return poll_request.request(request, {
      
      callback: r => {
        return r.success == true && r.status == "done";
      }
    });
  }
}

module.exports = TabScanner;