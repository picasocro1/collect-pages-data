const mongoose = require('mongoose')
const log = require('../../handlers/log')
const MilenaAndMatiGuestBook = mongoose.model('MilenaAndMatiGuestBook')
// libs to handle image processing
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const sharp = require('sharp')
const dateFormat = require('dateformat')

const MAX_IMAGE_SIZE_PX = 1920
const PHOTO_PATH = 'data/milena-and-mati/'
const DST_DIR = 'guest-book'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PHOTO_PATH)
    },

    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + dateFormat(Date.now(), 'yyyy-mm-dd--HH-MM-ss') + '_' + Date.now() + '.jpeg'/*path.extname(file.originalname)*/)
    }
})

const upload = multer({ storage })

exports.postRecord = (route, cors, app) => {
    //upload.single('image')
    //upload.array('image', 20)
    app.use(route, cors())
    app.post(route, upload.single('image'), async (req, res) => {
        log('milenaAndMatiGuestBook')

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

            const { author, wishes } = req.body

            const dbRecord = {
                author,
                wishes,
                image: {
                    data: fs.readFileSync(path.join(`${file.destination}/${DST_DIR}/${file.filename}`)),
                    contentType: 'image/jpeg'
                }
            }

            await (new MilenaAndMatiGuestBook(dbRecord).save())
        }

        try {
            await processFile(req.file)
            res.json({ result: 'success' })
        } catch ({ message }) {
            log(message);
            res.statusCode = 400
            res.json({ result: 'failure', error: message })
        }
    })
}

// don't use it: too expensive
exports.getRecords = async (req, res) => {
    log('milenaAndMatiGetRecords');

    try {
        MilenaAndMatiGuestBook.find({}, (error, items) => {
            if (error) {
                log(error);
                res.status(500).send('An error occurred', error);
            } else {
                const records = items
                    .map(({ _doc }) => _doc)
                    .map(({ author, image: { contentType, data }, wishes }) => ({
                        author,
                        wishes,
                        image: { contentType, data: data.toString('base64') }
                    }));

                res.json({ records })
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ result: 'failure', error });
    }
};
