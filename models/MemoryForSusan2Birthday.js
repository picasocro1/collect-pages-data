const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const MemoryForSusan2BirthdaySchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: String,
    required: 'Należy podać nazwę autora!'
  },
  memory: {
    type: String,
    required: 'Należy coś napisać we wspomnieniu!'
  },
  //https://json.geoiplookup.io/
  geoipdata: mongoose.Schema.Types.Mixed
}, { collection: 'susan-2-birthday-memories', usePushEach: true });

module.exports = mongoose.model('MemoryForSusan2Birthday', MemoryForSusan2BirthdaySchema);