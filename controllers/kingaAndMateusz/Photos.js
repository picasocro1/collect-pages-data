const log = require('../../handlers/log')
// libs to handle image processing
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const sharp = require('sharp')
const dateFormat = require('dateformat')

const MAX_IMAGE_SIZE_PX = 1920
const PHOTO_PATH = 'data/kinga-and-mateusz/'
const DST_DIR = 'photos'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PHOTO_PATH)
    },

    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + dateFormat(Date.now(), 'yyyy-mm-dd--HH-MM-ss') + '_' + Date.now() + '.jpeg'/*path.extname(file.originalname)*/)
    }
})

const upload = multer({ storage })

module.exports = (route, cors, app) => {
    //upload.single('image')
    //upload.array('image', 20)
    app.use(route, cors())
    app.post(route, upload.array('image', 100), async (req, res) => {
        log('kingaAndMateuszPhotos')

        const processFile = async (file) => {
            const image = sharp(file.path, { failOnError: false })

            // https://sharp.pixelplumbing.com/api-input#metadata
            const { width, height } = await image.metadata()
            const resizeByWidth = width > height

            await image
                .resize(resizeByWidth ? MAX_IMAGE_SIZE_PX : null, resizeByWidth ? null : MAX_IMAGE_SIZE_PX, { withoutEnlargement: true })
                .jpeg({ mozjpeg: true })
                .toFile(
                    path.resolve(file.destination, DST_DIR, file.filename)
                )

            try {
                fs.unlinkSync(file.path)
            } catch (error) {
                log('unlink error', error)
            }
        }

        try {
            await Promise.all(req.files.map(processFile))
            res.json({ result: 'success' })
        } catch ({ message }) {
            log(message);
            res.statusCode = 400
            res.json({ result: 'failure', error: message })
        }
    })
}
