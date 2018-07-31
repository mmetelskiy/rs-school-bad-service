const successProbability = require('../config.json').successProbability;

const spoilers = [
  function doNotSendAnything(req, res, responseBody, replyWithError) {
    return;
  },
  function cutJsonBody(req, res, responseBody, replyWithError) {
    const jsonAsString = JSON.stringify(responseBody);

    const randomIndex = Math.floor(Math.random() * jsonAsString.length);

    res.set('Content-Type', 'application/json');

    res
      .status(200)
      .send(jsonAsString.substring(0, randomIndex));
  }
];

exports.spoilByIndex = function (req, res, responseBody, index, replyWithError) {
  if (parseInt(index, 10) !== Number(index)) {
    replyWithError(req, res, 'Expected spoiler query param to be a number.', 400);
  } else if (!spoilers[index]) {
    replyWithError(req, res, 'No such spoiler.', 400);
  } else {
    spoiler[index](req, res, responseBody, replyWithError);
  }
};
