const mongoose = require('mongoose')
const log = require('../../handlers/log')
const MilenaAndMatiPhotoGame = mongoose.model('MilenaAndMatiPhotoGame')
// libs to handle image processing
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const sharp = require('sharp')
const dateFormat = require('dateformat')

const MAX_IMAGE_SIZE_PX = 1920
const PHOTO_PATH = 'data/milena-and-mati/photo-game/'
const DST_DIR_BRIDGE = 'bridge'
const DST_DIR_GROOM = 'groom'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PHOTO_PATH)
    },

    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + dateFormat(Date.now(), 'yyyy-mm-dd--HH-MM-ss') + '_' + Date.now() /*'.jpeg'*//*path.extname(file.originalname)*/)
    }
})

const upload = multer({ storage })

module.exports = (route, cors, app) => {
    //upload.single('image')
    //upload.array('image', 20)
    app.use(route, cors())
    app.post(route, upload.single('image'), async (req, res) => {
        log('milenaAndMatiPhotoGame')

        const processFile = async (file) => {
            const { description } = req.body
            const bridgeFamilySide = req.body.bridgeFamilySide === 'true'

            const dstDir = bridgeFamilySide ? DST_DIR_BRIDGE : DST_DIR_GROOM
            const image = sharp(file.path, { failOnError: false })
            const filename = `${file.filename}-${description}`.substr(0, 95).replace(/[^a-z0-9_.\-]/gi, '_').toLowerCase() + '.jpeg';

            // https://sharp.pixelplumbing.com/api-input#metadata
            const { width, height } = await image.metadata()
            const resizeByWidth = width > height

            await image
                .resize(resizeByWidth ? MAX_IMAGE_SIZE_PX : null, resizeByWidth ? null : MAX_IMAGE_SIZE_PX, { withoutEnlargement: true })
                .jpeg({ mozjpeg: true })
                .toFile(
                    path.resolve(file.destination, dstDir, filename)
                )
            try {
                fs.unlinkSync(file.path)
            } catch (error) {
                log('unlink error', error)
            }

            const dbRecord = {
                bridgeFamilySide,
                description,
                image: {
                    data: fs.readFileSync(path.join(`${file.destination}/${dstDir}/${filename}`)),
                    contentType: 'image/jpeg'
                }
            }

            await (new MilenaAndMatiPhotoGame(dbRecord).save())
        }

        try {
            await processFile(req.file)
            res.json({ result: 'success' })
        } catch ({  message }) {
            log(message);
            res.statusCode = 400
            res.json({ result: 'failure', error: message })
        }
    })
}
