const mongoose = require('mongoose');
const AnyData = mongoose.model('AnyData');

exports.getAnyData = async (req, res) => {
  try {
    const data = await AnyData
      .find()
      .sort({ created: -1 })
      .exec();
    res.json({ result: data });
  } catch (e) {
    res.json({ result: 'failure', error: e });
  }
}

exports.registerAnyData = async (req, res) => {
  try {
    const anyData = await (new AnyData({ data: req.body }).save());
    res.json({ result: 'success' });
  } catch (e) {
    res.json({ result: 'failure', error: e });
  }
};

exports.deleteAllData = async (req, res) => {
  try {
    const deletedData = await AnyData.deleteMany({})
    res.json({ result: 'success' });
  } catch (e) {
    res.json({ result: 'failure', error: e });
  }
};