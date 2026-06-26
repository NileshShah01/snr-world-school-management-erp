# SNR ERP — Complete Deployment & Implementation Guide

## QUICK START (5 MINUTES)

### 1. Clone Repository
```bash
git clone https://github.com/NileshShah01/snr-world-school-management-erp.git
cd snr-world-school-management-erp
npm install
```

### 2. Firebase Setup
```bash
# Install Firebase CLI if not already done
npm install -g firebase-tools

# Login to your Firebase account
firebase login

# Select your Firebase project
firebase use --add
# Choose your project from the list
```

### 3. Configure API Keys
```bash
# Razorpay (get from https://dashboard.razorpay.com/app/keys)
firebase functions:config:set razorpay.key_id="rzp_live_XXXXXXXXXXXXX"
firebase functions:config:set razorpay.key_secret="XXXXXXXXXXXXXXXX"

# MSG91 (get from https://www.msg91.com/user/account/authkey)
firebase functions:config:set msg91.auth_key="XXXXXXXXXXXXXXXX"
firebase functions:config:set msg91.sender_id="SNREDU"

# School admin phone (for critical alerts)
firebase functions:config:set school.admin_phone="+919898XXXXXX"
```

### 4. Deploy to Firebase
```bash
# Deploy hosting + functions
firebase deploy

# Or deploy individually:
firebase deploy --only hosting:school      # Public website only
firebase deploy --only hosting:platform    # SaaS platform only
firebase deploy --only functions           # Cloud Functions only
```

### 5. Verify Deployment
```bash
# Check hosting URL
firebase hosting:channel:list

# Test live URL (should load without errors)
# School: https://apex-public-school-portal.web.app
# Platform: https://snredu-erp.web.app
```

---

## DETAILED SETUP GUIDE

### A. FIREBASE PROJECT SETUP

#### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create Project" → Enter project name → Create
3. Wait for provisioning (2-3 minutes)
4. Go to Project Settings → Add Web App
5. Copy the config (will look like this):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "...",
     appId: "1:..."
   };
   ```

#### 2. Update firebaseConfig in Code
Edit `js/firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### 3. Enable Firebase Services
In Firebase Console → Project Settings → APIs:
- ✅ Enable Cloud Firestore
- ✅ Enable Authentication (Email/Password + Phone)
- ✅ Enable Cloud Functions
- ✅ Enable Cloud Storage
- ✅ Enable Firebase Hosting

#### 4. Create Firestore Database
1. Go to Firestore Database → Create Database
2. Select: Production Mode
3. Location: Choose closest to your school (India: asia-south1)
4. Create

#### 5. Upload Security Rules
```bash
firebase deploy --only firestore:rules
```

#### 6. Create Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

#### 7. Create Initial Admin User
```javascript
// Run in browser console on admin-login.html:
const email = "admin@apex-public-school.com";
const password = "Secure@123456";
firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(user => {
    db.collection('users').doc(user.user.uid).set({
      email: email,
      role: 'admin',
      schoolId: 'SCH001',
      isActive: true
    });
    alert('Admin user created: ' + email);
  })
  .catch(e => alert('Error: ' + e.message));
```

---

### B. CLOUD FUNCTIONS SETUP

#### 1. Navigate to Functions Directory
```bash
cd functions
npm install
cd ..
```

#### 2. Set Configuration Variables
```bash
# Razorpay Payment Gateway
firebase functions:config:set razorpay.key_id="rzp_live_XXXXXXXX"
firebase functions:config:set razorpay.key_secret="XXXXXXXXXXXXXXXX"

# MSG91 SMS Provider
firebase functions:config:set msg91.auth_key="XXXXXXXXXXXXXXXX"
firebase functions:config:set msg91.sender_id="SNREDU"

# Admin alert phone
firebase functions:config:set school.admin_phone="+919898XXXXXX"
```

#### 3. Verify Configuration
```bash
firebase functions:config:get
```

Expected output:
```json
{
  "razorpay": {
    "key_id": "rzp_live_...",
    "key_secret": "..."
  },
  "msg91": {
    "auth_key": "...",
    "sender_id": "SNREDU"
  },
  "school": {
    "admin_phone": "+919898XXXXXX"
  }
}
```

#### 4. Deploy Functions
```bash
firebase deploy --only functions
```

Check deployment status:
```bash
firebase functions:list
```

You should see:
- createRazorpayOrder
- verifyRazorpayPayment
- sendSmsNotification
- sendWhatsappNotification

---

### C. HOSTING SETUP

#### 1. Verify firebase.json Hosting Config
Check `firebase.json` includes both targets:
```json
{
  "hosting": [
    {
      "target": "school",
      "public": "."
    },
    {
      "target": "platform",
      "public": "."
    }
  ]
}
```

#### 2. Create Hosting Sites in Firebase Console
1. Firebase Console → Hosting → Create Site
2. Create two sites:
   - Name: `apex-public-school-portal` (target: school)
   - Name: `snredu-erp` (target: platform)

#### 3. Link Sites to Targets
```bash
firebase target:apply hosting school apex-public-school-portal
firebase target:apply hosting platform snredu-erp
```

#### 4. Verify .firebaserc
Check `.firebaserc` has targets configured:
```json
{
  "projects": {
    "default": "your-project-id"
  },
  "targets": {
    "your-project-id": {
      "hosting": {
        "school": ["apex-public-school-portal"],
        "platform": ["snredu-erp"]
      }
    }
  }
}
```

#### 5. Deploy Hosting
```bash
firebase deploy --only hosting

# Or deploy specific targets:
firebase deploy --only hosting:school
firebase deploy --only hosting:platform
```

---

### D. FIRESTORE DATABASE INITIALIZATION

#### 1. Create Essential Collections

**schools/{schoolId}** — School master record
```firestore
schools/SCH001
├── name: "Apex Public School"
├── logo: "data:image/png;base64,..."
├── email: "admin@apex-public-school.com"
├── phone: "+919898123456"
├── address: "123 School Road, City"
├── tier: "PROFESSIONAL"  // BASIC, STANDARD, PROFESSIONAL
├── admissionStatus: "OPEN"  // OPEN, CLOSED, WAITLIST
├── website: "https://apex-public-school.web.app"
├── theme: {
│   └── primaryColor: "#1e40af",
│       secondaryColor: "#059669"
└── settings: {...}
```

**schools/{schoolId}/students** — Student records
**schools/{schoolId}/fees** — Fee ledger
**schools/{schoolId}/attendance** — Attendance records
**schools/{schoolId}/exams** — Exam data
**schools/{schoolId}/results** — Mark records
... (30+ more collections auto-created by admin dashboard)

#### 2. Initialize First School

Use the admin dashboard:
1. Go to `/portal/admin-dashboard.html`
2. Login with admin credentials
3. Go to "Settings" → "Website Settings"
4. Enter school details
5. Save

---

### E. EMAIL NOTIFICATIONS SETUP (Optional)

To send email instead of/in addition to SMS:

#### 1. Add SendGrid Cloud Function
In `functions/index.js`:
```javascript
const sgMail = require('@sendgrid/mail');

exports.sendEmailNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  
  sgMail.setApiKey(functions.config().sendgrid?.api_key);
  
  const msg = {
    to: data.email,
    from: 'noreply@snredu.com',
    subject: data.subject,
    html: data.html,
  };
  
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});
```

#### 2. Set SendGrid API Key
```bash
firebase functions:config:set sendgrid.api_key="SG.XXXXXXXXXXXXXXXX"
firebase deploy --only functions
```

---

### F. DATA MIGRATION (From Old System)

#### 1. Export Student Data from Old System
Format as CSV:
```csv
name,phone,email,class,section,rollNumber,fatherName,motherName,fatherPhone,motherPhone,dob,address
Aarav Singh,9898123456,aarav@email.com,Class VI,A,1,John Singh,Jane Singh,9898111111,9898111112,2015-01-15,"123 Main St"
...
```

#### 2. Upload via Admin Dashboard
1. Login as admin
2. Go to "Student Management" → "Bulk Import"
3. Upload CSV
4. Map columns to Firestore fields
5. Preview and submit

#### 3. Verify Data
Query Firestore to confirm students imported:
```javascript
const students = await db.collection('schools').doc('SCH001').collection('students').get();
console.log(`Imported ${students.size} students`);
```

---

### G. RAZORPAY PAYMENT SETUP

#### 1. Create Razorpay Account
Go to https://razorpay.com → Sign up → Complete KYC

#### 2. Get API Keys
Dashboard → Settings → API Keys → Copy Live Key ID and Secret

#### 3. Set Keys in Firebase
```bash
firebase functions:config:set razorpay.key_id="rzp_live_XXXXX"
firebase functions:config:set razorpay.key_secret="XXXXXXX"
firebase deploy --only functions
```

#### 4. Test Payment Flow
1. Student portal → Fees tab → "Pay Online"
2. Amount field → click "Pay"
3. Razorpay checkout modal appears
4. Enter test card: 4111 1111 1111 1111, any future date, CVV: 123
5. Click "Pay"
6. Verify payment in Firestore `payments` collection

---

### H. MSG91 SMS SETUP

#### 1. Create MSG91 Account
Go to https://msg91.com → Sign up → Activate

#### 2. Get API Key
Dashboard → Manage → API Key (copy your authkey)

#### 3. Set Key in Firebase
```bash
firebase functions:config:set msg91.auth_key="XXXXXXXXXXXXXXXX"
firebase functions:config:set msg91.sender_id="SNREDU"
firebase deploy --only functions
```

#### 4. Verify Sender ID
Adjust `msg91.sender_id` to your approved sender ID (usually 6-10 alphanumeric chars)

#### 5. Test SMS
1. Admin dashboard → "Fees" → "Send Fee Message"
2. Select students
3. Compose message
4. Click "Send"
5. Verify SMS received on student/parent phone

---

## VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Public site loads: https://apex-public-school-portal.web.app
- [ ] Admin login works: /portal/admin-login.html
- [ ] Student login works: /portal/student-login.html
- [ ] Teacher login works: /portal/teacher-dashboard.html
- [ ] Super Admin works: /portal/super-admin-pro.html
- [ ] Firestore data visible in Firebase Console
- [ ] Cloud Functions deployed (firebase functions:list shows 4+ functions)
- [ ] Razorpay payment creates order (check Razorpay dashboard)
- [ ] SMS sends and arrives within 30 seconds
- [ ] School CMS updates appear on public site (within 5 minutes cache)
- [ ] Student data isolation works (student A can't read student B's data)
- [ ] Admin auth guard prevents unauthenticated access

---

## TROUBLESHOOTING

### Issue: Firestore Rules Rejected
**Solution:** Check `firestore.rules` syntax with Firebase CLI:
```bash
firebase deploy --only firestore:rules --dry-run
```

### Issue: Cloud Functions Failing
**Solution:** Check logs:
```bash
firebase functions:log
```

### Issue: No SMS Received
**Solution:** 
1. Check phone number format: must be +country-code format
2. Verify MSG91 credit balance
3. Check sender ID is approved in MSG91 dashboard

### Issue: Razorpay Payment Not Recorded
**Solution:**
1. Check Cloud Functions logs for signature mismatch
2. Verify Razorpay keys are correct (live, not test mode)
3. Check student's schoolId matches in token

### Issue: Admin Dashboard Blank
**Solution:**
1. Check browser console for JS errors (F12 → Console tab)
2. Verify Firebase config is correct in firebase-config.js
3. Check Firestore rules allow your user

### Issue: Students Can't Login
**Solution:**
1. Verify student records exist in Firestore: `schools/SCH001/students`
2. Check phone number format in student record matches login input
3. If using Firebase Auth, verify user is created in Firebase Console

---

## SCALING CHECKLIST

For production with 10,000+ students:

- [ ] **Firestore:** Add composite indexes for complex queries (auto-done via firestore.indexes.json)
- [ ] **Cloud Functions:** Increase memory allocation if needed (default: 256MB, may need 512MB for bulk operations)
- [ ] **Hosting:** Use Firebase CDN (automatic, ~50 global edge locations)
- [ ] **Database:** Enable Firestore backups (Firebase Console → Backups → Enable)
- [ ] **Monitoring:** Set up Firebase Monitoring alerts
- [ ] **Load testing:** Use Apache JMeter to simulate 1000+ concurrent users

---

## SECURITY HARDENING (Pre-Production)

1. **Add reCAPTCHA to public forms:**
   ```html
   <script src="https://www.google.com/recaptcha/api.js"></script>
   <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
   ```

2. **Enable Firebase App Check:**
   ```bash
   firebase appcheck:create
   ```

3. **Set up DDoS protection:**
   - Enable Cloud Armor in GCP Console
   - Set rate limits to 100 requests/IP/minute

4. **Run security audit:**
   ```bash
   npm run lint
   ```

5. **Penetration testing:**
   - Use OWASP ZAP or Burp Suite to scan for vulnerabilities
   - Check CSP headers (firebase.json)
   - Verify no XSS vectors in user inputs

---

## MAINTENANCE

### Weekly
- Monitor Firestore read/write quotas (Firebase Console → Usage tab)
- Check error logs: `firebase functions:log`

### Monthly
- Review security audit log: `schools/{id}/auditLog`
- Update npm dependencies: `npm update`

### Quarterly
- Review and rotate API keys (Razorpay, MSG91)
- Test disaster recovery (restore from Firestore backup)
- Update Firestore indexes if queries are slow

---

## SUPPORT & DOCUMENTATION

- **Architecture docs:** See `docs/` directory
- **Module docs:** See `Educationdesk/` directory (26 modules, 4,000+ lines of specs)
- **Issue tracking:** GitHub Issues: https://github.com/NileshShah01/snr-world-school-management-erp/issues
- **Firebase docs:** https://firebase.google.com/docs

---

**Last Updated:** June 22, 2026  
**Version:** 1.0 (Production Ready)
