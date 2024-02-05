const milenaAndMatiPhotoMosaicController = require('../controllers/milenaAndMati/PhotoMosaic')
const milenaAndMatiPhotoGameController = require('../controllers/milenaAndMati/PhotoGame')
const milenaAndMatiGuestBookController = require('../controllers/milenaAndMati/GuestBook')

const majaAndMarcinPhotoMosaicController = require('../controllers/majaAndMarcin/PhotoMosaic')

const cors = require('cors');
const corsOptionsForDocenZycie = process.env.NODE_ENV === 'development' ? { origin: /http:\/\/localhost.*/ } : { origin: /https?:\/\/docenzycie\.pl.*/ }

module.exports = (app) => {
    milenaAndMatiPhotoMosaicController('/data/milena-and-mati/photo-mosaic/', () => cors(corsOptionsForDocenZycie), app)
    milenaAndMatiPhotoGameController('/data/milena-and-mati/photo-game/', () => cors(corsOptionsForDocenZycie), app)
    milenaAndMatiGuestBookController.postRecord('/data/milena-and-mati/guest-book/', () => cors(corsOptionsForDocenZycie), app)

    majaAndMarcinPhotoMosaicController('/data/maja-and-marcin/photo-mosaic/', () => cors(corsOptionsForDocenZycie), app)
}
