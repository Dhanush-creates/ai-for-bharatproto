# Aurora AI: AI-Powered Content Repurposing Platform 🚀

> **One-Line Pitch:** A serverless, AWS-native content logistics engine that transforms a single core idea into highly optimized, platform-specific social media assets in seconds.

---

## 🛑 The Problem
In today's digital landscape, content creation is heavily fragmented. Marketing teams and creators waste countless hours taking a single core idea (like a blog draft or raw notes) and manually rewriting, formatting, and tweaking it to fit the unique algorithm profiles of Instagram, LinkedIn, and YouTube. Maintaining consistent platform-specific tones without deeply nuanced prompt engineering is a major bottleneck.

## 💡 The Solution
**Aurora AI** solves this by providing a unified "Create Once, Post Everywhere" studio. By feeding the Bedrock-powered generation engine a single source context, the AI automatically discerns the specific platform constraints (character limits, hashtag density, professional vs. casual tone) and generates ready-to-publish content simultaneously across multiple platforms.

---

## ✨ Current Working MVP Features
*These features are fully functional and ready for live demonstration.*

- **Multi-Platform Content Generation:** Tailored, algorithm-optimized outputs for Instagram, LinkedIn, YouTube, and Blogs.
- **Secure Cognito Authentication:** Enterprise-grade security via AWS Cognito Hosted UI with JWT validation and protected local session tracking.
- **Dynamic Asset Management:** Users can save generated variants for quick retrieval (utilizing a high-speed `localStorage` fallback simulate DynamoDB responsiveness for the MVP).
- **History Tracking:** Automatic session logging to instantly reuse recent prompts and generations.
- **Export & Copy:** Instant clipboard functionality or raw `.txt` file downloading for cross-team sharing.
- **Modern UI/UX Architecture:** Dark mode, animated mesh gradients, glassmorphism, toast notifications, and dynamic markdown typing interfaces.

---

## 🛠 AWS-Native Architecture & Tech Stack

Aurora AI operates on a modern, decoupled serverless architecture to ensure high scalability.

### Core AWS Services Used:
1. **Amazon Bedrock:** The core AI reasoning engine. It parses user intent and generates tailored, high-quality social media responses.
2. **Amazon Cognito:** Manages user authentication, secure registration, and JWT session tokens securely.
3. **AWS API Gateway:** The robust HTTP endpoint routing system connecting the React frontend to the backend AWS infrastructure.
4. **AWS Lambda:** The serverless compute layer executing the content generation payload logic and bridging to Bedrock.

### Frontend Stack:
- **React.js (Vite)**
- **Tailwind CSS** (for responsive, utility-first styling)
- **React Router**

*(For a detailed technical and data flow breakdown, refer to [ARCHITECTURE.md](./ARCHITECTURE.md))*

---

## 🔄 End-to-End User Flow
1. **Login:** User authenticates via the secure AWS Cognito Hosted UI.
2. **Input Context:** User pastes raw notes, a messy draft, or bullet points into the `Source Context` studio.
3. **Generate:** The React frontend securely hits the API Gateway, passing the payload to Lambda and Bedrock.
4. **Review:** Bedrock automatically streams back platform-specific markdown variants (LinkedIn, Instagram, etc.).
5. **Save/Export:** The user clicks ⭐ `Save` to cache the asset in their library, or exports it directly to their machine.

*(For a detailed scene-by-scene runbook of the application demo, please read [DEMO_FLOW.md](./DEMO_FLOW.md))*

---

## 🚀 Local Setup Instructions

1. **Clone & Install**
   ```bash
   git clone https://github.com/Dhanush-creates/ai-for-bharatproto.git
   cd aurora-app
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file referencing your AWS infrastructure:
   ```env
   VITE_COGNITO_DOMAIN=<your-cognito-domain>
   VITE_COGNITO_CLIENT_ID=<your-client-id>
   VITE_API_BASE_URL=<your-api-gateway-url>
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   *(For full deployment instructions, see [SETUP.md](./SETUP.md))*

---

## 📁 Folder Structure Overview
```text
aurora-app/
├── public/                 # Static assets
└── src/
    ├── pages/              # Core React Views (Dashboard, LandingPage, AuthDark)
    ├── auth.js             # Authentication & session decoding logic
    ├── config.js           # Shared app configurations & API Gateway endpoints
    ├── main.jsx            # React root injection point
    ├── index.css           # Global Tailwind & Custom Animation rules
    └── App.jsx             # React Router hierarchy
```

---

## 🔮 Future Scope
While the current MVP demonstrates the core generation and auth loops, the architecture is designed to scale horizontally:
- **DynamoDB Persistence:** Fully migrating the simulated `localStorage` caches into robust multi-device DynamoDB tables.
- **Connected Accounts Personalization:** Users can connect Instagram and LinkedIn separately, allowing Aurora AI to analyze previous publishing patterns, engagement history, and unique tones to generate highly personalized, persona-based content.
- **Direct OAuth Publishing:** Connecting live social accounts to publish directly from the Aurora dashboard.
- **AWS Textract Integration:** Allowing users to seamlessly ingest multi-page PDF/Word context documents.

*(See [FUTURE_SCOPE.md](./FUTURE_SCOPE.md) for the full commercial roadmap).*

---

## 🤝 Team
- **[Dhanush]** - Full Stack / Cloud Architect
- *Created for the **AI for Bharat Hackathon Prototype Development Phase**.*
