module.exports = {
  LOGGER: {
    CHECK_ACCESS_TOKEN: "CheckAccessTokenMiddleware",
    CHECK_WEBSITE_ID: "CheckWebsiteIdMiddleWare",
    CHECK_UUID: "CheckUuidMiddleware"
  },
  MESSAGES: {
    CHECK_WEBSITE_ID: {
      WRONG_ID: 'WRONG_ID',
      WEBSITE_NOT_FOUND: 'WEBSITE_NOT_FOUND',
      WEBSITE_UNDER_THE_MANAGEMENT_OF_OTHER: 'WEBSITE_UNDER_THE_MANAGEMENT_OF_OTHER'
    },
    CHECK_UUID: {
      LOG_NOT_FOUND: 'LOG_NOT_FOUND',
      WRONG_ID: 'WRONG_ID'
    }
  }
};