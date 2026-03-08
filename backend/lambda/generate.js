// Lambda: POST /generate
// Calls Amazon Bedrock for AI content generation and saves to history.

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const crypto = require("crypto");

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

const HISTORY_TABLE = process.env.HISTORY_TABLE || "aurora-history";
const MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};

// Platform-specific prompts
const platformPrompts = {
    instagram: "Create an engaging Instagram caption with relevant hashtags and emojis. Keep it under 300 words. Make it visually appealing and use line breaks for readability.",
    linkedin: "Create a professional LinkedIn post. Use a compelling hook, provide value-driven insights, include a call-to-action, and keep it under 500 words. Use a professional but approachable tone.",
    youtube: "Create a YouTube video description including: an attention-grabbing first line, video summary, timestamps placeholder, relevant keywords, and a call-to-action for likes/subscribes.",
    blog: "Create a well-structured blog post with: a compelling title, introduction hook, 3-4 main sections with subheadings, and a conclusion with call-to-action. Use markdown formatting.",
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
        const { text, platform = "instagram" } = body;

        if (!text || !text.trim()) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Missing text input" }),
            };
        }

        const systemPrompt = platformPrompts[platform] || platformPrompts.instagram;
        const userPrompt = `Based on the following source material, ${systemPrompt}\n\nSource material:\n${text}`;

        // Call Bedrock (Claude 3 Haiku)
        const bedrockResponse = await bedrock.send(new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1024,
                messages: [
                    { role: "user", content: userPrompt },
                ],
            }),
        }));

        const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
        const generatedContent = responseBody.content?.[0]?.text || "";

        // Save to history
        const requestId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await ddb.send(new PutCommand({
            TableName: HISTORY_TABLE,
            Item: {
                userId,
                requestId,
                route: "/generate",
                createdAt,
                request: { text, platform },
                response: { platform, result: generatedContent },
            },
        }));

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                result: generatedContent,
                requestId,
                platform,
            }),
        };
    } catch (err) {
        console.error("generate error:", err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Generation failed", details: err.message }),
        };
    }
};
