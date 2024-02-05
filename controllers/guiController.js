const mongoose = require('mongoose');
const log = require('../handlers/log')

exports.homePage = (req, res) => {
  log('homePage')

  const currentDate = new Date();
  const dateTime = currentDate.getDate() + "/"
    + (currentDate.getMonth() + 1) + "/"
    + currentDate.getFullYear() + " @ "
    + currentDate.getHours() + ":"
    + currentDate.getMinutes() + ":"
    + currentDate.getSeconds();

  let mongooseState;

  switch (mongoose.connection.readyState) {
    case 0:
      mongooseState = 'disconnected';
      break;
    case 1:
      mongooseState = 'connected';
      break;
    case 2:
      mongooseState = 'connecting';
      break;
    case 3:
      mongooseState = 'disconnecting';
      break;
    default:
      mongooseState = 'unknown';
  }

  res.render('index', { dateTime: dateTime, mongooseState: mongooseState });
};
