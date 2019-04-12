const mongoose = require('mongoose');
const TraceUserSiteVisitor = mongoose.model('TraceUserSiteVisitor');
const TraceUserSiteVisit = mongoose.model('TraceUserSiteVisit');
const log = require('../handlers/log');

exports.createNewVisitor = async(req, res) => {
  try {
    let visit = {
      visitorData: req.body
    };
    visit.visitor = await TraceUserSiteVisitor.createNewVisitor(visit.visitorData);
    await (new TraceUserSiteVisit(visit).save());
    res.json({ result: 'success' });
  } catch (err) {
    res.json({ result: 'failure', error: err });
  }
};

exports.checkVisitor = async(req, res) => {
  try {
    const visitor = await TraceUserSiteVisitor.findById(await TraceUserSiteVisit.findVisitorId(req.body)).exec();

    log('checkVisitor: ', visitor);

    res.json({ result: 'success', data: visitor });
  } catch (err) {
    res.json({ result: 'failure', error: err });
  }
};

exports.getFirstVisit = async(req, res) => {
  try {
    log('visitor_id: ' + req.params.visitor_id);

    const firstVisit = await TraceUserSiteVisitor.findFirstVisit(req.params.visitor_id);

    log('getFirstVisit: ', firstVisit);

    res.json({ result: 'success', data: firstVisit });
  } catch (err) {
    res.json({ result: 'failure', error: err });
  }
};

exports.getVisitorHistory = async(req, res) => {
  try {
    log('visitor_id: ' + req.params.visitor_id);

    const visitor = await TraceUserSiteVisitor.findOne({ _id: req.params.visitor_id }).populate('visits').exec(); //populate virtual column visits

    log('getVisitorHistory: ', visitor);

    res.json({ result: 'success', data: visitor });
  } catch (err) {
    res.json({ result: 'failure', error: err });
  }
};

exports.getVisitorVisits = async(req, res) => {
  try {
    log('visitor_id: ' + req.params.visitor_id);
    const visits = await TraceUserSiteVisitor.findVisits(req.params.visitor_id);
    log('getVisitorVisits: ', visits);

    res.json({ result: 'success', data: visits });
  } catch (e) {
    res.json({ result: 'failure', error: e });
  }
};

exports.registerVisit = async(req, res) => {
  log('registerVisit');
  let results = {
    data: {}
  };

  let visit = {
    visitorData: req.body
  };

  let visitor;

  try {
    //try to find visitor
    visitor = await TraceUserSiteVisit.findVisitorId(req.body);

    if (visitor) {
      log('registerVisit: visitor exists');
      results.data.newVisitor = false;
      visit.visitor = visitor;
    } else {
      log('registerVisit: create new visitor');
      results.data.newVisitor = true;
      try {
        visit.visitor = await TraceUserSiteVisitor.createNewVisitor(visit.visitorData);
        visitor = visit.visitor;
      } catch (err) {
        results = { result: 'failure', error: err };
      }
    }
  } catch (err) {
    results = { result: 'failure', error: err };
  }

  if (!results.result) {
    //save visit
    try {
      log('registerVisit: try to find previous visits');

      results.data.visitor = await TraceUserSiteVisitor.findById(visitor._id).exec();
      results.data.visits = await TraceUserSiteVisitor.findVisits(visitor._id);

      try {
        log('registerVisit: try to register current visit');

        if (visit.visitorData.geolocation == undefined) {
          visit.visitorData.geolocation = {
            location: {
              type: 'Point',
              coordinates: [0, 0]
            }
          };

        }
        await (new TraceUserSiteVisit(visit).save());
        results.result = 'success';
      } catch (err) {
        results = { result: 'failure', error: err };
      }
    } catch (err) {
      results = { result: 'failure', error: err };
    }
  }

  res.json(results);
};

exports.visitorChange = async(req, res) => {
  log('visitorChange: ' + req.params.visitor_id + "; " + req.body.name);

  let results = {};

  if (req.params.visitor_id === undefined || req.body.name === undefined) {
    results = { result: 'failure', error: err };
  } else {
    try {
      await TraceUserSiteVisitor.findByIdAndUpdate(req.params.visitor_id, {
        $set: { name: req.body.name }
      });

      results.result = "success";
    } catch (err) {
      results = { result: 'failure', error: err };
    }
  }

  res.json(results);
};