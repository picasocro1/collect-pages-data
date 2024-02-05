const mongoose = require('mongoose');
const AtendeRecommendation = mongoose.model('AtendeRecommendation');
const log = require('../handlers/log');

exports.atendeRecommendation = async(req, res) => {
  log('atendeRecommendation');

  const password = req.body.password;

  try {
    if (password !== 'VOD') {
      return res.json({ result: 'failure', error: `Bad password provided: ${password}` });
    }

    await (new AtendeRecommendation(req.body).save());
    res.json({ result: 'success' });
  } catch (e) {
    console.log(e);
    res.json({ result: 'failure', error: e });
  }
};

