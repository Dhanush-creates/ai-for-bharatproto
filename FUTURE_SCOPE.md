# Post-Prototype Scaling & Future Scope

The Aurora AI architecture was intentionally designed to be decoupled and serverless, allowing for rapid horizontal scaling post-hackathon.

## 1. DynamoDB Persistence Layer
**Current State:** History logs and saved assets currently utilize a highly responsive browser `localStorage` simulated cache to guarantee zero-latency presentation stability.
**Future Scope:** Fully migrating these JSON arrays into a partitioned **AWS DynamoDB** table structure (Partition Key: `userId` from Cognito). This will enable seamless cross-device synchronization and robust asset querying.

## 2. Direct OAuth Social Publishing
**Current State:** Users must copy or export their optimized assets and post them manually.
**Future Scope:** Implementing direct OAuth 2.0 integrations inside the "Connected Accounts" modal. This will allow Aurora AI to act as an automated scheduling and publishing engine, pushing generated Bedrock content directly to LinkedIn and Instagram APIs with a single click.

## 3. Platform History-Aware Content Generation
**Current State:** The Bedrock prompt relies purely on the user's explicit input string to determine context.
**Future Scope:** Once social accounts are connected via OAuth, a new data pipeline will fetch and analyze previous post history for each user. By understanding historical posting styles, tone nuances, and engagement metrics, Aurora AI will offer **Persona-Based Content Repurposing**. This history-aware analysis unlocks advanced generation modes, such as automatically suggesting engagement-aware rewrites and audience-aligned content tailored directly to the creator's precise digital footprint.

## 4. AWS Textract Document Ingestion
**Current State:** The "Source Context" box accepts raw text strings copy-pasted by the user.
**Future Scope:** Activating the "Upload Reference File" drop-zone. Uploaded PDFs, images, or Word Documents will be securely uploaded to an S3 bucket, triggering an AWS Textract pipeline to strip the raw OCR text and invisibly inject it into the Bedrock prompt context window for massive long-form summarization.

## 5. Nuanced Personality Overrides
**Current State:** Outputs are generated accurately to the specific platform's structural logic (e.g., standard professional LinkedIn posts vs. hashtag-heavy Instagram posts).
**Future Scope:** Unlocking the "Professional / Witty / Friendly" tone toggle buttons in the dashboard header. This will inject specific system constraints into the Bedrock prompt layer, allowing brand agencies to maintain highly specific personality profiles.

## 6. Stripe Billing & SaaS Subscriptions
**Current State:** Full unrestricted generation access for authenticated test users.
**Future Scope:** Gating the API Gateway routes behind an AWS Lambda Auth layer that checks a Stripe subscription database table, effectively monetizing the "PRO" tier functionality.
