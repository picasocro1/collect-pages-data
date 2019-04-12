/*
 Catch Errors Handler

 With async/await, you need some way to catch errors
 Instead of using try{} catch(e) {} in each controller, we wrap the function in
 catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
 */

exports.notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/*
 Production Error Handler

 No stacktraces are leaked to user
 */
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
};
