const UserConstant = require('../modules/user/user.constant');
const config = require('config');

const Tracking = config.get('tracking');

module.exports = {
  LOGGER: {
    USER_DUMP_DATA: "UserDumpData",
    WEBSITE_DUMP_DATA: "WebsiteDumpData"
  },
  DUMP_DATA: {
    USER: {
      usersInfo: ["master"],
      userDetail: {
        ["master"]: {
          username: 'master',
          role: UserConstant.ROLE.MASTER,
          email: "master2020@gmail.com"
        }
      }
    },
    WEBSITE: {
      websiteInfo: Tracking.webTracking,
      websiteDetail: {
        [Tracking.webTracking]: {
          domain: Tracking.webTracking
        }
      }
    }
  }
}