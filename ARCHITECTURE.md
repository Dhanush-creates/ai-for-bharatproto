# Serverless AWS Architecture

Aurora AI operates on a modern, decoupled serverless architecture to ensure high scalability, rapid responsiveness, and enterprise-grade security.

## 🖥 Frontend Architecture
The frontend is a strictly typed (via prop conventions) React application compiled natively via Vite.
- **Component Pattern**: Container vs. presentational logic is strategically separated across route-level pages (e.g., `Dashboard.jsx`, `LandingPage.jsx`).
- **State Management**: React Context and Hooks (`useState`, `useEffect`) govern all UI states.
- **Cache Simulation**: To ensure zero-latency demonstrations during the MVP phase, `localStorage` acts as a high-speed temporary persistent cache for Saved Assets and History, simulating the eventual AWS DynamoDB integration.
- **CSS Architecture**: Tailwind CSS relies heavily on utility classes, `border/background` opacity scaling for glassmorphism, and custom animations optimized in `index.css`.

## 🔐 Security & Authentication Flow
Security is handled entirely via **Amazon Cognito**, ensuring a zero-trust model.
1. **Unauthenticated User**: Lands on `/` (Landing Page) and clicks "Get Started".
2. **Cognito Hosted UI**: User is redirected to the scalable, AWS-hosted Cognito domain.
3. **Registration / Login**: User signs in or creates an account (enforcing strict email verification).
4. **Callback**: AWS securely redirects back to `/dashboard#id_token=...&access_token=...`.
5. **Session Management**: The frontend (`auth.js`) intercepts the hash, extracts the `id_token`, saves it locally alongside token expiration times, and completely strips the URL to prevent token leakage.
6. **Protected Routes**: `/dashboard` validates `isSessionValid()`. If the JWT fails validation, the user is forcefully dropped back to the login page.

## ⚙️ Backend API & Bedrock Data Flow
For AI generation requests:
1. The user inputs text into the `Source Context` UI.
2. A `POST` request is fired to the **AWS API Gateway** endpoint (`/generate`), explicitly including the `Authorization: Bearer <token>` header derived from Cognito.
3. **Serverless Orchestration (AWS Lambda)**: The API Gateway forwards the authorized request to an AWS Lambda function.
4. **AI Reasoning (Amazon Bedrock)**: Lambda interfaces directly with Amazon Bedrock to securely generate the contextualized, multi-platform content string.
5. **Frontend Retrieval**: The React app catches the JSON response, initiates the `typing effect` animation, and stores the text in the active platform state.

## 🚀 Deployment Strategy
The Vite build is designed to be hosted seamlessly via **AWS Amplify Hosting** or a secure **S3 Static Website** bucket fronted by **CloudFront**, ensuring global edge-cache availability.
