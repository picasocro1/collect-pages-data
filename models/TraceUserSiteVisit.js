const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const minAgreementPercent = 80;
const minPrecisedAgreementPercent = 95;
const log = require('../handlers/log');

const TraceUserSiteVisit = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },

  visitor: {
    type: mongoose.Schema.ObjectId,
    ref: 'TraceUserSiteVisitor',
  },

  visitorData: {
    timeOpened: Date,
    href: { type: String, index: true },
    client: {
      browser: {
        browser: { type: String, index: true },
        engine: { type: String, index: true },
        engineVersion: { type: String, index: true },
        majorVersion: { type: String, index: true },
        userAgent: { type: String, index: true },
        version: { type: String, index: true }
      },
      components: {
        isCookie: Boolean,
        isFlash: Boolean,
        isFont: Boolean,
        isJava: Boolean,
        isLocalStorage: Boolean,
        isMimeTypes: Boolean,
        isSessionStorage: Boolean,
        isSilverlight: Boolean
      },
      device: {
        device: { type: String, index: true },
        type: { type: String, index: true },
        vendor: { type: String, index: true }
      },
      fingerprints: {
        low: { type: Number, index: true },
        medium: { type: Number, index: true },
        height: { type: Number, index: true }
      },
      fonts: { type: [String], index: 'text' },
      regional: {
        language: { type: String, index: true },
        systemLanguage: { type: String, index: true },
        timeZone: { type: String, index: true }
      },
      screen: {
        availableResolution: { type: String, index: true },
        colorDepth: { type: String, index: true },
        currentResolution: { type: String, index: true },
        deviceXDPI: { type: String, index: true },
        deviceYDPI: { type: String, index: true }
      },
      system: {
        CPU: { type: String, index: true },
        OS: { type: String, index: true },
        OSVersion: { type: String, index: true }
      }
    },
    debugInfo: {
      localStorage: mongoose.Schema.Types.Mixed
    },
    document: {
      cookie: String,
      referrer: String
    },
    geolocation: {
      asn: String,
      asn_number: Number,
      asn_org: String,
      city: String,
      connection_type: String,
      continent_code: String,
      country_code: String,
      country_name: String,
      currency_code: String,
      currency_name: String,
      district: String,
      hostname: String,
      ip: { type: String, index: true },
      isp: { type: String, index: true },
      location: {
        type: {
          type: String,
          default: 'Point'
        },
        coordinates: [{
          type: Number
        }],
      },
      org: String,
      postal_code: String,
      region: String,
      timezone_name: String
    },
    navigator: {
      appName: { type: String, index: true },
      product: { type: String, index: true },
      appVersion: { type: String, index: true },
      productSub: { type: String, index: true },
      userAgent: { type: String, index: true },
      language: { type: String, index: true },
      languages: { type: String, index: true },
      onLine: Boolean,
      platform: { type: String, index: true },
      javaEnabled: Boolean,
      cookieEnabled: Boolean,
    },
    screen: {
      availHeight: { type: Number, index: true },
      availWidth: { type: Number, index: true },
      colorDepth: { type: Number, index: true },
      height: { type: Number, index: true },
      orientation: {
        angle: { type: Number },
        type: { type: String }
      },
      pixelDepth: { type: Number, index: true },
      width: { type: Number, index: true }
    },
    window: {
      innerHeight: { type: Number, index: true },
      innerWidth: { type: Number, index: true },
      outerHeight: { type: Number, index: true },
      outerWidth: { type: Number, index: true }
    }
  }
}, { collection: 'trace-user-site-visits', usePushEach: true });

//compound indexes
/*
 TraceUserSiteVisit.index({
 'visitorData.client.system.CPU': 1,
 'visitorData.client.system.OS': 1,
 'visitorData.client.system.OSVersion': 1
 });

 TraceUserSiteVisit.index({
 'visitorData.client.device.device': 1,
 'visitorData.client.device.type': 1,
 'visitorData.client.device.vendor': 1
 });
 */

//plain index
TraceUserSiteVisit.index({
  'visitorData.geolocation.location': '2dsphere'
});

TraceUserSiteVisit.statics.findVisitorId = async function(visitorData) {
  let visit;

  //1. Find by fingerprints
  if (visitorData.client) {
    if (visitorData.client.fingerprints) {
      visit = await this.findOne({ 'visitorData.client.fingerprints.height': visitorData.client.fingerprints.height }).sort({ created: 1 }).exec();
      log('1. visit: ', visit);

      if (!visit) {
        visit = await this.findOne({ 'visitorData.client.fingerprints.medium': visitorData.client.fingerprints.medium }).sort({ created: 1 }).exec();
        log('2. visit: ', visit);
      }

      if (!visit) {
        visit = await this.findOne({ 'visitorData.client.fingerprints.medium': visitorData.client.fingerprints.medium }).sort({ created: 1 }).exec();
        log('3. visit: ', visit);
      }

      if (visit) {
        return visit.visitor;
      }
    }
  }

  //2. Find by system, device & fonts combination
  if (visitorData.client) {
    if (visitorData.client.fonts) {
      let systemMatchFilter = {
        'visitorData.client.system.CPU': visitorData.client.system.CPU,
        'visitorData.client.system.OS': visitorData.client.system.OS,
        'visitorData.client.system.OSVersion': visitorData.client.system.OSVersion,
      };

      let deviceMatchFilter = {};
      if (visitorData.client.system.device) {
        systemMatchFilter['visitorData.client.device.device'] = visitorData.client.device.device;
        systemMatchFilter['visitorData.client.device.deviceType'] = visitorData.client.device.type;
        systemMatchFilter['visitorData.client.device.deviceVendor'] = visitorData.client.device.vendor;
      }

      let minMatchNumber = Math.floor(visitorData.client.fonts.length * minAgreementPercent / 100);

      visit = await this.aggregate([
        { $match: { $text: { $search: visitorData.client.fonts.join(' ') } } },
        { $match: systemMatchFilter },
        { $match: deviceMatchFilter },
        { $addFields: { score: { $meta: "textScore" } } },
        { $match: { score: { $gte: minMatchNumber } } }, //limit query
        { $sort: { score: -1 } },
        { $limit: 1 }
      ]);

      if (visit && visit.length > 0) {
        visit = visit[0];

        if (Math.min(visitorData.client.fonts.length, visit.visitorData.client.fonts.length) / Math.max(visitorData.client.fonts.length,
            visit.visitorData.client.fonts.length) * 100 < minAgreementPercent) {
          visit = undefined;
        }

        if (visit) {
          //check precised score
          let minPrecisedMatchNumber = Math.floor(Math.min(visitorData.client.fonts.length, visit.visitorData.client.fonts.length) * minPrecisedAgreementPercent / 100);

          log('• minPrecisedMatchNumber: ' + minPrecisedMatchNumber);
          log('• visit.score: ' + visit.score);

          if (visit.score < minPrecisedMatchNumber) {
            visit = undefined;
          }
        }
      }

      log('4. visit: ', visit);

      if (visit) {
        return visit.visitor;
      }
    }
  }
};

module.exports = mongoose.model('TraceUserSiteVisit', TraceUserSiteVisit);