let request = require('request');
let TabScanner = require('../index');
let fixtures = require(__dirname + "/fixtures.js");
let fs = require('fs');

let image = fs.readFileSync(__dirname + "/asda.jpg");
let validApiKey = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl"

jest.setTimeout(30000)
jest.mock('request');


describe("Testing API request builds", () => {

  beforeEach(() => {
    request.post.mockReturnValueOnce(fixtures.get_token_success);

    request.mockReturnValueOnce(fixtures.get_token_result_unavailable).mockReturnValueOnce(fixtures.get_token_result_unavailable).mockReturnValueOnce(fixtures.get_token_result_unavailable).mockReturnValueOnce(fixtures.asda);
  });

  test('Constructor must throw error if apiKey is not valid 64 character string', () => {
    ["", undefined, null, 0, "david", function() {},
      ["array", "of", "words"], {
        object: "key"
      }
    ].forEach(apiKey => {
      expect(() => {
        new TabScanner({
          apiKey: apiKey
        });
      }).toThrow();
    })
  });

  test('Constructor does not throw error if apiKey is valid 64 character string', () => {
    expect(() => {
      new TabScanner({
        apiKey: validApiKey
      });
    }).not.toThrow();
  })

  test("Passes default constructor options to first API request", async() => {
    var tb = new TabScanner({
      apiKey: validApiKey,
      decimalPlaces: 0,
      defaultDateParsing: "d/m",
      testMode: true,
      documentType: "receipt",
      cents: false
    })
    const build_request = jest.spyOn(tb, "buildRequest");
    await tb.parseReceipt({
      image: image
    })
    let first_call = build_request.mock.results[0].value;
    expect(first_call.url).toEqual('https://api.tabscanner.com/api/process');
    expect(first_call.method).toEqual('POST');
    expect(first_call.formData.decimalPlaces).toEqual(0);
    expect(first_call.formData.defaultDateParsing).toEqual("d/m");
    expect(first_call.formData.documentType).toEqual("receipt");
    expect(first_call.formData.cents).toEqual(false);
    expect(first_call.formData.testMode).toEqual(true);
    expect(first_call.headers.apiKey).toEqual(validApiKey);
    expect(first_call.json).toEqual(true);
  })

  test("Call to retrieve results has correct request parameters", async() => {
    var tb = new TabScanner({
      apiKey: validApiKey,
      decimalPlaces: 0,
      defaultDateParsing: "d/m",
      testMode: true,
      documentType: "receipt",
      cents: false
    })
    const build_request = jest.spyOn(tb, "buildRequest");
    await tb.parseReceipt({
      image: image
    })
    let second_call = build_request.mock.results[1].value;
    expect(second_call.url).toEqual("https://api.tabscanner.com/api/result/naQM25k8KyJPmgxG");
    expect(second_call.headers.apiKey).toEqual(validApiKey);
    expect(second_call.json).toEqual(true);
    expect(second_call.method).toEqual("GET");
    expect(second_call.formData).toBeUndefined();
  })
})

describe("testing successful results", () => {
  beforeEach(() => {
    request.post.mockReturnValueOnce(fixtures.get_token_success);

    request.mockReturnValueOnce(fixtures.get_token_result_unavailable).mockReturnValueOnce(fixtures.get_token_result_unavailable).mockReturnValueOnce(fixtures.get_token_result_unavailable).mockReturnValueOnce(fixtures.asda);
  });

  test('Get successful result', done => {
    let tb = new TabScanner({
      apiKey: validApiKey
    });

    let result = tb.parseReceipt(image);
    result.then(r => {
      expect(r.establishment).toEqual("ASDA");
      expect(r.date).toEqual("2020-01-02 17:49:35");
      expect(r.url).toEqual("www.asda.com");
      expect(r.total).toEqual("18.880");
      expect(r.lineItems[0].desc).toEqual("SP BUTTER 000002040596K")
      expect(r).toEqual(fixtures.asda.result)
      done();
    })
  })

  test('Test transform filters', done => {
    let tb = new TabScanner({
      apiKey: validApiKey
    });

    let waitrose_filter = (receipt) => {
      if (receipt.establishment == "Waitrose") {
        let lines = [];
        let total = 0;
        receipt.lineItems.forEach(line => {
          if (!line.desc.match(/15.0%/i)) {
            line.lineTotal = (85 / 100) * line.lineTotal;
            lines.push(line);
          }
        })
        receipt.lineItems = lines;
      }
      console.log(receipt);
      return receipt;
    }




  })

})