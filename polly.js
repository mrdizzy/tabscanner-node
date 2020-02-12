class Polly {
  constructor(attempts = 3, first_poll = 1000, second_poll = 500, subsequent_polls = 0.1) {

    this.time_until_first_poll = first_poll;
    this.time_until_second_poll = second_poll;
    this.time_for_subsequent_polls = subsequent_polls;
    this.attempts_before_timeout = attempts;
  }

  async ask(function_to_call, evaluator_function) {
    await this.sleep(this.time_until_first_poll);
    return this.subsequentPollRequests(function_to_call, evaluator_function);
  }

  async subsequentPollRequests(function_to_call, evaluator_function, attempts = 0) {

    let amount_to_sleep = this.time_until_second_poll;
    if (attempts == this.attempts_before_timeout) {
      return Promise.reject("Failed after " + attempts + " attempts")
    }
    attempts += 1;
    try {
      let response = await function_to_call();
      console.log(response)

      if (evaluator_function(response)) {
        return response;
      }
      else {
        await this.sleep(amount_to_sleep);
        this.calculateNextDelay();
        return await this.subsequentPollRequests(function_to_call, evaluator_function, attempts);
      }
    }
    catch (error) {
      console.log(error)
    }
  }
  calculateNextDelay() {
    this.time_until_second_poll += this.time_until_second_poll * this.time_for_subsequent_polls;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Polly;