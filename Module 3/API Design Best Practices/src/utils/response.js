export function sendSuccess(res, statusCode, data, meta = null) {
  const response = { data };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
}

export function sendError(res, statusCode, code, message, details = null) {
  const response = {
    error: {
      code,
      message,
    },
  };
  if (details) {
    response.error.details = details;
  }
  return res.status(statusCode).json(response);
}