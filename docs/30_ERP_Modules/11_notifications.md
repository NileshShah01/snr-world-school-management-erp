# 11 — Communication & Notifications Module

## Purpose

Send bulk in-app messages to parents, students, and staff. Track delivery history. Currently limited to in-app only — no external channel integrations (SMS, WhatsApp, Email, Push).

## Current Working State

- **JS File:** `D:\Snredu\js\erp-notifications.js` (5.7 KB)
- **Firestore Collections:**
  - `notifications` — top-level collection. Each doc represents a sent message (`title`, `message`, `type`: broadcast/class-specific/student-specific, `targetAudience`, `targetClass`, `targetStudent`, `sentBy`, `sentAt`, `deliveryStatus`, `readCount`).
  - `notifications/{notificationId}/recipients` — sub-collection. Per-recipient status (`recipientId`, `recipientType`: student/parent/staff, `status`: sent/delivered/read, `readAt`).
- **Key Functions:**
  - `loadNotifications()` — fetches sent notifications with pagination.
  - `sendNotification()` — creates notification doc + recipient entries. Currently marks `deliveryStatus` as "sent" with no actual external delivery.
  - `sendBulkNotification()` — batch-writes to all students/parents in a class.
  - `markAsRead()` — updates recipient read status.
- **Current Channels:**
  - **In-app:** Fully functional — messages appear in student/parent dashboard notification panel.
  - **WhatsApp:** Only a floating "Contact on WhatsApp" button with `wa.me/` deep link. No API integration for bulk messaging.
  - **SMS/Email/Push:** None. No gateway configured.
- **Access:** Admin sends from admin dashboard. Recipients view in respective dashboards.

## Gaps

| Priority | Gap | Notes |
|----------|-----|-------|
| P0 | No SMS gateway | MSG91, Twilio, or similar — critical for emergency broadcasts and password resets. |
| P0 | No WhatsApp Business API | Wati, Interakt, AiSensy, or WhatsApp Cloud API — primary parent communication channel in Indian schools. |
| P1 | No email service | SendGrid, Mailgun, or Firebase Extensions — needed for formal communication, receipts, reports. |
| P1 | No push notifications | Firebase Cloud Messaging (FCM) — mobile/web push for time-sensitive alerts. |
| P1 | No read receipts | Cannot track who has actually read the message (currently only sent/delivered). |
| P2 | No delivery tracking | No per-channel delivery status (e.g., SMS delivered vs failed, WhatsApp read). |
| P2 | No message templates | No predefined templates for common messages (fee reminder, holiday, exam schedule). |
| P2 | No scheduled sending | Cannot schedule a message for future delivery. |
| P2 | No multi-language messages | No support for Hindi/regional languages alongside English. |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | Campus24x7 | SNR (Current) |
|---------|---------------|--------|-----------|------------|---------------|
| In-app messages | Yes | Yes | Yes | Yes | Yes |
| SMS | Yes | Yes | Yes | Yes | No |
| WhatsApp API | Yes | No | Yes | Yes (primary) | No (only `wa.me/` link) |
| Email | Yes | Yes | Yes | Yes | No |
| Push notifications | Yes | Yes | Yes | Yes | No |
| Read receipts | Yes | No | Yes | Yes | Partial |
| Templates | Yes | Yes | Yes | Yes | No |
| Scheduled sending | Yes | Yes | Yes | Yes | No |
| Multi-language | No | No | No | Yes | No |

## Perfect Version

- **Unified notification gateway** — abstraction layer over SMS (Twilio/MSG91), WhatsApp (Cloud API), Email (SendGrid), and Push (FCM). Single `sendNotification()` function routes to all enabled channels.
- **Channel preferences per user** — parents choose preferred channels (e.g., WhatsApp for urgent, Email for reports).
- **Template engine** — predefined templates with variable substitution (`{{studentName}}`, `{{feeAmount}}`, `{{dueDate}}`). Template approval workflow.
- **Scheduled & recurring notifications** — cron-based scheduling for fee reminders, birthday wishes, holiday alerts.
- **Delivery analytics dashboard** — per-message stats: sent/delivered/failed/read across all channels. Channel-wise breakdown. Delivery time heatmaps.
- **Two-way communication** — parents can reply via WhatsApp/Email → reply logged against original message in notification thread.
- **Multi-language support** — message composition with language selector; Hindi text alongside English.
- **Emergency broadcast system** — single-click send to all parents/staff across all channels with priority flag.
- **v3 Data Model:**
  ```
  schools/{id}/notifications/{notificationId}
  schools/{id}/notifications/{notificationId}/receipts/{channelUserId}
  schools/{id}/notificationTemplates/{templateId}
  schools/{id}/users/{userId}/communicationPrefs
  ```
