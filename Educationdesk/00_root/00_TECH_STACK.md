# Education Desk - Tech Stack & Architecture

## Platform
- **Vendor:** Education Desk (educationdesk.in)
- **Type:** Cloud-based School ERP (SaaS / White-label)
- **School:** APEX PUBLIC SCHOOL (Burari, Delhi-84, CBSE affiliated)
- **Domain:** apexps.educationdesk.in

## Backend
- **Runtime:** Java (JSESSIONID cookie = server-side session, typical of Java Servlet / Spring MVC)
- **Session Store:** Server-side (JSESSIONID persisted, EDKEMPSESSION_ as secondary auth token)
- **Session File:** EDKEMPSESSION_ = Base64-encoded session payload (likely encrypted token)
- **Framework:** Spring MVC (inferred from URL patterns, form handling, AJAX structure)
- **API Pattern:** REST-ish POST endpoints returning HTML fragments (not JSON APIs)

## Frontend
- **CSS Framework:** Bootstrap 3.x
- **JavaScript:** jQuery (loaded first, used extensively)
- **UI Components:**
  - DataTables.net (table rendering, Excel export)
  - Select2 (enhanced dropdowns)
  - iCheck (custom checkboxes/radios)
  - Parsley.js (form validation)
  - PNotify (notifications/toasts)
  - NProgress (loading bars)
  - ECharts (charts, used on dashboard)
  - Chart.js (alternative charts)
  - Bootstrap Daterangepicker
  - ClockPicker
  - Switchery (toggle switches)
  - Bootstrap WYSIWYG editor
  - Starrr (star ratings)
  - jQuery Tags Input
  - jqvmap (vector maps)
- **Custom JS:** /static/build/js/custom.js, /static/build/js/common.js
- **Table Libraries (dual):**
  - /static/vendors/datatables.net-* (primary)
  - /static/assets/datatable/* (secondary, used for Excel/PDF export)

## Auth Model
- **Login Endpoint:** POST /employee/emp-login-process (form-urlencoded)
- **Form Fields:** user_name, password
- **Credentials (observed):** apex / baby
- **Session Cookies:**
  - JSESSIONID (primary Java session)
  - EDKEMPSESSION_ (secondary employee session token)
- **Auth Flow:**
  1. GET /login -> renders login form
  2. POST /emp-login-process -> sets cookies, redirects to /employee/home
  3. All /employee/* routes require valid session
- **Password Reset:** /forgot-password (separate form)
- **Admin Panel:** /admin (separate login endpoint)
- **Session Expiry:** Server-controlled (JSESSIONID timeout)

## Asset Delivery
- **Static Assets:** Served from /static/ on same domain
- **School Logo CDN:** doc3.educationdesk.in (external CDN for uploaded images)
- **No CDN for JS/CSS** - all bundled on same origin
- **Cache Busting:** Query string versioning (?v=4.2, ?v=2.4, ?v=1.1)

## Database (inferred)
- **Student Records:** Code, Name, Reg No, Roll No, Class, Section, Session
- **Financial Data:** Fee structures, payments, salary, loans, finance accounts
- **Academic Data:** Exam results, attendance, homework, syllabus
- **Transport:** Vehicles, drivers, routes, stoppages
- **Product Inventory:** Categories, products, stock in/out, rate plans, tax rules

## Key IDs (from extracted data)
- **Session IDs:** 525 (2023-24), 616 (2024-25), 786 (2025-26), 1127 (2026-27)
- **Enterprise ID:** enterprise_0 (in CDN URL path)

## URL Structure
- All employee routes: /employee/{action}
- Forms submit to: /employee/{action} (same-page POST)
- AJAX endpoints: /employee/get-parent-course (POST, returns HTML fragments)
- Password reset: /forgot-password
- Admin panel: /admin

## Security Observations
- Session tokens in cookies (HttpOnly not confirmed)
- No CSRF token visible in forms (forms use POST but no hidden _token field)
- Credentials observed in cleartext (baby is a weak password)
- No rate limiting observed on login attempts
- Session fixation possible (JSESSIONID set before login)
