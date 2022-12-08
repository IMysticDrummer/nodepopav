'use strict';

class APIError {
  all(req, res, next) {
    const status = 404;

    const response = {
      status,
      error: "API page doesn't found",
    };
    res.status(status);
    res.json(response);
    return;
  }
}

module.exports = APIError;
