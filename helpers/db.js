const mongoose = require('mongoose'),
      { setupInitialCountryList } = require('./countryUtils'),
      { logd, logi } = require('./debuglog');

const cloud = require('mongoose-cloud');

let conn = null;

mongoose.Promise = global.Promise;

mongoose.connection.on('buffer', data => {
  console.log('Buffered', mongoose.connection.readyState, data);
});

const setupInitialStates = async () => {
  await setupInitialCountryList();
};

const connectToDatabase = () => {
  if (conn !== null) {
    logd('connectToDatabase> using EXISTING database connection...');
    return Promise.resolve();
  }

  const options = {
    useNewUrlParser: true, // to remove DeprecationWarning @ 5.2.13: current URL string parser is deprecated, and will be removed in a future version.
    // heartbeatFrequencyMS: 2000, // workaround to reduce the occasional query lag from 10 secs to 2 secs. Awaiting official fix in mongoose v5.9.25
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0 // and MongoDB driver buffering
  };

  // to remove DeprecationWarning @ 5.2.13: collection.ensureIndex is deprecated.
  mongoose.set('useCreateIndex', true);

  // to remove DeprecationWarning: collection.findAndModify is deprecated. Use findOneAndUpdate, findOneAndReplace orfindOneAndDelete instead.
  mongoose.set('useFindAndModify', false);

  // to remove DeprecationWarning @ 5.7.6: current Server Discovery and Monitoring engine is deprecated
  mongoose.set('useUnifiedTopology', true);

  logi('connectToDatabase> CREATING a new database connection.');
  conn = mongoose.connection;
  return mongoose.connect(cloud.config().uri, { ...cloud.config(), ...options }).then((db) => {
    logd(`connectToDatabase> MongoDB - isConnected: ${db.connections[0].readyState}`);
    return setupInitialStates();
  });
};

module.exports = { connectToDatabase };
