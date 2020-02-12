const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const image = fs.readFileSync(__dirname + "/test/waitrose_22_06.jpg");

axios.defaults.baseURL = 'https://api.tabscanner.com/api';
axios.defaults.headers.common['apiKey'] = "yMSgxm3eyourn2vK9KmW68WrElLO9afDVY0D7is2yVeoTOnqvc6aONwZYvj4iujm";


class AxiosPoll {
    constructor(first_poll = 1000, second_poll = 500, subsequent_polls = 0.1, attempts = 3) {
        this.poll_options = {
            first_poll: first_poll,
            second_poll: second_poll,
            subsequent_polls: subsequent_polls,
            attempts: attempts
        }
    }

    async poll(axios_options = {}, end_poll_callback) {
        this.axios_options = axios_options;
        await this.sleep(this.poll_options.first_poll);
        return this.subsequentPollRequests(end_poll_callback);
    }

    async subsequentPollRequests(end_poll_callback, attempts = 0) {
        let amount_to_sleep = this.poll_options.second_poll
        if (attempts == this.poll_options.attempts) {
            return Promise.reject("Failed after " + attempts + " attempts")
        }
        attempts += 1;
        try {
            let response = await axios(this.axios_options);

            if (end_poll_callback(response)) {
                return response;
            }
            else {
                await this.sleep(amount_to_sleep);
                this.calculateNextDelay();
                return await this.subsequentPollRequests(end_poll_callback, attempts);
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    calculateNextDelay() {
        this.poll_options.second_poll += this.poll_options.second_poll * this.poll_options.subsequent_polls;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}



let multipart_axios = function(axios_options, formdata, files) {
    const form = new FormData();
    for (let key in formdata) {
        let value = formdata[key];
        if (Array.isArray(value)) {
            let [binary, filename, content_type] = value;
            form.append(key, binary, {
                filename: filename,
                contentType: content_type
            })
        }
        else {
            form.append(key, value);
        }
    }

    axios_options.data = form;
    axios_options.headers = form.getHeaders();
    try {
        return axios(axios_options)
    }
    catch (error) {
        console.log(error)
    }


}

multipart_axios({
    method: "post",
    url: "/process"
}, {
    file: [image, "receipt.jpg", "image/jpg"],
    testMode: "true"
}).then(r => {
    let token = r.data.token;
    const axios_poll = new AxiosPoll();
    axios_poll.poll({url: "/result/" + token}, (evaluate) => {
        return evaluate.data.success == true;
    }).then(r => {
        console.log(r)
    })
})

//const axios_poll = new AxiosPoll();
//axios_poll.poll({
//    method: "post",
//    url: "/process"
//}, response => {
//    console.log(response)
//})
