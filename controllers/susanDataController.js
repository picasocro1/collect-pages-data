const mongoose = require('mongoose');
const MemoryForSusan2Birthday = mongoose.model('MemoryForSusan2Birthday');
const log = require('../handlers/log');

exports.memoryForSusan2Birthday = async(req, res) => {
  log('memoryForSusan2Birthday');

  //new Date(year, month, day, hours, minutes, seconds, milliseconds); //months are numbered from zero!
  let finishDate = new Date('2019', '2', '25', '00', '00', '00', '00');

  if ((new Date()) > finishDate && !req.body.author.startsWith('@@@')) {
    res.json({ result: 'failure', error: '⌛️ Przepraszamy, upłynął czas przyjmowania wpisów (2019-03-04).' });
  } else {
    try {
      if (req.body.author.startsWith('@@@')) {
        req.body.author = req.body.author.substring(3);
      }

      const memory = await (new MemoryForSusan2Birthday(req.body).save());
      res.json({ result: 'success' });
    } catch (e) {
      console.log(e);
      res.json({ result: 'failure', error: e });
    }
  }
};

