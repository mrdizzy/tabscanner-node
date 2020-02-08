let request_promise = require('request-promise-native');
let TabScanner = require('../index');
let fixtures = require(__dirname + "/fixtures.js");
let fs = require('fs');
let image = fs.readFileSync(__dirname + "/asda.jpg");

let validApiKey = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl"

jest.mock('request-promise-native');

test('Constructor must throw error if apiKey is not valid 64 character string', () => {
    ["", undefined, null, 0, "david", function() {},
        ["array", "of", "words"], {
            object: "key"
        }
    ].forEach(apiKey => {
        expect(() => {
            new TabScanner(apiKey);
        }).toThrow();
    })
});

test('Constructor does not throw error if apiKey is valid 64 character string', () => {
    expect(() => {
        new TabScanner(validApiKey);
    }).not.toThrow();
})

test("Passes default constructor options to first API request", () => {
   var tb =  new TabScanner(validApiKey, {
            decimalPlaces: 0,
            defaultDateParsing: "d/m",
            testMode: true,
        }
    )
    
    let result = tb.parseReceipt(image);
    console.log(request_promise.post.mock.calls[0][0].formData);
})

test('Get successful result', done => {
    request_promise.post.mockResolvedValueOnce(fixtures.get_token_success);

    let waitrose_filter = (result) => {
        let receipt = result.result;
        if (receipt.establishment == "Waitrose") {
            let lines = [];
            var total = 0;
            receipt.lineItems.forEach(line => {
                if (!line.desc.match(/15.0%/i)) {
                    line.lineTotal = (85 / 100) * line.lineTotal;
                    lines.push(line);
                }
            })
            receipt.lineItems = lines;
        }
        return receipt;
    }
    // qty, desc, unit, price, symbols, discount, lineType, descClean, lineATOtal, productCode, customFields
    let final_filter = (receipt) => {
        let date = receipt.date;
        let establishment = receipt.establishment;
        let total = receipt.total;
        let address = receipt.address;
        let paymentMethod = receipt.paymentMethod;
        let lines = [];

        receipt.lineItems.forEach(line => {

            lines.push([date, establishment, address, "", line.lineTotal, line.lineTotal, "", line.descClean, "", paymentMethod])
        })
        lines.push("", "", "", "", "", "", "", "", "", total)
        return lines;
    }

    var filters = [waitrose_filter, final_filter]

    var tb = new TabScanner(validApiKey);
    tb.retrieveResults = jest.fn().mockResolvedValueOnce(fixtures.waitrose)
    var result = tb.parseReceipt(image, filters);
    result.then(r => {
        done();
    })
})