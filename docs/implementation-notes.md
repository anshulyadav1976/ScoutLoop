# Implementation Notes

## Keep the original chatbot template useful

The Vercel Chatbot template has rich chat functionality. Do not delete core template features unless necessary. Instead, add ScoutLoop as a dedicated route or primary mode.

## Primary route recommendation

Use:

```txt
/scoutloop
```

The homepage can redirect there for demo if helpful.

## State management

For hackathon MVP:

- Use React state for active run.
- Use localStorage for last evaluation if needed.
- Use server memory fallback for lesson demo if Mubit is unavailable.

## API route design

### `POST /api/scoutloop/evaluate`

Starts WDK workflow if enabled.

Body:

```json
{
  "url": "https://example.com",
  "pitchText": "...",
  "uploadedTexts": [],
  "mode": "startup_judge"
}
```

### `POST /api/scoutloop/evaluate-direct`

Direct fallback route without WDK.

### `POST /api/scoutloop/feedback`

Stores evaluator feedback and returns lessons.

### `POST /api/scoutloop/rerun`

Reruns evaluation with lessons applied.

## File upload

Do file reading on the client using `FileReader` or `file.text()`.

Do not upload binary files to server.

## Prompt composition

Evaluation prompt should include:

1. Selected mode
2. User URL
3. Pitch text
4. Uploaded text
5. Evidence cards
6. Mubit lessons
7. Scoring rubric
8. Output schema instruction

## Safety and quality

The product is a decision-support tool, not final investment advice.

Add footer note:

```txt
ScoutLoop provides evidence-backed evaluation support, not financial advice or final investment decisions.
```
