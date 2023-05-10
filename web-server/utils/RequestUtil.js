const HttpStatus = require('http-status-codes');

const joiValidationResponse = (err, res) => {
  const messages = err.details.map(detail => {
    return detail.message;
  });
  const result = {
    status: HttpStatus.BAD_REQUEST,
    messages: messages,
    data: {}
  };
  return res.status(HttpStatus.BAD_REQUEST).json(result);
};

module.exports = {
  joiValidationResponse
};
