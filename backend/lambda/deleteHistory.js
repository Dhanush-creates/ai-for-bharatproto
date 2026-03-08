// Lambda: DELETE /history/{requestId}
// Deletes a single history item for the authenticated user.

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.HISTORY_TABLE || "aurora-history";

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

        const requestId = event.pathParameters?.requestId;
        if (!requestId) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Missing requestId" }),
            };
        }

        await ddb.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                userId: userId,
                requestId: requestId,
            },
            ConditionExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": userId },
        }));

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: "Deleted successfully" }),
        };
    } catch (err) {
        // ConditionalCheckFailedException = item doesn't belong to user or doesn't exist
        if (err.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Item not found" }),
            };
        }
        console.error("deleteHistory error:", err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
