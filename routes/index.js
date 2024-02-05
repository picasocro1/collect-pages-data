const express = require('express');
const router = express.Router();
const guiController = require('../controllers/guiController');
const susanDataController = require('../controllers/susanDataController');
const atendeRecommendationsDataController = require('../controllers/atendeRecommendationsDataController');
const milenaAndMatiGuestBookController = require('../controllers/milenaAndMati/GuestBook')
const traceUserSiteDataController = require('../controllers/traceUserSiteDataController');
const anyDataController = require('../controllers/anyDataController');
const cors = require('cors');

// Do work here
router.get('/', /*storeController.myMiddleware, */guiController.homePage);
/*router.options('/data/memoryForSusan2Birthday', cors());*/
router.post('/data/memoryForSusan2Birthday', /*cors(), */susanDataController.memoryForSusan2Birthday);

//------------------------------------------------
// Milena and Mati
//------------------------------------------------
const corsOptionsForDocenZycie = process.env.NODE_ENV === 'development' ? { origin: /http:\/\/localhost.*/ } : { origin: /https?:\/\/docenzycie\.pl.*/ }
router.all('/data/milena-and-mati/guest-book/', cors(corsOptionsForDocenZycie))
// router.get('/data/milena-and-mati/guest-book/', milenaAndMatiGuestBookController.getRecords)

//------------------------------------------------
// AtendeRecommendations
//------------------------------------------------
const corsOptionsForAtendeRecommendations = { origin: /https?:\/\/docenzycie\.pl.*/ };
router.options('/data/atende', cors(corsOptionsForAtendeRecommendations));
router.post('/data/atende', cors(corsOptionsForAtendeRecommendations), atendeRecommendationsDataController.atendeRecommendation);

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
router.delete('/data/traceUserSite/visitor/:visitor_id', cors(), traceUserSiteDataController.visitorDelete);

router.get('/data/traceUSerSite/analytics/compareTwoVisitors/:first_visitor_id/:second_visitor_id', cors(), traceUserSiteDataController.compareTwoVisitors);

//------------------------------------------------
// anyData
//------------------------------------------------
router.options('/data/anyData/*', cors()); //enabling CORS pre-flight
router.get('/data/anyData/', cors(), anyDataController.getAnyData);
router.post('/data/anyData/register', cors(), anyDataController.registerAnyData);
router.delete('/data/anyData/delete', cors(), anyDataController.deleteAllData);

module.exports = router;
