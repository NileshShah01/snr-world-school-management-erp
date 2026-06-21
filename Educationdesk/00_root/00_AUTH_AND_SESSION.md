# Education Desk - Authentication & Session

## Login Flow

### Step 1: GET /login
- Renders login form
- Form action: emp-login-process
- Form method: POST
- Fields: user_name (text), password (password)
- No CSRF token
- JSESSIONID cookie set on first visit

### Step 2: POST /emp-login-process
- Content-Type: application/x-www-form-urlencoded
- Body: user_name={username}&password={password}
- On success: Sets JSESSIONID + EDKEMPSESSION_ cookies
- Redirects to: /employee/home
- On failure: Returns to /login with error

### Observed Credentials
- Username: apex
- Password: baby

## Session Management

### Cookies
| Cookie | Purpose | Domain | Path |
|--------|---------|--------|------|
| JSESSIONID | Java server session | apexps.educationdesk.in | / |
| EDKEMPSESSION_ | Employee auth token | apexps.educationdesk.in | / |

### EDKEMPSESSION_ Format
- Base64-encoded string
- Likely contains: employee_id, role, timestamp, school_id
- Decoded value: UWFVMXFyTE4ySVVuUE15NVpSNVg0dz09
- Server validates on each request

### Session Lifecycle
1. Created on login
2. Valid for all /employee/* routes
3. Invalidated on logout (implied)
4. Timeout controlled server-side

## Protected Routes
- All routes under /employee/* require valid session
- Unauthenticated requests redirect to /login
- /app/dashboard requires session (returns 531 bytes - minimal page)

## Password Reset
- Route: /forgot-password
- Separate form from login
- No information about reset mechanism (email/SMS)

## Admin Panel
- Separate login at /admin
- Different credentials (not tested)
- Creates CMS admin session

## Security Notes
- No CSRF protection visible
- Weak password observed (baby)
- No brute-force protection observed
- Session fixation possible (JSESSIONID set pre-auth)
- No multi-factor authentication
- Password stored/transmitted in cleartext (HTTPS assumed)
