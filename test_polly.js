const fs = require('fs');
const FormData = require('form-data');
const https = require('https');
const Polly = require(__dirname + "/polly.js")
const polly = new Polly();

const form = new FormData();

form.append('file', fs.createReadStream(__dirname + "/test/waitrose_22_06.jpg"));
form.append('testMode', 'true')

let sendReceiptImage = function() {
  return new Promise((resolve, reject) => {

    form.submit({
      host: 'api.tabscanner.com',
      path: '/api/process',
      protocol: 'https:',
      headers: {
        'apiKey': 'yMSgxm3eyourn2vK9KmW68WrElLO9afDVY0D7is2yVeoTOnqvc6aONwZYvj4iujm'
      }
    }, function(err, res) {
      if (err) {
        reject(err);
      }
      else {
        res.on('data', function(data) {
          resolve(data.toString())
        })
      }
    });

  })
}


let results = sendReceiptImage().then(r => {

  let parseReceipt = async function() {
    return new Promise((resolve, reject) => {
    let token = JSON.parse(r).token;
    let options = {
      host: 'api.tabscanner.com',
      path: '/api/result/' + token,
      protocol: 'https:',
      port: 443,
      method: 'GET',
      headers: {
        'apiKey': 'yMSgxm3eyourn2vK9KmW68WrElLO9afDVY0D7is2yVeoTOnqvc6aONwZYvj4iujm'
      }
    };

    let req = https.request(options, function(res) {
      let data = "";
      res.on('data', function(d) {
        data = data + d.toString();
      });
      res.on('end', function() {
        resolve(JSON.parse(data))
      })
    });

    req.end();
      
    })
  }

  polly.ask(parseReceipt, (response) => {
    return(response.success == true)
  })
})