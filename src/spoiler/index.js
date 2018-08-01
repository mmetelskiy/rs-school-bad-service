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
  function returnNonRequestdData(req, res, responseBody, replyWithError) {
    res
      .status(200)
      .json({
        city: cities[Math.floor(Math.random() * cities.length)],
        temperature: responseBody.temperature
      });
  }
];

const probabilityForSpoiler = 1.0 / spoilers.length;
const prefixSums = Array.from({ length: spoilers.length }, (x, i) => {
  return i * probabilityForSpoiler;
});

const getSpoilerIndexByProbability = function (p, l, r) {
  const index = l + Math.floor((r - l) / 2);

  if (l >= r) {
    return l;
  }
  if (prefixSums[index] === p) {
    return index;
  } else if (p < prefixSums[index]) {
    return getSpoilerIndexByProbability(p, l, index);
  } else {
    return getSpoilerIndexByProbability(p, index + 1, r);
  }
};

exports.useRandomSpoiler = function (req, res, responseBody, replyWithError) {
  const randomNumber = Math.random();
  const randomIndex = getSpoilerIndexByProbability(randomNumber, 0, prefixSums.length) - 1;

  if (!spoilers[randomIndex]) {
    logger.error(`Binary search error: random ${randomNumber}, prefixSums ${prefixSums.join(', ')}`)
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
