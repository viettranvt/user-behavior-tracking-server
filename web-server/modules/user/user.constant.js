module.exports = {
  MESSAGES: {
    LOGIN: {
      MAIL_NOT_FOUND_OR_PASSWORD_NOT_MATCH: "MAIL_NOT_FOUND_OR_PASSWORD_NOT_MATCH",
      LOGIN_SUCCESSFULLY: "LOGIN_SUCCESSFULLY"
    },
    GET_USER_INFO: {
      GET_USER_INFO_SUCCESSFUL: "GET_USER_INFO_SUCCESSFUL"
    },
    UPDATE_PASSWORD: {
      NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH: "NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH",
      CURRRENT_PASSWORD_NOT_MATCH: "CURRRENT_PASSWORD_NOT_MATCH",
      UPDATE_PASSWORD_SUCCESSFULLY: "UPDATE_PASSWORD_SUCCESSFULLY"
    }
  },
  LOGGER: {
    USER_CONTROLLER: "UserController",
    USER_SERVICE: "UserService"
  },
  SALT_LENGTH: 10,
  ROLE: {
   MASTER: 1,
   ADMIN: 2,
   USER: 3
  }
};
