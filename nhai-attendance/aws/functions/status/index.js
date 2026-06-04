/**
 * aws/functions/status/index.js
 * Lambda function: Health check endpoint for the sync service.
 * Returns service status and current timestamp.
 */

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'OK',
      service: 'nhai-hackathon-project-sync',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      region: process.env.AWS_REGION || 'ap-south-1',
    }),
  };
};
