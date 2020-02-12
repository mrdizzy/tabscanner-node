var TabScanner = require('../index.js');
var fs = require('fs');
var image = fs.readFileSync(__dirname + "/waitrose_22_06.jpg");

var fixtures = require(__dirname + '/fixtures.js');

let waitrose_filter = (receipt) => {
    if (receipt.establishment === "Waitrose") {
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
    lines.push(["", "", "", "", "", "", "", "", "", total])
    return lines;
}

let filters = [waitrose_filter, final_filter]

let tb = new TabScanner({
    apiKey: "yMSgxm3eyourn2vK9KmW68WrElLO9afDVY0D7is2yVeoTOnqvc6aONwZYvj4iujm"
});
tb.parseReceipt(image, {
    testMode: "true", transformer_functions: filters}).then(result => {
    console.log(result);
})