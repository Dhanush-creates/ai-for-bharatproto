# 🚀 Local Dev & Evaluation Setup Guide

Follow these steps exactly to deploy and evaluate the **Aurora AI** local Vite environment. 

## ✅ Prerequisites
- Node.js (v16+)
- NPM or Yarn
- Valid AWS environment variables (Your evaluator or team lead will provide these. The application requires an active Amazon Cognito user pool and API Gateway endpoint to authenticate and connect to Amazon Bedrock).

## 🗄️ Environment Variables Config
Create a `.env` file in the root of the `aurora-app` directory and securely input your AWS parameters:

```env
VITE_COGNITO_DOMAIN=your-cognito-domain.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=your_cognito_app_client_id
VITE_API_BASE_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod
```

## 📦 Installation
1. Clone the repository and navigate into the app folder.
```bash
git clone https://github.com/Dhanush-creates/ai-for-bharatproto.git
cd aurora-app
```
2. Rapidly install the strict Node dependencies (optimized for the Vite compiler).
```bash
npm install
```

## ⚡ Running the Serverless Application Local Engine
1. Start the Vite hot-reloading development server.
```bash
npm run dev
```
2. The application will immediately be available at `http://localhost:5173`. 
*(Note: If the application attempts to load on a different port due to conflicts, ensure Vite is configured correctly to port 5173, otherwise AWS Cognito strict redirect URIs will fail to validate).*

## 🌐 Production Deployment Architecture
For the final production deployment beyond the hackathon MVP, the React/Vite frontend is designed to be hosted via **AWS Amplify Hosting** or a secure **S3 Static Website bucket fronted by CloudFront**.

*Ensure that the **Callback URIs** and **Logout URIs** in your AWS Cognito User Pool configuration are permanently updated to include the final production domain (e.g., `https://aurora-ai-demo.vercel.app/dashboard`) before disabling `localhost` testing.*
