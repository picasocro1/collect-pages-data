const express = require('express');
const mongoose = require('mongoose');
const glob = require('glob');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const promisify = require('es6-promisify');
const path = require('path');
const errorHandlers = require('./handlers/errorHandlers');
const log = require('./handlers/log');

if (process.env.NODE_ENV == undefined) {
  process.env.NODE_ENV = "production";
}

console.log('--------------------------------------------');
console.log(`→ App run in: ${process.env.NODE_ENV} mode.`);
console.log('--------------------------------------------');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.error('⚠ ️⚠ ⚠ Node in version 7.6 or greater is required');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`⚠ ️⚠ ⚠ → ${err.message}`);
});

require('./models/MemoryForSusan2Birthday');
require('./models/TraceUserSiteVisit');
require('./models/TraceUserSiteVisitor');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

const routes = require('./routes/index');
app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// production error handler
app.use(errorHandlers.productionErrors);

// Start our app!
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  log(`Express running → PORT ${server.address().port}`);
  log(`http://localhost`);
});
