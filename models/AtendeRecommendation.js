const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const AtendeRecommendationSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  contact: {
    type: String,
    required: 'Pole kontakt jest wymagane'
  },
  author: {
    type: String,
    required: 'Pole autor jest wymagane'
  },
  recommendation: {
    type: String,
    required: 'Pole z rekomendacją jest wymagane'
  }
}, { collection: 'atende-recommendations', usePushEach: true });

module.exports = mongoose.model('AtendeRecommendation', AtendeRecommendationSchema);