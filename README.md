# Aurora AI - Content Studio

Aurora AI is a powerful, serverless centralized AI content studio designed to help creators and marketers seamlessly transform their raw drafts, ideas, or scripts into highly optimized, platform-specific social media assets in seconds.

## Problem Statement
Content creation is fragmented. A single blog post needs to be rewritten manually for LinkedIn, shortened for Twitter, formatted for Instagram captions, and scripted for YouTube. Managing this takes significant time, and maintaining platform-specific tones is difficult without deeply nuanced AI prompt engineering.

## Solution
Aurora AI provides a unified "Create Once, Post Everywhere" interface. By feeding it a single source context, the AI automatically discerns the platform requirements and generates professional, ready-to-use content. 

## Current Working Features
- **Smart Generation**: Tailored outputs for Instagram, LinkedIn, YouTube, and Blogs.
- **Secure Authentication**: AWS Cognito Hosted UI with JWT validation via local session tracking.
- **Asset Management**: Save generated variants via a fallback local storage system for quick asset retrieval.
- **History Logs**: Temporary history tracking to reuse recent prompts and generations.
- **Export & Copy**: Instantly copy content to clipboard or download it as a raw `.txt` file.
- **Sleek UI/UX**: Dark mode, mesh gradients, glassmorphism, with toast notifications and dynamic markdown typing effects.

## AWS Services Used
- **Amazon Bedrock**: Core AI reasoning engine used to parse intents and generate tailored social media responses.
- **Amazon Cognito**: Used for user authentication, registration, and managing secure user session tokens via the Hosted UI.
- **AWS API Gateway**: The robust HTTP endpoint routing system connecting the frontend to AWS backend services.
- **AWS Lambda**: Acts as the serverless bridge executing the content generation payload logic.

## Architecture Summary
The frontend is a decoupled React application built using Vite and Tailwind CSS. All state and routing (via `react-router-dom`) is handled client-side. Authentication tokens passed back from AWS Cognito via the URL hash are intercepted, validated, and stored securely in `localStorage`. 
When generation requests are fired, the app makes authorized HTTP POST calls to the AWS API Gateway, triggering Lambda to pass the prompt into Amazon Bedrock. 
*(For full architecture details, refer to `ARCHITECTURE.md`)*

## Local Setup Steps
For detailed environment variables and local dependency setup, please refer to the `SETUP.md` document.
1. `npm install`
2. `npm run dev`

## Demo Flow
For a detailed scene-by-scene runbook of how to present this application at the hackathon, please read `DEMO_FLOW.md`.

## Folder Structure Overview
```text
aurora-app/
├── public/                 # Static assets
└── src/
    ├── pages/              # Core React Views (Dashboard, LandingPage, Auth flows)
    ├── auth.js             # Authentication & session decoding logic
    ├── config.js           # Shared app configurations & endpoints
    ├── main.jsx            # React root injection point
    ├── index.css           # Global Tailwind & Custom Animation rules
    └── App.jsx             # React Router hierarchy
```

## Future Scope
- **Connect Social Accounts**: Integrating Instagram/LinkedIn via OAuth to allow one-click publishing.
- **Document Ingestion**: Parsing PDF and Word docs via AWS Textract for long-form context summaries.
- **DynamoDB Persistence**: Migrating the saved assets and history log arrays currently utilizing browser `localStorage` gracefully into full AWS DynamoDB synchronization.

## Team / Credits
- **[Dhanush]** - Full Stack / Cloud Architect
- Created specifically for the **AI for Bharat Hackathon Prototype Development Phase**.
