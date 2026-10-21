# AI Architecture

## Provider
Groq is the initial model provider. All model calls go through an internal AI service/provider layer so a future provider can replace or supplement Groq.

## AI Knowledge Center
The UI may call this "Train AI", but the primary implementation should be retrieval-augmented generation (RAG), not automatic model fine-tuning.

Authorized users can add knowledge from notes and supported documents/images. Target formats include PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, text and images, subject to safe extraction support.

## Ingestion Pipeline
Upload -> validate -> store original -> extract/normalize text -> classify metadata -> chunk -> index/embed using the selected retrieval approach -> permission/course scope -> publish to knowledge base.

## AI Experiences
- Student AI Tutor: constrained to the online student's permitted/enrolled learning context.
- Faculty AI: teaching assistance, question generation, summaries, content drafting.
- Employee AI: procedures, tasks and permitted institutional knowledge.
- Superadmin AI: permission-aware organization analytics and natural-language assistance.

## Tool-Based AI
Questions involving live ERP facts (fees, attendance, tasks, CRM) should use controlled server-side tools/queries rather than placing the whole database into a prompt.

## Security
- Never expose API keys client-side.
- AI inherits the user's permissions.
- Prevent cross-student/cross-role data leakage.
- Log sensitive AI tool actions.
- Treat uploaded content as untrusted.
- Require human confirmation for high-impact writes/communications.
- AI does not autonomously make disciplinary, employment or financial approval decisions.

## Example Capabilities
Course Q&A, quiz generation, notice drafting, multilingual drafting, student performance summaries, fee reminder drafts, CRM follow-up summaries, task summaries and management analytics.
