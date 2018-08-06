const successProbability = require('../config.json').successProbability;

const cities = [
  'Minsk',
  'Moscow',
  'Toronto',
  'New-Yourk',
  'Warsaw',
  'Vilnius'
];

const spoilers = [
  function doNotSendAnything(req, res, responseBody, replyWithError) {
    return;
  },
  function abortConnection(req, res, responseBody, replyWithError) {
    req.connection.destroy();
  },
  function cutJsonBody(req, res, responseBody, replyWithError) {
    const jsonAsString = JSON.stringify(responseBody);

    const randomIndex = Math.floor(Math.random() * jsonAsString.length);

    res.set('Content-Type', 'application/json');

    res
      .status(200)
      .send(jsonAsString.substring(0, randomIndex));
  },
  function numberAsString(req, res, responseBody, replyWithError) {
    res
      .status(200)
      .json({
        city: responseBody.city,
        temperature: String(responseBody.temperature)
      });
  },
  function serverError(req, res, responseBody, replyWithError) {
    replyWithError(req, res, 'Internal server error.', 500);
  },
  function returnNonRequestedData(req, res, responseBody, replyWithError) {
    res
      .status(200)
      .json({
        city: cities[Math.floor(Math.random() * cities.length)],
        temperature: responseBody.temperature
      });
  },
  function cityAsArray(req, res, responseBody, replyWithError) {
    res
      .status(200)
      .json({
        city: [responseBody.city],
        temperature: responseBody.temperature
      });
  }
];

exports.useRandomSpoiler = function (req, res, responseBody, replyWithError) {
  const randomIndex = Math.floor(Math.random() * spoilers.length);

  if (!spoilers[randomIndex]) {
    randomIndex = 0;
  }

  spoilers[randomIndex](req, res, responseBody, replyWithError);
};

exports.spoilByIndex = function (req, res, responseBody, index, replyWithError) {
  if (parseInt(index, 10) !== Number(index)) {
    replyWithError(req, res, 'Expected spoiler query param to be a number.', 400);
  } else if (!spoilers[index]) {
    replyWithError(req, res, 'No such spoiler.', 400);
  } else {
    spoilers[index](req, res, responseBody, replyWithError);
  }
};
