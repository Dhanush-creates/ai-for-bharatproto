// Lambda: POST /assets/save
// Saves generated content as a reusable asset in DynamoDB.

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

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

        const body = JSON.parse(event.body || "{}");
        const { platform, content } = body;

        if (!platform || !content) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Missing platform or content" }),
            };
        }

        const assetId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await ddb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                userId,
                assetId,
                platform,
                content,
                createdAt,
            },
        }));

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                message: "Asset saved",
                assetId,
                createdAt,
            }),
        };
    } catch (err) {
        console.error("saveAsset error:", err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
