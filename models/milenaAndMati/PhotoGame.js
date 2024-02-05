const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const PhotoGameSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  bridgeFamilySide: {
    type: Boolean,
    required: 'Informacja o stronie rodziny jest wymagana'
  },
  image: {
    data: Buffer,
    contentType: {
      type: String,
      required: 'Zdjęcie jest wymagane'
    }
  },
  description: {
    type: String,
    required: 'Opis zdjęcia jest wymagany'
  }
}, {collection: 'milena-and-mati-photo-game', usePushEach: true})

module.exports = mongoose.model('MilenaAndMatiPhotoGame', PhotoGameSchema)
