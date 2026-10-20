/**
 * Standard API response formatting helpers.
 * Ensures consistent JSON payloads and integrates telemetry for the Judge's Prompt X-Ray Drawer.
 */

const sendSuccess = (res, data, promptTelemetry = null, status = 200) => {
  const payload = {
    success: true,
    data,
  };

  if (promptTelemetry) {
    payload.promptTelemetry = promptTelemetry;
  }

  return res.status(status).json(payload);
};

const sendError = (res, message = 'Internal Server Error', status = 400, details = null) => {
  const payload = {
    success: false,
    error: message,
  };

  if (details) {
    payload.details = details;
  }

  return res.status(status).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
