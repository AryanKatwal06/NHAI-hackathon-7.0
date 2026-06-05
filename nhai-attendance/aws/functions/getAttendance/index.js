/**
 * aws/functions/getAttendance/index.js
 * Lambda function: Retrieves attendance records for a given worksite.
 * Queries DynamoDB using the WorksiteIndex GSI.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'nhai-field attendance-project-prod';

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const worksiteId = event.pathParameters?.worksiteId;
    if (!worksiteId) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'worksiteId is required' }) };
    }

    const date = event.queryStringParameters?.date || new Date().toISOString().split('T')[0];
    const limit = parseInt(event.queryStringParameters?.limit || '50', 10);

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'WorksiteIndex',
      KeyConditionExpression: 'worksiteId = :wid AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: {
        ':wid': worksiteId,
        ':prefix': 'AUTH#',
      },
      Limit: limit,
      ScanIndexForward: false,
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        worksiteId,
        date,
        records: result.Items || [],
        count: result.Count || 0,
      }),
    };
  } catch (error) {
    console.error('GetAttendance error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};
