# Hackathon Demo Flow

This script outlines the exact user journey to follow during the live hackathon pitch to ensure all working features are demonstrated without hitting any unfinished edge cases.

## Step 1: The Landing Page
- **Start at:** `http://localhost:5173/`
- **Action:** Open the Landing Page. Wait 1-2 seconds to let the background mesh animations render natively.
- **Talking Point:** "Welcome to Aurora AI. The core problem we're solving is the fragmentation of content creation. Marketers waste hours formatting a single blog post into various social formats. Let's sign in."
- **Action:** Click **"Get Started Free"**.

## Step 2: Authentication
- **User Journey:** The app will redirect to the AWS Cognito Hosted UI (or the customized `/auth-dark` flow depending on the latest integration).
- **Action:** Complete the sign-in using the prepared test credentials.
- **Talking Point:** "We've fully integrated AWS Cognito to orchestrate secure session logic. It manages our JWT handshakes to ensure our Lambda functions are fully protected from unauthorized access."

## Step 3: The Dashboard Interface
- **User Journey:** The user is redirected back to `/dashboard`.
- **Action:** Point out the Sidebar on the left (showing the dynamically fetched user name/email from the JWT token) and the empty context blocks.
- **Talking Point:** "This is the Content Studio. Notice our UI gives priority to the 'Source Context'. You can feed Aurora a raw draft, notes, or bullet points."

## Step 4: Generation
- **Action:** Paste a sample paragraph of text into the "Source Context" box.
- **Talking Point:** "Watch what happens when I press Enter. Our backend hits AWS Step Functions and routes the intent into Amazon Bedrock."
- **Action:** Press **Enter** on the keyboard. Both buttons will disable and spin. 
- **User Journey:** The right panel will begin streaming the parsed markdown using a typing-effect animation.
- **Action:** Click the "LinkedIn" and "Instagram" tabs above the generated text to show how the context adapts strictly to the specific platform.

## Step 5: Post-Generation Utilities
- **Action:** Click the **⭐ Save** button. Explain that this locks the generated variant for later structural reuse.
- **Action:** Click the **Export** button. Open the `.txt` file that downloads to prove it works securely on the local machine.
- **Action:** Open the **"Saved Assets"** tab in the sidebar drawer to show the saved output there. Expand it and click the "Copy" icon.
- **Talking Point:** "Everything is designed to streamline the creative's workflow, enabling one click 'Create Once, Post Everywhere'."

## Wrap Up
- **Action:** Inform the judges of the placeholders (click "Connected Accounts" to show the modal) to highlight the future trajectory (OAuth posting), and conclude the demo.
