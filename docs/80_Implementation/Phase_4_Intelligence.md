# Phase 4: Intelligence & AI (4-6 weeks)

> Differentiation: predictive analytics, AI-powered reports, personalized learning, AI tutor, smart communication.
> **Effort:** 16-24 engineer-weeks (1-2 devs + AI engineer, 4-6 weeks)
> **Depends on:** Phase 2 (attendance, marks data for analytics) + Phase 3 (fee data for predictions, comms channels)

---

## Task Checklist

### Week 1-2: Predictive Analytics
- [ ] **Drop-out risk model** — combines signals:
  - Attendance trend (< 75% is high risk)
  - Marks trend (declining across terms)
  - Fee payment pattern (late > 3 months)
- [ ] **Fee default prediction** — based on historical payment timing per parent
- [ ] **Teacher workload balancer** — "Mr. X is over-allocated (32 periods/week), redistribute"
- [ ] **Early warning dashboard**: red/amber/green per student
  - Red: ≥ 2 risk factors
  - Amber: 1 risk factor
  - Green: no risk factors
- [ ] Risk factor drill-down: click student → see which factors triggered

### Week 3: AI-Powered Reports
- [ ] **Auto-report-card-comments**: "Rahul shows strong analytical skills in Mathematics. He would benefit from additional practice in Geometry."
  - Input: subject-wise marks, attendance, teacher notes
  - Output: 2-3 sentence personalized comment per subject
  - LLM: Gemini / Claude / OpenAI (configurable per school)
- [ ] **Auto-summarize student progress**: one-paragraph summary for parent meetings
- [ ] **Smart notice drafting**: teacher types bullet points → LLM generates polished notice
- [ ] **Prompt library**: reusable, school-customizable prompt templates

### Week 4-5: Personalized Learning (Optional)
- [ ] **Weak-topic identification** per student from marks data
  - "Student X struggles with: Quadratic Equations, Chemical Bonding, French Revolution"
  - Mapped to subject syllabus topics
- [ ] **Adaptive quizzes**: difficulty adjusts to student performance
- [ ] **Recommendation engine**: "Based on weak areas, practice these 5 questions"
- [ ] Integration with optional LMS module (video lessons, external quiz platforms)

### Week 5-6: AI Tutor (Premium Add-On)
- [ ] **24/7 chatbot for students**:
  - Topic-bounded: only answers curriculum questions
  - Refuses off-topic: "I can only help with your Class 7 Science syllabus"
  - Powered by Gemini / Claude / OpenAI (school configures provider)
- [ ] **Multilingual support**: English, Hindi, regional languages (as school configures)
- [ ] **Parent-facing version**: "Explain my child's progress in plain language"
  - Input: raw marks + attendance data → plain Hindi/English summary
  - "Your child Ravi is doing well in Math but needs help in Science. Here's what you can do..."
- [ ] **Session history**: chat logs stored per student for teacher review
- [ ] **Usage analytics**: queries/day, common topics, parent vs student usage

### Week 6: Smart Communication
- [ ] **Best-time-to-message**: analyze past parent message open rates → suggest optimal send time per parent
- [ ] **Auto-translate**: notice written in English → parent receives in Hindi / regional language
  - Uses LLM or Google Translate API
  - Preference stored in `parentNotificationSettings.language`
- [ ] **Sentiment analysis**: detect upset parents from message tone
  - Scan incoming parent messages → flag negative sentiment
  - Alert school admin: "Parent of Aisha (Class 6-A) seems upset about fees"
- [ ] **Smart reply suggestions**: AI-drafted responses for common parent queries

---

## Modules Involved

| Module | Scope |
|--------|-------|
| Predictive Analytics | Drop-out risk, fee default, workload balance, early warning |
| AI Reports | Auto-comments, progress summaries, smart drafting |
| Personalized Learning | Weak-topic ID, adaptive quizzes, recommendations |
| AI Tutor | 24/7 chatbot, multi-lingual, topic-bounded, parent version |
| Smart Communication | Best-time messaging, auto-translate, sentiment analysis |

---

## JS Files to Create/Modify

| File | Action |
|------|--------|
| `js/ai-predictive-analytics.js` | Risk scoring engine, early warning dashboard |
| `js/ai-report-comments.js` | Auto-comment generation, progress summaries |
| `js/ai-smart-draft.js` | Notice drafting from bullet points |
| `js/ai-tutor.js` | Chatbot UI, session management, topic guard |
| `js/ai-adaptive-quiz.js` | Quiz engine, difficulty adjustment, weak-topic detection |
| `js/ai-smart-comms.js` | Best-time algorithm, auto-translate, sentiment scan |
| `js/ai-prompt-library.js` | Reusable prompt templates per school |
| `js/ai-provider.js` | LLM provider abstraction (Gemini / Claude / OpenAI) |
| `functions/ai-generateComment.js` | Callable: generate report card comment |
| `functions/ai-summarizeProgress.js` | Callable: generate progress summary |
| `functions/ai-smartDraft.js` | Callable: generate notice from bullets |
| `functions/ai-chat.js` | Callable: AI tutor chat turn |
| `functions/ai-translate.js` | Callable: translate notice text |
| `functions/ai-sentiment.js` | Callable: analyze message sentiment |
| `functions/ai-riskScore.js` | Scheduled: recalculate risk scores nightly |
| `portal/admin-dashboard.html` | Add AI analytics dashboard, AI report tools |
| `portal/student-dashboard.html` | AI tutor access, personalized recommendations |
| `portal/ai-tutor.html` | Dedicated AI tutor chat page |

---

## Firestore Collections

| Collection | Document | Key Fields |
|------------|----------|------------|
| `schools/{id}/riskScores/{studentId}` | RiskScore | dropOutRisk, feeDefaultRisk, factors, lastUpdated |
| `schools/{id}/aiComments/{studentId}/{examId}` | AiComment | subject, comment, generatedAt, reviewedBy |
| `schools/{id}/promptTemplates/{templateId}` | PromptTemplate | name, category, promptText, schoolCustomizations |
| `schools/{id}/aiTutorSessions/{sessionId}/chats/{msgId}` | TutorChat | role, content, timestamp, language |
| `schools/{id}/weakTopics/{studentId}` | WeakTopic | subject, topicName, confidenceScore |
| `schools/{id}/adaptiveQuizResults/{quizId}/responses/{studentId}` | QuizResponse | questionId, correct, difficulty, timestamp |
| `schools/{id}/messageSentiment/{messageId}` | SentimentScore | score, label, flags |
| `schools/{id}/settings/aiConfig` | AiConfig | provider, apiKeyRef, enabledFeatures, promptTemplates |
| `schools/{id}/settings/parentComms` | ParentCommsConfig | defaultLanguage, bestTimeWindow, autoTranslate |

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Gemini API | latest | Primary LLM provider |
| Claude API | latest | Secondary LLM provider |
| OpenAI API | latest | Tertiary LLM provider |
| Google Translate API | — | Auto-translate fallback |
| Chart.js | 4.x | Early warning dashboard charts |
| Firebase Functions | — | AI Cloud Functions (callable + scheduled) |

---

## Estimated Effort (Dev-Days)

| Week | Module | Dev-Days | Dependencies |
|------|--------|----------|--------------|
| 1-2 | Predictive Analytics | 7 | Phase 2 (attendance, marks) + Phase 3 (fees) |
| 3 | AI-Powered Reports | 5 | Week 2 (marks data, grading rules) |
| 4-5 | Personalized Learning | 5 | Week 3 (weak-topic data) |
| 5-6 | AI Tutor | 6 | Week 5 (LLM provider setup) |
| 6 | Smart Communication | 3 | Phase 3 (comm channels, parent prefs) |
| **Total** | | **~26** | |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM API costs unpredictable | Medium | High | Per-school configurable provider; usage caps; cost dashboard |
| AI accuracy on Hindi / regional languages | Medium | Medium | Test with native speakers; fallback to English |
| Parents misuse AI tutor ("do my homework") | High | Low | Topic-bounded; teacher review of chat logs |
| Predictive analytics false positives | Medium | Medium | Flag as "indicators, not diagnosis"; teacher override |
| API key management security | Medium | High | Store keys in Firebase Functions config, NOT frontend |
| Student data sent to third-party LLM | High | Critical | Require school consent; anonymize where possible; offer on-premise option |

---

## Success Criteria / Exit Gate

- [ ] 1 customer pays premium for AI features
- [ ] Predictive analytics dashboard live with red/amber/green scoring
- [ ] Auto-report-card-comments generated for 1 exam cycle (≥ 80% acceptable)
- [ ] AI tutor in beta with 1 school, topic-bounded and multi-lingual
- [ ] Smart communication: auto-translate + sentiment analysis live
- [ ] Weak-topic identification per student with ≥ 70% accuracy vs teacher assessment
- [ ] All AI features gated behind `schools/{id}/plan >= 'premium'`
