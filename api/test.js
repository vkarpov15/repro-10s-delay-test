const cloud = require('mongoose-cloud');

module.exports = cloud.lambda(require('../handler').queryCountries);
