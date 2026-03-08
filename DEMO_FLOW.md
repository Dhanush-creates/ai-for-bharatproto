# 🎥 Prototype Demo Sequence

This script details the exact evaluation user journey. Evaluators and presentation judges should follow this flow to experience the full end-to-end serverless AWS application without hitting any planned tertiary `Coming Soon` placeholders.

## 🎬 1. The Landing & Auth Gateway
- **Start at:** `http://localhost:5173/`
- **Action:** Open the Landing Page. Observe the smooth native CSS mesh gradient rendering.
- **Narrative:** "Welcome to Aurora AI. The core problem we're solving is the fragmentation of content creation. Marketers waste hours formatting a single blog post into various social formats. By clicking 'Get Started Free', you trigger our secure Amazon Cognito authentication handshake."
- **Action:** Sign in using the valid provided test credentials.

## 🧠 2. The Studio & AWS API Bridge
- **User Journey:** Following login verification, the JWT token successfully redirects to `/dashboard` and the UI mounts.
- **Action:** Point out the Sidebar on the left (dynamically formatting the user's name from the JWT payload). 
- **Action:** Paste a sample paragraph of rough, unformatted text into the **Source Context** box.
- **Narrative:** "Watch what happens when I press Enter. Our React frontend fires an authorized HTTP payload to the AWS API Gateway, routing through Lambda directly into Amazon Bedrock's generation engine."
- **Action:** Press **Enter** on the keyboard. Both buttons disable seamlessly to prevent duplicate async requests.

## ✍️ 3. Output Observation
- **User Journey:** The right panel will begin "streaming" the parsed markdown variants dynamically.
- **Action:** Click the "LinkedIn" and "Instagram" tabs above the generated text.
- **Narrative:** "You can see that the content adapts strictly to the specific algorithm. The LinkedIn post is professional and structured, while the Instagram caption automatically incorporates spacing, emojis, and higher hashtag densities—all from the single source intent."

## 💾 4. Persistence & Export Utilities
- **Action:** Click the **⭐ Save** button. Explain that this simulated cache locks the generated asset for structural reuse.
- **Action:** Click the **Export** button. Open the `.txt` file that securely downloads to prove the data leaves the app safely.
- **Action:** Finally, open the right-hand **Saved Assets** drawer to prove the asset is stored safely in the payload structure, highlighting our readiness to migrate the arrays to DynamoDB post-hackathon.

## 🏁 5. Evaluation Conclusion
- **Action:** Politely click the **Connected Accounts** modal to highlight the "Coming Soon" future-scope (OAuth API posting).
- **Narrative:** "Aurora isn't a simple text wrapper; it's a serverless AWS-native content logistics engine built to scale rapidly. Thank you for evaluating."
