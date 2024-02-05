const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const AnyDataSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  //https://json.geoiplookup.io/
  data: mongoose.Schema.Types.Mixed
}, { collection: 'any-data', usePushEach: true });

module.exports = mongoose.model('AnyData', AnyDataSchema);