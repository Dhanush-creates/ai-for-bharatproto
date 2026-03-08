# Local Setup Guide

Follow these steps to deploy and run Aurora AI locally for development or hackathon demonstration.

## Prerequisites
- Node.js (v16+)
- NPM or Yarn
- Access to an AWS Account with Bedrock, Cognito, and API Gateway configured (or access to the team's shared `.env` variables).

## Environment Variables
Create a `.env` file in the root of the `aurora-app` directory with your AWS parameters:

```env
VITE_COGNITO_DOMAIN=your-cognito-domain.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=your_cognito_app_client_id
VITE_API_BASE_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod
```

## Installation
1. Clone the repository and navigate into the app folder.
```bash
cd aurora-app
```
2. Install the necessary Node dependencies.
```bash
npm install
```

## Running the Application
1. Start the Vite development server.
```bash
npm run dev
```
2. The application will be available at `http://localhost:5173`. 
*(Note: If the application attempts to load on a different port, ensure Vite is configured correctly, otherwise AWS Cognito redirect URIs may fail).*

## Deployment Notes
For production deployment, the Vite frontend can be hosted via AWS Amplify Hosting or an S3 Static Website bucket.

Ensure that the **Callback URIs** and **Logout URIs** in your AWS Cognito User Pool configuration are updated to include your final production domain (e.g., `https://aurora-ai-demo.vercel.app/dashboard`).
