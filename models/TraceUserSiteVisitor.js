const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
mongoose.Promise = global.Promise;
const TraceUserSiteVisit = mongoose.model('TraceUserSiteVisit');

const TraceUserSiteVisitor = new mongoose.Schema({
    created: {
      type: Date,
      default: Date.now
    },
    name: {
      type: String,
      default: uuidv4()
    }
  },
  { collection: 'trace-user-site-visitors', toJSON: { virtuals: true }, toObject: { virtuals: true }/*, usePushEach: true*/ });

TraceUserSiteVisitor.statics.findFirstVisit = async function(visitor_id) {
  if (visitor_id !== undefined) {
    return await TraceUserSiteVisit.findOne({ visitor: visitor_id }).sort({ created: 1 }).exec();
  } else {
    return null;
  }
};

TraceUserSiteVisitor.statics.findVisits = async function(visitor_id) {
  if (visitor_id !== undefined) {
    return await TraceUserSiteVisit.find({ visitor: visitor_id }).select(
      'created visitorData.client.browser.browser visitorData.client.browser.version visitorData.geolocation.ip visitorData.geolocation.country_code visitorData.geolocation.location.coordinates').sort(
      { created: -1 }).exec();
  } else {
    return null;
  }
};

TraceUserSiteVisitor.statics.createNewVisitor = async function(visitData) {
  return await (new this({}).save());
};

//find visits where the visitor _id property === visits visitor property
TraceUserSiteVisitor.virtual('visits', {
  ref: 'TraceUserSiteVisit', //what model to link?
  localField: '_id', //which field on the visitor?
  foreignField: 'visitor' //which field on the visit?
});

module.exports = mongoose.model('TraceUserSiteVisitor', TraceUserSiteVisitor);