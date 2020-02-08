var request_promise = require('request-promise-native')
var PollRequest = require('poll-request');

/* TABSCANNER arguments to https://api.tabscanner.com/api/2/process endpoint

  file - REQUIRED	The image file. Can accept JPG, PNG and PDF file formats.

  decimalPlaces - optional - integer - Should be 0, 1 or 3. A hint for what to look for on the receipt. It can improve accuracy if you know the number of decimal places in advance. This is not related to number formatting.

  cents - optional - boolean - Convert numbers without decimal places to cents. Only works with receipts set to 3 decimal places. (e.g. 1.574 = 1.574, 245 = 0.245)

  documentType - optional	- string - Must be receipt, invoice or auto. The default is receipt. Specify the type of document to be processed. If set to auto Tabscanner will attempt to auto-detect the document type.

  defaultDateParsing - optional	- string - Must be m/d or d/m. In the case of an ambiguous date eg. 02/03/2019 this parameter determines if the date is understood as day followed by month or month followed by day.
  
  testMode - optional	- boolean - The goal of testMode is to stop credits being used while performing integration testing. The value should not be set to true when evaluating the accuracy of results. If set to true, any subsequent calls with the same image will return immediately the token from the first call without using any credit. Primarily used for testing, and make sure to disable on production environments, when experimenting with parameters and when accuracy testing. IMPORTANT: when using test mode, changing parameters will only affect the first call for a given image as testMode works by using a cache of the previously requested result instead of re-processing the request.
*/

/** Class representing a wrapper for the TabScanner API */
class TabScanner {

  /** 
   * Create an instance of the API
   * @param {string} apiKey - the API key provided by tabscanner.com to enable you to access the endpoint, this should be a string that is 64 characters long
   **/
  constructor(apiKey, tabscanner_formdata_options) {
    this.tabscanner_formdata_options = tabscanner_formdata_options;
    if (apiKey && apiKey.length === 64 && typeof apiKey == "string") {
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


  // TODO: merge constructor default options with options parsed to this instance 
  async parseReceipt(image, transformer_functions, tabscanner_formdata_options) {
    this.tabscanner_formdata_options = Object.assign({}, this.tabscanner_formdata_options, tabscanner_formdata_options)
    this.image = image;
    let getToken = this.createFirstRequest(image);

    let results = await getToken.then(result => {
      return this.retrieveResults(result.token);
    })

    if (transformer_functions) {
      transformer_functions.forEach(callback => {
        results = callback(results);
      })
    }
    return results;
  }

  createFirstRequest(image_buffer) {
    let options = {
      url: "https://api.tabscanner.com/api/process",
      method: "POST",
      formData: this.tabscanner_formdata_options
    }
    options.formData.file = {
      value: image_buffer,
      options: {
        filename: "aldi.png",
        contentType: "image/png"
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