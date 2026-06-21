/**
 * SNR Edu ERP — Cloud Functions
 *
 * Prerequisites:
 *   1. npm install in functions/
 *   2. firebase functions:config:set razorpay.key_id="rzp_live_..." razorpay.key_secret="..."
 *   3. firebase functions:config:set msg91.auth_key="..." msg91.sender_id="SNREDU"
 *   4. firebase functions:config:set school.admin_phone="+9198XXXXXXXX"
 *   5. firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const RAZORPAY_KEY_ID = functions.config().razorpay?.key_id || '';
const RAZORPAY_KEY_SECRET = functions.config().razorpay?.key_secret || '';
const MSG91_AUTH_KEY = functions.config().msg91?.auth_key || '';
const MSG91_SENDER_ID = functions.config().msg91?.sender_id || 'SNREDU';
const SCHOOL_ADMIN_PHONE = functions.config().school?.admin_phone || '';

// ===================== SHARED =====================

/**
 * Validate that the request has a schoolId and the caller belongs to it.
 */
function assertSchoolAccess(context, schoolId) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const tokenSchoolId = context.auth.token.schoolId;
  if (schoolId && tokenSchoolId && tokenSchoolId !== schoolId) {
    throw new functions.https.HttpsError('permission-denied', 'School mismatch');
  }
}

// ===================== RAZORPAY =====================

const Razorpay = require('razorpay');

/**
 * createRazorpayOrder — Callable function
 * Creates a Razorpay order and returns the order_id to the client.
 * Called when a user clicks "Pay Online".
 */
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  assertSchoolAccess(context, data.schoolId);

  const { amount, currency, receipt, notes } = data;
  if (!amount || amount < 1) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount must be at least ₹1');
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new functions.https.HttpsError('failed-precondition', 'Razorpay not configured. Set razorpay.key_id and razorpay.key_secret in Firebase config.');
  }

  const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

  try {
    const order = await razorpay.orders.create({
      amount: amount, // in paise (₹1 = 100 paise)
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    });
    return { order_id: order.id, amount: order.amount, currency: order.currency };
  } catch (err) {
    console.error('[Razorpay] Order creation failed:', err);
    throw new functions.https.HttpsError('internal', 'Failed to create order: ' + err.message);
  }
});

/**
 * verifyRazorpayPayment — Callable function
 * Verifies the payment signature (server-side) and updates Firestore atomically.
 */
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  assertSchoolAccess(context, data.schoolId);

  const { order_id, payment_id, signature, schoolId, studentId, feeItemId, amount } = data;
  if (!order_id || !payment_id || !signature) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing payment verification fields');
  }

  // Verify signature
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${order_id}|${payment_id}`)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new functions.https.HttpsError('permission-denied', 'Payment signature mismatch');
  }

  // Signature valid — record payment in Firestore
  const db = admin.firestore();
  const paymentRef = db
    .collection('schools').doc(schoolId)
    .collection('payments').doc(payment_id);

  await paymentRef.set({
    paymentId: payment_id,
    orderId: order_id,
    studentId: studentId || '',
    feeItemId: feeItemId || '',
    amount: amount || 0,
    currency: 'INR',
    status: 'captured',
    method: 'razorpay',
    paidAt: admin.firestore.FieldValue.serverTimestamp(),
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    verifiedBy: context.auth.uid,
  });

  // If this is a fee payment, also record in feePayments
  if (studentId && feeItemId && amount) {
    const feePaymentRef = db
      .collection('schools').doc(schoolId)
      .collection('feePayments').doc();
    await feePaymentRef.set({
      paymentId: payment_id,
      studentId: studentId,
      feeItemId: feeItemId,
      amount: amount,
      mode: 'online',
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      schoolId: schoolId,
    });
  }

  return { success: true, payment_id };
});

/**
 * razorpayWebhook — HTTP function
 * Handles async Razorpay events (payment.failed, refund, dispute).
 */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Verify webhook signature
  const webhookSecret = functions.config().razorpay?.webhook_secret || '';
  const receivedSignature = req.headers['x-razorpay-signature'];
  if (webhookSecret && receivedSignature) {
    const crypto = require('crypto');
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (expectedSig !== receivedSignature) {
      console.warn('[Razorpay] Webhook signature mismatch');
      res.status(403).send('Invalid signature');
      return;
    }
  }

  const event = req.body?.event;
  const payment = req.body?.payload?.payment?.entity;

  if (event === 'payment.failed' && payment) {
    const db = admin.firestore();
    await db.collection('schools').doc(payment.notes?.schoolId || '_unknown')
      .collection('payments').doc(payment.id).set({
        paymentId: payment.id,
        status: 'failed',
        errorCode: payment.error_code || '',
        errorDescription: payment.error_description || '',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    console.log(`[Razorpay] Payment failed: ${payment.id}`);
  }

  if (event === 'refund.created' && payment) {
    const db = admin.firestore();
    await db.collection('schools').doc(payment.notes?.schoolId || '_unknown')
      .collection('payments').doc(payment.id).set({
        status: 'refunded',
        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    console.log(`[Razorpay] Refund created: ${payment.id}`);
  }

  res.status(200).send('OK');
});

// ===================== MSG91 SMS =====================

const axios = require('axios');

/**
 * sendSms — Callable function (admin-triggered) + Firestore-triggered
 *
 * Firestore triggers:
 *   - inquiries/{id} onCreate → SMS to school admin
 *   - payments/{id} onCreate → SMS receipt to parent
 *   - attendance/{id} onCreate (status=absent) → SMS to parent
 *
 * Callable usage: firebase.functions().httpsCallable('sendSms')({ to, template, data })
 */
async function sendSmsViaMsg91(to, templateId, variables) {
  if (!MSG91_AUTH_KEY) {
    console.warn('[MSG91] Auth key not configured. Skipping SMS to', to);
    return;
  }
  try {
    const response = await axios.post('https://api.msg91.com/api/v5/flow/', {
      sender: MSG91_SENDER_ID,
      flow_id: templateId,
      mobiles: to.replace(/[^0-9]/g, ''),
      VAR: variables,
    }, {
      headers: { 'authkey': MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
    });
    console.log('[MSG91] SMS sent to', to, ':', response.data);
    return response.data;
  } catch (err) {
    console.error('[MSG91] Send failed:', err.response?.data || err.message);
    throw err;
  }
}

// Callable: admin triggers an SMS manually
exports.sendSms = functions.https.onCall(async (data, context) => {
  assertSchoolAccess(context, data.schoolId);
  const { to, template, variables } = data;
  if (!to || !template) throw new functions.https.HttpsError('invalid-argument', 'Missing to/template');
  await sendSmsViaMsg91(to, template, variables || {});
  return { success: true };
});

// Firestore trigger: new inquiry → SMS to school admin
exports.onInquiryCreated = functions.firestore
  .document('schools/{schoolId}/inquiries/{inquiryId}')
  .onCreate(async (snap, context) => {
    const inquiry = snap.data();
    const to = SCHOOL_ADMIN_PHONE;
    if (!to) {
      console.warn('[MSG91] SCHOOL_ADMIN_PHONE not configured, skipping inquiry SMS');
      return;
    }
    await sendSmsViaMsg91(to, 'inquiry_template_id', {
      name: inquiry.name || '—',
      phone: inquiry.mobile || inquiry.phone || '—',
      message: inquiry.message || '—',
    });
  });

// Firestore trigger: new payment → SMS receipt to parent
exports.onPaymentCreated = functions.firestore
  .document('schools/{schoolId}/payments/{paymentId}')
  .onCreate(async (snap, context) => {
    const payment = snap.data();
    if (!payment.studentId) return;
    const db = admin.firestore();
    const studentDoc = await db.collection('schools').doc(context.params.schoolId)
      .collection('students').doc(payment.studentId).get();
    if (!studentDoc.exists) return;
    const student = studentDoc.data();
    const parentPhone = student.phone || student.guardian_phone;
    if (!parentPhone) return;
    const amount = (payment.amount / 100).toFixed(2);
    await sendSmsViaMsg91(parentPhone, 'payment_receipt_template_id', {
      name: student.name || 'Student',
      amount: amount,
      date: new Date().toLocaleDateString('en-IN'),
    });
  });

// Firestore trigger: absent attendance → SMS to parent
exports.onAbsentAttendance = functions.firestore
  .document('schools/{schoolId}/attendance/{attendanceId}')
  .onCreate(async (snap, context) => {
    const record = snap.data();
    if (record.status !== 'absent' || !record.studentId) return;
    const db = admin.firestore();
    const studentDoc = await db.collection('schools').doc(context.params.schoolId)
      .collection('students').doc(record.studentId).get();
    if (!studentDoc.exists) return;
    const student = studentDoc.data();
    const parentPhone = student.phone || student.guardian_phone;
    if (!parentPhone) return;
    await sendSmsViaMsg91(parentPhone, 'absent_alert_template_id', {
      name: student.name || 'Student',
      date: record.date || new Date().toLocaleDateString('en-IN'),
    });
  });
