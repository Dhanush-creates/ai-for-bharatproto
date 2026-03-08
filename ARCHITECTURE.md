# Architecture

Aurora AI operates on a modern, decoupled serverless architecture to ensure high scalability and responsiveness.

## Frontend Architecture
The frontend is a strictly typed (via prop conventions) React application built on Vite. It uses:
- **Component Pattern**: Container vs presentational logic separated out across route-level pages (e.g. `Dashboard.jsx`, `LandingPage.jsx`).
- **State Management**: React Context / Hooks (`useState`, `useEffect`) govern UI states, while `localStorage` acts as a temporary persistent cache for Saved Assets and History (as a fallback for incomplete AWS backend routes).
- **CSS Architecture**: Tailwind CSS relies heavily on utility classes, `border/background` opacity scaling for glassmorphism, and custom animations in `index.css`.

## Authentication Flow
Security is handled entirely via **AWS Cognito**.
1. **Unauthenticated User**: Lands on `/` (Landing Page). Clicks "Log In".
2. **Cognito Hosted UI**: User is redirected to the AWS-hosted Cognito domain.
3. **Registration / Login**: User signs in or creates an account (requires email verification).
4. **Callback**: AWS redirects back to `/dashboard#id_token=...&access_token=...`.
5. **Session Management**: The frontend (`auth.js`) intercepts the hash, extracts the `id_token`, saves it to `localStorage` alongside expiration times, and strips the URL to prevent token leakage.
6. **Protected Routes**: `/dashboard` validates `isSessionValid()`. If failed, it drops the user back to the login page.

## API & Data Flow
For generation requests:
1. The user inputs text into the `<textarea>`.
2. A `POST` request is fired to the AWS API Gateway endpoint (`/generate`) including the `Authorization: Bearer <token>` header.
3. **Backend Processing (AWS)**: The gateway forwards the request to an AWS Lambda function which interacts with Amazon Bedrock to generate the parsed content string.
4. **Frontend Retrieval**: The React app catches the JSON response, initiates the `typing effect` animation, and stores the text in component state.

*Note: For the current hackathon MVP, the `/assets/save` routes use a simulated fallback pointing directly to window `localStorage` since the API Gateway routes for DB interactions are pending deployment.*
