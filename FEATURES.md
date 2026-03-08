# Aurora AI Features

## 🟢 Working Features (Demo Ready)
- **Authentication**: Fully functional AWS Cognito Hosted UI integration with sign-up, sign-in, verification, and logout flows. Includes secure session caching.
- **Content Generation**: Real-time connection to the AWS Bedrock REST API.
- **Dynamic Output Parsing**: Generates properly formatted content tailored specifically to the selected active platform (Instagram, LinkedIn, YouTube, Blog).
- **History Viewer**: Automatically saves prompt session logs. Users can view and delete them, or click "Reuse Prompt" to load a past prompt back into the editor.
- **Saved Assets**: Users can click the "Save" icon on a generated output to permanently store it. They can view all saved assets via the sidebar and instantly copy or reload them into the editor. *(Note: Currently utilizing `localStorage` to ensure stability for the hackathon demo)*
- **Export**: Users can export the generated AI text into a downloadable `.txt` file directly to their local desktop.
- **Clean UI**: Modern, glassmorphic styling layered onto a dynamic background gradient with full mobile responsiveness (collapsing sidebar).

## 🟡 Demo-Safe Placeholders (Graceful Fallbacks)
To ensure the hackathon demonstration is polished and professional, unfinished modules provide informative popup `toast` notifications rather than breaking the application flow.
- **Settings / Workspace Panel**: Returns "Settings panel coming soon!"
- **Upload Reference File**: Returns "File upload coming soon! Paste text below instead."
- **Connected Accounts Integration**: Triggers a functional modal UI with "Coming Soon" alerts for OAuth integrations.
- **Tone Variations**: Clicking "Friendly" or "Witty" alerts that "Additional tones coming soon!"
- **Manual Output Edit Box**: Instructs users that "Manual editing is coming soon!".

## 🔴 Future Planned Features
- Full AWS API Gateway + DynamoDB synchronization for cross-device Asset management.
- Multi-document embeddings (PDF, Docx ingestion) via AWS Textract for long-form context reasoning.
- Stripe billing integration.
