const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const GuestBookSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  image: {
    data: Buffer,
    contentType: String
  },
  author: String,
  wishes: String,
}, {collection: 'milena-and-mati-guest-book', usePushEach: true})

module.exports = mongoose.model('MilenaAndMatiGuestBook', GuestBookSchema)
