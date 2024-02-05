module.exports = function log(...texts) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...texts)
  }
};
