const config = require('config');
const Tracking = config.get('tracking')

module.exports = {
  LOGGER: {
    WEBSITES_CONTROLLER: "WebsitesController",
    WEBSITES_SERVICES: "WebsitesService"
  },
  MESSAGES: {
    GET_WEBSITES_LIST: {
      GET_WEBSITES_LIST_SUCCESSFULLY: "GET_WEBSITES_LIST_SUCCESSFULLY"
    },
    CHECK_DOMAIN_TRACKING_CODE: {
      VERIFY_DOMAIN_AND_CODE_ATTACHED_SUCCESSFULLY: "VERIFY_DOMAIN_AND_CODE_ATTACHED_SUCCESSFULLY"
    }
  },
  TRACKING_SCRIPT: `src="${Tracking.trackingScript}?key={code}"`,
};