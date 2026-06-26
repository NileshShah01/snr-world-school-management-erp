// Admin Dashboard Logic - Premium Version
const SITE_URL = 'https://nileshshah01.github.io/Apex-public-school-test-01';
let allStudents = [];
let selectedStudents = new Set();
let currentPage = 1;
const itemsPerPage = 20;
let isInitializing = false;
let editingDocId = null; // Track current student being edited

// Per-school student counter (avoids full collection scans for super admin)
async function adjustStudentCounter(delta) {
    try {
        const schoolRef = (window.db || firebase.firestore()).collection('schools').doc(window.CURRENT_SCHOOL_ID || '');
        await schoolRef.update({
            studentCount: firebase.firestore.FieldValue.increment(delta)
        });
    } catch (e) {
        console.warn('Failed to update student counter:', e);
    }
}

// Global Loading Helper (backward compatibility for erp modules)
window.showLoading = function (show) {
    if (typeof setLoading === 'function') setLoading(show);
};

// Safety watchdog: Force-hide loading after 10 seconds if still stuck
// Started immediately to ensure it catches early hangs
const globalLoadWatchdog = setTimeout(() => {
    console.warn('Global loading watchdog triggered - force hiding loader');
    setLoading(false);
}, 10000);

// Global error handler for admin dashboard to prevent stuck loader on JS crash
window.onerror = function (msg, url, line, col, error) {
    console.error('Critical Admin JS Error:', msg, 'at', url, ':', line);
    setLoading(false);
    return false; // Let browser handle the rest
};

/**
 * Core function to switch between dashboard sections
 * Exposed to window for global access/extensibility
 */
const MODULE_SECTIONS = {
    dashboardOverview: 'overview/dashboardOverview',
    adminPortalCMS: 'overview/adminPortalCMS',
    adminProfile: 'overview/adminProfile',
    websiteSettings: 'overview/websiteSettings',
    addSession: 'classes/addSession',
    addClass: 'classes/addClass',
    addSubject: 'classes/addSubject',
    addSyllabus: 'classes/addSyllabus',
    // detailClass: 'classes/detailClass', // content embedded in studentDetail.html
    addNonSubject: 'classes/addNonSubject',
    addClassDetails: 'classes/addClassDetails',
    createTimetable: 'classes/createTimetable',
    classTimetables: 'classes/classTimetables',
    teacherTimetables: 'classes/teacherTimetables',
    assignHomework: 'classes/assignHomework',
    homeworkHistory: 'classes/homeworkHistory',
    gradeHomework: 'classes/gradeHomework',
    addStudent: 'students/addStudent',
    studentList: 'students/studentList',
    bulkImport: 'students/bulkImport',
    electiveMapping: 'students/electiveMapping',
    promotions: 'students/promotions',
    studentBulkUpdate: 'students/studentBulkUpdate',
    studentRfidUpdate: 'students/studentRfidUpdate',
    hostelReport: 'students/hostelReport',
    transportReport: 'students/transportReport',
    pickupIdPrint: 'students/pickupIdPrint',
    studentDetail: 'students/studentDetail',
    studentIdPrint: 'students/studentIdPrint',
    studentExamAttendance: 'students/studentExamAttendance',
    studentAdmission: 'students/studentAdmission',
    searchStudentFee: 'fees/searchStudentFee',
    createMonthlyFee: 'fees/createMonthlyFee',
    classFeePayment: 'fees/classFeePayment',
    demandReceipt: 'fees/demandReceipt',
    bulkFeeDiscount: 'fees/bulkFeeDiscount',
    bulkExtraFee: 'fees/bulkExtraFee',
    lateFeeRules: 'fees/lateFeeRules',
    feeMaster: 'fees/feeMaster',
    searchFeeDues: 'fees/searchFeeDues',
    sendFeeMessage: 'fees/sendFeeMessage',
    monthlyPaymentView: 'fees/monthlyPaymentView',
    revertedPayments: 'fees/revertedPayments',
    manageFeeFine: 'fees/manageFeeFine',
    examGrading: 'exams/examGrading',
    manageExam: 'exams/manageExam',
    manageExamSchedule: 'exams/manageExamSchedule',
    viewExamSchedule: 'exams/viewExamSchedule',
    publishExamSchedule: 'exams/publishExamSchedule',
    admitCardTool: 'exams/admitCardTool',
    examAttendanceCard: 'exams/examAttendanceCard',
    admitCardSplitter: 'exams/admitCardSplitter',
    questionPaperLibrary: 'exams/questionPaperLibrary',
    addResult: 'results/addResult',
    viewReportCard: 'results/viewReportCard',
    publishResults: 'results/publishResults',
    bulkResultGenerator: 'results/bulkResultGenerator',
    resultAnalytics: 'results/resultAnalytics',
    manageAllResults: 'results/manageAllResults',
    reportCardRemarks: 'results/reportCardRemarks',
    manualReportCardUpload: 'results/manualReportCardUpload',
    resultsStatus: 'results/resultsStatus',
    // rcPreview: 'results/rcPreview', // content embedded in viewReportCard.html
    attendanceManagement: 'attendance/attendanceManagement',
    viewAttendanceStats: 'attendance/viewAttendanceStats',
    addEmployee: 'staff/addEmployee',
    searchEmployee: 'staff/searchEmployee',
    bulkEmployeeUpdate: 'staff/bulkEmployeeUpdate',
    employeeIdPrint: 'staff/employeeIdPrint',
    staffAttendanceMark: 'staff/staffAttendanceMark',
    staffAttendanceReport: 'staff/staffAttendanceReport',
    designationManager: 'staff/designationManager',
    manageLeaveTypes: 'staff/manageLeaveTypes',
    leaveApplications: 'staff/leaveApplications',
    leaveBalance: 'staff/leaveBalance',
    leaveCalendar: 'staff/leaveCalendar',
    leaveReport: 'staff/leaveReport',
    salaryStructure: 'payroll/salaryStructure',
    staffSalary: 'payroll/staffSalary',
    generatePayroll: 'payroll/generatePayroll',
    payrollHistory: 'payroll/payrollHistory',
    payslipView: 'payroll/payslipView',
    salaryReports: 'payroll/salaryReports',
    notices: 'communication/notices',
    sendNotification: 'communication/sendNotification',
    notificationHistory: 'communication/notificationHistory',
    parentLogin: 'communication/parentLogin',
    bonafideCertificate: 'certificates/bonafideCertificate',
    schoolLeavingCertificate: 'certificates/schoolLeavingCertificate',
    transferCertificate: 'certificates/transferCertificate',
    certificateHistory: 'certificates/certificateHistory',
    bookCatalog: 'library/bookCatalog',
    issueReturn: 'library/issueReturn',
    libraryTransactions: 'library/libraryTransactions',
    manageRoutes: 'transport/manageRoutes',
    mapTransport: 'transport/mapTransport',
    financeDashboard: 'finance/financeDashboard',
    chartOfAccounts: 'finance/chartOfAccounts',
    journalEntry: 'finance/journalEntry',
    paymentVouchers: 'finance/paymentVouchers',
    receiptVouchers: 'finance/receiptVouchers',
    trialBalance: 'finance/trialBalance',
    profitLossReport: 'finance/profitLossReport',
    balanceSheetReport: 'finance/balanceSheetReport',
    cmsHero: 'cms/cmsHero',
    cmsTheme: 'cms/cmsTheme',
    cmsAdmission: 'cms/cmsAdmission',
    cmsGlobalStats: 'cms/cmsGlobalStats',
    cmsGallery: 'cms/cmsGallery',
    cmsStaff: 'cms/cmsStaff',
    cmsHolidays: 'cms/cmsHolidays',
    cmsEvents: 'cms/cmsEvents',
    cmsAchievements: 'cms/cmsAchievements',
    cmsTestimonials: 'cms/cmsTestimonials',
    cmsStudentDashboard: 'cms/cmsStudentDashboard',
    cmsFees: 'cms/cmsFees',
    cmsStats: 'cms/cmsStats',
    cmsTimetable: 'cms/cmsTimetable',
    cmsImgHomeHero: 'cms/cmsImgHomeHero',
    cmsImgHomeFacilities: 'cms/cmsImgHomeFacilities',
    cmsImgHomeMemories: 'cms/cmsImgHomeMemories',
    cmsImgAdmissions: 'cms/cmsImgAdmissions',
    cmsImgFacilities: 'cms/cmsImgFacilities',
    cmsImgAboutHero: 'cms/cmsImgAboutHero',
    cmsTextHome: 'cms/cmsTextHome',
    cmsTextAbout: 'cms/cmsTextAbout',
    cmsTextAcademics: 'cms/cmsTextAcademics',
    cmsTextAdmissions: 'cms/cmsTextAdmissions',
    cmsTextContact: 'cms/cmsTextContact',
    cmsTextFacilities: 'cms/cmsTextFacilities',
    cmsTextGallery: 'cms/cmsTextGallery',
    cmsTextInquiry: 'cms/cmsTextInquiry',
    addEnquiry: 'cms/addEnquiry',
    searchEnquiry: 'cms/searchEnquiry',
    schoolSetupWizard: 'setup/schoolSetupWizard',
    legacyMigration: 'tools/legacyMigration',
    parentsNotPaidTool: 'tools/parentsNotPaidTool',
    dsrRequests: 'tools/dsrRequests',
};

// ─── SECTION META for tab titles + breadcrumb ───
const SECTION_META = {
    dashboardOverview:        { label: 'Dashboard',              parent: null },
    addSession:               { label: 'Sessions',               parent: 'Class Management' },
    addClass:                 { label: 'Classes',                parent: 'Class Management' },
    addSubject:               { label: 'Subjects',               parent: 'Class Management' },
    addSyllabus:               { label: 'Syllabus',               parent: 'Class Management' },
    addSyllabusSection:       { label: 'Syllabus',               parent: 'Class Management' },
    addStudent:               { label: 'Add Student',            parent: 'Student Management' },
    studentList:              { label: 'Search Students',        parent: 'Student Management' },
    bulkImport:               { label: 'Bulk Import',            parent: 'Student Management' },
    electiveMapping:          { label: 'Elective Mapping',       parent: 'Student Management' },
    promotions:               { label: 'Promote Students',       parent: 'Student Management' },
    studentBulkUpdate:        { label: 'Bulk Update',            parent: 'Student Management' },
    studentRfidUpdate:        { label: 'RFID Update',            parent: 'Student Management' },
    hostelReport:             { label: 'Hostel Report',          parent: 'Student Management' },
    transportReport:          { label: 'Transport Report',       parent: 'Student Management' },
    pickupIdPrint:            { label: 'Pickup ID Print',        parent: 'Student Management' },
    addEnquiry:               { label: 'New Enquiry',            parent: 'Admission' },
    searchEnquiry:            { label: 'Enquiries',              parent: 'Admission' },
    studentAdmission:         { label: 'Admission Form',         parent: 'Admission' },
    attendanceManagement:     { label: 'Mark Attendance',        parent: 'Attendance' },
    viewAttendanceStats:      { label: 'Attendance Reports',     parent: 'Attendance' },
    searchStudentFee:         { label: 'Student Fee Payment',    parent: 'Fees' },
    searchStudentFeeSection:  { label: 'Student Fee Payment',    parent: 'Fees' },
    createMonthlyFee:         { label: 'Monthly Fee Generation', parent: 'Fees' },
    createMonthlyFeeSection:  { label: 'Monthly Fee Generation', parent: 'Fees' },
    classFeePayment:          { label: 'Add Fee Payment',        parent: 'Fees' },
    classFeePaymentSection:   { label: 'Add Fee Payment',        parent: 'Fees' },
    demandReceipt:            { label: 'Demand Receipt',         parent: 'Fees' },
    demandReceiptSection:     { label: 'Demand Receipt',         parent: 'Fees' },
    bulkFeeDiscount:          { label: 'Bulk Discount',          parent: 'Fees' },
    bulkFeeDiscountSection:   { label: 'Bulk Discount',          parent: 'Fees' },
    bulkExtraFee:             { label: 'Bulk Extra Fee',         parent: 'Fees' },
    bulkExtraFeeSection:      { label: 'Bulk Extra Fee',         parent: 'Fees' },
    lateFeeRules:             { label: 'Late Fee Rules',         parent: 'Fees' },
    lateFeeRulesSection:      { label: 'Late Fee Rules',         parent: 'Fees' },
    feeMaster:                { label: 'Fee Master',             parent: 'Fees' },
    feeMasterSection:         { label: 'Fee Master',             parent: 'Fees' },
    searchFeeDues:            { label: 'Search Fee Dues',        parent: 'Fees' },
    searchFeeDuesSection:     { label: 'Search Fee Dues',        parent: 'Fees' },
    sendFeeMessage:           { label: 'Send Fee Message',       parent: 'Fees' },
    sendFeeMessageSection:    { label: 'Send Fee Message',       parent: 'Fees' },
    examGrading:              { label: 'Grading Rules',          parent: 'Exams' },
    manageExam:               { label: 'Create Exams',           parent: 'Exams' },
    manageExamSchedule:       { label: 'Exam Timetable',         parent: 'Exams' },
    viewExamSchedule:         { label: 'View Date-Sheet',        parent: 'Exams' },
    publishExamSchedule:      { label: 'Publish Schedule',       parent: 'Exams' },
    admitCardTool:            { label: 'Admit Card',             parent: 'Exams' },
    examAttendanceCard:       { label: 'Exam Attendance',        parent: 'Exams' },
    addResult:                { label: 'Add Results',            parent: 'Results' },
    viewReportCard:           { label: 'Report Card',            parent: 'Results' },
    publishResults:           { label: 'Publish Results',        parent: 'Results' },
    bulkResultGenerator:      { label: 'Bulk Result Upload',     parent: 'Results' },
    resultAnalytics:          { label: 'Result Analytics',       parent: 'Results' },
    manageAllResults:         { label: 'Manage Results',         parent: 'Results' },
    reportCardRemarks:        { label: 'Report Remarks',         parent: 'Results' },
    sendNotification:         { label: 'Send Notification',      parent: 'Notifications' },
    notificationHistory:      { label: 'Notification History',   parent: 'Notifications' },
    bookCatalog:              { label: 'Book Catalog',           parent: 'Library' },
    issueReturn:              { label: 'Issue / Return',         parent: 'Library' },
    libraryTransactions:      { label: 'Library Transactions',   parent: 'Library' },
    manageRoutes:             { label: 'Manage Routes',          parent: 'Transport' },
    mapTransport:             { label: 'Assign Students',        parent: 'Transport' },
    addEmployee:              { label: 'Add Employee',           parent: 'Employee' },
    searchEmployee:           { label: 'Search Employees',       parent: 'Employee' },
    bulkEmployeeUpdate:       { label: 'Bulk Update',            parent: 'Employee' },
    employeeIdPrint:          { label: 'Employee ID Print',      parent: 'Employee' },
    staffAttendanceMark:      { label: 'Staff Attendance',       parent: 'Employee' },
    cmsHero:                  { label: 'Hero Slider',            parent: 'Website CMS' },
    cmsTheme:                 { label: 'Theme',                  parent: 'Website CMS' },
    cmsAdmission:             { label: 'Admission Settings',     parent: 'Website CMS' },
    cmsGlobalStats:           { label: 'Global Stats',           parent: 'Website CMS' },
    cmsGallery:               { label: 'Gallery',                parent: 'Website CMS' },
    cmsStaff:                 { label: 'Staff Directory',        parent: 'Website CMS' },
    cmsHolidays:              { label: 'Holidays',               parent: 'Website CMS' },
    cmsEvents:                { label: 'Events',                 parent: 'Website CMS' },
    cmsAchievements:          { label: 'Achievements',           parent: 'Website CMS' },
    cmsTestimonials:          { label: 'Testimonials',           parent: 'Website CMS' },
    cmsStudentDashboard:      { label: 'Student Dashboard Config', parent: 'Website CMS' },
    financeDashboard:         { label: 'Finance Dashboard',      parent: 'Finance' },
    chartOfAccounts:          { label: 'Chart of Accounts',      parent: 'Finance' },
    journalEntry:             { label: 'Journal Entry',          parent: 'Finance' },
    paymentVouchers:          { label: 'Payment Vouchers',       parent: 'Finance' },
    receiptVouchers:          { label: 'Receipt Vouchers',       parent: 'Finance' },
    trialBalance:             { label: 'Trial Balance',          parent: 'Finance' },
    profitLossReport:         { label: 'Profit & Loss',          parent: 'Finance' },
    balanceSheetReport:       { label: 'Balance Sheet',          parent: 'Finance' },
    salaryStructure:          { label: 'Salary Structure',       parent: 'Payroll' },
    staffSalary:              { label: 'Staff Salary',           parent: 'Payroll' },
    generatePayroll:          { label: 'Generate Payroll',       parent: 'Payroll' },
    payrollHistory:           { label: 'Payroll History',        parent: 'Payroll' },
    payslipView:              { label: 'Payslip View',           parent: 'Payroll' },
    salaryReports:            { label: 'Salary Reports',         parent: 'Payroll' },
    websiteSettings:          { label: 'Website Settings',       parent: 'Settings' },
    adminPortalCMS:           { label: 'Portal Branding',        parent: 'Settings' },
    notices:                  { label: 'Notice Board',           parent: 'Communication' },
    parentLogin:              { label: 'Parent Login Access',    parent: 'Communication' },
    parentLoginSection:       { label: 'Parent Login Access',    parent: 'Communication' },
    bonafideCertificate:      { label: 'Bonafide Certificate',   parent: 'Certificates' },
    bonafideCertificateSection: { label: 'Bonafide Certificate', parent: 'Certificates' },
    schoolLeavingCertificate: { label: 'School Leaving Certificate', parent: 'Certificates' },
    schoolLeavingCertificateSection: { label: 'School Leaving Certificate', parent: 'Certificates' },
    transferCertificate:      { label: 'Transfer Certificate',   parent: 'Certificates' },
    transferCertificateSection: { label: 'Transfer Certificate', parent: 'Certificates' },
    certificateHistory:       { label: 'Certificate History',    parent: 'Certificates' },
    certificateHistorySection: { label: 'Certificate History',   parent: 'Certificates' },
};

window.showSection = function (sectionId, updateHash = true) {
    if (!sectionId) sectionId = 'dashboardOverview';
    // Normalize: strip trailing 'Section' from legacy nav links (admin-dashboard.html uses 'xxxSection')
    const normalizedId = sectionId.endsWith('Section') ? sectionId.slice(0, -7) : sectionId;
    window._currentSectionId = normalizedId;

    // Load dynamic module if this section uses one
    if (MODULE_SECTIONS[normalizedId] && !window.SECTION_MODULES[MODULE_SECTIONS[normalizedId]]) {
        window.loadSectionModule(MODULE_SECTIONS[normalizedId], normalizedId + 'Section');
    }

    // Update hash for persistence
    if (updateHash) {
        window.location.hash = normalizedId;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide all (including dynamic sections inside #dynamicSectionContainer)
    document.querySelectorAll('.dashboard-section').forEach((s) => {
        s.style.display = 'none';
        s.classList.add('hidden');
        s.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    document.querySelectorAll('.cat-header').forEach((h) => h.classList.remove('active'));

    // Show target (try both normalizedId with Section suffix and raw sectionId)
    const target = document.getElementById(normalizedId + 'Section');
    if (target) {
        target.style.display = 'block';
        target.classList.remove('hidden');
        target.classList.add('active');
    } else {
        const fallbackTarget = document.getElementById(normalizedId) || document.getElementById(sectionId);
        if (fallbackTarget) {
            fallbackTarget.style.display = 'block';
            fallbackTarget.classList.remove('hidden');
            fallbackTarget.classList.add('active');
        } else if (MODULE_SECTIONS[normalizedId]) {
            // Modular section that hasn't loaded yet — wait for it
            sessionStorage.setItem('_pendingModuleSection', normalizedId);
            return;
        } else {
            console.warn(`Section ${normalizedId} not found, defaulting to dashboardOverview`);
            if (normalizedId !== 'dashboardOverview' && normalizedId !== '') {
                window.showSection('dashboardOverview', true);
            }
            return;
        }
    }

    // Active link highlighting (match both 'xxx' and 'xxxSection' formats)
    const activeLink =
        document.querySelector(`.nav-link[onclick*="'${normalizedId}'"]`) ||
        document.querySelector(`.nav-link[onclick*="'${sectionId}'"]`) ||
        document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');

        // Also highlight parent category header if it's a sub-link
        if (activeLink.classList.contains('sub-link')) {
            const parentCat = activeLink.closest('.nav-category');
            if (parentCat) {
                const header = parentCat.querySelector('.cat-header');
                const submenu = parentCat.querySelector('.cat-submenu');
                if (header) header.classList.add('active');
                if (submenu) submenu.classList.add('open');
            }
        }
    }

    // Update browser tab title and breadcrumb
    const schoolName = document.getElementById('sidebarSchoolName')?.textContent || 'School';
    const meta = SECTION_META[normalizedId];
    if (meta) {
        document.title = `${meta.label} | ${schoolName} ERP`;
        const bcParent = document.getElementById('breadcrumbParent');
        const bcCurrent = document.getElementById('breadcrumbCurrent');
        const bcSep = document.getElementById('breadcrumbSep');
        if (bcParent && bcCurrent) {
            bcParent.textContent = meta.parent || '';
            bcCurrent.textContent = meta.label;
            if (bcSep) bcSep.style.display = meta.parent ? 'inline' : 'none';
        }
    } else {
        document.title = `Admin Dashboard | ${schoolName}`;
    }

    // Update Section Title & Subtitle
    const sectionMetadata = {
        dashboardOverview: { title: 'School Overview', sub: 'Real-time performance metrics' },
        studentList: { title: 'Student Search & Management', sub: 'Quick search and comprehensive student profiles' },
        promotions: { title: 'Promotion Wizard', sub: 'End-of-year bulk student promotion across sessions' },
        resultsStatus: { title: 'Documents Verification', sub: 'Audit and verify student enrollment documents' },
        admitCardTool: { title: 'Admit Card PDF Tool', sub: 'Generate and print examination admit cards' },
        bulkResultGenerator: { title: 'Report Card PDF Tool', sub: 'Bulk generate student report cards' },
        feeMasterSection: { title: 'Fee Master Configuration', sub: 'Define fee structures and amounts' },
        createMonthlyFeeSection: {
            title: 'Monthly Fee Generation',
            sub: 'Generate fees for a class for a specific month',
        },
        searchStudentFeeSection: { title: 'Student Fee Ledger', sub: 'Search individual student payment status' },
        searchFeeDuesSection: { title: 'Search Fee Dues', sub: 'Filter students with outstanding balances' },
        sendFeeMessageSection: { title: 'Send Fee Message', sub: 'Notify parents about pending fees' },
        monthlyPaymentViewSection: { title: 'Monthly Payment View', sub: 'Track monthly fee payment status' },
        revertedPaymentsSection: { title: 'Reverted Payments', sub: 'Audit trail of cancelled receipts' },
        bulkFeeDiscountSection: { title: 'Bulk Fee Discount', sub: 'Apply discounts to multiple students' },
        bulkExtraFeeSection: { title: 'Bulk Add Extra Fee', sub: 'Add one-off charges to a whole class' },
        lateFeeRulesSection: { title: 'Late Fee Fine Rules', sub: 'Configure automatic late fine charges' },
        classFeePaymentSection: { title: 'Fee Collection Dashboard', sub: 'Collect and manage fee payments' },
        demandReceiptSection: { title: 'Demand Fee Receipt', sub: 'Generate demand receipts' },
        manageExam: { title: 'Examination & Marks', sub: 'Manage schedules, subjects, and marks entry' },
        attendanceManagement: { title: 'Attendance Marking', sub: 'Daily student attendance tracking' },
        notices: { title: 'Notice Board', sub: 'Publish and manage school-wide announcements' },
        academicSession: { title: 'Academic Sessions', sub: 'Configure and switch between academic years' },
        addClass: { title: 'Classes & Sections', sub: 'Manage school structure and class levels' },
        addSubject: { title: 'Subject Management', sub: 'Define and assign subjects to classes' },
        addSyllabusSection: { title: 'Syllabus & Resources', sub: 'Upload PDFs, books, and study materials' },
        studentIdPrintSection: { title: 'ID Card Generator', sub: 'Design and print student identity cards' },
        adminPortalCMS: { title: 'Admin Portal CMS', sub: 'Customize portal settings and branding' },
        parentsNotPaidTool: { title: 'Fee Default Tracking', sub: 'Identify and notify parents with pending dues' },
        manualReportCardUpload: { title: 'Manual Report Card Upload', sub: 'Upload legacy report cards for students' },
        addEnquiry: { title: 'New Admission Enquiry', sub: 'Record and track potential student leads' },
        searchEnquiry: { title: 'Search Enquiries', sub: 'Filter and manage admission enquiries' },
        studentAdmission: { title: 'Student Admission', sub: 'Register new student profiles in the system' },
        viewAttendanceStats: { title: 'Attendance Reports', sub: 'Analyze student attendance trends' },
        studentRfidUpdate: { title: 'Student RFID Update', sub: 'Update RFID numbers for student identification' },
        pickupIdPrint: { title: 'Pickup ID Print', sub: 'Generate pickup cards for students' },
        assignHomework: { title: 'Assign Homework', sub: 'Create and distribute homework to classes' },
        homeworkHistory: { title: 'Homework History', sub: 'Review and manage past homework assignments' },
        gradeHomework: { title: 'Grade Homework', sub: 'Review and grade student submissions' },
        classTimetables: { title: 'Class Timetables', sub: 'Manage and view class-wise schedules' },
        teacherTimetables: { title: 'Teacher Timetables', sub: 'Manage and view teacher-wise schedules' },
        manageExamSchedule: { title: 'Exam Timetable', sub: 'Configure dates and timing for examinations' },
        viewExamSchedule: { title: 'View Date-Sheet', sub: 'Monitor upcoming exam schedules' },
        publishExamSchedule: { title: 'Publish Schedule', sub: 'Make exam schedules visible to students' },
        examAttendanceCard: { title: 'Exam Attendance', sub: 'Generate attendance sheets for exams' },
        addResult: { title: 'Bulk Marks Entry', sub: 'Batch update student exam marks' },
        viewReportCard: { title: 'View Report Card', sub: 'Preview individual student results' },
        publishResults: { title: 'Publish Results', sub: 'Release examination results to portals' },
        resultAnalytics: { title: 'Result Analytics', sub: 'In-depth performance analysis and stats' },
        manageAllResults: { title: 'Manage Results', sub: 'Administrative control over all student marks' },
        sendNotification: { title: 'Send Bulk Message', sub: 'Blast announcements via SMS or Email' },
        bookCatalog: { title: 'Book Catalog', sub: 'Manage library book inventory' },
        issueReturn: { title: 'Issue / Return Book', sub: 'Log library circulation transactions' },
        manageRoutes: { title: 'Manage Routes', sub: 'Configure school transport paths' },
        mapTransport: { title: 'Assign Students', sub: 'Link students to transport routes' },
        addEmployee: { title: 'Add Employee', sub: 'Register new staff members' },
        searchEmployee: { title: 'Search Employee', sub: 'Filter and manage staff profiles' },
        cmsHero: { title: 'Hero Slider CMS', sub: 'Manage home page banner images' },
        cmsGallery: { title: 'Photo Gallery CMS', sub: 'Update website image gallery' },
        cmsStaff: { title: 'Staff Directory CMS', sub: 'Manage staff profiles on the website' },
        financeDashboard: { title: 'Finance Dashboard', sub: 'Overview of school finances' },
        chartOfAccounts: { title: 'Chart of Accounts', sub: 'Manage account heads' },
        journalEntry: { title: 'Journal Entry', sub: 'Record double-entry vouchers' },
        paymentVouchers: { title: 'Payment Vouchers', sub: 'Outgoing payment records' },
        receiptVouchers: { title: 'Receipt Vouchers', sub: 'Incoming receipt records' },
        trialBalance: { title: 'Trial Balance', sub: 'Verify debits equal credits' },
        profitLossReport: { title: 'Profit & Loss Statement', sub: 'Income vs Expenses overview' },
        balanceSheetReport: { title: 'Balance Sheet', sub: 'Financial position overview' },
        salaryStructure: { title: 'Salary Structure', sub: 'Define pay scales and deductions' },
        staffSalary: { title: 'Staff Salary Assignment', sub: 'Assign structures to employees' },
        generatePayroll: { title: 'Generate Payroll', sub: 'Create monthly salary records' },
        payrollHistory: { title: 'Payroll History', sub: 'View past payroll runs' },
        payslipView: { title: 'Payslip View', sub: 'Search and view employee payslips' },
        salaryReports: { title: 'Salary Reports', sub: 'Expenditure analysis and breakdown' },
        manageLeaveTypes: { title: 'Leave Types', sub: 'Define leave categories' },
        leaveApplications: { title: 'Leave Applications', sub: 'Review staff leave requests' },
        leaveBalance: { title: 'Leave Balance', sub: 'View remaining leave balances' },
        leaveCalendar: { title: 'Leave Calendar', sub: 'Visual calendar of leaves' },
        leaveReport: { title: 'Leave Report', sub: 'Year-wise leave summary' },
        staffAttendanceMark: { title: 'Staff Attendance', sub: 'Mark daily employee attendance' },
        staffAttendanceReport: { title: 'Staff Attendance Report', sub: 'Monthly attendance summary' },
        bonafideCertificateSection: { title: 'Bonafide Certificate', sub: 'Generate student bonafide certificate' },
        schoolLeavingCertificateSection: { title: 'School Leaving Certificate', sub: 'Generate SLC for leaving students' },
        transferCertificateSection: { title: 'Transfer Certificate', sub: 'Generate TC for transferring students' },
        certificateHistorySection: { title: 'Certificate History', sub: 'Audit trail of all issued certificates' },
        parentLoginSection: { title: 'Manage Parent Login', sub: 'Create and manage parent portal access credentials' },
        adminProfile: { title: 'My Profile', sub: 'View your account details and change your password' },
        legacyMigration: { title: 'Legacy Data Migration', sub: 'Migrate top-level data into school collections' },
    };

    const titleEl = document.getElementById('sectionTitle');
    const subtextEl = document.getElementById('headerSubtext');

    if (titleEl && sectionMetadata[sectionId]) {
        titleEl.textContent = sectionMetadata[sectionId].title;
        if (subtextEl) subtextEl.textContent = sectionMetadata[sectionId].sub;
    }

    // ERP Integration: Auto-populate dropdowns when entering registration sections
    if (
        (sectionId === 'addStudentSection' || sectionId === 'studentList') &&
        typeof updateSessionDropdowns === 'function'
    ) {
        updateSessionDropdowns();
    }
    // Bulk Student Update: auto-populate session dropdown
    if (sectionId === 'studentBulkUpdateSection') {
        if (typeof initBulkUpdate === 'function') initBulkUpdate();
    }
    // Student RFID Update: auto-populate session dropdown
    if (sectionId === 'studentRfidUpdateSection' && typeof updateSessionDropdowns === 'function') {
        updateSessionDropdowns();
    }
    // Promotions: populate session/class dropdowns
    if (sectionId === 'promotions') {
        populatePromoteDropdowns();
    }
    // Pickup ID Print: auto-populate session dropdown
    if (sectionId === 'pickupIdPrintSection' && typeof updateSessionDropdowns === 'function') {
        updateSessionDropdowns();
    }

    // Result Management Initializers
    if (sectionId === 'bulkResultGenerator') {
        if (typeof BulkReportCardUI !== 'undefined') BulkReportCardUI.initUI();
    }
    if (sectionId === 'viewReportCard') {
        if (typeof RcPreviewUI !== 'undefined') RcPreviewUI.init();
    }
    if (sectionId === 'publishResults') {
        if (window.refreshPublishStatus) window.refreshPublishStatus();
    }
    if (sectionId === 'reportCardRemarksSection' || sectionId === 'reportCardRemarks') {
        if (window.loadRemarksGrid) window.loadRemarksGrid();
    }
    // ID Generator: auto-populate session dropdown
    if (sectionId === 'studentIdPrintSection' && typeof updateSessionDropdowns === 'function') {
        updateSessionDropdowns().then(() => {
            if (typeof initERPIdCards === 'function') initERPIdCards();
        });
    }

    // Homework Management hook
    if ((sectionId === 'assignHomework' || sectionId === 'homeworkHistory') && typeof initERPHomework === 'function') {
        initERPHomework();
    }
    if (sectionId === 'gradeHomework' && typeof initHomeworkGrading === 'function') {
        initHomeworkGrading();
    }

    // Library Management hook
    if ((sectionId === 'bookCatalog' || sectionId === 'issueReturn') && typeof ERPLibrary !== 'undefined') {
        ERPLibrary.init();
    }

    // Transport Management hook
    if (
        (sectionId === 'manageRoutes' || sectionId === 'assignTransport' || sectionId === 'transportReport') &&
        typeof initERPTransport === 'function'
    ) {
        initERPTransport();
    }

    // Attendance Management hook
    if (
        (sectionId === 'attendanceManagement' || sectionId === 'viewAttendanceStats') &&
        typeof initERPAttendance === 'function'
    ) {
        initERPAttendance();
    }

    // Exam & Report Card hook
    const examSections = [
        'examGrading',
        'manageExam',
        'manageExamSchedule',
        'viewExamSchedule',
        'publishExamSchedule',
        'admitCardTool',
        'examAttendanceCard',
        'studentExamAttendance',
        'addResult',
        'viewReportCard',
        'publishResults',
        'bulkResultGenerator',
        'resultAnalytics',
        'manageAllResults',
        'reportCardRemarks',
        'manualReportCardUpload',
    ];
    if (examSections.includes(sectionId) && typeof initERPExams === 'function') {
        initERPExams();
    }

    // Notification System hook
    if (
        (sectionId === 'sendNotification' || sectionId === 'notificationHistory') &&
        typeof ERPNotifications !== 'undefined'
    ) {
        ERPNotifications.init();
    }

    // Analytics hook
    if (sectionId === 'resultAnalytics' && typeof ResultAnalytics !== 'undefined') {
        ResultAnalytics.init();
    }

    // Timetable hook
    if (
        ['classTimetables', 'teacherTimetables', 'createTimetable', 'viewTimetable'].includes(sectionId) &&
        typeof initERPTimetable === 'function'
    ) {
        initERPTimetable();
    }

    // Question Paper hook
    if (sectionId === 'questionPaperLibrary' && typeof initQuestionPapers === 'function') {
        initQuestionPapers().then(() => {
            if (typeof loadQuestionPapers === 'function') loadQuestionPapers();
        });
    }

    // Admin Portal CMS hook
    if (sectionId === 'adminPortalCMS' && typeof initAdminPortalCMS === 'function') {
        initAdminPortalCMS();
    }

    // Finance & Accounting hook
    const financeSections = [
        'financeDashboard', 'chartOfAccounts', 'journalEntry',
        'paymentVouchers', 'receiptVouchers', 'trialBalance',
        'profitLossReport', 'balanceSheetReport'
    ];
    if (financeSections.includes(sectionId) && typeof initERPFinance === 'function') {
        initERPFinance();
        if (sectionId === 'financeDashboard') loadFinanceDashboard();
        if (sectionId === 'paymentVouchers') loadFilteredVouchers('Payment', 'paymentVoucherTableBody');
        if (sectionId === 'receiptVouchers') loadFilteredVouchers('Receipt', 'receiptVoucherTableBody');
        if (sectionId === 'trialBalance') generateTrialBalance();
        if (sectionId === 'profitLossReport') generateProfitLoss();
        if (sectionId === 'balanceSheetReport') generateBalanceSheet();
    }

    // Salary & Payroll hook
    const payrollSections = [
        'salaryStructure', 'staffSalary', 'generatePayroll',
        'payrollHistory', 'payslipView', 'salaryReports'
    ];
    if (payrollSections.includes(sectionId) && typeof initERPPayroll === 'function') {
        initERPPayroll();
        if (sectionId === 'payslipView') populatePayslipStaffSelect();
        if (sectionId === 'salaryReports') loadSalaryReport();
    }

    // Leave Management hook
    const leaveSections = [
        'manageLeaveTypes', 'leaveApplications', 'leaveBalance',
        'leaveCalendar', 'leaveReport'
    ];
    if (leaveSections.includes(sectionId) && typeof initERPLeave === 'function') {
        initERPLeave();
        if (sectionId === 'leaveBalance') loadLeaveBalances();
        if (sectionId === 'leaveReport') loadLeaveReport();
        if (sectionId === 'leaveCalendar') loadLeaveCalendar();
    }

    // Staff Attendance hook
    const staffAttSections = ['staffAttendanceMark', 'staffAttendanceReport'];
    if (staffAttSections.includes(sectionId) && typeof initERPStaffAttendance === 'function') {
        initERPStaffAttendance();
        if (sectionId === 'staffAttendanceMark') loadStaffForAttendance();
        if (sectionId === 'staffAttendanceReport') loadStaffAttendanceReport();
    }

    // Certificates hook
    const certSections = [
        'bonafideCertificateSection',
        'schoolLeavingCertificateSection',
        'transferCertificateSection',
        'certificateHistorySection',
    ];
    if (certSections.includes(sectionId) && typeof initERPCertificates === 'function') {
        initERPCertificates();
        if (sectionId === 'certificateHistorySection') loadCertHistory();
    }

    // Manual Report Card Upload hook
    if (sectionId === 'manualReportCardUpload' && typeof initManualUpload === 'function') {
        initManualUpload();
    }

    // Parent Login Manager hook
    if (sectionId === 'parentLoginSection' && typeof initERPParentLogin === 'function') {
        initERPParentLogin();
    }

    // Dashboard Overview hook: load live KPI cards
    if (sectionId === 'dashboardOverview' && typeof loadLiveDashboardKPIs === 'function') {
        loadLiveDashboardKPIs();
    }

    // Admin Profile hook
    if (sectionId === 'adminProfile') {
        populateAdminProfile();
    }
};

// Deprecated: window.originalShowSection is no longer used for extension hooks

document.addEventListener('DOMContentLoaded', async () => {
    // Event Listeners
    // Delegated event listeners for dynamically loaded sections
    document.body.addEventListener('submit', function (e) {
        switch (e.target.id) {
            case 'studentForm': handleStudentSubmit(e); break;
            case 'bulkImportForm': handleBulkImport(e); break;
            case 'noticeForm': handleNoticeSubmit(e); break;
            case 'websiteSettingsForm': handleWebsiteSettingsSave(e); break;
        }
    });
    document.body.addEventListener('change', function (e) {
        if (e.target.id === 'selectAll') handleSelectAll(e);
        if (e.target.id === 'classFilter') {
            currentPage = 1;
            filterAndDisplayStudents();
        }
    });
    document.body.addEventListener('input', function (e) {
        if (e.target.id === 'searchInput') {
            currentPage = 1;
            filterAndDisplayStudents();
        }
    });

    // Initial Auth and App Initialization
    const session = await window.AuthGuard?.requireAuth({ role: ['admin', 'super_admin'] });
    if (session) {
        document.getElementById('adminEmail').textContent = session.user.email;

        // Only initialize once
        if (!isInitializing) {
            initializeApp();
        }

        // Initial Routing based on Hash - delayed to ensure everything is ready
        setTimeout(() => {
            const initialSection = window.location.hash.replace('#', '');
            window.showSection(initialSection || 'dashboardOverview');
        }, 100);
    }

    // Hash change routing
    window.addEventListener('hashchange', () => {
        const sectionId = window.location.hash.replace('#', '');
        if (sectionId) showSection(sectionId, false); // false = don't update hash again
    });
});

async function initializeApp() {
    if (isInitializing) return;

    // Ensure school resolution is complete before any data fetching
    if (window.schoolBootstrapReady) {
        console.log('Admin Dashboard: Waiting for school bootstrap...');
        await window.schoolBootstrapReady;
    }

    isInitializing = true;
    console.log('Initializing App for School:', CURRENT_SCHOOL_ID);
    setLoading(true);

    // Check if school setup is needed (first-time login)
    try {
        const sessionSnap = await schoolData('sessions').limit(1).get();
        const classSnap = await schoolData('classes').limit(1).get();
        const schoolDocSnap = await schoolRef().get();
        const schoolNeedsSetup = sessionSnap.empty || classSnap.empty;
        const setupFlag = schoolDocSnap.exists && schoolDocSnap.data().setupComplete === true;

        if (schoolNeedsSetup && !setupFlag) {
            console.log('[Setup] New school detected — launching setup wizard');
            setLoading(false);
            window.showSection('schoolSetupWizard');
            return;
        }
    } catch (setupErr) {
        console.warn('[Setup] Setup check failed, proceeding normally:', setupErr);
    }

    try {
        await loadInitialData();
        updateStats();

        // Phase 8 + ERP Initializers (Wrapped to prevent one failure from hanging the whole app)
        const safeInit = (fn, name) => {
            try {
                if (typeof fn === 'function') fn();
                else console.warn(`Initializer ${name} not found.`);
            } catch (e) {
                console.error(`Error in ${name}:`, e);
            }
        };

        // Note: initCMS* are mostly handled by DOMContentLoaded in cms-admin.js

        if (typeof initERPClassMgmt === 'function') safeInit(initERPClassMgmt, 'initERPClassMgmt');
        if (typeof initERPExams === 'function') safeInit(initERPExams, 'initERPExams');
        if (typeof initERPFees === 'function') safeInit(initERPFees, 'initERPFees');
        // Initialize dynamic modules based on current section (check hash since initializeApp runs before the initial showSection due to setTimeout)
        const initSectionId = window._currentSectionId || window.location.hash.replace('#', '') || 'dashboardOverview';
        if ((initSectionId === 'demandReceipt' || initSectionId === 'demandReceiptSection') && typeof loadDemandSessions === 'function') loadDemandSessions();
        if (typeof initERPAdmission === 'function') safeInit(initERPAdmission, 'initERPAdmission');
        if (typeof initQuestionPapers === 'function') safeInit(initQuestionPapers, 'initQuestionPapers');

        // Designation Manager init
        if (typeof initDesignationManager === 'function') safeInit(initDesignationManager, 'initDesignationManager');

        // Final Branding Cleanup
        if (typeof applyAdminBranding === 'function') applyAdminBranding();
    } catch (error) {
        console.error('Initialization failed:', error);
    } finally {
        clearTimeout(globalLoadWatchdog);
        setLoading(false);
        console.log('Initialization complete.');

        // Prefetch student list module for faster navigation
        if (typeof window.preloadSectionModule === 'function') {
            window.preloadSectionModule('students/student-list');
        }
    }
}

function setLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex';
        } else {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
}

function showToast(message, type = 'success', detail = '', duration = 0) {
    const existing = document.getElementById('snrToast');
    if (existing) existing.remove();

    if (!duration) {
        duration = Math.max(3000, message.length * 60 + (detail.length * 40));
        if (type === 'error') duration = 0;
    }

    const icons = {
        success: { icon: '✓', bg: '#dcfce7', color: '#15803d', border: '#10b981' },
        error:   { icon: '✕', bg: '#fee2e2', color: '#b91c1c', border: '#ef4444' },
        warning: { icon: '!', bg: '#fef3c7', color: '#b45309', border: '#f59e0b' },
        info:    { icon: 'i', bg: '#eff6ff', color: '#1d4ed8', border: '#3b82f6' },
    };
    const style = icons[type] || icons.info;

    const toast = document.createElement('div');
    toast.id = 'snrToast';
    toast.innerHTML = `
        <div style="
            position: fixed; bottom: 1.5rem; right: 1.5rem;
            background: white; border-radius: 14px; padding: 1rem 1.25rem;
            box-shadow: 0 8px 40px rgba(0,0,0,.18);
            display: flex; align-items: flex-start; gap: 0.875rem;
            z-index: 9999; max-width: 420px; min-width: 280px;
            border-left: 4px solid ${style.border};
            animation: toastSlideIn 0.25s ease;
        ">
            <div style="
                width: 30px; height: 30px; min-width: 30px;
                background: ${style.bg}; color: ${style.color};
                border-radius: 50%; display: flex; align-items: center;
                justify-content: center; font-weight: 800; font-size: 0.85rem;
            ">${style.icon}</div>
            <div style="flex:1; min-width:0">
                <div style="font-weight:600; font-size:0.9rem; color:#1e293b; line-height:1.3">${message}</div>
                ${detail ? `<div style="font-size:0.78rem; color:#64748b; margin-top:3px">${detail}</div>` : ''}
            </div>
            <button onclick="document.getElementById('snrToast')?.remove()" style="
                background: none; border: none; color: #94a3b8;
                cursor: pointer; font-size: 1rem; padding: 0;
                line-height: 1; flex-shrink: 0;
            ">✕</button>
        </div>
    `;

    if (!document.getElementById('toastStyle')) {
        const s = document.createElement('style');
        s.id = 'toastStyle';
        s.textContent = `@keyframes toastSlideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
        document.head.appendChild(s);
    }

    document.body.appendChild(toast);
    if (duration > 0) {
        setTimeout(() => document.getElementById('snrToast')?.remove(), duration);
    }
}

async function loadInitialData(classFilterVal = '') {
    try {
        let query = schoolData('students');

        // Optimization: Use .where() if a class filter is provided
        if (classFilterVal) {
            query = query.where('class', '==', classFilterVal);
        }

        const snapshot = await query.get();
        allStudents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Update Stats
        updateStats();

        // Populate Class Filters only if it's the first load (to avoid wiping out the selection)
        if (!classFilterVal) {
            const classes = [...new Set(allStudents.map((s) => s.class))].filter(Boolean).sort((a, b) => a - b);
            const classFilter = document.getElementById('classFilter');
            const promoteFrom = document.getElementById('promoteFromClass');

            if (classFilter) {
                const currentFilter = classFilter.value;
                classFilter.innerHTML = '<option value="">All Classes</option>';
                classes.forEach((c) => {
                    classFilter.innerHTML += `<option value="${c}">Class ${c}</option>`;
                });
                classFilter.value = currentFilter;
            }

            if (promoteFrom) {
                promoteFrom.innerHTML = '<option value="">Select Class</option>';
                classes.forEach((c) => {
                    promoteFrom.innerHTML += `<option value="${c}">Class ${c}</option>`;
                });
            }
        }

        filterAndDisplayStudents();
        loadNoticeHistory();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading student data', 'error');
    }
}

async function loadDashboardOverview() {
    // Rely on updateStats for dynamic counts
    updateStats();

    // Other counts (Mocked for now, will connect to real collections in Phase 3)
    const teachers = document.getElementById('totalTeachersCount');
    if (teachers) teachers.textContent = '12';

    const fees = document.getElementById('monthlyFeesTotal');
    if (fees) fees.textContent = '₹ 1,45,000';

    const attendance = document.getElementById('attendanceRate');
    if (attendance) attendance.textContent = '94%';

    // Load custom quick links
    loadCustomQuickLinks();
}

/**
 * ADMIN PORTAL CMS LOGIC
 */
let adminPortalSettings = {
    logoUrl: '',
    principalSignatureUrl: '',
    showSchoolName: true,
    quickLinks: [
        { title: 'New Enquiry', icon: 'fa-user-plus', sectionId: 'addEnquiry', color: 'blue' },
        { title: 'Add Student', icon: 'fa-user-plus', sectionId: 'studentList', color: 'blue' },
        { title: 'ID Card', icon: 'fa-id-card', sectionId: 'studentIdPrint', color: 'green' },
        { title: 'Report Card', icon: 'fa-print', sectionId: 'bulkResultGenerator', color: 'indigo' },
        { title: 'Fee Management', icon: 'fa-credit-card', sectionId: 'feeMaster', color: 'amber' },
        { title: 'Exams', icon: 'fa-magic', sectionId: 'manageExam', color: 'indigo' },
        { title: 'Attendance', icon: 'fa-check-double', sectionId: 'attendanceManagement', color: 'red' },
        { title: 'Classes', icon: 'fa-ruler-combined', sectionId: 'addClass', color: 'amber' },
    ],
};

async function initAdminPortalCMS() {
    setLoading(true);
    try {
        const doc = await schoolData('settings').doc('admin_portal').get();
        if (doc.exists) {
            adminPortalSettings = { ...adminPortalSettings, ...doc.data() };
        }

        // Apply to form
        const logoPreview = document.getElementById('cms_logoPreview');
        const sigPreview = document.getElementById('cms_signaturePreview');
        const showNameCheck = document.getElementById('cms_showSchoolName');

        if (logoPreview && adminPortalSettings.logoUrl) logoPreview.src = adminPortalSettings.logoUrl;
        if (sigPreview && adminPortalSettings.principalSignatureUrl)
            sigPreview.src = adminPortalSettings.principalSignatureUrl;
        if (showNameCheck) showNameCheck.checked = adminPortalSettings.showSchoolName !== false;

        renderAdminQuickLinksEditor();
    } catch (error) {
        console.error('Error loading Admin CMS settings:', error);
        showToast('Error loading settings', 'error');
    } finally {
        setLoading(false);
    }
}

function renderAdminQuickLinksEditor() {
    const list = document.getElementById('cms_quickLinksList');
    if (!list) return;

    list.innerHTML = '';
    adminPortalSettings.quickLinks.forEach((link, index) => {
        const row = document.createElement('div');
        row.className = 'flex gap-0-5 mb-0-75 align-center card bg-light p-0-75 border-radius-8';
        row.innerHTML = `
            <div class="flex-1">
                <input type="text" class="form-control form-control-sm mb-0-25" placeholder="Title" value="${link.title}" onchange="updateQuickLink(${index}, 'title', this.value)">
                <div class="flex gap-0-5">
                    <input type="text" class="form-control form-control-sm" placeholder="Icon (fa-...)" value="${link.icon}" onchange="updateQuickLink(${index}, 'icon', this.value)">
                    <select class="form-control form-control-sm" onchange="updateQuickLink(${index}, 'sectionId', this.value)">
                        <option value="dashboardOverview" ${link.sectionId === 'dashboardOverview' ? 'selected' : ''}>Overview</option>
                        <option value="studentList" ${link.sectionId === 'studentList' ? 'selected' : ''}>Students</option>
                        <option value="studentIdPrint" ${link.sectionId === 'studentIdPrint' ? 'selected' : ''}>ID Cards</option>
                        <option value="bulkResultGenerator" ${link.sectionId === 'bulkResultGenerator' ? 'selected' : ''}>Report Cards</option>
                        <option value="feeMaster" ${link.sectionId === 'feeMaster' ? 'selected' : ''}>Fees</option>
                        <option value="manageExam" ${link.sectionId === 'manageExam' ? 'selected' : ''}>Exams</option>
                        <option value="attendanceManagement" ${link.sectionId === 'attendanceManagement' ? 'selected' : ''}>Attendance</option>
                        <option value="addClass" ${link.sectionId === 'addClass' ? 'selected' : ''}>Classes</option>
                        <option value="notices" ${link.sectionId === 'notices' ? 'selected' : ''}>Notices</option>
                        <option value="addEnquiry" ${link.sectionId === 'addEnquiry' ? 'selected' : ''}>Enquiry</option>
                    </select>
                </div>
            </div>
            <button class="btn-portal btn-ghost btn-sm text-red" onclick="removeQuickLinkRow(${index})"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(row);
    });
}

function updateQuickLink(index, field, value) {
    adminPortalSettings.quickLinks[index][field] = value;
}

function addQuickLinkRow() {
    adminPortalSettings.quickLinks.push({
        title: 'New Link',
        icon: 'fa-link',
        sectionId: 'dashboardOverview',
        color: 'blue',
    });
    renderAdminQuickLinksEditor();
}

function removeQuickLinkRow(index) {
    adminPortalSettings.quickLinks.splice(index, 1);
    renderAdminQuickLinksEditor();
}

/**
 * Global helper for image previews
 */
window.previewImage = function (input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById(previewId).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

async function saveAdminPortalCMS() {
    setLoading(true);
    try {
        const logoInput = document.getElementById('cms_logoInput');
        const sigInput = document.getElementById('cms_signatureInput');
        const showNameCheck = document.getElementById('cms_showSchoolName');

        // Handle Image Uploads (Base64 for this version)
        if (logoInput.files && logoInput.files[0]) {
            adminPortalSettings.logoUrl = await toBase64(logoInput.files[0]);
        }
        if (sigInput.files && sigInput.files[0]) {
            adminPortalSettings.principalSignatureUrl = await toBase64(sigInput.files[0]);
        }

        adminPortalSettings.showSchoolName = showNameCheck ? showNameCheck.checked : true;

        await schoolData('settings').doc('admin_portal').set(withSchool(adminPortalSettings));

        // Update global branding instantly
        if (typeof applyAdminBranding === 'function') applyAdminBranding();

        showToast('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving Admin CMS settings:', error);
        showToast('Error saving settings', 'error');
    } finally {
        setLoading(false);
    }
}

function toBase64(file) {
    if (file.type && file.type.startsWith('image/') && typeof ImageStorage !== 'undefined') {
        return ImageStorage.compressImageUnder200KB(file);
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Load and render custom quick links on dashboard home
 */
async function loadCustomQuickLinks() {
    const hub = document.querySelector('#quickActionsHub .feature-grid');
    if (!hub) return;

    try {
        // Try to fetch latest settings
        const doc = await schoolData('settings').doc('admin_portal').get();
        if (doc.exists) {
            adminPortalSettings = { ...adminPortalSettings, ...doc.data() };
        }

        // Apply dynamic visibility
        applyAdminBranding();

        // Render links
        hub.innerHTML = '';
        adminPortalSettings.quickLinks.forEach((link) => {
            const card = document.createElement('div');
            card.className = 'feature-card';
            card.onclick = () => showSection(link.sectionId);
            card.innerHTML = `
                <div class="icon-box-small flex-center bg-${link.color || 'blue'}-light text-primary border-radius-12">
                    <i class="fas ${link.icon}"></i>
                </div>
                <h4>${link.title}</h4>
                <p>Quick Access</p>
            `;
            hub.appendChild(card);
        });
    } catch (e) {
        console.warn('Could not load custom quick links, using defaults', e);
    }
}

/**
 * Apply dynamic branding across the portal
 */
function applyAdminBranding() {
    const sNameElements = document.querySelectorAll('.school-name-dynamic');
    const sLogoElements = document.querySelectorAll('.school-logo-dynamic');

    const showName = adminPortalSettings.showSchoolName !== false;
    const logoUrl = adminPortalSettings.logoUrl || window.SCHOOL_LOGO || 'ApexPublicSchoolLogo.png';
    const name = window.SCHOOL_NAME || 'School Portal';

    sNameElements.forEach((el) => {
        el.textContent = name;
        el.style.display = showName ? 'block' : 'none';
    });

    // logoUrl may be a bare media-library filename, an absolute path, or a URL.
    const isBare = !logoUrl.startsWith('/') && !logoUrl.startsWith('http') && !logoUrl.startsWith('data:');
    sLogoElements.forEach((el) => {
        if (isBare && window.SNRMedia) {
            window.SNRMedia.getDataUrl(logoUrl).then((url) => {
                if (url) el.src = url;
            }).catch(() => { el.src = ''; });
        } else {
            el.src = logoUrl;
        }
    });

    // Update global variables for other modules
    if (adminPortalSettings.logoUrl) window.SCHOOL_LOGO = adminPortalSettings.logoUrl;
    if (adminPortalSettings.principalSignatureUrl)
        window.PRINCIPAL_SIGNATURE = adminPortalSettings.principalSignatureUrl;
}

async function updateStudentAttendance() {
    const studentId = document.getElementById('att_studentId').value;
    const date = document.getElementById('att_date')?.value || new Date().toISOString().split('T')[0];
    const status = document.getElementById('att_status')?.value || 'present';
    const sclass = document.getElementById('att_class')?.value || '';
    const section = document.getElementById('att_section')?.value || '';

    if (!studentId || !date) {
        showToast('Please select student and date', 'error');
        return;
    }

    setLoading(true);
    try {
        await schoolData('attendance').add(
            withSchool({
                studentId,
                class: sclass,
                section,
                date,
                status,
            })
        );

        showToast('Attendance marked successfully!');
    } catch (e) {
        showToast('Error updating attendance: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function filterAndDisplayStudents() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const classVal = document.getElementById('classFilter')?.value || '';
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    const filtered = allStudents.filter((s) => {
        const name = (s.name || '').toLowerCase();
        const sid = (s.student_id || '').toLowerCase();
        const roll = (s.roll_no || '').toLowerCase();
        const reg = (s.reg_no || '').toLowerCase();
        const aadhar = (s.aadhar || s.student_aadhar || '').toLowerCase();
        const father = (s.father_name || s.fatherName || '').toLowerCase();
        const mother = (s.mother_name || s.mother || '').toLowerCase();
        const mobile = (s.mobile || s.phone || '').toLowerCase();

        const matchesSearch =
            name.includes(searchTerm) ||
            sid.includes(searchTerm) ||
            roll.includes(searchTerm) ||
            reg.includes(searchTerm) ||
            aadhar.includes(searchTerm) ||
            father.includes(searchTerm) ||
            mother.includes(searchTerm) ||
            mobile.includes(searchTerm);

        const matchesClass = classVal === '' || s.class === classVal;
        return matchesSearch && matchesClass;
    });

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    tbody.innerHTML = '';
    paginated.forEach((student) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="student-checkbox" value="${escHtml(student.id)}" onchange="toggleSelect('${escHtml(student.id)}')" ${selectedStudents.has(student.id) ? 'checked' : ''}></td>
            <td>${escHtml(student.student_id) || '-'}</td>
            <td>${escHtml(student.roll_no) || '-'}</td>
            <td>${escHtml(student.reg_no) || '-'}</td>
            <td><b>${escHtml(student.name) || '-'}</b></td>
            <td><span class="badge" style="background:#f1f5f9; color:#475569;">Class ${escHtml(student.class) || '-'} / ${escHtml(student.section) || '-'}</span></td>
            <td>${escHtml(student.session) || '-'}</td>
            <td>${escHtml(student.father_name) || '-'}</td>
            <td>${escHtml(student.mother_name) || '-'}</td>
            <td>${escHtml(student.phone || student.mobile) || '-'}</td>
            <td>${escHtml(student.dob) || '-'}</td>
            <td>${escHtml(student.gender) || '-'}</td>
            <td>${escHtml(student.category) || '-'}</td>
            <td>${escHtml(student.caste) || '-'}</td>
            <td>${escHtml(student.religion) || '-'}</td>
            <td>${escHtml(student.aadhar) || '-'}</td>
            <td>${escHtml(student.pen) || '-'}</td>
            <td>${escHtml(student.rfid_no || student.rfid || student.smart_card_no) || '-'}</td>
            <td>${escHtml(student.guardian_name) || '-'}</td>
            <td>${escHtml(student.guardian_phone) || '-'}</td>
            <td>${escHtml(student.address) || '-'}</td>
            <td>${escHtml(student.permanent_address) || '-'}</td>
            <td>${escHtml(student.city) || '-'}</td>
            <td>${escHtml(student.hostel) || '-'}</td>
            <td>${escHtml(student.transport) || '-'}</td>
            <td>${escHtml(student.join_date) || '-'}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-portal btn-ghost btn-sm" onclick="viewStudent('${escHtml(student.id)}')" title="View Profile"><i class="fas fa-eye"></i></button>
                    <button class="btn-portal btn-ghost btn-sm" onclick="editStudent('${escHtml(student.id)}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-portal btn-ghost btn-sm btn-danger" onclick="deleteStudent('${escHtml(student.id)}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderPagination(filtered.length);
}

function renderPagination(total) {
    const container = document.getElementById('paginationControls');
    const totalPages = Math.ceil(total / itemsPerPage);
    if (!container) return;

    container.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: center;">
            <button class="btn-portal btn-ghost" onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>
            <span style="font-size: 0.875rem;">Page ${currentPage} of ${totalPages || 1}</span>
            <button class="btn-portal btn-ghost" onclick="changePage(1)" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
        </div>
    `;
}

function changePage(delta) {
    currentPage += delta;
    filterAndDisplayStudents();
}



async function populateResultsStatus() {
    const tbody = document.getElementById('resultsStatusTableBody');
    const yearSelect = document.getElementById('resultsYearFilter');
    const year = yearSelect ? yearSelect.value : '2026';

    tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Checking documents...</td></tr>';

    // Use currently loaded students (which might be filtered by class already)
    const sortedStudents = [...allStudents].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    let resultsCount = 0;
    tbody.innerHTML = '';
    const displayLimit = 50;
    const verifiedList = sortedStudents.slice(0, displayLimit);

    for (const student of verifiedList) {
        const docId = student.id;
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${student.student_id || docId}</td>
            <td>${student.name}</td>
            <td>Class ${student.class || '-'}</td>
            <td>
                <div style="display:flex; flex-direction:column; gap:0.25rem;">
                    <div id="status-report-${docId}"><span class="badge" style="background:#f1f5f9; color:#94a3b8;"><i class="fas fa-spinner fa-spin"></i> Rep: Checking...</span></div>
                    <div id="status-admit-${docId}"><span class="badge" style="background:#f1f5f9; color:#94a3b8;"><i class="fas fa-spinner fa-spin"></i> Adm: Checking...</span></div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <input type="file" id="upload-pdf-${docId}" accept="application/pdf" style="display:none;" onchange="uploadResult(event, '${docId}', '${year}')">
                        <button class="btn-portal btn-ghost btn-sm" onclick="document.getElementById('upload-pdf-${docId}').click()" style="font-size:0.75rem;">
                            <i class="fas fa-upload"></i> Report
                        </button>
                        <a id="preview-btn-${docId}" href="#" target="_blank" class="btn-portal btn-ghost btn-sm hidden" style="font-size:0.75rem;">
                            <i class="fas fa-external-link-alt"></i> View
                        </a>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <input type="file" id="upload-admit-${docId}" accept="application/pdf" style="display:none;" onchange="uploadAdmitCard(event, '${docId}', '${year}')">
                        <button class="btn-portal btn-ghost btn-sm" onclick="document.getElementById('upload-admit-${docId}').click()" style="font-size:0.75rem; color:#d97706;">
                            <i class="fas fa-upload"></i> Admit
                        </button>
                        <a id="preview-admit-btn-${docId}" href="#" target="_blank" class="btn-portal btn-ghost btn-sm hidden" style="font-size:0.75rem;">
                            <i class="fas fa-external-link-alt"></i> View
                        </a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);

        // OPTIMIZATION: Check session cache first for document status
        const cacheKey = `status_${docId}_${year}`;
        const cachedStatus = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');

        const updateUI = (type, exists, data = null) => {
            const cellId = type === 'report' ? `status-report-${docId}` : `status-admit-${docId}`;
            const btnId = type === 'report' ? `preview-btn-${docId}` : `preview-admit-btn-${docId}`;
            const cell = document.getElementById(cellId);
            const btn = document.getElementById(btnId);

            if (exists) {
                if (cell) {
                    cell.innerHTML =
                        type === 'report'
                            ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Rep: Available</span>'
                            : '<span class="badge badge-success" style="background:#f59e0b;"><i class="fas fa-check-circle"></i> Adm: Available</span>';
                }
                if (btn) {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        const win = window.open('', '_blank', 'noopener,noreferrer');
                        if (!win) return;
                        win.document.write(
                            `<iframe src="${escHtml(data)}" width="100%" height="100%" style="border:none;"></iframe>`
                        );
                    };
                    btn.classList.remove('hidden');
                }
                if (type === 'report') {
                    resultsCount++;
                    const countEl = document.getElementById('statTotalResults');
                    if (countEl) countEl.textContent = resultsCount;
                }
            } else {
                if (cell)
                    cell.innerHTML = `<span class="badge badge-danger"><i class="fas fa-times-circle"></i> ${type === 'report' ? 'Rep' : 'Adm'}: Missing</span>`;
            }
        };

        // Check Report Card (Cached or Firestore)
        if (cachedStatus.reportData) {
            updateUI('report', true, cachedStatus.reportData);
        } else {
            schoolDoc('reports', `${docId}_${year}`)
                .get()
                .then((docRef) => {
                    if (docRef.exists) {
                        const data = docRef.data().fileData;
                        updateUI('report', true, data);
                        const current = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
                        sessionStorage.setItem(cacheKey, JSON.stringify({ ...current, reportData: data }));
                    } else {
                        updateUI('report', false);
                    }
                })
                .catch(() => updateUI('report', false));
        }

        // Check Admit Card (Cached or Firestore)
        if (cachedStatus.admitData) {
            updateUI('admit', true, cachedStatus.admitData);
        } else {
            schoolDoc('admitcards', `${docId}_${year}`)
                .get()
                .then((docRef) => {
                    if (docRef.exists) {
                        const data = docRef.data().fileData;
                        updateUI('admit', true, data);
                        const current = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
                        sessionStorage.setItem(cacheKey, JSON.stringify({ ...current, admitData: data }));
                    } else {
                        updateUI('admit', false);
                    }
                })
                .catch(() => updateUI('admit', false));
        }
    }
}

async function uploadResult(event, docId, year) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 900 * 1024) {
        showToast('File too large! Max 900KB.', 'error');
        return;
    }
    setLoading(true);
    try {
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        await schoolDoc('reports', `${docId}_${year}`).set(
            withSchool({
                fileData: base64,
            })
        );
        showToast('Result PDF saved!');
        populateResultsStatus();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function uploadAdmitCard(event, docId, year) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 900 * 1024) {
        showToast('File too large! Max 900KB.', 'error');
        return;
    }
    setLoading(true);
    try {
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        await schoolDoc('admitcards', `${docId}_${year}`).set(
            withSchool({
                fileData: base64,
            })
        );
        showToast('Admit Card saved!');
        populateResultsStatus();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== PROMOTION WIZARD =====================
var _promotePreviewStudents = [];

window.populatePromoteDropdowns = function () {
    // Sessions
    var fromSess = document.getElementById('promoteFromSession');
    var toSess = document.getElementById('promoteToSession');
    if (!fromSess || !toSess) return;
    if (typeof erpState === 'undefined' || !erpState.sessions || !erpState.sessions.length) {
        fromSess.innerHTML = '<option value="">No sessions found</option>';
        toSess.innerHTML = '<option value="">No sessions found</option>';
        return;
    }
    var opts = '<option value="">Select Session</option>';
    erpState.sessions.forEach(function (s) {
        opts += '<option value="' + s.id + '">' + s.name + '</option>';
    });
    fromSess.innerHTML = opts;
    toSess.innerHTML = opts;
    if (erpState.activeSessionId) fromSess.value = erpState.activeSessionId;

    // Classes - populate both from and to from allStudents distinct class values
    var classes = [...new Set(allStudents.map(function (s) { return s.class; }))].filter(Boolean).sort(function (a, b) { return Number(a) - Number(b); });
    var fromCls = document.getElementById('promoteFromClass');
    var toCls = document.getElementById('promoteToClass');
    if (fromCls) {
        var copts = '<option value="">Select Class</option>';
        classes.forEach(function (c) { copts += '<option value="' + c + '">Class ' + c + '</option>'; });
        fromCls.innerHTML = copts;
    }
    if (toCls) {
        var copts2 = '<option value="">Select Class</option>';
        classes.forEach(function (c) { copts2 += '<option value="' + c + '">Class ' + c + '</option>'; });
        toCls.innerHTML = copts2;
    }
};

window.autoSelectTargetSession = function () {
    var fromSessId = document.getElementById('promoteFromSession').value;
    var toSess = document.getElementById('promoteToSession');
    if (!fromSessId || !toSess || typeof erpState === 'undefined') return;
    var fromSession = erpState.sessions.find(function (s) { return s.id === fromSessId; });
    if (!fromSession) return;
    // Parse end year from session name (e.g. "2025-2026" → 2026)
    var nameParts = (fromSession.name || '').match(/(\d{4})/g);
    if (!nameParts || nameParts.length < 2) return;
    var nextStart = parseInt(nameParts[1]);
    // Find a session whose start year matches the next start year
    var nextSession = erpState.sessions.find(function (s) {
        var parts = (s.name || '').match(/(\d{4})/g);
        return parts && parts.length >= 2 && parseInt(parts[0]) === nextStart;
    });
    if (nextSession) toSess.value = nextSession.id;
};

window.autoSelectTargetClass = function () {
    var fromCls = document.getElementById('promoteFromClass').value;
    var toCls = document.getElementById('promoteToClass');
    if (!fromCls || !toCls) return;
    var nextClass = String(Number(fromCls) + 1);
    // Check if next class exists in the dropdown
    for (var i = 0; i < toCls.options.length; i++) {
        if (toCls.options[i].value === nextClass) {
            toCls.value = nextClass;
            return;
        }
    }
};

window.previewPromotion = async function () {
    var status = document.getElementById('promoteStatus');
    var previewArea = document.getElementById('promotePreviewArea');
    var body = document.getElementById('promotePreviewBody');
    var countEl = document.getElementById('promoteCount');
    var confirmBtn = document.getElementById('promoteConfirmBtn');
    if (!body) return;

    var fromSessionId = document.getElementById('promoteFromSession').value;
    var fromClass = document.getElementById('promoteFromClass').value;
    var toSessionId = document.getElementById('promoteToSession').value;
    var toClass = document.getElementById('promoteToClass').value;

    if (!fromSessionId || !fromClass || !toSessionId || !toClass) {
        showToast('Please select source and target values', 'error');
        return;
    }

    status.textContent = 'Loading...';
    previewArea.classList.add('hidden');

    try {
        var snap = await schoolData('students')
            .where('session', '==', fromSessionId)
            .where('class', '==', fromClass)
            .get();

        var students = snap.docs.map(function (d) { return { id: d.id, ...d.data() }; });
        _promotePreviewStudents = students;

        var fromSessName = fromSessionId;
        var toSessName = toSessionId;
        if (typeof erpState !== 'undefined' && erpState.sessions) {
            var fs = erpState.sessions.find(function (s) { return s.id === fromSessionId; });
            var ts = erpState.sessions.find(function (s) { return s.id === toSessionId; });
            if (fs) fromSessName = fs.name;
            if (ts) toSessName = ts.name;
        }

        if (students.length === 0) {
            body.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-4"><i class="fas fa-users text-2xl mb-1 opacity-30" style="display:block;font-size:1.5rem;margin-bottom:0.5rem;"></i>No students found in the selected session and class.</td></tr>';
            countEl.textContent = '0';
            confirmBtn.disabled = true;
            status.textContent = 'No students to promote.';
            previewArea.classList.remove('hidden');
            return;
        }

        var html = '';
        students.forEach(function (s, i) {
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + (s.roll_no || s.rollNo || '-') + '</td>' +
                '<td><strong>' + (s.name || '--') + '</strong></td>' +
                '<td>' + (s.class || '--') + '</td>' +
                '<td class="promote-diff">' + toClass + '</td>' +
                '<td>' + fromSessName + '</td>' +
                '<td class="promote-diff">' + toSessName + '</td>' +
                '</tr>';
        });
        body.innerHTML = html;
        countEl.textContent = students.length;
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Promote All (' + students.length + ')';
        status.textContent = students.length + ' students ready for promotion.';
        previewArea.classList.remove('hidden');
    } catch (e) {
        console.error('[Promote] Preview failed:', e);
        status.textContent = 'Error: ' + e.message;
        showToast('Preview failed: ' + e.message, 'error');
    }
};

window.confirmPromotion = async function () {
    var students = _promotePreviewStudents;
    if (!students || students.length === 0) {
        showToast('No students to promote. Run preview first.', 'error');
        return;
    }

    var toClass = document.getElementById('promoteToClass').value;
    var toSessionId = document.getElementById('promoteToSession').value;
    var carryFees = document.getElementById('promoteCarryFees').checked;

    if (!await window.showConfirmModal({ title: 'Confirm Promotion', message: 'Promote ' + students.length + ' students to Class ' + toClass + '? This cannot be easily undone.', icon: 'fa-arrow-right', confirmText: 'Promote' })) return;

    setLoading(true);
    try {
        var db = window.db || firebase.firestore();
        var batch = db.batch();
        students.forEach(function (s) {
            batch.update(schoolDoc('students', s.id), { class: toClass, session: toSessionId });
        });
        await batch.commit();
        showToast('Promoted ' + students.length + ' students to Class ' + toClass + '!');

        // Carry forward pending fees (batched per student in a single query)
        if (carryFees) {
            var feeCount = 0;
            var sids = students.map(function (s) { return s.id; });
            // Fetch all pending fees for all students in one query
            for (let i = 0; i < sids.length; i += 10) {
                const chunk = sids.slice(i, i + 10);
                const feeSnap = await schoolData('fees')
                    .where('studentId', 'in', chunk)
                    .where('status', 'in', ['pending', 'partial'])
                    .get();
                if (!feeSnap.empty) {
                    const feesByStudent = {};
                    feeSnap.forEach(function (fd) {
                        const fdData = fd.data();
                        if (!feesByStudent[fdData.studentId]) feesByStudent[fdData.studentId] = [];
                        feesByStudent[fdData.studentId].push(fd);
                    });
                    for (const studentId in feesByStudent) {
                        const studentFees = feesByStudent[studentId];
                        const feeBatch = db.batch();
                        studentFees.forEach(function (fd) {
                            const fdData = fd.data();
                            const newRef = schoolData('fees').doc();
                            feeBatch.set(newRef, withSchool({
                                studentId: studentId,
                                session: toSessionId,
                                month: fdData.month || '',
                                year: fdData.year || '',
                                amount: fdData.amount || 0,
                                feeType: fdData.feeType || 'Tuition Fee',
                                paidAmount: 0,
                                status: 'pending',
                                carriedFrom: fd.id,
                                originalSession: fdData.session || ''
                            }));
                            feeCount++;
                        });
                        await feeBatch.commit();
                    }
                }
            }
            if (feeCount > 0) showToast('Carried forward ' + feeCount + ' pending fee records.', 'success');
        }

        _promotePreviewStudents = [];
        await loadInitialData();
        showSection('studentList');
    } catch (error) {
        showToast('Promotion failed: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
};

const BulkReportCardUI = {
    _concurrency: 3,

    initUI() {
        return this.init();
    },

    async init() {
        const sessionSelect = document.getElementById('bulkRes_sessionSelect');
        if (sessionSelect && typeof erpState !== 'undefined' && erpState.sessions) {
            sessionSelect.innerHTML =
                '<option value="">Select Session</option>' +
                erpState.sessions
                    .map((s) => `<option value="${s.id}" ${s.active ? 'selected' : ''}>${s.name}</option>`)
                    .join('');
            if (erpState.activeSessionId) this.loadExams();
        }
    },

    loadExams() {
        RcPreviewUI.loadExams();
    },

    async loadStudents() {
        const sessEl = document.getElementById('bulkRes_sessionSelect');
        if (!sessEl) return;
        const sess = sessEl.options[sessEl.selectedIndex]?.text;
        const cls = document.getElementById('bulkRes_classSelect').value;
        const sec = document.getElementById('bulkRes_sectionSelect').value;
        const body = document.getElementById('bulkResTableBody');
        if (!cls || !body) return;
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';
        try {
            const q = schoolData('students').where('session', '==', sess).where('class', '==', cls);
            const snap = sec === 'All' ? await q.get() : await q.where('section', '==', sec).get();
            if (snap.empty) {
                body.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-4"><i class="fas fa-users text-2xl mb-1 opacity-30" style="display:block;font-size:1.5rem;margin-bottom:0.5rem;"></i>No students found.</td></tr>';
                return;
            }
            body.innerHTML = snap.docs.map((doc) => {
                const s = doc.data();
                return `<tr>
                    <td><input type="checkbox" class="bulk-res-check" value="${doc.id}"></td>
                    <td>${s.roll_no || '-'}</td>
                    <td><strong>${s.name}</strong></td>
                    <td><span class="badge" style="background:#f1f5f9;">Ready</span></td>
                    <td id="status_${doc.id}"><span style="color:var(--text-muted);">Waiting</span></td>
                </tr>`;
            }).join('');
            document.getElementById('startBulkGenBtn').disabled = false;
        } catch (e) {
            console.error(e);
            body.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger);">Error loading students.</td></tr>';
        }
    },

    async runBulk() {
        const selected = Array.from(document.querySelectorAll('.bulk-res-check:checked')).map(cb => cb.value);
        if (selected.length === 0) { showToast('No students selected', 'warning'); return; }
        const examId = document.getElementById('bulkRes_examSelect').value;
        const sessionId = document.getElementById('bulkRes_sessionSelect').value;
        const format = document.getElementById('bulkRes_formatSelect')?.value || 'himalayan';
        if (!examId) { showToast('Select Exam First', 'error'); return; }
        if (!window.ReportCardTool) { showToast('ReportCardTool not loaded', 'error'); return; }
        if (!await window.showConfirmModal({ title: 'Generate Report Cards', message: 'Generate & Publish report cards for ' + selected.length + ' students?', icon: 'fa-file-pdf', confirmText: 'Generate' })) return;

        const progressArea = document.getElementById('bulkResProgressArea');
        const bar = document.getElementById('bulkResProgressBar');
        const statusMsg = document.getElementById('bulkResStatusMsg');
        const percentMsg = document.getElementById('bulkResPercentMsg');
        if (progressArea) progressArea.style.display = 'block';
        document.getElementById('startBulkGenBtn').disabled = true;

        let successCount = 0;
        let completed = 0;
        const total = selected.length;

        async function processOne(sid) {
            const nameEl = document.getElementById(`status_${sid}`);
            if (nameEl) nameEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            try {
                const result = await ReportCardTool.processReportCard(sid, examId, sessionId, format);
                if (result.success) {
                    successCount++;
                    if (nameEl) nameEl.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success);"></i> Published';
                } else {
                    if (nameEl) nameEl.innerHTML = `<i class="fas fa-minus-circle" style="color:#f59e0b;"></i> ${result.reason || 'Skipped'}`;
                }
            } catch (err) {
                if (nameEl) nameEl.innerHTML = `<i class="fas fa-times-circle" style="color:var(--danger);"></i> Failed`;
            }
            completed++;
            const p = Math.round((completed / total) * 100);
            if (bar) bar.style.width = `${p}%`;
            if (percentMsg) percentMsg.textContent = `${p}%`;
            if (statusMsg) statusMsg.textContent = `Completed ${completed}/${total} (${successCount} success)`;
        }

        while (completed < total) {
            const batch = selected.slice(completed, completed + this._concurrency);
            await Promise.allSettled(batch.map(sid => processOne(sid)));
        }

        showToast(`Bulk complete! ${successCount}/${total} published.`);
        document.getElementById('startBulkGenBtn').disabled = false;
    },
};

const IdCardPreviewUI = {
    async init() {
        const sessEl = document.getElementById('idIndiv_session');
        if (!sessEl) return;
        if (typeof erpState !== 'undefined' && erpState.sessions) {
            const options =
                '<option value="">Select Session</option>' +
                erpState.sessions
                    .map((s) => `<option value="${s.id}" ${s.active ? 'selected' : ''}>${s.name}</option>`)
                    .join('');
            sessEl.innerHTML = options;
            if (erpState.activeSessionId) {
                setTimeout(() => this.loadClasses(), 100);
            }
        }
    },
    async loadClasses() {
        const sessId = document.getElementById('idIndiv_session').value;
        const el = document.getElementById('idIndiv_class');
        if (!el || !sessId) return;
        const snap = await schoolData('classes').where('sessionId', '==', sessId).orderBy('sortOrder', 'asc').get();
        el.innerHTML =
            '<option value="">Select Class</option>' +
            snap.docs.map((doc) => `<option value="${doc.data().name}">${doc.data().name}</option>`).join('');
    },
    async loadStudents() {
        const sessEl = document.getElementById('idIndiv_session');
        const sess = sessEl.options[sessEl.selectedIndex]?.text;
        const cls = document.getElementById('idIndiv_class').value;
        const el = document.getElementById('idIndiv_student');
        if (!el || !cls || !sess) return;

        const snap = await schoolData('students').where('session', '==', sess).where('class', '==', cls).get();
        el.innerHTML =
            '<option value="">Select Student</option>' +
            snap.docs.map((doc) => `<option value="${doc.id}">${doc.data().name}</option>`).join('');
    },
    preview() {
        const sid = document.getElementById('idIndiv_student').value;
        if (!sid) return;
        document.getElementById('idPrintSid').value = sid;
        if (window.updateIdPreview) window.updateIdPreview();
    },
};

const RcPreviewUI = {
    async init() {
        const sessionDropdowns = [
            'rcPreviewSession',
            'publishSessionSelect',
            'bulkRes_sessionSelect',
            'remarkSessionSelect',
            'manageResultsSession',
        ];

        // Find at least one existing dropdown to proceed
        const exists = sessionDropdowns.some((id) => document.getElementById(id));
        if (!exists) return;

        if (typeof erpState !== 'undefined' && erpState.sessions) {
            const options =
                '<option value="">Select Session</option>' +
                erpState.sessions
                    .map((s) => `<option value="${s.id}" ${s.active ? 'selected' : ''}>${s.name}</option>`)
                    .join('');

            sessionDropdowns.forEach((id) => {
                const el = document.getElementById(id);
                if (el && el.options.length <= 1) el.innerHTML = options;
            });

            if (erpState.activeSessionId) {
                setTimeout(() => {
                    this.loadClasses('rcPreviewSession', 'rcPreviewClass');
                    this.loadClasses('publishSessionSelect', 'publishClassSelect');
                    this.loadClasses('bulkRes_sessionSelect', 'bulkRes_classSelect');
                    this.loadClasses('remarkSessionSelect', 'remarkClassSelect');
                    this.loadClasses('manageResultsSession', 'manageResultsClass');
                    this.loadExams();
                }, 100);
            }
        }
    },

    async loadClasses(sessIdStr, targetIdStr) {
        const sessId = document.getElementById(sessIdStr)?.value;
        const el = document.getElementById(targetIdStr);
        if (!el || !sessId) return;

        const snap = await schoolData('classes').where('sessionId', '==', sessId).orderBy('sortOrder', 'asc').get();
        const options =
            '<option value="">Select Class</option>' +
            snap.docs.map((doc) => `<option value="${doc.data().name}">${doc.data().name}</option>`).join('');
        el.innerHTML = options;
    },

    async loadSections(sessIdStr, classIdStr, targetIdStr) {
        const sessId = document.getElementById(sessIdStr)?.value;
        const cls = document.getElementById(classIdStr)?.value;
        const el = document.getElementById(targetIdStr);
        if (!el || !cls || !sessId) return;

        const snap = await schoolData('classes')
            .where('sessionId', '==', sessId)
            .where('name', '==', cls)
            .limit(1)
            .get();
        if (!snap.empty) {
            const sections = snap.docs[0].data().sections || ['A'];
            const options =
                '<option value="">Select Section</option>' +
                sections.map((s) => `<option value="${s}">${s}</option>`).join('');
            el.innerHTML = options;
        }
    },

    async loadStudents() {
        const sessEl = document.getElementById('rcPreviewSession');
        const sess = sessEl.options[sessEl.selectedIndex].text;
        const cls = document.getElementById('rcPreviewClass').value;
        const sec = document.getElementById('rcPreviewSection').value;
        const studentSelect = document.getElementById('rcPreviewStudentSelect');

        if (!cls || !sec) return;

        const q = schoolData('students')
            .where('session', '==', sess)
            .where('class', '==', cls)
            .where('section', '==', sec);
        const snap = await q.get();

        studentSelect.innerHTML =
            '<option value="All">All Students</option>' +
            snap.docs.map((doc) => `<option value="${doc.id}">${doc.data().name}</option>`).join('');
    },

    async loadExams() {
        const sessionDropdowns = [
            'rcPreviewSession',
            'publishSessionSelect',
            'bulkRes_sessionSelect',
            'remarkSessionSelect',
            'manageResultsSession',
        ];
        const examDropdowns = [
            'rcPreviewExam',
            'publishExamSelect',
            'bulkRes_examSelect',
            'remarkExamSelect',
            'manageResultsExam',
        ];

        for (let i = 0; i < sessionDropdowns.length; i++) {
            const sessId = document.getElementById(sessionDropdowns[i])?.value;
            const exEl = document.getElementById(examDropdowns[i]);
            if (!sessId || !exEl) continue;

            const exSnap = await schoolData('exams').where('sessionId', '==', sessId).get();
            exEl.innerHTML =
                '<option value="">Select Exam</option>' +
                exSnap.docs.map((doc) => `<option value="${doc.id}">${doc.data().name}</option>`).join('');
        }
    },
};

const PublishResultsUI = {
    loadClasses() {
        window.loadPublishClasses();
    },
    loadSections() {
        window.loadPublishSections();
    },
    refresh() {
        if (window.refreshPublishStatus) window.refreshPublishStatus();
    },
};

// Global hooks
// Global hooks for Report Card Preview
window.loadRcClasses = () => RcPreviewUI.loadClasses('rcPreviewSession', 'rcPreviewClass');
window.loadRcSections = () => RcPreviewUI.loadSections('rcPreviewSession', 'rcPreviewClass', 'rcPreviewSection');
window.loadRcStudents = () => RcPreviewUI.loadStudents();

window.idIndivLoadClasses = () => IdCardPreviewUI.loadClasses();
window.idIndivLoadStudents = () => IdCardPreviewUI.loadStudents();
window.idIndivPreview = () => IdCardPreviewUI.preview();

window.loadPublishClasses = () => RcPreviewUI.loadClasses('publishSessionSelect', 'publishClassSelect');
window.loadPublishSections = () => {
    RcPreviewUI.loadSections('publishSessionSelect', 'publishClassSelect', 'publishSectionSelect');
    if (window.refreshPublishStatus) refreshPublishStatus();
};

window.loadRemarkClasses = () => RcPreviewUI.loadClasses('remarkSessionSelect', 'remarkClassSelect');
window.loadRemarkSections = () => {
    RcPreviewUI.loadSections('remarkSessionSelect', 'remarkClassSelect', 'remarkSectionSelect');
    if (window.loadRemarksGrid) loadRemarksGrid();
};

window.loadManageResultsClasses = () => RcPreviewUI.loadClasses('manageResultsSession', 'manageResultsClass');
window.loadManageResultsSections = () => {
    RcPreviewUI.loadSections('manageResultsSession', 'manageResultsClass', 'manageResultsSectionSelect');
    if (window.refreshManageResultsTable) refreshManageResultsTable();
};
window.loadManageResultsSubjects = () => {
    const sessId = document.getElementById('manageResultsSession')?.value;
    if (window.loadSubjectsForResults && sessId) {
        window.loadSubjectsForResults(sessId, 'manageResultsSubject');
    }
};

window.loadBulkResClasses = () => RcPreviewUI.loadClasses('bulkRes_sessionSelect', 'bulkRes_classSelect');
window.loadBulkResSections = () => {
    RcPreviewUI.loadSections('bulkRes_sessionSelect', 'bulkRes_classSelect', 'bulkRes_sectionSelect');
    BulkReportCardUI.loadStudents();
};

window.loadStudentsForBulkRes = () => BulkReportCardUI.loadStudents();
window.toggleBulkResSelection = (master) => {
    document.querySelectorAll('.bulk-res-check').forEach((cb) => (cb.checked = master.checked));
};
window.runBulkGeneration = () => BulkReportCardUI.runBulk();
window.previewSingleReportCard = (isDownload = false) => {
    if (typeof previewSingleReportCard === 'function') {
        window.previewSingleReportCard(isDownload);
    } else {
        showToast('Report card logic initializing...', 'info');
    }
};

// Notice Board
async function handleNoticeSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const title = document.getElementById('noticeTitle').value;
    const message = document.getElementById('noticeMessage').value;
    try {
        await schoolData('notices').add(
            withSchool({
                title,
                message,
            })
        );
        showToast('Notice published!');
        e.target.reset();
        await loadNoticeHistory();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function loadNoticeHistory() {
    const container = document.getElementById('adminNoticesContainer');
    if (!container) return;
    try {
        const snap = await schoolData('notices').orderBy('date', 'desc').limit(50).get();
        container.innerHTML = '';
        snap.forEach((doc) => {
            const d = doc.data();
            const date = d.date ? new Date(d.date.seconds * 1000).toLocaleDateString() : 'Just now';
            container.innerHTML += `
                <div style="padding:1rem; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:600;">${d.title}</div>
                        <div style="font-size:0.75rem; color:#666;">${date}</div>
                    </div>
                    <button class="btn-portal btn-ghost btn-sm btn-danger" onclick="deleteNotice('${doc.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });
    } catch (e) {}
}

async function deleteNotice(id) {
    if (await window.showConfirmModal({ title: 'Delete Notice', message: 'Delete this notice?', icon: 'fa-trash-alt', confirmText: 'Delete', danger: true })) {
        try {
            await schoolDoc('notices', id).delete();
            showToast('Notice deleted');
            loadNoticeHistory();
        } catch (e) {
            showToast('Error deleting notice: ' + e.message, 'error');
        }
    }
}

// // ===================== ERP TOOLS =====================

// Website Settings / CMS
async function loadWebsiteSettings() {
    try {
        const doc = await schoolDoc('settings', 'general').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('set_marquee').value = data.marquee || '';
            document.getElementById('set_phone').value = data.phone || '';
            document.getElementById('set_email').value = data.email || '';
            document.getElementById('set_address').value = data.address || '';

            // Sync to localStorage for React tools
            if (data.schoolName) localStorage.setItem('schoolName', data.schoolName);
            if (data.logo) localStorage.setItem('schoolLogo', data.logo);
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

async function handleWebsiteSettingsSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
        const schoolName = document.getElementById('set_schoolName')?.value.trim() || '';
        const logo = document.getElementById('set_logo')?.value.trim() || ''; // Assuming there's a logo field or URL

        const payload = {
            marquee: document.getElementById('set_marquee').value.trim(),
            phone: document.getElementById('set_phone').value.trim(),
            email: document.getElementById('set_email').value.trim(),
            dpoEmail: document.getElementById('set_dpoEmail')?.value.trim() || '',
            dpoPhone: document.getElementById('set_dpoPhone')?.value.trim() || '',
            address: document.getElementById('set_address').value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        if (schoolName) payload.schoolName = schoolName;

        await schoolDoc('settings', 'general').set(payload, { merge: true });
        showToast('Website Settings updated!');
        // Sync to localStorage
        if (schoolName) localStorage.setItem('schoolName', schoolName);
    } catch (e) {
        showToast('Error update: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Export Data
function exportStudentData() {
    if (allStudents.length === 0) {
        showToast('No students to export', 'info');
        return;
    }
    try {
        // PII mask: masks Aadhar numbers by default for data privacy compliance
        // Set window._EXPORT_FULL_PII = true before calling to include unmasked PII
        const maskPii = !window._EXPORT_FULL_PII;
        function maskAadhar(val) {
            if (!maskPii || !val) return val || '';
            return val.replace(/\d{4}(\d{4})/, 'XXXX$1');
        }
        function maskPhone(val) {
            if (!maskPii || !val) return val || '';
            return val.replace(/(\d{6})\d{4}$/, '$1XXXX');
        }

        const formattedData = allStudents.map((s) => ({
            'Student ID': s.student_id || '',
            'Registration No': s.reg_no || '',
            'Admission No': s.admission_no || '',
            'PEN No': s.pen || '',
            'Smart Card No': s.smart_card_no || '',
            'Aadhar No': maskAadhar(s.aadhar) || '',

            Name: s.name || '',
            Gender: s.gender || '',
            'Date of Birth': s.dob || '',
            Religion: s.religion || '',
            Category: s.category || '',
            Caste: s.caste || '',
            'Blood Group': s.blood_group || '',
            Nationality: s.nationality || '',

            Session: s.session || '',
            Class: s.class || '',
            Section: s.section || '',
            'Roll No': s.roll_no || '',
            'Join Date': s.join_date || s.joinDate || '',
            'Previous School': s.previous_school || '',
            'TC No': s.tc_no || '',

            "Father's Name": s.father_name || s.fatherName || '',
            "Father's Aadhar": maskAadhar(s.father_aadhar) || '',
            "Father's Mobile": maskPhone(s.father_mobile) || '',
            "Father's Occupation": s.father_occupation || '',
            "Mother's Name": s.mother_name || s.motherName || '',
            "Mother's Aadhar": maskAadhar(s.mother_aadhar) || '',
            "Mother's Mobile": maskPhone(s.mother_mobile) || '',
            'Guardian Name': s.guardian_name || '',
            'Guardian Phone': maskPhone(s.guardian_phone) || '',
            'Guardian Relation': s.guardian_relation || '',
            'SMS Contact (Mobile)': maskPhone(s.sms_contact || s.phone) || '',

            'Mobile / Phone': maskPhone(s.phone || s.mobile) || '',
            Email: s.email || '',
            'Current Address': s.address || '',
            'Permanent Address': s.permanent_address || '',
            City: s.city || '',
            State: s.state || '',
            Pincode: s.pincode || '',

            Hostel: s.hostel || '',
            Transport: s.transport || '',
            'Bus Route': s.bus_route || '',
            'Bus Stop': s.bus_stop || '',

            Status: s.status || 'Active',
            Remarks: s.remarks || '',
            'Created At': s.createdAt
                ? new Date(s.createdAt.seconds ? s.createdAt.seconds * 1000 : s.createdAt).toLocaleDateString()
                : '',
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        // Auto-fit column widths
        const colWidths = Object.keys(formattedData[0]).map((k) => ({ wch: Math.max(k.length + 2, 14) }));
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, `apex_students_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast(`Exported ${formattedData.length} student(s) — all fields included!`);
    } catch (e) {
        showToast('Export failed: ' + e.message, 'error');
    }
}

// Student Management Core
async function handleStudentSubmit(e) {
    e.preventDefault();
    const sid = document.getElementById('student_id').value.trim();
    const name = document.getElementById('student_name').value.trim();
    const father = document.getElementById('student_father').value.trim();
    const phone = document.getElementById('student_phone').value.trim();
    const sclass = document.getElementById('student_class').value.trim();
    const sect = document.getElementById('student_section').value.trim();
    const roll_no = document.getElementById('student_roll_no').value.trim();
    const reg_no = document.getElementById('student_reg_no').value.trim();
    const session = document.getElementById('student_session').value.trim();
    const join_date = document.getElementById('student_join_date').value.trim();
    const dob = document.getElementById('student_dob').value.trim();
    const gender = document.getElementById('student_gender').value;
    const aadhar = document.getElementById('student_aadhar').value.trim();
    const religion = document.getElementById('student_religion').value.trim();
    const category = document.getElementById('student_category').value.trim();
    const caste = document.getElementById('student_caste').value.trim();
    const pen = document.getElementById('student_pen').value.trim();
    const smart_card_no = document.getElementById('student_smart_card_no').value.trim();
    const mother = document.getElementById('student_mother').value.trim();
    const father_aadhar = document.getElementById('student_father_aadhar').value.trim();
    const mother_aadhar = document.getElementById('student_mother_aadhar').value.trim();
    const guardian_name = document.getElementById('student_guardian_name').value.trim();
    const guardian_phone = document.getElementById('student_guardian_phone').value.trim();
    const address = document.getElementById('student_address').value.trim();
    const permanent_address = document.getElementById('student_permanent_address').value.trim();
    const city = document.getElementById('student_city').value.trim();
    const hostel = document.getElementById('student_hostel').value;
    const transport = document.getElementById('student_transport').value;
    const photoFile = document.getElementById('student_photo').files[0];

    if (!name || !father || !phone) {
        showToast('Please fill all mandatory fields (Name, Father Name, Mobile Number)', 'error');
        return;
    }

    if (!sclass || !sect || !session) {
        showToast('Please select Session, Class and Section from dropdowns', 'error');
        return;
    }

    // Require consent checkbox for new students (DPDP Act 2023)
    const consentCheck = document.getElementById('consentCheckbox');
    if (!editingDocId && (!consentCheck || !consentCheck.checked)) {
        showToast('Please accept the Privacy Policy consent to register a new student.', 'error');
        return;
    }

    setLoading(true);
    try {
        let photoUrl = '';
        let finalSid = sid;
        let docId = editingDocId;

        // NEW STUDENT: Global sequential ID (A000001, A000002, ...)
        if (!docId) {
            finalSid = await window.getGlobalStudentId();
            docId = finalSid; // Use student_id as firestore doc index
        }

        // Upload photo — auto-compress under 200KB
        if (photoFile) {
            document.getElementById('uploadProgress').style.display = 'block';
            try {
                if (typeof ImageStorage !== 'undefined') {
                    photoUrl = await ImageStorage.compressImageUnder200KB(photoFile);
                } else {
                    // Fallback: basic base64
                    photoUrl = await new Promise((r, j) => {
                        const reader = new FileReader();
                        reader.onload = e => r(e.target.result);
                        reader.onerror = j;
                        reader.readAsDataURL(photoFile);
                    });
                }
            } catch (imageErr) {
                console.error('Photo processing error:', imageErr);
                showToast('Warning: Photo could not be processed, saving without photo.', 'error');
            }
            document.getElementById('uploadProgress').style.display = 'none';
        }

        const studentData = {
            studentId: finalSid,
            student_id: finalSid,
            name: name,
            father_name: father,
            phone: phone,
            mobile: phone,
            class: sclass,
            section: sect,
            roll_no: roll_no,
            reg_no: reg_no,
            session: session,
            admissionYear: session,
            join_date,
            dob: dob,
            dateOfBirth: dob,
            gender,
            aadhar,
            religion,
            category,
            caste,
            pen,
            smart_card_no,
            mother_name: mother,
            father_aadhar,
            mother_aadhar,
            guardian_name,
            guardian_phone,
            address,
            permanent_address,
            city,
            hostel,
            transport,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        if (!editingDocId) {
            studentData.consentGiven = true;
            studentData.consentTimestamp = firebase.firestore.FieldValue.serverTimestamp();
            studentData.consentVersion = '1.0';
        }

        if (photoUrl) studentData.photo_url = photoUrl;

        await schoolDoc('students', docId).set(withSchool(studentData), { merge: true });
        if (!editingDocId) adjustStudentCounter(1);

        // Create Firebase Auth account for student (non-blocking: warn on failure)
        if (!editingDocId && typeof window.createFirebaseUser === 'function') {
            try {
                const authEmail = `s.${CURRENT_SCHOOL_ID}.${finalSid}@snredu.app`;
                const authPassword = phone; // Phone number as initial password
                const authUid = await window.createFirebaseUser(authEmail, authPassword, {
                    role: 'student',
                    schoolId: CURRENT_SCHOOL_ID,
                });
                await schoolDoc('students', docId).update({
                    authUid: authUid,
                    authEmail: authEmail,
                });
                console.log(`[Auth] Firebase Auth user created for ${name} (${authEmail})`);
            } catch (authErr) {
                console.warn('[Auth] Could not create Firebase Auth user:', authErr);
                showToast('Student saved. Note: Firebase Auth account could not be created.', 'warning');
            }
        }

        showToast('Student saved successfully!');
        editingDocId = null;
        showSection('studentList');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setLoading(false);
        document.getElementById('uploadProgress').style.display = 'none';
    }
}

function toggleSelect(id) {
    if (selectedStudents.has(id)) selectedStudents.delete(id);
    else selectedStudents.add(id);
    updateBulkUI();
}

function handleSelectAll(e) {
    const cbs = document.querySelectorAll('.student-checkbox');
    cbs.forEach((cb) => {
        cb.checked = e.target.checked;
        if (e.target.checked) selectedStudents.add(cb.value);
        else selectedStudents.delete(cb.value);
    });
    updateBulkUI();
}

function updateBulkUI() {
    const btn = document.getElementById('bulkDeleteBtn');
    const count = document.getElementById('selectedCount');
    if (selectedStudents.size > 0) {
        btn.classList.remove('hidden');
        count.textContent = selectedStudents.size;
    } else {
        btn.classList.add('hidden');
    }
}

async function handleBulkDelete() {
    if (await window.showConfirmModal({ title: 'Bulk Delete', message: 'Delete ' + selectedStudents.size + ' students? This cannot be undone.', icon: 'fa-user-slash', confirmText: 'Delete All', danger: true })) {
        setLoading(true);
        const batch = (window.db || firebase.firestore()).batch();
        selectedStudents.forEach((id) => batch.delete(schoolDoc('students', id)));
        await batch.commit();
        adjustStudentCounter(-selectedStudents.size);
        selectedStudents.clear();
        updateBulkUI();
        loadInitialData();
        setLoading(false);
    }
}

async function deleteStudent(id) {
    if (await window.showConfirmModal({ title: 'Delete Student', message: 'Delete this student profile? This cannot be undone.', icon: 'fa-user-minus', confirmText: 'Delete', danger: true })) {
        setLoading(true);
        await schoolDoc('students', id).delete();
        adjustStudentCounter(-1);
        loadInitialData();
        setLoading(false);
    }
}

// ===================== STUDENT DETAIL VIEW =====================
function calcAge(dobStr) {
    var dob = new Date(dobStr);
    if (isNaN(dob.getTime())) {
        // Try dd/mm/yyyy or dd-mm-yyyy
        var parts = dobStr.split(/[\/\-]/);
        if (parts.length === 3) dob = new Date(parts[2], parts[1] - 1, parts[0]);
        if (isNaN(dob.getTime())) return '--';
    }
    var today = new Date();
    var age = today.getFullYear() - dob.getFullYear();
    var m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age + ' years';
}

function getDateStr(d) {
    if (!d) return '--';
    if (d.toDate) d = d.toDate();
    if (typeof d === 'string') d = new Date(d);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

var currentDetailStudentId = null;

window.viewStudent = async function (id) {
    var s = allStudents.find(function (x) { return x.id === id; });
    if (!s) { showToast('Student not found', 'error'); return; }
    currentDetailStudentId = id;

    showSection('studentDetail');
    document.getElementById('detailStudentName').textContent = s.name || 'Student Profile';
    document.getElementById('detailStudentSubtext').textContent = 'Viewing profile of ' + (s.name || 'student');

    // Profile header
    document.getElementById('detailName').textContent = s.name || '--';
    document.getElementById('detailStudentId').textContent = 'ID: ' + (s.student_id || s.studentId || '--');
    document.getElementById('detailClassSection').textContent = 'Class ' + (s.class || '--') + ' / ' + (s.section || '--');
    document.getElementById('detailRoll').textContent = s.roll_no || s.rollNo || '--';
    document.getElementById('detailGender').textContent = s.gender || '--';
    document.getElementById('detailDob').textContent = s.dob || s.dateOfBirth || '--';
    // Calculate age from DOB
    var dobStr = s.dob || s.dateOfBirth || '';
    document.getElementById('detailAge').textContent = dobStr ? calcAge(dobStr) : '--';
    document.getElementById('detailSession').textContent = s.session || '--';
    document.getElementById('detailStatus').textContent = s.status || 'Active';
    document.getElementById('detailStatClass').textContent = (s.class || '--') + ' / ' + (s.section || '--');

    // Photo
    var photoUrl = s.photo_url || s.photo || '';
    var photoImg = document.getElementById('detailPhotoImg');
    var photoPlaceholder = document.getElementById('detailPhotoPlaceholder');
    if (photoUrl) {
        photoImg.src = photoUrl;
        photoImg.style.display = 'block';
        photoPlaceholder.style.display = 'none';
    } else {
        photoImg.style.display = 'none';
        photoPlaceholder.style.display = 'block';
    }

    // Personal tab
    document.getElementById('dtName').textContent = s.name || '--';
    document.getElementById('dtDob').textContent = s.dob || s.dateOfBirth || '--';
    document.getElementById('dtGender').textContent = s.gender || '--';
    document.getElementById('dtBlood').textContent = s.blood_group || s.bloodGroup || '--';
    document.getElementById('dtReligion').textContent = s.religion || '--';
    document.getElementById('dtCategory').textContent = s.category || '--';
    document.getElementById('dtCaste').textContent = s.caste || '--';
    document.getElementById('dtAadhar').textContent = s.aadhar || s.aadhaar || '--';
    document.getElementById('dtPen').textContent = s.pen || '--';
    document.getElementById('dtMobile').textContent = s.mobile || s.phone || '--';
    document.getElementById('dtEmail').textContent = s.email || '--';
    document.getElementById('dtAddress').textContent = s.address || '--';
    document.getElementById('dtPermanentAddress').textContent = s.permanent_address || '--';
    document.getElementById('dtCity').textContent = s.city || '--';
    document.getElementById('dtHostel').textContent = s.hostel || 'No';
    document.getElementById('dtTransport').textContent = s.transport || 'No';

    // Family tab
    document.getElementById('dtFather').textContent = s.father_name || s.fatherName || '--';
    document.getElementById('dtFatherAadhar').textContent = s.father_aadhar || '--';
    document.getElementById('dtMother').textContent = s.mother_name || s.mother || '--';
    document.getElementById('dtMotherAadhar').textContent = s.mother_aadhar || '--';
    document.getElementById('dtGuardian').textContent = s.guardian_name || '--';
    document.getElementById('dtGuardianPhone').textContent = s.guardian_phone || '--';

    // Academic tab
    document.getElementById('dtStudentId').textContent = s.student_id || s.studentId || '--';
    document.getElementById('dtRoll').textContent = s.roll_no || s.rollNo || '--';
    document.getElementById('dtRegNo').textContent = s.reg_no || s.regNo || '--';
    document.getElementById('dtClass').textContent = s.class || '--';
    document.getElementById('dtSection').textContent = s.section || '--';
    document.getElementById('dtSession').textContent = s.session || '--';
    document.getElementById('dtAdmissionYear').textContent = s.admissionYear || s.session || '--';
    document.getElementById('dtJoinDate').textContent = s.join_date || '--';
    document.getElementById('dtSmartCard').textContent = s.smart_card_no || s.rfid_no || s.rfid || '--';

    // Reset tabs
    switchDetailTab('personal');

    // Load dynamic data
    loadDetailFees(id);
    loadDetailAttendance(id);
};

window.switchDetailTab = function (tab) {
    var tabs = ['personal', 'family', 'academic', 'fees', 'attendance'];
    for (var i = 0; i < tabs.length; i++) {
        var content = document.getElementById('detailTab' + tabs[i].charAt(0).toUpperCase() + tabs[i].slice(1));
        if (content) content.classList.add('hidden');
    }
    var activeContent = document.getElementById('detailTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (activeContent) activeContent.classList.remove('hidden');

    var buttons = document.querySelectorAll('#studentDetailSection .tab-btn');
    for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('active');
    }
    var activeBtn = document.querySelector('#studentDetailSection .tab-btn[data-tab="' + tab + '"]');
    if (activeBtn) activeBtn.classList.add('active');
};

async function loadDetailFees(studentId) {
    var loading = document.getElementById('detailFeesLoading');
    var table = document.getElementById('detailFeesTable');
    var body = document.getElementById('detailFeesBody');
    var statusEl = document.getElementById('detailFeeStatus');
    var lastPayEl = document.getElementById('detailLastPayDate');
    if (!body) return;

    try {
        var [feeSnap, paySnap] = await Promise.all([
            schoolData('fees').where('studentId', '==', studentId).get(),
            schoolData('feePayments').where('studentId', '==', studentId).orderBy('createdAt', 'desc').get()
        ]);

        // Fee ledger table
        if (feeSnap.empty) {
            loading.textContent = 'No fee records found.';
            table.style.display = 'none';
            if (statusEl) statusEl.textContent = 'No Records';
        } else {
            var total = 0, paid = 0;
            var html = '';
            feeSnap.forEach(function (doc) {
                var d = doc.data();
                var amount = parseFloat(d.amount || d.totalAmount || 0);
                var paidAmt = parseFloat(d.paid || d.paidAmount || 0);
                total += amount;
                paid += paidAmt;
                var due = amount - paidAmt;
                var status = paidAmt >= amount ? 'Paid' : (paidAmt > 0 ? 'Partial' : 'Unpaid');
                var statusClass = status === 'Paid' ? 'text-success' : (status === 'Partial' ? 'text-warning' : 'text-danger');
                html += '<tr>' +
                    '<td>' + (d.month || d.feeMonth || d.name || '-') + '</td>' +
                    '<td>₹' + amount.toLocaleString() + '</td>' +
                    '<td>₹' + paidAmt.toLocaleString() + '</td>' +
                    '<td>₹' + due.toLocaleString() + '</td>' +
                    '<td class="' + statusClass + ' font-600">' + status + '</td>' +
                    '<td>' + (d.date || d.paymentDate || (d.lastPaidDate ? getDateStr(d.lastPaidDate) : '-')) + '</td>' +
                    '</tr>';
            });
            body.innerHTML = html;
            loading.style.display = 'none';
            table.style.display = '';
            if (statusEl) {
                var pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                statusEl.textContent = '₹' + paid.toLocaleString() + ' / ₹' + total.toLocaleString() + ' (' + pct + '%)';
                statusEl.style.color = pct >= 90 ? '#10b981' : (pct >= 50 ? '#f59e0b' : '#ef4444');
            }
        }

        // Payment receipts table
        var receiptsLoading = document.getElementById('detailReceiptsLoading');
        var receiptsTable = document.getElementById('detailReceiptsTable');
        var receiptsBody = document.getElementById('detailReceiptsBody');
        var noReceipts = document.getElementById('detailNoReceipts');
        if (receiptsBody) {
            if (paySnap.empty) {
                receiptsLoading.style.display = 'none';
                receiptsTable.style.display = 'none';
                noReceipts.style.display = '';
                if (lastPayEl) lastPayEl.textContent = '';
            } else {
                var rh = '';
                var lastPay = null;
                paySnap.forEach(function (doc) {
                    var p = doc.data();
                    var payDate = p.createdAt ? getDateStr(p.createdAt) : (p.date || '-');
                    if (!lastPay) lastPay = payDate;
                    var amount = parseFloat(p.amount || 0);
                    rh += '<tr>' +
                        '<td><strong>' + (p.receiptNo || doc.id.substring(0, 8).toUpperCase()) + '</strong></td>' +
                        '<td>₹' + amount.toLocaleString() + '</td>' +
                        '<td>' + (p.paymentMode || p.mode || '--') + '</td>' +
                        '<td>' + payDate + '</td>' +
                        '<td>' + (p.remarks || '--') + '</td>' +
                        '<td><button class="btn-portal btn-ghost btn-sm" onclick="viewReceipt(\'' + doc.id + '\')"><i class="fas fa-receipt"></i> View</button></td>' +
                        '</tr>';
                });
                receiptsBody.innerHTML = rh;
                receiptsLoading.style.display = 'none';
                receiptsTable.style.display = '';
                noReceipts.style.display = 'none';
                if (lastPayEl) lastPayEl.textContent = 'Last: ' + (lastPay || '');
            }
        }
    } catch (e) {
        console.error('[Detail] Fees load failed:', e);
        loading.textContent = 'Failed to load fee records.';
    }
}

async function loadDetailAttendance(studentId) {
    var loading = document.getElementById('detailAttLoading');
    var table = document.getElementById('detailAttTable');
    var body = document.getElementById('detailAttBody');
    var summary = document.getElementById('detailAttSummary');
    var pctEl = document.getElementById('detailAttendancePct');
    if (!body) return;

    try {
        var snap = await schoolData('attendance').where('studentId', '==', studentId).get();
        if (snap.empty) {
            loading.textContent = 'No attendance records found.';
            table.style.display = 'none';
            if (summary) summary.innerHTML = '';
            if (pctEl) pctEl.textContent = '--';
            return;
        }
        var total = 0, present = 0;
        var html = '';
        snap.forEach(function (doc) {
            var d = doc.data();
            total++;
            var status = d.status || 'absent';
            if (status === 'present' || status === 'P') present++;
            var icon = status === 'present' || status === 'P' ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-times-circle text-danger"></i>';
            html += '<tr><td>' + (d.date?.toDate?.()?.toLocaleDateString() || d.date || '-') + '</td><td>' + icon + ' ' + status + '</td></tr>';
        });
        body.innerHTML = html;
        loading.style.display = 'none';
        table.style.display = '';
        var pct = total > 0 ? Math.round((present / total) * 100) : 0;
        if (summary) {
            summary.innerHTML = '<div class="flex gap-1"><span class="badge" style="background:#05966920;color:#10b981;padding:4px 12px;">Present: ' + present + '</span><span class="badge" style="background:#dc262620;color:#f87171;padding:4px 12px;">Absent: ' + (total - present) + '</span><span class="badge" style="background:#3b82f620;color:#60a5fa;padding:4px 12px;">Total Days: ' + total + '</span></div>';
        }
        if (pctEl) {
            pctEl.textContent = pct + '%';
            pctEl.style.color = pct >= 75 ? '#10b981' : (pct >= 50 ? '#f59e0b' : '#ef4444');
        }
    } catch (e) {
        console.error('[Detail] Attendance load failed:', e);
        loading.textContent = 'Failed to load attendance.';
    }
}

window.viewReceipt = async function (paymentId) {
    try {
        var doc = await schoolData('feePayments').doc(paymentId).get();
        if (!doc.exists) { showToast('Receipt not found', 'error'); return; }
        var p = doc.data();
        var s = allStudents.find(function (x) { return x.id === currentDetailStudentId; });
        var schoolInfo = document.getElementById('schoolName');
        var schoolName = schoolInfo ? schoolInfo.textContent : 'School Name';
        var payDate = p.createdAt ? getDateStr(p.createdAt) : (p.date || '--');
        var allocHtml = '';
        var totalPaid = parseFloat(p.amount || 0);
        if (p.allocations && p.allocations.length) {
            p.allocations.forEach(function (a, i) {
                allocHtml += '<tr><td>' + (i + 1) + '</td><td>' + (a.feeType || 'Fee') + ' (' + (a.month || '') + ')</td><td style="text-align:right;">₹' + (a.amount || 0).toLocaleString() + '</td><td style="text-align:right;">₹0</td><td style="text-align:right;">₹' + (a.amount || 0).toLocaleString() + '</td><td style="text-align:right;">₹' + (a.paidNow || 0).toLocaleString() + '</td></tr>';
            });
        } else {
            allocHtml = '<tr><td>1</td><td>Fee Payment</td><td style="text-align:right;">₹' + totalPaid.toLocaleString() + '</td><td style="text-align:right;">₹0</td><td style="text-align:right;">₹' + totalPaid.toLocaleString() + '</td><td style="text-align:right;">₹' + totalPaid.toLocaleString() + '</td></tr>';
        }

        var html = '<div class="receipt-premium" style="width:100%;box-shadow:none;border:1px solid #e2e8f0;">' +
            '<div class="rp-header" style="background:linear-gradient(135deg,#059669,#10b981);color:white;padding:20px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:50px;height:50px;background:white;border-radius:10px;padding:3px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🏫</div>' +
                    '<div><h3 style="margin:0;font-size:18px;font-weight:800;">' + schoolName + '</h3><p style="margin:0;font-size:11px;opacity:0.9;">Payment Receipt</p></div>' +
                '</div>' +
                '<div style="text-align:right;"><h2 style="margin:0;font-size:24px;opacity:0.3;text-transform:uppercase;letter-spacing:2px;">Receipt</h2><p style="margin:0;font-weight:700;"># ' + (p.receiptNo || paymentId.substring(0,8).toUpperCase()) + '</p></div>' +
            '</div>' +
            '<div style="background:#f8fafc;padding:15px 20px;display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e2e8f0;font-size:13px;">' +
                '<div><b style="color:#64748b;width:100px;display:inline-block;">Date:</b> ' + payDate + '</div>' +
                '<div><b style="color:#64748b;width:100px;display:inline-block;">Payment ID:</b> ' + paymentId.substring(0,12) + '...</div>' +
                '<div><b style="color:#64748b;width:100px;display:inline-block;">Session:</b> ' + (p.session || (s ? s.session : '--')) + '</div>' +
                '<div><b style="color:#64748b;width:100px;display:inline-block;">Mode:</b> ' + (p.paymentMode || '--') + '</div>' +
            '</div>' +
            '<div style="padding:20px;">' +
                '<div style="background:#ecfdf5;border:1px solid #d1fae5;border-radius:10px;padding:15px;margin-bottom:20px;display:flex;justify-content:space-between;">' +
                    '<div><p style="margin:0;font-size:12px;color:#047857;">STUDENT</p><h3 style="margin:5px 0 0;font-size:16px;color:#065f46;">' + (s ? s.name : '--') + '</h3><p style="margin:2px 0 0;font-size:12px;color:#047857;">' + (s ? (s.class + ' - ' + s.section) : '') + ' | Adm: ' + (s ? (s.student_id || s.studentId || '--') : '') + '</p></div>' +
                    '<div style="text-align:right;"><p style="margin:0;font-size:12px;color:#047857;">FATHER\'S NAME</p><h3 style="margin:5px 0 0;font-size:15px;color:#065f46;">' + (s ? (s.father_name || s.fatherName || '--') : '') + '</h3></div>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">' +
                    '<thead><tr><th style="background:#f1f5f9;text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Sl</th><th style="background:#f1f5f9;text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Fee Name</th><th style="background:#f1f5f9;text-align:right;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Fee</th><th style="background:#f1f5f9;text-align:right;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Discount</th><th style="background:#f1f5f9;text-align:right;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Due</th><th style="background:#f1f5f9;text-align:right;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Paid</th></tr></thead>' +
                    '<tbody>' + allocHtml + '</tbody>' +
                '</table>' +
                '<div style="display:flex;justify-content:flex-end;">' +
                    '<div style="width:280px;background:#f8fafc;border-radius:10px;padding:12px;">' +
                        '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;"><span>Sub Total</span><b>₹' + totalPaid.toLocaleString() + '</b></div>' +
                        '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#10b981;"><span>Discount</span><b>-₹0</b></div>' +
                        '<div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:2px solid #e2e8f0;font-weight:800;font-size:16px;color:#059669;"><span>Total Paid</span><span>₹' + totalPaid.toLocaleString() + '</span></div>' +
                    '</div>' +
                '</div>' +
                (p.remarks ? '<p style="margin-top:15px;font-size:12px;color:#64748b;font-style:italic;">Note: ' + p.remarks + '</p>' : '') +
            '</div>' +
            '<div style="padding:20px 30px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #e2e8f0;">' +
                '<p style="max-width:350px;font-size:10px;color:#94a3b8;line-height:1.5;">This is a computer generated receipt and does not require a physical signature.</p>' +
                '<div style="text-align:center;"><div style="width:60px;height:60px;border:3px double #059669;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#059669;font-weight:800;font-size:8px;text-transform:uppercase;opacity:0.6;margin:0 auto 8px;">Stamp</div><div style="border-top:1px solid #1e293b;width:150px;padding-top:4px;font-size:11px;font-weight:600;">Authorised Signatory</div></div>' +
            '</div>' +
        '</div>';

        document.getElementById('receiptPreviewBody').innerHTML = html;
        document.getElementById('receiptPreviewModal').classList.remove('hidden');
    } catch (e) {
        console.error('[Receipt] Failed:', e);
        showToast('Failed to load receipt: ' + e.message, 'error');
    }
};

window.closeReceiptPreview = function () {
    document.getElementById('receiptPreviewModal').classList.add('hidden');
};

window.printReceiptPreview = function () {
    var content = document.getElementById('receiptPreviewBody').innerHTML;
    var win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) { showToast('Please allow pop-ups to print receipts', 'warning'); return; }
    win.document.write('<html><head><title>Receipt</title><style>body{margin:0;padding:20px;font-family:"Inter",sans-serif;}@media print{body{padding:0;}}</style></head><body>' + content + '</body></html>');
    win.document.close();
    setTimeout(function () { win.print(); }, 500);
};

async function editStudent(id) {
    const s = allStudents.find((x) => x.id === id);
    if (!s) return;
    editingDocId = id; // remember doc ID for saving

    // Show section first to ensure HTML elements exist
    showSection('addStudent');
    document.getElementById('formTitle').textContent = 'Edit Student Profile';

    // Basic Fields
    document.getElementById('student_id').value = s.studentId || s.student_id || '';
    document.getElementById('student_name').value = s.name || '';
    document.getElementById('student_father').value = s.fatherName || s.father_name || '';
    document.getElementById('student_phone').value = s.mobile || s.phone || '';

    // ERP Dropdowns (Async chain)
    if (typeof updateSessionDropdowns === 'function') {
        setLoading(true);
        try {
            await updateSessionDropdowns();
            const sessionSelect = document.getElementById('student_session');
            if (sessionSelect) {
                sessionSelect.value = s.session || '';
                await loadClassesForRegistration();

                const classSelect = document.getElementById('student_class');
                if (classSelect) {
                    classSelect.value = s.class || '';
                    await updateRegistrationSections();

                    const secSelect = document.getElementById('student_section');
                    if (secSelect) secSelect.value = s.section || '';
                }
            }
        } catch (e) {
            console.error('Error pre-filling registration dropdowns:', e);
        } finally {
            setLoading(false);
        }
    }

    document.getElementById('student_roll_no').value = s.roll_no || s.rollNo || '';
    document.getElementById('student_reg_no').value = s.reg_no || s.regNo || '';
    document.getElementById('student_join_date').value = s.join_date || '';
    document.getElementById('student_dob').value = s.dob || s.dateOfBirth || '';
    document.getElementById('student_gender').value = s.gender || '';
    document.getElementById('student_aadhar').value = s.aadhar || '';
    document.getElementById('student_religion').value = s.religion || '';
    document.getElementById('student_category').value = s.category || '';
    document.getElementById('student_caste').value = s.caste || '';
    document.getElementById('student_pen').value = s.pen || '';
    document.getElementById('student_smart_card_no').value = s.smart_card_no || '';
    document.getElementById('student_mother').value = s.mother_name || s.motherName || '';
    document.getElementById('student_father_aadhar').value = s.father_aadhar || '';
    document.getElementById('student_mother_aadhar').value = s.mother_aadhar || '';
    document.getElementById('student_guardian_name').value = s.guardian_name || '';
    document.getElementById('student_guardian_phone').value = s.guardian_phone || '';
    document.getElementById('student_address').value = s.address || '';
    document.getElementById('student_permanent_address').value = s.permanent_address || '';
    document.getElementById('student_city').value = s.city || '';
    document.getElementById('student_hostel').value = s.hostel || 'No';
    document.getElementById('student_transport').value = s.transport || 'No';

    // Show existing photo
    const previewImg = document.getElementById('proto_preview_img');
    const placeholderIcon = document.getElementById('photo_placeholder_icon');
    const fileNameSpan = document.getElementById('photoFileName');

    if (s.photo_url) {
        if (previewImg) {
            previewImg.src = s.photo_url;
            previewImg.classList.remove('hidden');
        }
        if (placeholderIcon) placeholderIcon.classList.add('hidden');
    } else {
        if (previewImg) {
            previewImg.src = '';
            previewImg.classList.add('hidden');
        }
        if (placeholderIcon) placeholderIcon.classList.remove('hidden');
    }
    if (fileNameSpan) fileNameSpan.textContent = '';
}

// Added Photo Preview helper
window.previewPhoto = function (event) {
    const file = event.target.files[0];
    const previewImg = document.getElementById('proto_preview_img');
    const placeholderIcon = document.getElementById('photo_placeholder_icon');
    const fileNameSpan = document.getElementById('photoFileName');

    if (file) {
        if (fileNameSpan) fileNameSpan.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function (e) {
            if (previewImg) {
                previewImg.src = e.target.result;
                previewImg.classList.remove('hidden');
            }
            if (placeholderIcon) placeholderIcon.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        if (fileNameSpan) fileNameSpan.textContent = '';
        if (previewImg) {
            previewImg.src = '';
            previewImg.classList.add('hidden');
        }
        if (placeholderIcon) placeholderIcon.classList.remove('hidden');
    }
};

// Bulk Import (Excel Version)
async function handleBulkImport(e) {
    e.preventDefault();
    const file = document.getElementById('excelFile').files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON with headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                showToast('The Excel file seems to be empty.', 'error');
                setLoading(false);
                return;
            }

            document.getElementById('importStats').style.display = 'block';
            document.getElementById('totalImport').textContent = jsonData.length;

            let processed = 0;
            for (const row of jsonData) {
                // Map fields from Excel to Firestore schema
                const studentData = {
                    studentId: (row['Id'] || row['studentId'] || row['student_id'] || '').toString().trim(),
                    name: (row['Name'] || row['name'] || '').toString().trim(),
                    regNo: (row['Reg No'] || row['regNo'] || row['reg_no'] || '').toString().trim(),
                    rollNo: (row['Roll No'] || row['rollNo'] || row['roll_no'] || '').toString().trim(),
                    admissionYear: (row['Session'] || row['admissionYear'] || row['session'] || '').toString().trim(),
                    class: (row['Class'] || row['class'] || '').toString().trim(),
                    section: (row['Section'] || row['section'] || '').toString().trim(),
                    dateOfBirth: (row['Birth Date'] || row['dateOfBirth'] || row['dob'] || '').toString().trim(),
                    join_date: (row['Join Date'] || row['join_date'] || '').toString().trim(),
                    gender: (row['Gender'] || row['gender'] || '').toString().trim(),
                    fatherName: (row['Father Name'] || row['fatherName'] || row['father_name'] || '').toString().trim(),
                    motherName: (row['Mother Name'] || row['motherName'] || row['mother_name'] || '').toString().trim(),
                    mobile: (row['Phone'] || row['mobile'] || row['phone'] || '').toString().trim(),
                    religion: (row['Religion'] || row['religion'] || '').toString().trim(),
                    category: (row['Category'] || row['category'] || '').toString().trim(),
                    pen: (row['PEN'] || row['pen'] || '').toString().trim(),
                    aadhar: (row['Aadhar'] || row['aadhar'] || '').toString().trim(),
                    father_aadhar: (row['Father Aadhar'] || row['father_aadhar'] || '').toString().trim(),
                    mother_aadhar: (row['Mother Aadhar'] || row['mother_aadhar'] || '').toString().trim(),
                    caste: (row['Caste'] || row['caste'] || '').toString().trim(),
                    hostel: (row['Hostel'] || row['hostel'] || '').toString().trim(),
                    transport: (row['Transport'] || row['transport'] || '').toString().trim(),
                    address: (row['Address'] || row['address'] || '').toString().trim(),
                    permanent_address: (row['Permanent Address'] || row['permanent_address'] || '').toString().trim(),
                    city: (row['City'] || row['city'] || '').toString().trim(),
                    guardian_name: (row['Guardian Name'] || row['guardian_name'] || '').toString().trim(),
                    guardian_phone: (row['Guardian Phone'] || row['guardian_phone'] || '').toString().trim(),
                    smart_card_no: (row['Smart Card No'] || row['smart_card_no'] || '').toString().trim(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                };

                // Mandatory fields validation
                if (!studentData.name || !studentData.mobile || !studentData.fatherName) {
                    continue;
                }

                const docId = studentData.studentId || studentData.mobile;
                await schoolDoc('students', docId).set(withSchool(studentData), { merge: true });
                processed++;
                document.getElementById('currentImport').textContent = processed;
            }

            showToast(`Bulk Import Complete: ${processed} students processed.`);
            showSection('studentList');
        } catch (error) {
            console.error('Excel processing error:', error);
            showToast('Failed to process Excel file.', 'error');
        } finally {
            setLoading(false);
        }
    };
    reader.readAsArrayBuffer(file);
}

function logoutAdmin() {
    auth.signOut().then(() => {
        const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
        window.location.href = slug ? `/${slug}/portal/admin-login.html` : '/portal/admin-login.html';
    });
}

function updateStats() {
    const totalStudents = document.getElementById('totalStudentsCount');
    if (totalStudents) {
        totalStudents.textContent = allStudents.length;
    }

    const totalClasses = document.getElementById('statTotalClasses');
    if (totalClasses) {
        const classes = new Set(allStudents.map((s) => s.class));
        totalClasses.textContent = classes.size;
    }

    // Secondary UI IDs (for backward compatibility or multiple views)
    const statStudents = document.getElementById('statTotalStudents');
    if (statStudents) statStudents.textContent = allStudents.length;
}

// ===================== INQUIRIES =====================
async function loadInquiries() {
    const tbody = document.getElementById('inquiryTableBody');
    tbody.innerHTML =
        '<tr><td colspan="8" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading inquiries...</td></tr>';

    try {
        const snap = await schoolData('inquiries').orderBy('submittedAt', 'desc').limit(100).get();
        if (snap.empty) {
            tbody.innerHTML =
                '<tr><td colspan="8" style="text-align:center; color:#64748b;">No inquiries yet.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        snap.forEach((doc) => {
            const d = doc.data();
            const date = d.submittedAt ? new Date(d.submittedAt.seconds * 1000).toLocaleDateString('en-IN') : 'N/A';
            const statusColor = d.status === 'New' ? '#ef4444' : d.status === 'Contacted' ? '#f59e0b' : '#10b981';
            tbody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td><b>${d.student || '-'}</b></td>
                    <td>${d.parent || '-'}</td>
                    <td><a href="tel:${d.mobile}">${d.mobile || '-'}</a></td>
                    <td>${d.class || '-'}</td>
                    <td>${d.village || '-'}</td>
                    <td><span class="badge" style="background:${statusColor}; color:white;">${d.status || 'New'}</span></td>
                    <td>
                        <select onchange="updateInquiryStatus('${doc.id}', this.value)" style="padding:0.3rem; border-radius:0.3rem; border:1px solid #d1d5db; font-size:0.8rem;">
                            <option ${d.status === 'New' ? 'selected' : ''}>New</option>
                            <option ${d.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                            <option ${d.status === 'Admitted' ? 'selected' : ''}>Admitted</option>
                            <option ${d.status === 'Not Interested' ? 'selected' : ''}>Not Interested</option>
                        </select>
                    </td>
                </tr>`;
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#ef4444;">Error: ${e.message}</td></tr>`;
    }
}

async function updateInquiryStatus(docId, newStatus) {
    try {
        await schoolDoc('inquiries', docId).update({ status: newStatus });
        showToast(`Status updated to "${newStatus}"`);
    } catch (e) {
        showToast('Error updating status: ' + e.message, 'error');
    }
}

// ===================== LIBRARY HELPERS =====================
function toggleAddBookForm() {
    const wrapper = document.getElementById('addBookFormWrapper');
    if (wrapper) wrapper.style.display = wrapper.style.display === 'none' ? 'block' : 'none';
}

function toggleAddRouteForm() {
    const wrapper = document.getElementById('addRouteFormWrapper');
    if (wrapper) wrapper.style.display = wrapper.style.display === 'none' ? 'block' : 'none';
}

// ===================== BULK PDF UPLOAD =====================
async function handleBulkUpload(event, collection) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const isReport = collection === 'reports';
    const year = document.getElementById(isReport ? 'bulkReportYear' : 'bulkAdmitYear').value;
    const logDiv = document.getElementById('bulkUploadLog');
    const logItems = document.getElementById('bulkUploadLogItems');
    logDiv.style.display = 'block';
    logItems.innerHTML = `<p style="color:#64748b; margin-bottom:1rem;">Processing ${files.length} files for Year ${year}...</p>`;

    // Build lookup: student_id -> firestore doc.id
    const lookup = {};
    allStudents.forEach((s) => {
        if (s.student_id) lookup[s.student_id.trim().toLowerCase()] = s.id;
    });

    let success = 0,
        failed = 0;

    for (const file of files) {
        const studentIdFromFile = file.name
            .replace(/\.pdf$/i, '')
            .trim()
            .toLowerCase();
        const docId = lookup[studentIdFromFile];

        if (!docId) {
            logItems.innerHTML += `<div style="padding:0.5rem; background:#fff1f2; border-radius:0.5rem; margin-bottom:0.5rem; color:#be123c;">
                ❌ <b>${file.name}</b> — Student ID "<b>${studentIdFromFile}</b>" not found in system.
            </div>`;
            failed++;
            continue;
        }

        if (file.size > 900 * 1024) {
            logItems.innerHTML += `<div style="padding:0.5rem; background:#fef9c3; border-radius:0.5rem; margin-bottom:0.5rem; color:#854d0e;">
                ⚠️ <b>${file.name}</b> — File too large (max 900KB). Skipped.
            </div>`;
            failed++;
            continue;
        }

        try {
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
            await schoolDoc(collection, `${docId}_${year}`).set(
                withSchool({
                    fileData: base64,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                })
            );
            logItems.innerHTML += `<div style="padding:0.5rem; background:#ecfdf5; border-radius:0.5rem; margin-bottom:0.5rem; color:#065f46;">
                ✅ <b>${file.name}</b> — Uploaded for Student "${studentIdFromFile}" (${year})
            </div>`;
            success++;
        } catch (e) {
            logItems.innerHTML += `<div style="padding:0.5rem; background:#fff1f2; border-radius:0.5rem; margin-bottom:0.5rem; color:#be123c;">
                ❌ <b>${file.name}</b> — Upload failed: ${e.message}
            </div>`;
            failed++;
        }
    }

    logItems.innerHTML += `<div style="margin-top:1rem; padding:1rem; background:#f1f5f9; border-radius:0.5rem; font-weight:700;">
        Done: ✅ ${success} uploaded, ❌ ${failed} failed out of ${files.length} files.
    </div>`;
    showToast(`Bulk upload complete: ${success} success, ${failed} failed`);
    event.target.value = ''; // Reset file input
}

// ===================== CSV EXPORT =====================
async function exportToCSV(collection) {
    try {
        setLoading(true);
        const snap = await schoolData(collection).limit(1000).get();
        if (snap.empty) {
            showToast('No data to export', 'error');
            return;
        }
        if (snap.size === 1000) {
            showToast('Export limited to 1000 records. Use filters for more specific exports.', 'warning');
        }

        let csvContent = 'data:text/csv;charset=utf-8,';
        let headers = [];
        let rows = [];

        snap.forEach((doc) => {
            const data = doc.data();
            const row = {};

            // Format specific based on collection
            if (collection === 'students') {
                row['Student ID'] = data.studentId || data.student_id;
                row['Name'] = data.name;
                row['Class'] = data.class;
                row['Section'] = data.section;
                row['DOB'] = data.dateOfBirth || data.dob;
                row['Mobile'] = data.mobile || data.phone;
                row['Father Name'] = data.fatherName || data.father_name;
                row['Village/Address'] = data.village || data.address;
            } else if (collection === 'staff') {
                row['Name'] = data.name;
                row['Subject/Role'] = data.subject || data.role;
                row['Qualifications'] = data.qualifications || '';
            } else if (collection === 'inquiries') {
                row['Date'] = data.submittedAt ? new Date(data.submittedAt.toDate()).toLocaleDateString() : '';
                row['Parent Name'] = data.parent;
                row['Student Name'] = data.student;
                row['Mobile'] = data.mobile;
                row['Class'] = data.class;
                row['Village'] = data.village;
                row['Status'] = data.status;
                row['Message'] = data.message;
            }

            rows.push(row);
        });

        // Extract headers from first row
        if (rows.length > 0) {
            headers = Object.keys(rows[0]);
            csvContent += headers.map((h) => `"${h}"`).join(',') + '\r\n';

            rows.forEach((row) => {
                const values = headers.map((header) => {
                    let val = row[header] === undefined ? '' : row[header];
                    // Escape quotes
                    if (typeof val === 'string') {
                        val = val.replace(/"/g, '""');
                        if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
                    }
                    return val;
                });
                csvContent += values.join(',') + '\r\n';
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${collection}_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`Exported ${rows.length} records!`);
    } catch (e) {
        showToast('Error exporting: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== ADMIT CARD PDF TOOL =====================
async function processAdmitCardPdf() {
    const classVal = document.getElementById('admitToolClass').value;
    const year = document.getElementById('admitToolYear').value;
    const fileInput = document.getElementById('admitToolFile');
    const logArea = document.getElementById('admitToolLog');
    const progressSpan = document.getElementById('admitToolProgress');

    if (!classVal || !fileInput.files[0]) {
        showToast('Please select a Class and upload a PDF file.', 'error');
        return;
    }

    const file = fileInput.files[0];
    logArea.innerHTML = `> Starting process for Class: ${classVal}, Year: ${year}<br>`;
    logArea.innerHTML += `> File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)<br>`;
    progressSpan.innerText = 'Initializing...';

    // 1. Get students for this class, sorted by Student ID
    const students = allStudents
        .filter((s) => s.class === classVal)
        .sort((a, b) => {
            const idA = (a.studentId || a.student_id || '').toLowerCase();
            const idB = (b.studentId || b.student_id || '').toLowerCase();
            return idA.localeCompare(idB);
        });

    if (students.length === 0) {
        logArea.innerHTML += `<span style="color:#ef4444;">> ERROR: No students found in Class ${classVal}. Aborting.</span><br>`;
        progressSpan.innerText = 'Failed';
        return;
    }

    logArea.innerHTML += `> Found ${students.length} students in Class ${classVal}.<br>`;

    try {
        progressSpan.innerText = 'Reading PDF...';
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const mainPdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = mainPdfDoc.getPageCount();

        logArea.innerHTML += `> PDF has ${pageCount} pages.<br>`;

        if (pageCount !== students.length) {
            logArea.innerHTML += `<span style="color:#f59e0b;">> WARNING: Page count (${pageCount}) does not match student count (${students.length}).</span><br>`;
        }

        const limit = Math.min(pageCount, students.length);
        let successCount = 0;

        for (let i = 0; i < limit; i++) {
            const student = students[i];
            progressSpan.innerText = `Splitting: ${i + 1}/${limit}`;

            try {
                // Create a new PDF for this single page
                const subPdfDoc = await PDFDocument.create();
                const [copiedPage] = await subPdfDoc.copyPages(mainPdfDoc, [i]);
                subPdfDoc.addPage(copiedPage);

                const pdfBytes = await subPdfDoc.save();
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(new Blob([pdfBytes], { type: 'application/pdf' }));
                });

                logArea.innerHTML += `> Processing student: <b>${student.studentId || student.student_id}</b> (${student.name})...<br>`;

                // Upload to Firestore
                await schoolDoc('admitcards', `${student.id}_${year}`).set(
                    withSchool({
                        fileData: base64,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    })
                );

                logArea.innerHTML += `<span style="color:#10b981;">  ✅ Successfully assigned page ${i + 1} to ${student.studentId || student.student_id}</span><br>`;
                successCount++;
            } catch (err) {
                logArea.innerHTML += `<span style="color:#ef4444;">  ❌ Failed for ${student.studentId || student.student_id}: ${err.message}</span><br>`;
            }

            // Auto-scroll log
            logArea.scrollTop = logArea.scrollHeight;
        }

        logArea.innerHTML += `<span style="color:#38bdf8; font-weight:bold;">> COMPLETED: ${successCount} admit cards processed successfully.</span><br>`;
        progressSpan.innerText = 'Done';
        showToast(`Admit Card Split complete! ${successCount} successful.`, 'success');
    } catch (e) {
        logArea.innerHTML += `<span style="color:#ef4444;">> CRITICAL ERROR: ${e.message}</span><br>`;
        progressSpan.innerText = 'Error';
        console.error(e);
    }
}
// ===================== SEARCHABLE STUDENT SELECT =====================
function initSearchableSelect(containerId, dataArray, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Attach data to window for the global toggle/filter functions to access
    window[`${containerId}_data`] = dataArray;

    container.innerHTML = `
        <div class="searchable-select-wrapper" style="position:relative;">
            <div class="select-trigger" onclick="toggleSearchDropdown('${containerId}')" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; border:1px solid var(--border); border-radius:0.5rem; background:white; cursor:pointer;">
                <span id="${containerId}_label" style="color:var(--text-muted);">Select Item...</span>
                <i class="fas fa-chevron-down" style="font-size:0.8rem; color:var(--text-muted);"></i>
            </div>
            <div id="${containerId}_dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:white; border:1px solid var(--border); border-radius:0.5rem; margin-top:0.5rem; box-shadow:0 10px 25px rgba(0,0,0,0.1); z-index:1000; max-height:300px; overflow:hidden; display:flex; flex-direction:column;">
                <div style="padding:0.75rem; border-bottom:1px solid var(--border); background:#f8fafc;">
                    <input type="text" placeholder="Search..." oninput="filterSearchDropdown('${containerId}', this.value)" style="width:100%; padding:0.6rem; border:1px solid var(--border); border-radius:0.4rem; font-size:0.9rem;">
                </div>
                <div id="${containerId}_list" style="overflow-y:auto; flex:1; max-height:220px;">
                    <!-- List populated dynamically -->
                </div>
            </div>
        </div>
    `;

    window[`${containerId}_select`] = (sJson) => {
        const s = JSON.parse(decodeURIComponent(sJson));
        // Default label formatting for students vs classes
        const labelText = s.student_id ? `${s.name} [${s.father_name || ''}] [${s.student_id}]` : s.name || s.id;
        document.getElementById(`${containerId}_label`).textContent = labelText;
        document.getElementById(`${containerId}_dropdown`).style.display = 'none';
        if (onSelect) onSelect(s);
    };
}

function toggleSearchDropdown(id) {
    const drop = document.getElementById(`${id}_dropdown`);
    const isVisible = drop.style.display === 'flex';
    const dataArray = window[`${id}_data`] || [];

    // Close others
    document.querySelectorAll('[id$="_dropdown"]').forEach((el) => (el.style.display = 'none'));

    if (!isVisible) {
        drop.style.display = 'flex';
        renderDropdownList(id, dataArray);
        const input = drop.querySelector('input');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function filterSearchDropdown(id, q) {
    const term = q.toLowerCase();
    const dataArray = window[`${id}_data`] || [];
    const filtered = dataArray.filter(
        (s) =>
            (s.name || '').toLowerCase().includes(term) ||
            (s.student_id || '').toLowerCase().includes(term) ||
            (s.father_name || '').toLowerCase().includes(term) ||
            (s.phone || '').toLowerCase().includes(term)
    );
    renderDropdownList(id, filtered.slice(0, 30)); // Limit for performance
}

function renderDropdownList(id, list) {
    const el = document.getElementById(`${id}_list`);
    if (!el) return; // Added check for el
    if (!list || list.length === 0) {
        el.innerHTML =
            '<div style="padding:0.75rem; text-align:center; color:var(--text-muted);">No results found</div>';
        return;
    }

    el.innerHTML = list
        .map((s) => {
            const labelText = s.student_id ? `${s.name} (${s.student_id})` : s.name || s.id;
            const subText = s.father_name
                ? `<br><small style="color:var(--text-muted)">Father: ${s.father_name}</small>`
                : '';
            return `<div onclick="window['${id}_select']('${encodeURIComponent(JSON.stringify(s))}')" style="padding:0.75rem 1rem; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.2s;">
                <div style="font-weight:500;">${labelText}</div>
                ${subText}
            </div>`;
        })
        .join('');
}

// Close dropdowns on click outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.searchable-select-wrapper')) {
        document.querySelectorAll('[id$="_dropdown"]').forEach((el) => (el.style.display = 'none'));
    }
});

// ==================== BULK STUDENT UPDATE LOGIC ====================
async function initBulkUpdate() {
    const sessionSelect = document.getElementById('bulk_student_session');
    if (!sessionSelect) return;

    if (typeof erpState !== 'undefined' && erpState.sessions.length > 0) {
        populateBulkSessionDropdown();
    } else {
        await loadSessions();
        populateBulkSessionDropdown();
    }
}

window.initBulkUpdate = initBulkUpdate;

function populateBulkSessionDropdown() {
    const sessionSelect = document.getElementById('bulk_student_session');
    if (!sessionSelect) return;

    sessionSelect.innerHTML =
        '<option value="">Select Session</option>' +
        erpState.sessions
            .map((s) => `<option value="${s.name}" data-id="${s.id}" ${s.active ? 'selected' : ''}>${s.name}</option>`)
            .join('');

    if (erpState.activeSessionId) loadClassesForBulkUpdate();
}

async function loadClassesForBulkUpdate() {
    const sessionSelect = document.getElementById('bulk_student_session');
    const sessionId = sessionSelect.options[sessionSelect.selectedIndex]?.getAttribute('data-id');
    const classSelect = document.getElementById('bulk_student_class');
    if (!classSelect || !sessionId) return;

    try {
        const snapshot = await schoolData('classes')
            .where('sessionId', '==', sessionId)
            .orderBy('sortOrder', 'asc')
            .get();
        const classes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        classSelect.innerHTML =
            '<option value="">Select Class</option>' +
            classes.map((cls) => `<option value="${cls.name}" data-id="${cls.id}">${cls.name}</option>`).join('');

        document.getElementById('bulk_student_section').innerHTML = '<option value="">Select Class First</option>';
    } catch (e) {
        console.error('Error loading classes for bulk update:', e);
    }
}

window.loadClassesForBulkUpdate = loadClassesForBulkUpdate;

function escAttr(val) {
    if (val == null) return '';
    return String(val).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function loadBulkStudentList() {
    const session = document.getElementById('bulk_student_session').value;
    const className = document.getElementById('bulk_student_class').value;
    const section = document.getElementById('bulk_student_section').value;
    const body = document.getElementById('bulkUpdateTableBody');

    if (!session || !className) return;

    body.innerHTML = '<tr><td colspan="28" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading students...</td></tr>';

    try {
        let query = schoolData('students').where('session', '==', session).where('class', '==', className);
        if (section) query = query.where('section', '==', section);

        const snapshot = await query.get();
        const students = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        if (students.length === 0) {
            body.innerHTML = '<tr><td colspan="28" class="text-center text-muted p-4"><i class="fas fa-search text-2xl mb-1 opacity-30" style="display:block;font-size:1.5rem;margin-bottom:0.5rem;"></i>No students found matching filters.</td></tr>';
            return;
        }

        body.innerHTML = students.map((s) => {
            var sid = escAttr(s.student_id || s.id.slice(0, 6));
            var name = escAttr(s.name || '');
            var roll = escAttr(s.roll_no || '');
            var sec = escAttr(s.section || '');
            var father = escAttr(s.father_name || '');
            var mother = escAttr(s.mother_name || '');
            var mobile = escAttr(s.mobile || '');
            var email = escAttr(s.email || '');
            var dob = escAttr(s.dob || '');
            var gender = escAttr(s.gender || '');
            var blood = escAttr(s.blood_group || '');
            var cat = escAttr(s.category || '');
            var caste = escAttr(s.caste || '');
            var rel = escAttr(s.religion || '');
            var aadhar = escAttr(s.aadhar || '');
            var pen = escAttr(s.pen || '');
            var reg = escAttr(s.reg_no || s.regNo || '');
            var rfid = escAttr(s.rfid_no || s.rfid || '');
            var guardian = escAttr(s.guardian_name || '');
            var gphone = escAttr(s.guardian_phone || '');
            var addr = escAttr(s.address || '');
            var perm = escAttr(s.permanent_address || '');
            var city = escAttr(s.city || '');
            var sms = escAttr(s.sms_contact || '');
            var hostel = escAttr(s.hostel || '');
            var transport = escAttr(s.transport || '');
            var jdate = escAttr(s.join_date || '');
            var status = escAttr(s.status || '');

            return '<tr data-id="' + s.id + '">' +
                '<td style="font-family:monospace;font-size:0.75rem;">' + sid + '</td>' +
                '<td><input type="text" class="bulk-input b-name" value="' + name + '"></td>' +
                '<td class="col_roll"><input type="text" class="bulk-input b-roll" value="' + roll + '"></td>' +
                '<td class="col_section hidden"><input type="text" class="bulk-input b-section" value="' + sec + '"></td>' +
                '<td class="col_father"><input type="text" class="bulk-input b-father" value="' + father + '"></td>' +
                '<td class="col_mother hidden"><input type="text" class="bulk-input b-mother" value="' + mother + '"></td>' +
                '<td class="col_mobile"><input type="text" class="bulk-input b-mobile" value="' + mobile + '"></td>' +
                '<td class="col_email hidden"><input type="text" class="bulk-input b-email" value="' + email + '"></td>' +
                '<td class="col_dob"><input type="date" class="bulk-input b-dob" value="' + dob + '"></td>' +
                '<td class="col_gender hidden"><select class="bulk-input b-gender"><option value="">--</option><option value="Male"' + (gender === 'Male' ? ' selected' : '') + '>Male</option><option value="Female"' + (gender === 'Female' ? ' selected' : '') + '>Female</option><option value="Other"' + (gender === 'Other' ? ' selected' : '') + '>Other</option></select></td>' +
                '<td class="col_blood hidden"><input type="text" class="bulk-input b-blood" value="' + blood + '"></td>' +
                '<td class="col_category hidden"><input type="text" class="bulk-input b-category" value="' + cat + '"></td>' +
                '<td class="col_caste hidden"><input type="text" class="bulk-input b-caste" value="' + caste + '"></td>' +
                '<td class="col_religion hidden"><input type="text" class="bulk-input b-religion" value="' + rel + '"></td>' +
                '<td class="col_aadhar hidden"><input type="text" class="bulk-input b-aadhar" value="' + aadhar + '"></td>' +
                '<td class="col_pen hidden"><input type="text" class="bulk-input b-pen" value="' + pen + '"></td>' +
                '<td class="col_regno hidden"><input type="text" class="bulk-input b-regno" value="' + reg + '"></td>' +
                '<td class="col_rfid hidden"><input type="text" class="bulk-input b-rfid" value="' + rfid + '"></td>' +
                '<td class="col_guardian hidden"><input type="text" class="bulk-input b-guardian" value="' + guardian + '"></td>' +
                '<td class="col_guardphone hidden"><input type="text" class="bulk-input b-guardphone" value="' + gphone + '"></td>' +
                '<td class="col_address hidden"><input type="text" class="bulk-input b-address" value="' + addr + '"></td>' +
                '<td class="col_permaddr hidden"><input type="text" class="bulk-input b-permaddr" value="' + perm + '"></td>' +
                '<td class="col_city hidden"><input type="text" class="bulk-input b-city" value="' + city + '"></td>' +
                '<td class="col_sms hidden"><input type="text" class="bulk-input b-sms" value="' + sms + '"></td>' +
                '<td class="col_hostel hidden"><select class="bulk-input b-hostel"><option value="">--</option><option value="Yes"' + (hostel === 'Yes' ? ' selected' : '') + '>Yes</option><option value="No"' + (hostel === 'No' ? ' selected' : '') + '>No</option></select></td>' +
                '<td class="col_transport hidden"><input type="text" class="bulk-input b-transport" value="' + transport + '"></td>' +
                '<td class="col_joindate hidden"><input type="date" class="bulk-input b-joindate" value="' + jdate + '"></td>' +
                '<td class="col_status hidden"><select class="bulk-input b-status"><option value="">--</option><option value="Active"' + (status === 'Active' ? ' selected' : '') + '>Active</option><option value="Left"' + (status === 'Left' ? ' selected' : '') + '>Left</option><option value="TC Released"' + (status === 'TC Released' ? ' selected' : '') + '>TC Released</option></select></td>' +
                '</tr>';
        }).join('');

        // Re-apply column visibility
        document.querySelectorAll('#bulkColumnToggles input[type="checkbox"]').forEach((cb) => {
            var m = cb.getAttribute('onchange').match(/'([^']+)'/);
            if (m) toggleBulkCol(m[1], cb.checked);
        });
    } catch (e) {
        console.error('Error loading bulk list:', e);
        body.innerHTML = '<tr><td colspan="28" style="text-align:center;color:var(--danger);">Error loading students.</td></tr>';
    }
}

window.loadBulkStudentList = loadBulkStudentList;

function toggleBulkUpdateColumns() {
    var toggles = document.getElementById('bulkColumnToggles');
    toggles.style.display = toggles.style.display === 'none' ? 'block' : 'none';
}

window.toggleBulkUpdateColumns = toggleBulkUpdateColumns;

function toggleBulkCol(colClass, forceState) {
    var elements = document.querySelectorAll('.' + colClass);
    var checkbox = document.querySelector('input[onchange*="' + colClass + '"]');
    var shouldShow = forceState !== undefined && forceState !== null ? forceState : checkbox && checkbox.checked;
    if (checkbox) checkbox.checked = shouldShow;
    elements.forEach(function (el) { el.style.display = shouldShow ? '' : 'none'; });
}

window.toggleBulkCol = toggleBulkCol;

function bulkSetFieldChanged() {
    var field = document.getElementById('bulkSetField').value;
    var valInput = document.getElementById('bulkSetValue');
    // Provide hints for dropdown-type fields
    var hints = {
        gender: 'e.g. Male / Female / Other',
        hostel: 'e.g. Yes / No',
        status: 'e.g. Active / Left / TC Released',
        section: 'e.g. A / B / C',
        dob: 'YYYY-MM-DD',
        join_date: 'YYYY-MM-DD',
        rfid_no: 'RFID card number',
        sms_contact: 'Mobile number for SMS alerts'
    };
    valInput.placeholder = hints[field] || 'Enter value';
}

window.bulkSetFieldChanged = bulkSetFieldChanged;

async function bulkSetColumnValue() {
    var field = document.getElementById('bulkSetField').value;
    var value = document.getElementById('bulkSetValue').value.trim();
    var statusEl = document.getElementById('bulkSetStatus');
    var rows = document.querySelectorAll('#bulkUpdateTableBody tr[data-id]');

    if (!field) { showToast('Select a field to set', 'error'); return; }
    if (rows.length === 0) { showToast('No students loaded', 'error'); return; }

    if (!await window.showConfirmModal({ title: 'Bulk Update', message: 'Set "' + field + '" to "' + (value || '(empty)') + '" for ' + rows.length + ' students?', icon: 'fa-edit', confirmText: 'Update' })) return;

    // Map field name to CSS class
    var classMap = {
        roll_no: '.b-roll', name: '.b-name', section: '.b-section',
        father_name: '.b-father', mother_name: '.b-mother',
        mobile: '.b-mobile', email: '.b-email',
        guardian_name: '.b-guardian', guardian_phone: '.b-guardphone',
        dob: '.b-dob', gender: '.b-gender', blood_group: '.b-blood',
        category: '.b-category', caste: '.b-caste', religion: '.b-religion',
        aadhar: '.b-aadhar', pen: '.b-pen', reg_no: '.b-regno', rfid_no: '.b-rfid',
        address: '.b-address', permanent_address: '.b-permaddr', city: '.b-city',
        sms_contact: '.b-sms', hostel: '.b-hostel', transport: '.b-transport',
        join_date: '.b-joindate', status: '.b-status'
    };
    var selector = classMap[field];
    if (!selector) { showToast('Unknown field: ' + field, 'error'); return; }

    rows.forEach(function (row) {
        var input = row.querySelector(selector);
        if (input) input.value = value;
    });

    statusEl.textContent = 'Set "' + field + '" = "' + (value || '(empty)') + '" for ' + rows.length + ' students.';
    showToast('Applied to ' + rows.length + ' rows', 'success');

    // Auto-save if checked
    var autoSave = document.getElementById('bulkSetAutoSave');
    if (autoSave && autoSave.checked) {
        await saveBulkStudentUpdate();
    }
}

window.bulkSetColumnValue = bulkSetColumnValue;

async function saveBulkStudentUpdate() {
    var rows = document.querySelectorAll('#bulkUpdateTableBody tr[data-id]');
    if (rows.length === 0) return;

    try {
        setLoading(true);
        var batch = (window.db || firebase.firestore()).batch();
        var count = 0;

        rows.forEach(function (row) {
            var id = row.getAttribute('data-id');
            var getVal = function (sel) { var el = row.querySelector(sel); return el ? el.value.trim() : ''; };
            var data = {
                name: getVal('.b-name'),
                roll_no: getVal('.b-roll'),
                section: getVal('.b-section'),
                father_name: getVal('.b-father'),
                mother_name: getVal('.b-mother'),
                mobile: getVal('.b-mobile'),
                email: getVal('.b-email'),
                dob: getVal('.b-dob'),
                gender: getVal('.b-gender'),
                blood_group: getVal('.b-blood'),
                category: getVal('.b-category'),
                caste: getVal('.b-caste'),
                religion: getVal('.b-religion'),
                aadhar: getVal('.b-aadhar'),
                pen: getVal('.b-pen'),
                reg_no: getVal('.b-regno'),
                rfid_no: getVal('.b-rfid'),
                guardian_name: getVal('.b-guardian'),
                guardian_phone: getVal('.b-guardphone'),
                address: getVal('.b-address'),
                permanent_address: getVal('.b-permaddr'),
                city: getVal('.b-city'),
                sms_contact: getVal('.b-sms'),
                hostel: getVal('.b-hostel'),
                transport: getVal('.b-transport'),
                join_date: getVal('.b-joindate'),
                status: getVal('.b-status'),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            batch.update(schoolDoc('students', id), data);
            count++;
        });

        await batch.commit();
        showToast('Successfully updated ' + count + ' student records!', 'success');
        loadInitialData();
    } catch (e) {
        console.error('Bulk update failed:', e);
        showToast('Failed to save changes: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

window.saveBulkStudentUpdate = saveBulkStudentUpdate;

// ==================== REPORT CARD LOGIC (Phase 5) ====================
async function initReportCardSection() {
    const sessionSelect = document.getElementById('rc_session');
    if (!sessionSelect) return;

    if (typeof erpState !== 'undefined' && erpState.sessions.length > 0) {
        populateRcSessionDropdown();
    } else {
        await loadSessions();
        populateRcSessionDropdown();
    }
}

function populateRcSessionDropdown() {
    const sessionSelect = document.getElementById('rc_session');
    if (!sessionSelect) return;
    sessionSelect.innerHTML =
        '<option value="">Select Session</option>' +
        erpState.sessions
            .map((s) => `<option value="${s.name}" data-id="${s.id}" ${s.active ? 'selected' : ''}>${s.name}</option>`)
            .join('');
    if (erpState.activeSessionId) loadRcClasses();
}

async function loadRcClasses() {
    const sessionSelect = document.getElementById('rc_session');
    const sessionId = sessionSelect.options[sessionSelect.selectedIndex]?.getAttribute('data-id');
    const classSelect = document.getElementById('rc_class');
    if (!classSelect || !sessionId) return;

    try {
        const snapshot = await schoolData('classes')
            .where('sessionId', '==', sessionId)
            .orderBy('sortOrder', 'asc')
            .get();
        const classes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        classSelect.innerHTML =
            '<option value="">Select Class</option>' +
            classes.map((cls) => `<option value="${cls.name}" data-id="${cls.id}">${cls.name}</option>`).join('');
        document.getElementById('rc_section').innerHTML = '<option value="">Select Class First</option>';
        document.getElementById('rc_student').innerHTML = '<option value="">Select Details Above</option>';
    } catch (e) {
        console.error(e);
    }
}

async function loadRcSections() {
    const classSelect = document.getElementById('rc_class');
    const className = classSelect.value;
    const sectSelect = document.getElementById('rc_section');
    if (!sectSelect || !className) return;

    const session = document.getElementById('rc_session').value;
    try {
        const snapshot = await schoolData('students')
            .where('session', '==', session)
            .where('class', '==', className)
            .get();
        const students = snapshot.docs.map((doc) => doc.data());
        const sections = [...new Set(students.map((s) => s.section).filter(Boolean))];
        sectSelect.innerHTML =
            '<option value="">Select Section</option>' +
            sections.map((s) => `<option value="${s}">${s}</option>`).join('');
    } catch (e) {
        console.error(e);
    }
}

async function loadRcStudents() {
    const session = document.getElementById('rc_session').value;
    const className = document.getElementById('rc_class').value;
    const section = document.getElementById('rc_section').value;
    const studentSelect = document.getElementById('rc_student');
    if (!studentSelect || !session || !className) return;

    studentSelect.innerHTML = '<option value="">Loading students...</option>';
    try {
        let query = schoolData('students').where('session', '==', session).where('class', '==', className);
        if (section) query = query.where('section', '==', section);
        const snapshot = await query.get();
        const students = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const container = document.getElementById('rcStudentContainer');
        if (container) {
            initSearchableSelect('rcStudentContainer', students, (selectedStudent) => {
                document.getElementById('rc_student').value = selectedStudent.id;
            });
            // Reset the hidden value initially
            document.getElementById('rc_student').value = '';
        }
    } catch (e) {
        console.error(e);
    }
}

async function processReportCardGeneration() {
    const studentId = document.getElementById('rc_student').value;
    const format = document.getElementById('rc_format').value;
    const session = document.getElementById('rc_session').value;

    if (!studentId) {
        showToast('Please select a student first', 'error');
        return;
    }

    try {
        setLoading(true);
        const sessionSelect = document.getElementById('rc_session');
        const sessionId = sessionSelect.options[sessionSelect.selectedIndex]?.getAttribute('data-id') || session;

        // 1. Fetch Student Data
        const sDoc = await schoolDoc('students', studentId).get();
        if (!sDoc.exists) throw new Error('Student not found');
        const student = sDoc.data();

        // 2. Fetch Marks (For now, just getting all marks for this student/session)
        // In a real scenario, you'd filter by Term/Exam too
        const mSnap = await schoolData('marks')
            .where('studentId', '==', studentId)
            .where('session', '==', session)
            .get();
        const marks = mSnap.docs.map((doc) => doc.data());

        // 3. School Details (Mock or from Settings)
        const schoolDetails = {
            name: 'HIMALAYAN INTERNATIONAL SCHOOL', // As per reference
            address: 'CHETAN PARSA, PARSA, SARAN, BIHAR - 841219',
        };

        const examDetails = {
            title: 'TERM 2',
            session: session,
        };

        // 4. Generate via common Factory
        if (format === 'premium') {
            // Premium uses the advanced tool with attendance calculation
            if (window.ReportCardTool) {
                await window.ReportCardTool.processReportCard(studentId, 'premium', sessionId, 'premium');
            } else {
                await window.ReportCardFactory.generatePremium(student, marks, examDetails, schoolDetails);
            }
        } else if (format === 'Himalayan') {
            await window.ReportCardFactory.generateHimalayan(student, marks, examDetails, schoolDetails);
        } else if (format === 'MCQ_Normal') {
            await window.ReportCardFactory.generateMCQNormal(student, marks, examDetails, schoolDetails);
        } else if (format === 'MCQ_Standard') {
            await window.ReportCardFactory.generateMCQStandard(student, marks, examDetails, schoolDetails);
        } else if (format === 'MCQ_Advance') {
            await window.ReportCardFactory.generateMCQAdvance(student, marks, examDetails, schoolDetails);
        } else {
            showToast('Selected format is not yet supported.', 'error');
        }
    } catch (e) {
        console.error('Report generation failed:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Global exposure
window.loadRcClasses = loadRcClasses;
window.loadRcSections = loadRcSections;
window.loadRcStudents = loadRcStudents;
window.processReportCardGeneration = processReportCardGeneration;
window.initReportCardSection = initReportCardSection;

async function loadEmployeesForIdPrint() {
    const select = document.getElementById('empIdSelect');
    if (!select) return;

    try {
        const snap = await schoolData('employees').limit(500).get();
        select.innerHTML = '<option value="">-- Select Employee --</option>';
        snap.docs.forEach((doc) => {
            const emp = doc.data();
            select.innerHTML += `<option value="${doc.id}">${emp.name} (${emp.designation || ''})</option>`;
        });
    } catch (e) {
        console.error(e);
    }
}

async function populateEnquiryClasses() {
    const select = document.getElementById('enq_class');
    if (!select) return;

    try {
        const snap = await schoolData('classes').get();
        select.innerHTML = '<option value="">Select Class</option>';
        snap.docs.forEach((doc) => {
            const c = doc.data();
            select.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        });
    } catch (e) {
        console.error(e);
    }
}

/**
 * Standardized Excel Template Generator
 * Supports: students, marks, fee_dues, fee_payments
 */
function downloadExcelTemplate(type) {
    let filename = 'template.xlsx';
    let headers = [];
    let sampleData = [];

    switch (type) {
        case 'students':
            filename = 'student_import_template.xlsx';
            headers = ['Id', 'Name', 'Class', 'Section', 'Phone', 'Father Name', 'Address'];
            sampleData = [['1001', 'John Doe', '5', 'A', '9876543210', 'Richard Doe', 'Main St, City']];
            break;
        case 'marks':
            filename = 'marks_upload_template.xlsx';
            headers = ['Roll No', 'Name', 'Marks Obtained'];
            sampleData = [['1', 'John Doe', '85']];
            break;
        case 'fee_dues':
            filename = 'fee_dues_template.xlsx';
            headers = ['Student Id', 'Student Name', 'Father Name', 'Phone', 'Session', 'Class', 'Due Amount'];
            sampleData = [['1001', 'John Doe', 'Richard Doe', '9876543210', '2025-26', '5', '5000']];
            break;
        case 'fee_payments':
            filename = 'monthly_payments_template.xlsx';
            headers = ['Student Id', 'Student Name', 'Father Name', 'Phone', 'Session', 'Class', 'Paid Amount'];
            sampleData = [['1001', 'John Doe', 'Richard Doe', '9876543210', '2025-26', '5', '2000']];
            break;
        default:
            showToast('Invalid template type', 'error');
            return;
    }

    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

        // Basic column widths
        ws['!cols'] = headers.map(() => ({ wch: 15 }));

        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, filename);
        showToast(`Downloaded ${filename}`, 'success');
    } catch (e) {
        console.error('Template download error:', e);
        showToast('Failed to generate template', 'error');
    }
}

// Global Exports for templates
window.downloadExcelTemplate = downloadExcelTemplate;

// ==================== Student RFID Update Functions ====================

async function loadClassesForRfidUpdate() {
    const sessionSelect = document.getElementById('rfid_student_session');
    const classSelect = document.getElementById('rfid_student_class');
    if (!sessionSelect || !classSelect) return;

    const sessionId = sessionSelect.value;
    if (!sessionId) {
        classSelect.innerHTML = '<option value="">Select Session First</option>';
        return;
    }

    try {
        const snapshot = await schoolData('classes')
            .where('sessionId', '==', sessionId)
            .orderBy('sortOrder', 'asc')
            .get();

        classSelect.innerHTML = '<option value="">Select Class</option>';
        snapshot.docs.forEach((doc) => {
            const c = doc.data();
            classSelect.innerHTML += `<option value="${c.name}" data-id="${c.id}">${c.name}</option>`;
        });
    } catch (e) {
        console.error('Error loading classes for RFID:', e);
    }
}

function loadSectionsForRfidUpdate() {
    const classSelect = document.getElementById('rfid_student_class');
    const secSelect = document.getElementById('rfid_student_section');
    if (!classSelect || !secSelect) return;

    const selectedOption = classSelect.options[classSelect.selectedIndex];
    const classId = selectedOption?.getAttribute('data-id');

    if (!classId) {
        secSelect.innerHTML = '<option value="">Select Class First</option>';
        return;
    }

    const cls = erpState.classes.find((c) => c.id === classId);
    if (!cls || !cls.sections || cls.sections.length === 0) {
        secSelect.innerHTML = '<option value="">No Sections</option>';
        return;
    }

    secSelect.innerHTML =
        '<option value="">All Sections</option>' +
        cls.sections.map((sec) => `<option value="${sec}">${sec}</option>`).join('');
}

async function loadStudentsForRfidUpdate() {
    const sessionSelect = document.getElementById('rfid_student_session');
    const classSelect = document.getElementById('rfid_student_class');
    const secSelect = document.getElementById('rfid_student_section');
    const tbody = document.getElementById('rfidUpdateTableBody');

    if (!classSelect.value) {
        tbody.innerHTML = `<tr>
            <td colspan="5" class="text-center p-3 text-slate-muted">
                <i class="fas fa-wifi text-2xl opacity-03 mb-1 block"></i>
                Select Session, Class and Section to load students
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = `<tr>
        <td colspan="5" class="text-center p-3">
            <i class="fas fa-spinner fa-spin"></i> Loading students...
        </td>
    </tr>`;

    const selectedSession = sessionSelect.options[sessionSelect.selectedIndex]?.text || '';
    const selectedClass = classSelect.value;
    const selectedSection = secSelect.value;

    try {
        let query = schoolData('students').where('session', '==', selectedSession).where('class', '==', selectedClass);

        if (selectedSection) {
            query = query.where('section', '==', selectedSection);
        }

        const snapshot = await query.orderBy('roll_no', 'asc').get();

        if (snapshot.empty) {
            tbody.innerHTML = `<tr>
                <td colspan="5" class="text-center p-3 text-slate-muted">No students found</td>
            </tr>`;
            return;
        }

        tbody.innerHTML = snapshot.docs
            .map((doc) => {
                const s = doc.data();
                const rfid = s.rfid_no || s.rfid || s.smart_card_no || s.smartCardNo || '';
                return `<tr>
                <td>${s.studentId || s.student_id || doc.id}</td>
                <td>${s.name || s.student_name || ''}</td>
                <td>${s.class || ''} ${s.section || ''}</td>
                <td>${rfid || '-'}</td>
                <td>
                    <input type="text" 
                        class="form-control" 
                        placeholder="Enter RFID No" 
                        data-student-id="${doc.id}"
                        value="${rfid || ''}"
                        style="width: 150px;"
                    />
                </td>
            </tr>`;
            })
            .join('');
    } catch (e) {
        console.error('Error loading students for RFID:', e);
        tbody.innerHTML = `<tr>
            <td colspan="5" class="text-center p-3 text-red">Error loading students</td>
        </tr>`;
    }
}

async function saveRfidUpdates() {
    const inputs = document.querySelectorAll('#rfidUpdateTableBody input');
    const updates = [];

    inputs.forEach((input) => {
        const studentId = input.getAttribute('data-student-id');
        const newRfid = input.value.trim();
        if (studentId && newRfid) {
            updates.push({ studentId, rfid: newRfid });
        }
    });

    if (updates.length === 0) {
        showToast('No RFID updates to save', 'info');
        return;
    }

    try {
        setLoading(true);

        const batch = db.batch();

        for (const upd of updates) {
            const docRef = schoolData('students').doc(upd.studentId);
            batch.update(docRef, { rfid_no: upd.rfid });
        }

        await batch.commit();
        showToast(`Successfully updated ${updates.length} RFID numbers`, 'success');
        loadStudentsForRfidUpdate(); // Refresh the table
    } catch (e) {
        console.error('Error saving RFID updates:', e);
        showToast('Failed to save RFID updates', 'error');
    } finally {
        setLoading(false);
    }
}

// Export functions to window
window.loadClassesForRfidUpdate = loadClassesForRfidUpdate;
window.loadSectionsForRfidUpdate = loadSectionsForRfidUpdate;
window.loadStudentsForRfidUpdate = loadStudentsForRfidUpdate;
window.saveRfidUpdates = saveRfidUpdates;

// ==================== Pickup ID Print Functions ====================

let pickupSelectedStudents = new Set();

async function loadClassesForPickupId() {
    const sessionSelect = document.getElementById('pickup_session');
    const classSelect = document.getElementById('pickup_class');
    if (!sessionSelect || !classSelect) return;

    const sessionId = sessionSelect.value;
    if (!sessionId) {
        classSelect.innerHTML = '<option value="">Select Session First</option>';
        return;
    }

    try {
        const snapshot = await schoolData('classes')
            .where('sessionId', '==', sessionId)
            .orderBy('sortOrder', 'asc')
            .get();

        classSelect.innerHTML = '<option value="">Select Class</option>';
        snapshot.docs.forEach((doc) => {
            const c = doc.data();
            classSelect.innerHTML += `<option value="${c.name}" data-id="${c.id}">${c.name}</option>`;
        });
    } catch (e) {
        console.error('Error loading classes for pickup:', e);
    }
}

function loadSectionsForPickupId() {
    const classSelect = document.getElementById('pickup_class');
    const secSelect = document.getElementById('pickup_section');
    if (!classSelect || !secSelect) return;

    const selectedOption = classSelect.options[classSelect.selectedIndex];
    const classId = selectedOption?.getAttribute('data-id');

    if (!classId) {
        secSelect.innerHTML = '<option value="">Select Class First</option>';
        return;
    }

    const cls = erpState.classes.find((c) => c.id === classId);
    if (!cls || !cls.sections || cls.sections.length === 0) {
        secSelect.innerHTML = '<option value="">No Sections</option>';
        return;
    }

    secSelect.innerHTML =
        '<option value="">All Sections</option>' +
        cls.sections.map((sec) => `<option value="${sec}">${sec}</option>`).join('');
}

async function loadStudentsForPickupId() {
    const sessionSelect = document.getElementById('pickup_session');
    const classSelect = document.getElementById('pickup_class');
    const secSelect = document.getElementById('pickup_section');
    const listContainer = document.getElementById('pickupStudentList');
    const previewContainer = document.getElementById('pickupIdPreviewContainer');
    const countSpan = document.getElementById('pickupSelectedCount');

    pickupSelectedStudents.clear();
    if (countSpan) countSpan.textContent = '0';

    if (!classSelect.value) {
        listContainer.innerHTML = '<p class="text-muted text-center p-2">Select session and class to load students</p>';
        return;
    }

    listContainer.innerHTML = '<p class="text-center p-2"><i class="fas fa-spinner fa-spin"></i> Loading...</p>';

    const selectedSession = sessionSelect.options[sessionSelect.selectedIndex]?.text || '';
    const selectedClass = classSelect.value;
    const selectedSection = secSelect.value;

    try {
        let query = schoolData('students').where('session', '==', selectedSession).where('class', '==', selectedClass);

        if (selectedSection) {
            query = query.where('section', '==', selectedSection);
        }

        const snapshot = await query.orderBy('roll_no', 'asc').get();

        if (snapshot.empty) {
            listContainer.innerHTML = '<p class="text-muted text-center p-2">No students found</p>';
            return;
        }

        listContainer.innerHTML = snapshot.docs
            .map((doc) => {
                const s = doc.data();
                return `<div class="flex align-center gap-1 p-0-5 border-bottom">
                <input type="checkbox" class="pickup-student-checkbox" 
                    data-student-id="${doc.id}" 
                    data-student-name="${s.name || ''}"
                    data-father-name="${s.father_name || s.fatherName || ''}"
                    data-class="${s.class || ''} ${s.section || ''}"
                    onchange="updatePickupSelection(this)">
                <div>
                    <div class="font-600">${s.name || ''}</div>
                    <div class="text-xs text-muted">${s.class || ''} ${s.section || ''} - Father: ${s.father_name || s.fatherName || '-'}</div>
                </div>
            </div>`;
            })
            .join('');

        previewContainer.innerHTML = `<div class="text-muted text-center">
            <i class="fas fa-eye-slash text-4xl opacity-20 block mb-1"></i>
            Select students to see preview
        </div>`;
    } catch (e) {
        console.error('Error loading students for pickup:', e);
        listContainer.innerHTML = '<p class="text-danger text-center p-2">Error loading students</p>';
    }
}

function updatePickupSelection(checkbox) {
    const studentId = checkbox.getAttribute('data-student-id');
    if (checkbox.checked) {
        pickupSelectedStudents.add(studentId);
    } else {
        pickupSelectedStudents.delete(studentId);
    }

    const countSpan = document.getElementById('pickupSelectedCount');
    if (countSpan) countSpan.textContent = pickupSelectedStudents.size;

    updatePickupPreview();
}

function selectAllPickupStudents() {
    document.querySelectorAll('.pickup-student-checkbox').forEach((cb) => {
        cb.checked = true;
        pickupSelectedStudents.add(cb.getAttribute('data-student-id'));
    });
    const countSpan = document.getElementById('pickupSelectedCount');
    if (countSpan) countSpan.textContent = pickupSelectedStudents.size;
    updatePickupPreview();
}

function deselectAllPickupStudents() {
    document.querySelectorAll('.pickup-student-checkbox').forEach((cb) => {
        cb.checked = false;
    });
    pickupSelectedStudents.clear();
    const countSpan = document.getElementById('pickupSelectedCount');
    if (countSpan) countSpan.textContent = '0';
    updatePickupPreview();
}

function updatePickupPreview() {
    const previewContainer = document.getElementById('pickupIdPreviewContainer');
    const template = document.getElementById('pickup_template')?.value || 'simple';
    const orientation = document.getElementById('pickup_orientation')?.value || 'portrait';

    if (pickupSelectedStudents.size === 0) {
        previewContainer.innerHTML = `<div class="text-muted text-center">
            <i class="fas fa-eye-slash text-4xl opacity-20 block mb-1"></i>
            Select students to see preview
        </div>`;
        return;
    }

    // Get selected student data
    const checkboxes = document.querySelectorAll('.pickup-student-checkbox:checked');
    const students = Array.from(checkboxes).map((cb) => ({
        id: cb.getAttribute('data-student-id'),
        name: cb.getAttribute('data-student-name'),
        fatherName: cb.getAttribute('data-father-name'),
        class: cb.getAttribute('data-class'),
    }));

    if (students.length === 0) return;

    const isLandscape = orientation === 'landscape';
    const cardClass = isLandscape ? 'pickup-card-landscape' : 'pickup-card-portrait';

    previewContainer.innerHTML = `
        <div class="flex flex-col gap-1">
            ${students
                .slice(0, 3)
                .map(
                    (s) => `
                <div class="${cardClass} pickup-card-preview">
                    <div class="pickup-card-header">
                        <i class="fas fa-id-card"></i> PICKUP PASS
                    </div>
                    <div class="pickup-card-body">
                        <div class="pickup-student-name">${s.name}</div>
                        <div class="pickup-class-section">${s.class}</div>
                        <div class="pickup-father-name">Father: ${s.fatherName}</div>
                    </div>
                </div>
            `
                )
                .join('')}
            ${students.length > 3 ? `<div class="text-xs text-muted">+ ${students.length - 3} more students</div>` : ''}
        </div>
    `;
}

async function generatePickupIdCards() {
    if (pickupSelectedStudents.size === 0) {
        showToast('Please select at least one student', 'info');
        return;
    }

    const checkboxes = document.querySelectorAll('.pickup-student-checkbox:checked');
    const students = Array.from(checkboxes).map((cb) => ({
        id: cb.getAttribute('data-student-id'),
        name: cb.getAttribute('data-student-name'),
        fatherName: cb.getAttribute('data-father-name'),
        class: cb.getAttribute('data-class'),
    }));

    try {
        setLoading(true);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const orientation = document.getElementById('pickup_orientation')?.value || 'portrait';
        const isLandscape = orientation === 'landscape';

        // Card dimensions
        const cardW = isLandscape ? 85 : 54;
        const cardH = isLandscape ? 54 : 85;
        const margin = 10;
        const gap = 5;

        let x = margin,
            y = margin;

        // Render container
        const renderDiv = document.createElement('div');
        renderDiv.style.position = 'absolute';
        renderDiv.style.left = '-9999px';
        document.body.appendChild(renderDiv);

        for (const s of students) {
            // Simple pickup card template
            renderDiv.innerHTML = `
                <div class="pickup-card" style="width:${cardW}mm;height:${cardH}mm;border:2px solid #333;padding:5px;font-family:Arial,sans-serif;">
                    <div style="background:#333;color:#fff;padding:3px;text-align:center;font-weight:bold;font-size:10px;">
                        PICKUP PASS
                    </div>
                    <div style="padding:5px;text-align:center;">
                        <div style="font-size:12px;font-weight:bold;">${s.name}</div>
                        <div style="font-size:9px;color:#666;">${s.class}</div>
                        <div style="font-size:9px;margin-top:3px;">Father: ${s.fatherName}</div>
                    </div>
                    <div style="border-top:1px dashed #999;padding:3px;text-align:center;font-size:8px;">
                        Valid for Pickup
                    </div>
                </div>
            `;

            const cardEl = renderDiv.firstElementChild;
            if (!cardEl) continue;

            const canvas = await html2canvas(cardEl, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');

            if (y + cardH > (isLandscape ? 200 : 280)) {
                pdf.addPage();
                x = margin;
                y = margin;
            }

            pdf.addImage(imgData, 'PNG', x, y, cardW, cardH);
            x += cardW + gap;
            if (x + cardW > (isLandscape ? 290 : 200)) {
                x = margin;
                y += cardH + gap;
            }
        }

        document.body.removeChild(renderDiv);
        pdf.save(`Pickup_ID_Cards_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast(`Generated pickup IDs for ${students.length} students`, 'success');
    } catch (e) {
        console.error('Error generating pickup IDs:', e);
        showToast('Failed to generate pickup IDs', 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== EMPLOYEE MANAGEMENT =====================
window.previewEmpPhoto = function (input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        var preview = document.getElementById('empPhotoPreview');
        var placeholder = document.getElementById('empPhotoPlaceholder');
        if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
};

window.handleAddEmployee = async function (e) {
    e.preventDefault();
    var name = document.getElementById('emp_name').value.trim();
    var phone = document.getElementById('emp_phone').value.trim();
    var email = document.getElementById('emp_email').value.trim();
    var password = document.getElementById('emp_password').value;
    var passwordConfirm = document.getElementById('emp_password_confirm').value;

    if (!name) { showToast('Name is required', 'error'); return; }
    if (!phone) { showToast('Mobile number is required', 'error'); return; }
    if (!email) { showToast('Email is required', 'error'); return; }
    if (!password || password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    if (password !== passwordConfirm) { showToast('Passwords do not match', 'error'); return; }

    var employeeId = document.getElementById('emp_id').value.trim() || 'EMP' + Date.now();
    var photoFile = document.getElementById('emp_photo')?.files?.[0];

    var staffData = {
        name: name,
        employeeId: employeeId,
        phone: phone,
        email: email,
        designation: document.getElementById('emp_designation').value || '',
        designationId: document.getElementById('emp_rbac_designation')?.value || '',
        department: document.getElementById('emp_department').value || '',
        employmentType: document.getElementById('emp_type').value || '',
        dateOfJoining: document.getElementById('emp_doj').value || '',
        address: document.getElementById('emp_address').value.trim() || '',
        qualification: document.getElementById('emp_qualification').value.trim() || '',
        salary: parseFloat(document.getElementById('emp_salary').value) || 0,
        status: 'active',
        hasLogin: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        setLoading(true);

        // Process photo — auto-compress under 200KB
        if (photoFile) {
            try {
                if (typeof ImageStorage !== 'undefined') {
                    staffData.photo = await ImageStorage.compressImageUnder200KB(photoFile);
                } else {
                    staffData.photo = await new Promise(function (r, j) {
                        var reader = new FileReader();
                        reader.onload = function (e) { r(e.target.result); };
                        reader.onerror = j;
                        reader.readAsDataURL(photoFile);
                    });
                }
            } catch (imgErr) {
                console.warn('[Employee] Photo processing failed, continuing without photo:', imgErr);
            }
        }

        // Create Firebase Auth account
        if (typeof firebaseConfig === 'undefined') {
            throw new Error('Firebase configuration missing');
        }
        var secondaryApp;
        if (firebase.apps.find(function (a) { return a.name === 'empSecondary'; })) {
            secondaryApp = firebase.app('empSecondary');
        } else {
            secondaryApp = firebase.initializeApp(firebaseConfig, 'empSecondary');
        }
        var secondaryAuth = secondaryApp.auth();
        var uid;
        try {
            var userCred = await secondaryAuth.createUserWithEmailAndPassword(email, password);
            uid = userCred.user.uid;

            await db.collection('users').doc(uid).set({
                uid: uid,
                email: email,
                phone: phone,
                displayName: name,
                schoolId: CURRENT_SCHOOL_ID,
                role: staffData.designationId ? 'teacher' : 'admin',
                staffId: employeeId,
                designationId: staffData.designationId || '',
                isActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            staffData.authUid = uid;
            await secondaryAuth.signOut();
        } finally {
            await secondaryApp.delete();
        }

        // Save staff record
        await schoolData('staff').doc(employeeId).set(staffData);

        showToast(name + ' added successfully! Login: ' + email, 'success');
        document.getElementById('addEmployeeForm').reset();
        var preview = document.getElementById('empPhotoPreview');
        var placeholder = document.getElementById('empPhotoPlaceholder');
        if (preview) { preview.style.display = 'none'; preview.src = ''; }
        if (placeholder) placeholder.style.display = 'block';

        if (typeof loadEmployeeList === 'function') loadEmployeeList();
    } catch (e) {
        console.error('[Employee] Add failed:', e);
        var msg = e.message;
        if (e.code === 'auth/email-already-in-use') msg = 'Email ' + email + ' is already registered to another account.';
        showToast('Error: ' + msg, 'error');
    } finally {
        setLoading(false);
    }
};

window.loadEmployeeList = async function () {
    var tbody = document.getElementById('employeeListBody');
    if (!tbody) return;
    try {
        var snap = await schoolData('staff').limit(500).get();
        window._allEmployees = [];
        var html = '';
        snap.forEach(function (doc) {
            var d = doc.data();
            d.id = doc.id;
            window._allEmployees.push(d);
            var statusColor = d.status === 'active' ? 'success' : d.status === 'onLeave' ? 'warning' : 'danger';
            html += '<tr>' +
                '<td>' + escHtml(d.name) + '</td>' +
                '<td>' + escHtml(d.employeeId || d.id) + '</td>' +
                '<td>' + escHtml(d.designation || '-') + '</td>' +
                '<td>' + escHtml(d.phone || '-') + '</td>' +
                '<td><span class="badge badge-' + statusColor + '">' + escHtml(d.status) + '</span></td>' +
                '<td><button class="btn-sm btn-primary" onclick="showToast(\'Edit employee: not yet implemented\',\'info\')"><i class="fas fa-edit"></i></button></td>' +
                '</tr>';
        });
        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center text-muted py-4">No employees found.</td></tr>';
    } catch (e) {
        console.error('[Employee] List failed:', e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Failed to load: ' + escHtml(e.message) + '</td></tr>';
    }
};

window.filterEmployeeList = function () {
    var tbody = document.getElementById('employeeListBody');
    if (!tbody || !window._allEmployees) return;
    var search = (document.getElementById('empSearchInput')?.value || '').toLowerCase();
    var desig = document.getElementById('empFilterDesignation')?.value || '';
    var status = document.getElementById('empFilterStatus')?.value || '';
    var filtered = window._allEmployees.filter(function (e) {
        if (search && e.name?.toLowerCase().indexOf(search) === -1 && e.phone?.indexOf(search) === -1 && (e.employeeId || '').toLowerCase().indexOf(search) === -1) return false;
        if (desig && e.designation !== desig) return false;
        if (status && e.status !== status) return false;
        return true;
    });
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var d = filtered[i];
        var statusColor = d.status === 'active' ? 'success' : d.status === 'onLeave' ? 'warning' : 'danger';
        html += '<tr>' +
            '<td>' + escHtml(d.name) + '</td>' +
            '<td>' + escHtml(d.employeeId || d.id) + '</td>' +
            '<td>' + escHtml(d.designation || '-') + '</td>' +
            '<td>' + escHtml(d.phone || '-') + '</td>' +
            '<td><span class="badge badge-' + statusColor + '">' + escHtml(d.status) + '</span></td>' +
            '<td><button class="btn-sm btn-primary" onclick="showToast(\'Edit functionality coming soon\',\'info\')"><i class="fas fa-edit"></i></button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center text-muted py-4">No matching employees.</td></tr>';
};

window.handleBulkEmployeeUpload = async function (e) {
    e.preventDefault();
    var fileInput = document.getElementById('bulkEmpFile');
    if (!fileInput || !fileInput.files.length) return;
    try {
        setLoading(true);
        var text = await fileInput.files[0].text();
        var lines = text.split('\n').filter(function (l) { return l.trim(); });
        if (lines.length < 2) { showToast('CSV must have header + at least 1 row', 'error'); return; }
        var headers = lines[0].split(',').map(function (h) { return h.trim().toLowerCase(); });
        var batch = db.batch();
        var count = 0;
        for (var i = 1; i < lines.length; i++) {
            var vals = lines[i].split(',').map(function (v) { return v.trim(); });
            var obj = {};
            // ALLOWLIST: Only these fields can be set via CSV to prevent privilege escalation
            var allowedFields = ['employee_id', 'name', 'phone', 'email', 'designation', 'department',
                'role', 'qualifications', 'experience', 'address', 'dob', 'gender',
                'joining_date', 'status', 'bank_name', 'bank_account', 'ifsc_code',
                'pan_no', 'uan_no', 'pf_no', 'esi_no'];
            for (var j = 0; j < headers.length && j < vals.length; j++) {
                var field = headers[j];
                if (allowedFields.indexOf(field) !== -1) {
                    obj[field] = vals[j];
                }
            }
            if (!obj.employee_id && !obj.name) continue;
            var empId = obj.employee_id || 'EMP' + Date.now() + '_' + i;
            var ref = schoolData('staff').doc(empId);
            obj.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            batch.set(ref, obj, { merge: true });
            count++;
        }
        await batch.commit();
        showToast('Bulk upload complete: ' + count + ' employees processed', 'success');
        document.getElementById('bulkEmpForm').reset();
    } catch (e) {
        console.error('[Employee] Bulk upload failed:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
};

// ===================== DESIGNATION MANAGER =====================
async function loadRbacDesignationDropdown() {
    var select = document.getElementById('emp_rbac_designation');
    if (!select || typeof DesignationManager === 'undefined') return;
    try {
        var list = await DesignationManager.list();
        select.innerHTML = '<option value="">None (Admin-only)</option>';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            if (!d.isActive) continue;
            var opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name + (d.description ? ' (' + d.description + ')' : '');
            select.appendChild(opt);
        }
    } catch (e) {
        console.error('[Designations] Load dropdown failed:', e);
    }
}

async function initDesignationManager() {
    var form = document.getElementById('designationForm');
    if (!form) return;

    if (typeof DesignationManager === 'undefined') {
        console.warn('[Designations] DesignationManager not loaded yet, retrying...');
        setTimeout(initDesignationManager, 500);
        return;
    }

    form.addEventListener('submit', handleDesignationSubmit);

    if (document.getElementById('designationManagerSection')) {
        await loadDesignations();
        await loadRbacDesignationDropdown();
        DesignationManager.renderPermissionGrid('desigPermissionGrid', DesignationManager.DEFAULT_PERMISSIONS);
    }
}

async function handleDesignationSubmit(e) {
    e.preventDefault();
    var editId = document.getElementById('desigEditId').value;
    var name = document.getElementById('desigName').value.trim();
    var desc = document.getElementById('desigDesc').value.trim();
    var permissions = DesignationManager.collectPermissions('desigPermissionGrid');

    try {
        setLoading(true);
        if (editId) {
            await DesignationManager.update(editId, { name: name, description: desc, permissions: permissions });
            showToast('Designation updated successfully', 'success');
        } else {
            await DesignationManager.create(name, desc, permissions);
            showToast('Designation created successfully', 'success');
        }
        document.getElementById('designationForm').reset();
        document.getElementById('desigEditId').value = '';
        document.getElementById('desigBtnText').textContent = 'Create Designation';
        document.getElementById('desigCancelBtn').style.display = 'none';
        document.getElementById('desigFormTitle').textContent = 'New Designation';
        await loadDesignations();
    } catch (e) {
        console.error('[Designations] Save failed:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function loadDesignations() {
    var tbody = document.getElementById('designationTableBody');
    if (!tbody) return;

    try {
        var list = await DesignationManager.list();
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No designations created yet.</td></tr>';
            return;
        }
        var html = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            var staffCount = await DesignationManager.getStaffCount(d.id);
            var statusHtml = d.isActive
                ? '<span class="badge badge-success" style="background:#05966920;color:#10b981;padding:2px 10px;border-radius:20px;font-size:0.8rem;">Active</span>'
                : '<span class="badge badge-danger" style="background:#dc262620;color:#f87171;padding:2px 10px;border-radius:20px;font-size:0.8rem;">Resigned</span>';
            html += '<tr>';
            html += '<td><strong>' + escHtml(d.name) + '</strong><br><small class="text-muted">' + escHtml(d.description || '') + '</small></td>';
            html += '<td>' + staffCount + '</td>';
            html += '<td>' + statusHtml + '</td>';
            html += '<td>';
            html += '<button class="btn-sm btn-primary mr-0-5" onclick="editDesignation(\'' + d.id + '\')" title="Edit Designation"><i class="fas fa-edit"></i></button>';
            if (d.isActive) {
                html += '<button class="btn-sm btn-danger" onclick="resignDesignation(\'' + d.id + '\')" title="Resign (deactivate)"><i class="fas fa-user-slash"></i></button>';
            } else {
                html += '<button class="btn-sm btn-success" onclick="reactivateDesignation(\'' + d.id + '\')" title="Reactivate"><i class="fas fa-undo"></i></button>';
            }
            html += '</td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    } catch (e) {
        console.error('[Designations] Load failed:', e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-3">Failed to load: ' + escHtml(e.message) + '</td></tr>';
    }
}

function editDesignation(id) {
    if (!DesignationManager) return;
    DesignationManager.get(id).then(function (d) {
        if (!d) return;
        document.getElementById('desigEditId').value = d.id;
        document.getElementById('desigName').value = d.name;
        document.getElementById('desigDesc').value = d.description || '';
        document.getElementById('desigBtnText').textContent = 'Update Designation';
        document.getElementById('desigCancelBtn').style.display = 'block';
        document.getElementById('desigFormTitle').textContent = 'Edit Designation';
        DesignationManager.renderPermissionGrid('desigPermissionGrid', d.permissions || {});
        window.scrollTo({ top: document.getElementById('designationForm').offsetTop - 100, behavior: 'smooth' });
    });
}

function cancelDesignationEdit() {
    document.getElementById('designationForm').reset();
    document.getElementById('desigEditId').value = '';
    document.getElementById('desigBtnText').textContent = 'Create Designation';
    document.getElementById('desigCancelBtn').style.display = 'none';
    document.getElementById('desigFormTitle').textContent = 'New Designation';
    DesignationManager.renderPermissionGrid('desigPermissionGrid', DesignationManager.DEFAULT_PERMISSIONS);
}

async function resignDesignation(id) {
    if (!await window.showConfirmModal({ title: 'Resign Designation', message: 'Resign this designation? All teachers with this designation will lose access until reassigned.', icon: 'fa-user-times', confirmText: 'Resign', danger: true })) return;
    try {
        setLoading(true);
        await DesignationManager.resign(id);
        showToast('Designation resigned', 'success');
        await loadDesignations();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function reactivateDesignation(id) {
    try {
        setLoading(true);
        await DesignationManager.reactivate(id);
        showToast('Designation reactivated', 'success');
        await loadDesignations();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ── GLOBAL SEARCH ──────────────────────────────────────────
let _searchCache = { students: [], timestamp: 0 };

async function runGlobalSearch(query) {
    if (!query || query.length < 2) {
        const el = document.getElementById('globalSearchResults');
        if (el) el.innerHTML = '';
        return;
    }
    query = query.toLowerCase().trim();
    const resultsEl = document.getElementById('globalSearchResults');
    if (!resultsEl) return;
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = '<div style="padding:1rem;color:#94a3b8;font-size:0.83rem">Searching...</div>';

    if (Date.now() - _searchCache.timestamp > 60000) {
        try {
            const snap = await schoolData('students').get();
            _searchCache.students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            _searchCache.timestamp = Date.now();
        } catch (e) { resultsEl.innerHTML = '<div style="padding:1rem;color:#ef4444">Search unavailable</div>'; return; }
    }

    const students = _searchCache.students.filter(s =>
        (s.name || '').toLowerCase().includes(query) ||
        (s.phone || '').includes(query) ||
        (s.studentCode || '').toLowerCase().includes(query) ||
        (s.fatherName || '').toLowerCase().includes(query)
    ).slice(0, 8);

    const sections = Object.entries(SECTION_META)
        .filter(([id, m]) => m.label.toLowerCase().includes(query))
        .slice(0, 4);

    let html = '';
    if (students.length) {
        html += `<div style="padding:0.5rem 1rem 0.25rem;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Students</div>`;
        students.forEach(s => {
            html += `<div onclick="selectSearchStudent('${s.id}')" style="padding:0.65rem 1rem;display:flex;align-items:center;gap:0.75rem;cursor:pointer;border-bottom:1px solid #f8fafc" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
                <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.75rem;flex-shrink:0">${(s.name || '?')[0].toUpperCase()}</div>
                <div><div style="font-weight:600;font-size:0.85rem;color:#1e293b">${s.name || 'Unknown'}</div><div style="font-size:0.72rem;color:#94a3b8">${s.class || ''} · ${s.phone || ''}</div></div>
            </div>`;
        });
    }
    if (sections.length) {
        html += `<div style="padding:0.5rem 1rem 0.25rem;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-top:0.25rem">Navigate To</div>`;
        sections.forEach(([id, meta]) => {
            html += `<div onclick="showSection('${id}'); hideGlobalSearchResults()" style="padding:0.6rem 1rem;display:flex;align-items:center;gap:0.75rem;cursor:pointer;font-size:0.85rem;color:#475569" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''"><span style="color:#94a3b8">→</span> ${meta.parent ? meta.parent + ' / ' : ''}${meta.label}</div>`;
        });
    }
    if (!html) html = '<div style="padding:1.5rem;text-align:center;color:#94a3b8;font-size:0.85rem">No results for "' + query + '"</div>';
    resultsEl.innerHTML = html;
}

function selectSearchStudent(studentId) {
    hideGlobalSearchResults();
    showSection('studentList');
    setTimeout(() => {
        const searchEl = document.getElementById('studentSearch') || document.getElementById('searchInput');
        if (searchEl) { searchEl.value = studentId; searchEl.dispatchEvent(new Event('input')); }
    }, 400);
}

function showGlobalSearchResults() {
    const val = document.getElementById('globalSearchInput')?.value;
    if (val?.length >= 2) runGlobalSearch(val);
}

function hideGlobalSearchResults() {
    const el = document.getElementById('globalSearchResults');
    if (el) el.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('globalSearchInput');
        if (input) { input.focus(); input.select(); }
    }
    if (e.key === 'Escape') {
        hideGlobalSearchResults();
        document.getElementById('globalSearchInput')?.blur();
    }
});

// ── TABLE UTILITIES: Sort, Filter, Export ───────────────────
window.exportTableToCSV = function(tableIdOrEl, filename = 'export.csv') {
    const table = typeof tableIdOrEl === 'string' ? document.getElementById(tableIdOrEl) : tableIdOrEl;
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tr'));
    const csv = rows.map(row => {
        return Array.from(row.querySelectorAll('th, td'))
            .map(cell => {
                let text = cell.innerText.replace(/\n/g, ' ').trim();
                if (text.includes(',') || text.includes('"')) text = `"${text.replace(/"/g, '""')}"`;
                return text;
            }).join(',');
    }).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    showToast('CSV Downloaded', 'success', `${rows.length - 1} rows exported`);
};

window.buildTableActionBar = function(tableId, options = {}) {
    const { title = '', totalLabel = 'records', exportFilename = 'data.csv', extraButtons = [] } = options;
    const table = document.getElementById(tableId);
    if (!table) return;
    const rowCount = table.querySelectorAll('tbody tr').length;
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.875rem;flex-wrap:wrap;gap:0.5rem';
    bar.innerHTML = `
        <span style="font-size:0.78rem;color:#94a3b8">Showing <strong style="color:#334155">${rowCount}</strong> ${totalLabel}</span>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            ${extraButtons.map(b => `<button onclick="${b.onclick}" style="padding:0.4rem 0.875rem;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:0.78rem;font-weight:600;cursor:pointer">${b.icon || ''} ${b.label}</button>`).join('')}
            <button onclick="exportTableToCSV('${tableId}', '${exportFilename}')" style="padding:0.4rem 0.875rem;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:0.78rem;font-weight:600;cursor:pointer">📤 Export CSV</button>
            <button onclick="window.print()" style="padding:0.4rem 0.875rem;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:0.78rem;font-weight:600;cursor:pointer">🖨️ Print</button>
        </div>
    `;
    table.parentNode.insertBefore(bar, table);
};

// ── EMPTY STATE COMPONENTS ───────────────────────────────────
const EMPTY_STATES = {
    students: { icon: '👥', title: 'No students yet', desc: 'Start by adding your first student or uploading a CSV.', action: { label: '+ Add Student', section: 'addStudent' } },
    fees: { icon: '💰', title: 'No fee records found', desc: 'Generate monthly fees or record a manual payment.', action: { label: 'Generate Monthly Fees', section: 'createMonthlyFeeSection' } },
    exams: { icon: '📝', title: 'No exams created', desc: 'Create your first exam and build the schedule.', action: { label: '+ Create Exam', section: 'manageExam' } },
    results: { icon: '📊', title: 'No results recorded', desc: 'Add results manually or upload a CSV with marks.', action: { label: '+ Add Results', section: 'addResult' } },
    notifications: { icon: '🔔', title: 'No notifications sent', desc: 'Send SMS or WhatsApp messages to students and parents.', action: { label: 'Send Notification', section: 'sendNotification' } },
    library: { icon: '📚', title: 'No books in catalog', desc: 'Add books to the library to enable issue and return tracking.', action: { label: '+ Add Book', section: 'bookCatalog' } },
    enquiries: { icon: '📋', title: 'No enquiries yet', desc: 'Enquiries submitted via the website will appear here.', action: null },
    attendance: { icon: '📅', title: 'No attendance records', desc: 'Mark today\'s attendance for your classes.', action: { label: 'Mark Attendance', section: 'attendanceManagement' } },
};

window.renderEmptyState = function(containerId, type = 'students', customText = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const config = EMPTY_STATES[type] || { icon: '🔍', title: customText || 'Nothing here yet', desc: 'No records match your search.', action: null };
    container.innerHTML = `
        <div style="text-align:center;padding:3rem 1.5rem;color:#94a3b8">
            <div style="font-size:3.5rem;margin-bottom:1rem;opacity:0.4">${config.icon}</div>
            <h4 style="font-size:1rem;font-weight:600;color:#334155;margin-bottom:0.4rem">${config.title}</h4>
            <p style="font-size:0.83rem;color:#94a3b8;margin-bottom:${config.action ? '1.5rem' : '0'};max-width:300px;margin-left:auto;margin-right:auto">${config.desc}</p>
            ${config.action ? `<button onclick="showSection('${config.action.section}')" style="padding:0.65rem 1.5rem;background:#1e40af;color:white;border:none;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer">${config.action.label}</button>` : ''}
        </div>
    `;
};

function sendDirectSMS(phone, name) {
    if (!phone) return showToast('No phone number available', 'error');
    showToast('SMS to ' + (name || 'parent') + ' at ' + phone + ' — wire to your SMS service', 'info');
}

// ── LIVE KPI DASHBOARD ─────────────────────────────────────
async function loadLiveDashboardKPIs() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const thisMonth = dateStr.slice(0, 7);

    // Update welcome bar
    const hr = today.getHours();
    const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const nameEl = document.getElementById('adminEmail');
    const adminName = nameEl ? nameEl.textContent?.split('@')[0] || '' : '';
    const greetEl = document.getElementById('wbGreeting');
    if (greetEl) greetEl.textContent = '👋 ' + greet + (adminName ? ', ' + adminName : '');
    const dateEl = document.getElementById('wbDate');
    if (dateEl) dateEl.textContent = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const schoolEl = document.getElementById('wbSchoolName');
    const sideName = document.getElementById('sidebarSchoolName');
    if (schoolEl && sideName) schoolEl.textContent = sideName.textContent || 'your school';

    async function safeFetch(fn) { try { return await fn(); } catch (e) { console.warn('[KPI] fetch error:', e); return null; } }

    try {
        const [studentsSnap, feesSnap, attSnap, examsSnap] = await Promise.all([
            safeFetch(() => schoolData('students').get()),
            safeFetch(() => schoolData('fees').where('month', '==', thisMonth).get()),
            safeFetch(() => schoolData('attendance').where('date', '==', dateStr).get()),
            safeFetch(() => schoolData('exams').where('date', '>=', dateStr).orderBy('date').limit(5).get())
        ]);

        const totalStudents = studentsSnap ? studentsSnap.size : 0;
        const feeDocs = feesSnap ? feesSnap.docs.map(d => d.data()) : [];
        const totalDue = feeDocs.reduce((s, f) => s + (f.amount || 0), 0);
        const totalPaid = feeDocs.reduce((s, f) => s + (f.paid || 0), 0);
        const feePending = totalDue - totalPaid;
        const attDocs = attSnap ? attSnap.docs.map(d => d.data()) : [];
        const presentCount = attDocs.filter(a => (a.status || '').toLowerCase() === 'present').length;
        const absentCount = attDocs.filter(a => (a.status || '').toLowerCase() === 'absent').length;
        const leaveCount = attDocs.filter(a => (a.status || '').toLowerCase() === 'leave').length;
        const attPercent = attDocs.length > 0 ? Math.round((presentCount / attDocs.length) * 100) : 0;
        const examDocs = examsSnap ? examsSnap.docs : [];
        const examCount = examDocs.length;
        const nextExam = examDocs[0] ? examDocs[0].data() : null;

        const newThisMonth = studentsSnap ? studentsSnap.docs.filter(function(d) {
            const c = d.data().createdAt;
            if (!c) return false;
            const t = c.toDate ? c.toDate() : new Date(c);
            return t.getMonth() === today.getMonth() && t.getFullYear() === today.getFullYear();
        }).length : 0;

        // KPI grid
        const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setText('kpiTotalStudents', totalStudents.toLocaleString('en-IN'));
        setText('kpiNewStudents', newThisMonth.toString());
        setText('kpiStudentTrend', '<i class=\"fas fa-arrow-up\"></i> +' + newThisMonth);
        setText('kpiFeesThisMonth', '₹' + (totalPaid || 0).toLocaleString('en-IN'));
        setText('kpiFeePending', '₹' + Math.max(0, feePending).toLocaleString('en-IN') + ' pending');
        setText('kpiFeeTrend', '<i class=\"fas fa-arrow-up\"></i> ' + (totalDue > 0 ? Math.round((totalPaid/totalDue)*100) + '%' : '0%'));
        setText('kpiAttPct', (attDocs.length ? attPercent : '—') + '%');
        setText('kpiAttAbsent', absentCount + ' absent today');
        const attTrendEl = document.getElementById('kpiAttTrend');
        if (attTrendEl) {
            attTrendEl.className = 'kpi-trend ' + (attPercent >= 80 ? 'trend-up' : attPercent >= 60 ? 'trend-flat' : 'trend-down');
            attTrendEl.innerHTML = '<i class=\"fas fa-' + (attPercent >= 80 ? 'arrow-up' : attPercent >= 60 ? 'minus' : 'arrow-down') + '\"></i> ' + attPercent + '%';
        }
        setText('kpiExamsThisWeek', examCount.toString());
        setText('kpiExamSubjects', nextExam ? nextExam.name || nextExam.subject || 'Exam scheduled' : 'None scheduled');
        setText('kpiExamNext', nextExam ? new Date(nextExam.date).toLocaleDateString('en-IN', {day:'numeric',month:'short'}) : '—');

        // Alert strip
        setText('alertAbsent', absentCount + ' students absent today');
        setText('alertAbsentBadge', absentCount.toString());
        setText('alertAttPct', attPercent + '%');
        setText('alertEnquiries', '0');
        setText('alertEnquiriesBadge', '0');
        // Defaulters: count students with feeBalance > 0
        if (studentsSnap) {
            const defaulterCount = studentsSnap.docs.filter(function(d) { return (d.data().feeBalance || 0) > 0; }).length;
            setText('alertDefaulters', defaulterCount + ' fee defaulters');
            setText('alertDefaulterBadge', defaulterCount.toString());
        }

        // Attendance donut
        const circumference = 2 * Math.PI * 36;
        const dashLen = Math.round(circumference * attPercent / 100);
        const arcEl = document.getElementById('attDonutArc');
        if (arcEl) arcEl.setAttribute('stroke-dasharray', dashLen + ' ' + (circumference - dashLen));
        setText('attDonutPct', (attDocs.length ? attPercent : '—') + '%');
        setText('attPresent', presentCount.toString());
        setText('attAbsent', absentCount.toString());
        setText('attLeave', leaveCount.toString());
        setText('attTotal', attDocs.length.toString());
        const attDateEl = document.getElementById('attDate');
        if (attDateEl) attDateEl.textContent = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });

        // Class-wise attendance bars
        const classAttList = document.getElementById('classAttList');
        if (classAttList && attDocs.length) {
            const byClass = {};
            attDocs.forEach(a => {
                const cls = a.class || 'Unknown';
                if (!byClass[cls]) byClass[cls] = { present: 0, total: 0 };
                byClass[cls].total++;
                if ((a.status || '').toLowerCase() === 'present') byClass[cls].present++;
            });
            const classColors = ['var(--green)','var(--blue)','var(--amber)'];
            classAttList.innerHTML = Object.entries(byClass).sort().slice(0, 8).map(([cls, data], i) => {
                const pct = Math.round((data.present / data.total) * 100);
                const color = classColors[i % classColors.length];
                return '<div class="cal-row"><span class="cal-cls">' + escHtml(cls) + '</span><div class="cal-bar-bg"><div class="cal-bar" style="width:' + pct + '%;background:' + color + '"></div></div><span class="cal-pct" style="color:' + color + '">' + pct + '%</span></div>';
            }).join('');
        } else if (classAttList) {
            classAttList.innerHTML = '<div style="padding:.5rem 0;text-align:center;color:var(--faint);font-size:.78rem">No attendance marked today</div>';
        }

        // Recent payments
        const payList = document.getElementById('recentPayList');
        if (payList) {
            const recentPaySnap = await schoolData('feePayments').orderBy('createdAt', 'desc').limit(5).get().catch(() => null);
            if (recentPaySnap && recentPaySnap.size > 0) {
                payList.innerHTML = recentPaySnap.docs.map(d => {
                    const p = d.data();
                    const initial = (p.studentName || 'S')[0].toUpperCase();
                    const colors = ['linear-gradient(135deg,#3b82f6,#7c3aed)','linear-gradient(135deg,#10b981,#0891b2)','linear-gradient(135deg,#f59e0b,#ef4444)'];
                    const bg = colors[(p.studentName || '').charCodeAt(0) % colors.length] || colors[0];
                    const time = p.createdAt ? (p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt)) : new Date();
                    return '<div class="pay-item"><div class="pay-avatar" style="background:' + bg + '">' + initial + '</div><div class="pay-info"><div class="pay-name">' + escHtml(p.studentName || 'Student') + '</div><div class="pay-meta">' + escHtml(p.feeType || 'Fee') + ' · ' + escHtml(p.method || '—') + ' · #' + escHtml(p.receiptNo || d.id.slice(-4)) + '</div></div><div class="pay-right"><div class="pay-amount">+₹' + (p.amount || 0).toLocaleString('en-IN') + '</div><div class="pay-time">' + time.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) + '</div></div></div>';
                }).join('');
            } else {
                payList.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--faint);font-size:.82rem">No payments today</div>';
            }
        }

        // Today total
        const totalToday = feeDocs.reduce((s, f) => s + (f.paid || 0), 0);
        const totalEl = document.getElementById('recentPayTotal');
        if (totalEl) totalEl.textContent = 'Today\'s collections: ₹' + totalToday.toLocaleString('en-IN');

    } catch (e) { console.error('[KPI] Dashboard load error:', e); }
}

// ── STUDENT DRAWER ──────────────────────────────────────────
window.openStudentDrawer = async function(studentId) {
    const drawer = document.getElementById('studentDrawer');
    const overlay = document.getElementById('studentDrawerOverlay');
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    const body = document.getElementById('studentDrawerBody');
    if (body) body.innerHTML = '<div style="padding:3rem;text-align:center;color:#94a3b8"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const doc = await schoolData('students').doc(studentId).get();
        if (!doc.exists) { if (body) body.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--red)">Student not found</div>'; return; }
        const s = { id: doc.id, ...doc.data() };
        const initial = (s.name || '?')[0].toUpperCase();

        if (body) body.innerHTML =
          '<div style="display:flex;align-items:center;gap:1rem;padding:1.25rem;background:linear-gradient(135deg,var(--blue-lt),#f0f9ff);border-radius:var(--r-lg);border:1.5px solid var(--blue-md);margin-bottom:1.25rem">' +
          '<div style="width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.3rem;color:white;background:linear-gradient(135deg,#1e40af,#7c3aed);box-shadow:0 4px 12px rgba(30,64,175,.3)">' + initial + '</div>' +
          '<div><div style="font-size:1.05rem;font-weight:800;color:var(--ink)">' + escHtml(s.name || '—') + '</div>' +
          '<div style="font-size:.78rem;color:var(--muted)">' + (s.class || '') + ' ' + (s.section ? '— ' + s.section : '') + ' · Roll: ' + (s.rollNumber || '—') + ' · Reg: ' + (s.studentCode || s.id.slice(-4)) + '</div>' +
          '<div style="display:flex;gap:.35rem;margin-top:.4rem;flex-wrap:wrap">' +
          '<span class="pill pill-active">Active</span>' +
          (s.hostel && s.hostel !== 'No' && s.hostel !== '' ? '<span class="pill pill-info">' + escHtml(s.hostel) + '</span>' : '') +
          (s.transportRoute ? '<span class="pill pill-info">' + escHtml(s.transportRoute) + '</span>' : '') +
          '</div></div></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:1rem">' +
          [['DOB', s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '—'],
           ['Gender', s.gender || '—'],
           ['Blood Group', s.bloodGroup || '—'],
           ['Category', s.category || '—'],
           ['Father', s.fatherName || '—'],
           ['Father Phone', s.fatherPhone || s.phone || '—'],
           ['Mother', s.motherName || '—'],
           ['Mother Phone', s.motherPhone || '—'],
          ].map(function(a) {
            return '<div style="background:var(--bg);border-radius:var(--r-md);padding:.65rem .875rem"><div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--faint)">' + a[0] + '</div><div style="font-size:.85rem;font-weight:600;color:var(--ink-2);margin-top:2px">' + escHtml(a[1]) + '</div></div>';
          }).join('') +
          '<div style="grid-column:1/-1;background:var(--bg);border-radius:var(--r-md);padding:.65rem .875rem"><div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--faint)">Address</div><div style="font-size:.85rem;font-weight:600;color:var(--ink-2);margin-top:2px">' + escHtml(s.address || '—') + '</div></div>' +
          '</div>';

        document.getElementById('drawerFeeBtn').onclick = function() { closeStudentDrawer(); showSection('classFeePayment'); };
        document.getElementById('drawerEditBtn').onclick = function() { closeStudentDrawer(); showSection('addStudent'); };
        document.getElementById('drawerIdBtn').onclick = function() { closeStudentDrawer(); window.generateStudentIdCard ? generateStudentIdCard(studentId) : showToast('ID card function not available', 'info'); };
        document.getElementById('drawerSmsBtn').onclick = function() { closeStudentDrawer(); sendDirectSMS(s.fatherPhone || s.phone, s.name); };
    } catch (e) {
        if (body) body.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--red)">Error: ' + escHtml(e.message) + '</div>';
    }
};

window.closeStudentDrawer = function() {
    const drawer = document.getElementById('studentDrawer');
    const overlay = document.getElementById('studentDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
};

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Export designation functions to window
window.initDesignationManager = initDesignationManager;
window.handleDesignationSubmit = handleDesignationSubmit;
window.loadDesignations = loadDesignations;
window.editDesignation = editDesignation;
window.cancelDesignationEdit = cancelDesignationEdit;
window.resignDesignation = resignDesignation;
window.reactivateDesignation = reactivateDesignation;

// Export functions to window
window.loadClassesForPickupId = loadClassesForPickupId;
window.loadSectionsForPickupId = loadSectionsForPickupId;
window.loadStudentsForPickupId = loadStudentsForPickupId;
window.updatePickupSelection = updatePickupSelection;
window.selectAllPickupStudents = selectAllPickupStudents;
window.deselectAllPickupStudents = deselectAllPickupStudents;
window.updatePickupPreview = updatePickupPreview;
window.generatePickupIdCards = generatePickupIdCards;

// ===================== ADMIN PASSWORD CHANGE =====================

function populateAdminProfile() {
    const user = auth ? auth.currentUser : null;
    if (!user) return;
    const emailEl = document.getElementById('adminProfileEmail');
    const nameEl = document.getElementById('adminProfileName');
    const schoolIdEl = document.getElementById('adminProfileSchoolId');
    if (emailEl) emailEl.textContent = user.email;
    if (nameEl) nameEl.textContent = user.displayName || 'Admin';
    if (schoolIdEl) schoolIdEl.value = sessionStorage.getItem('CURRENT_SCHOOL_ID') || 'N/A';
}

window.openAdminChangePwdModal = function () {
    const user = auth ? auth.currentUser : null;
    if (!user) {
        showToast('Session not available. Please re-login.', 'error');
        return;
    }
    document.getElementById('acpEmail').value = user.email || '';
    document.getElementById('acpOldPassword').value = '';
    document.getElementById('acpNewPassword').value = '';
    document.getElementById('acpConfirmPassword').value = '';
    const errEl = document.getElementById('acpError');
    if (errEl) errEl.style.display = 'none';
    const btn = document.getElementById('acpSubmitBtn');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Update Password';
    }
    document.getElementById('adminChangePwdModal').classList.remove('hidden');
};

window.closeAdminChangePwdModal = function () {
    document.getElementById('adminChangePwdModal').classList.add('hidden');
};

window.submitAdminChangePassword = async function () {
    const oldPwd = document.getElementById('acpOldPassword').value;
    const newPwd = document.getElementById('acpNewPassword').value;
    const confirmPwd = document.getElementById('acpConfirmPassword').value;
    const errorEl = document.getElementById('acpError');
    const btn = document.getElementById('acpSubmitBtn');

    errorEl.style.display = 'none';

    if (!oldPwd) { errorEl.textContent = 'Please enter your current password'; errorEl.style.display = 'block'; return; }
    if (!newPwd || newPwd.length < 6) { errorEl.textContent = 'New password must be at least 6 characters'; errorEl.style.display = 'block'; return; }
    if (newPwd !== confirmPwd) { errorEl.textContent = 'New passwords do not match'; errorEl.style.display = 'block'; return; }
    if (newPwd === oldPwd) { errorEl.textContent = 'New password must be different from current password'; errorEl.style.display = 'block'; return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No authenticated user found. Please re-login.');

        const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPwd);
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPwd);

        showToast('Password updated successfully', 'success');
        closeAdminChangePwdModal();
    } catch (e) {
        console.error('Password change error:', e);
        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            errorEl.textContent = 'Current password is incorrect.';
        } else if (e.code === 'auth/requires-recent-login') {
            errorEl.textContent = 'Please log out and log in again before changing your password.';
        } else {
            errorEl.textContent = 'Failed to update password: ' + (e.message || e);
        }
        errorEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Update Password';
    }
};
