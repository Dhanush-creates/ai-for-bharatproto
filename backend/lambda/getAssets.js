// Lambda: GET /assets
// Returns all saved assets for the authenticated user, newest first.

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.ASSETS_TABLE || "aurora-assets";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};

exports.handler = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.jwt?.claims?.sub
            || event.requestContext?.authorizer?.claims?.sub;

        if (!userId) {
            return {
                statusCode: 401,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Unauthorized" }),
            };
        }

        const result = await ddb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": userId },
            ScanIndexForward: false,
            Limit: 50,
        }));

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ items: result.Items || [] }),
        };
    } catch (err) {
        console.error("getAssets error:", err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
