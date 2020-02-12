const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');


const image = fs.readFileSync(__dirname + "/test/waitrose_22_06.jpg");
const image2 = fs.readFileSync(__dirname + "/test/asda.jpg");

class TabScannerAxios {
    constructor(apiKey, options) {
        axios.defaults.baseURL = 'https://api.tabscanner.com/api';
        axios.defaults.headers.common['apiKey'] = apiKey;
    }

    async parseReceipt(image, options) {
        let result = await this.sendImage(image);
        let token = result.data.token;
        result = await this.getResults(token);
        console.log(result)
    }

    async sendImage(image) {
        const form = new FormData();
        form.append('file', image, {
            filename: "receipt.jpg"
        });

        form.append("testMode", "true");

        let form_headers = form.getHeaders();
        try {
            return axios.post('process', form, {
                headers: form_headers
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    async getResults(token) {

        try {
            return axios.get("result/" + token)
        }
        catch (error) {
            console.log(error)
        }
    }

}



let tabscanner = new TabScannerAxios("yMSgxm3eyourn2vK9KmW68WrElLO9afDVY0D7is2yVeoTOnqvc6aONwZYvj4iujm");
tabscanner.parseReceipt(image)