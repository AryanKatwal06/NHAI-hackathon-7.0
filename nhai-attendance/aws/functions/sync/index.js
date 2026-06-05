/**
 * aws/functions/sync/index.js
 * Lambda function: Receives batch sync payloads from mobile devices.
 * Stores attendance records in DynamoDB.
 *
 * For field attendance application, the app uses OfflineSyncService instead of this Lambda.
 * This code demonstrates the production architecture.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'nhai-field attendance-project-prod';

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key,Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const records = body.records || [];

    if (!Array.isArray(records) || records.length === 0) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'No records provided' }) };
    }

    // Validate and transform records for DynamoDB
    const putRequests = records.map((record) => ({
      PutRequest: {
        Item: {
          pk: `WORKER#${record.workerId}`,
          sk: `AUTH#${record.authAttemptId}`,
          worksiteId: record.worksiteId,
          authAttemptId: record.authAttemptId,
          workerId: record.workerId,
          employeeId: record.employeeId,
          trustScore: record.trustScore,
          decision: record.decision,
          signals: record.signals,
          timestamp: record.timestamp,
          deviceFingerprint: record.deviceFingerprint,
          syncedAt: new Date().toISOString(),
        },
      },
    }));

    // DynamoDB BatchWrite supports max 25 items per call
    const batches = [];
    for (let i = 0; i < putRequests.length; i += 25) {
      batches.push(putRequests.slice(i, i + 25));
    }

    const syncedIds = [];
    const failedIds = [];

    for (const batch of batches) {
      try {
        await docClient.send(new BatchWriteCommand({
          RequestItems: { [TABLE_NAME]: batch },
        }));
        batch.forEach((item) => syncedIds.push(item.PutRequest.Item.authAttemptId));
      } catch (batchErr) {
        console.error('Batch write failed:', batchErr);
        batch.forEach((item) => failedIds.push(item.PutRequest.Item.authAttemptId));
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        syncedIds,
        failedIds,
        syncedCount: syncedIds.length,
        failedCount: failedIds.length,
      }),
    };
  } catch (error) {
    console.error('Sync handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};
