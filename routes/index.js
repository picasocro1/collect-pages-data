const express = require('express');
const router = express.Router();
const guiController = require('../controllers/guiController');
const susanDataController = require('../controllers/susanDataController');
const traceUserSiteDataController = require('../controllers/traceUserSiteDataController');
const cors = require('cors');

// Do work here
router.get('/', /*storeController.myMiddleware, */guiController.homePage);
/*router.options('/data/memoryForSusan2Birthday', cors());*/
router.post('/data/memoryForSusan2Birthday', /*cors(), */susanDataController.memoryForSusan2Birthday);

//------------------------------------------------
// traceUserSite
//------------------------------------------------
router.options('/data/traceUserSite/*', cors()); //enabling CORS pre-flight

/*router.post('/data/traceUserSite/forceCreatingNewVisitor', cors(), traceUserSiteDataController.createNewVisitor);
router.post('/data/traceUserSite/checkVisitor', cors(), traceUserSiteDataController.checkVisitor);

router.get('/data/traceUserSite/firstVisit/:visitor_id', cors(), traceUserSiteDataController.getFirstVisit);
router.get('/data/traceUserSite/visits/:visitor_id', cors(), traceUserSiteDataController.getVisitorVisits);
router.get('/data/traceUserSite/history/:visitor_id', cors(), traceUserSiteDataController.getVisitorHistory);*/

router.post('/data/traceUserSite/registerVisit', cors(), traceUserSiteDataController.registerVisit);
router.patch('/data/traceUserSite/visitor/:visitor_id', cors(), traceUserSiteDataController.visitorChange);

module.exports = router;