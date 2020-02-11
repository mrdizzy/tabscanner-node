
    
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