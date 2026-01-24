# CLAUDE.md - WD Maintenance System Documentation

**Last Updated:** 2026-01-24
**Repository:** wd-maintenance
**Type:** Web Application (Maintenance Management System)
**Language:** Thai (ไทย)

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Codebase Structure](#codebase-structure)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Development Patterns](#development-patterns)
6. [Code Style & Conventions](#code-style--conventions)
7. [Common Development Tasks](#common-development-tasks)
8. [File Reference Guide](#file-reference-guide)
9. [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## Repository Overview

### What is WD Maintenance System?

A **Computerized Maintenance Management System (CMMS)** for **WD Manufacturing Co., Ltd.** - a comprehensive web application that manages maintenance requests, repairs, spare parts inventory, and reporting for manufacturing environments.

### Key Features

- **Role-Based Access Control**: 4 user roles (User, Technician, Manager, Admin)
- **Asset Management**: QR code scanning and equipment tracking
- **Ticket Lifecycle Management**: OPEN → IN_PROGRESS → PENDING_INSPECTION → COMPLETED
- **Media Documentation**: Photo evidence with cloud storage
- **Spare Parts System**: Inventory tracking and requisition
- **Voice-to-Text**: Speech recording for repair notes
- **Analytics Dashboard**: Charts and KPIs for managers
- **Report Generation**: Excel exports and printable job sheets
- **Mobile-Responsive**: Touch-optimized UI for field technicians

### User Roles

| Role | Dashboard | Primary Functions |
|------|-----------|-------------------|
| **User** | `repair_app_connected.html` | Submit maintenance requests, scan QR codes, track tickets |
| **Technician** | `technician_dashboard.html` | Accept jobs, record repairs, requisition parts, upload evidence |
| **Manager** | `manager_dashboard.html` | View analytics, monitor KPIs, access reports |
| **Admin** | `admin_dashboard.html` | Manage users, configure assets, generate QR codes |

---

## Codebase Structure

```
wd-maintenance/
├── .git/                           # Git repository
├── config.js                       # Central configuration (56 lines)
├── index.html                      # Login portal (115 lines)
├── repair_app_connected.html       # User dashboard (669 lines)
├── technician_dashboard.html       # Technician workspace (625 lines)
├── admin_dashboard.html            # Admin panel (429 lines)
├── manager_dashboard.html          # Manager analytics (393 lines)
├── inventory_management.html       # Spare parts management (573 lines)
├── print_job_sheet.html            # Job sheet printer (348 lines)
├── export_report.html              # Excel report generator (285 lines)
└── CLAUDE.md                       # This file
```

**Total Lines of Code:** ~3,493 lines

### Architecture Pattern

**Single-Page Application (SPA)** - Each HTML file is a standalone application with:
- Embedded CSS in `<style>` tags
- Embedded JavaScript in `<script>` tags
- No build process or bundlers
- Direct CDN imports for libraries
- Client-side rendering only

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **HTML5** | - | Page structure |
| **Tailwind CSS** | Latest (CDN) | Utility-first styling |
| **Vanilla JavaScript** | ES6+ | All application logic |
| **Font Awesome** | 6.4.0 | Icon library |
| **Google Fonts (Sarabun)** | - | Thai language support |

### Backend & Database

| Service | Details |
|---------|---------|
| **Supabase** | Backend-as-a-Service (BaaS) |
| Database | PostgreSQL via Supabase |
| Storage | `repair-files` bucket |
| Authentication | Supabase Auth + custom session |

**Supabase Instance:**
- URL: `https://nmezqexpvhdozpdzxxek.supabase.co`
- Configuration: See `config.js`

### Libraries & Dependencies (CDN)

```javascript
// Core
- @supabase/supabase-js@2          // Database client
- day.js                           // Date/time manipulation
- tailwindcss (CDN)                // CSS framework

// Features
- chart.js                         // Data visualization
- exceljs@4.3.0                    // Excel generation
- file-saver.js                    // File downloads
- jsbarcode                        // Barcode generation
- qrcode.js                        // QR code generation
- html5-qrcode                     // Camera QR scanning
- canvas-confetti                  // Celebration animations
```

---

## Database Schema

### Core Tables

#### `profiles` - User Accounts
```javascript
{
  id: UUID,
  username: STRING,
  password: STRING,          // Plain text (demo mode)
  full_name: STRING,
  role: ENUM('user', 'technician', 'manager', 'admin'),
  email: STRING
}
```

#### `tickets` - Maintenance Work Orders
```javascript
{
  id: UUID,
  asset_id: UUID,            // FK to assets
  requester_id: UUID,        // FK to profiles
  technician_id: UUID,       // FK to profiles
  status: ENUM('OPEN', 'IN_PROGRESS', 'PENDING_INSPECTION', 'COMPLETED'),
  incident_time: TIMESTAMP,
  issue_text: STRING,        // Issue title
  description: TEXT,
  photo_url: STRING,         // Initial report photo
  repair_details: TEXT,      // Technician notes
  finished_at: TIMESTAMP,
  created_at: TIMESTAMP
}
```

#### `assets` - Equipment/Machinery
```javascript
{
  id: UUID,
  name: STRING,
  asset_code: STRING,        // Unique identifier
  location: STRING,
  status: STRING,
  icon_id: STRING
}
```

#### `spare_parts` - Inventory Items
```javascript
{
  id: UUID,
  name: STRING,
  category: STRING,
  stock: INTEGER,
  unit_price: DECIMAL
}
```

#### `spare_parts_requests` - Parts Requisition
```javascript
{
  id: UUID,
  ticket_id: UUID,           // FK to tickets
  part_id: UUID,             // FK to spare_parts
  part_name: STRING,
  quantity: INTEGER,
  requester_id: UUID,
  created_at: TIMESTAMP
}
```

#### `issue_options` - Issue Types/Templates
```javascript
{
  id: UUID,
  title: STRING,
  icon: STRING,              // Font Awesome class
  is_active: BOOLEAN,
  sort_order: INTEGER,
  category: STRING
}
```

#### `media` - Attached Photos
```javascript
{
  id: UUID,
  ticket_id: UUID,
  url: STRING,               // Supabase storage URL
  uploaded_at: TIMESTAMP
}
```

### Data Flow

1. **User creates ticket** → `tickets` table (status: OPEN)
2. **Technician accepts** → Update `technician_id` (status: IN_PROGRESS)
3. **Photos uploaded** → Supabase Storage → `media` table
4. **Parts requested** → `spare_parts_requests` table
5. **Job finished** → Update `repair_details`, `finished_at` (status: COMPLETED)

---

## Development Patterns

### File Structure Convention

Every HTML file follows this pattern:

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Page Title] - WD Maintenance System</title>

    <!-- CDN Libraries -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>

    <!-- ALWAYS import config.js -->
    <script src="config.js"></script>

    <!-- Custom Styles -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
        body { font-family: 'Sarabun', sans-serif; }
        /* Page-specific styles */
    </style>
</head>
<body>
    <!-- Page Content -->

    <script>
        // 1. Auth check (if protected page)
        const currentUser = Auth.requireRole(['technician', 'manager']);

        // 2. Global variables
        let tickets = [];

        // 3. Initialize function
        async function init() {
            // Load data
            // Setup event listeners
        }

        // 4. Feature functions
        async function loadTickets() { /* ... */ }
        async function handleSubmit() { /* ... */ }

        // 5. Run on load
        init();
    </script>
</body>
</html>
```

### Authentication Pattern

**All protected pages MUST start with:**

```javascript
// Require specific roles
const currentUser = Auth.requireRole(['technician', 'manager']);

// Or allow any authenticated user
const currentUser = Auth.requireRole([]);

// Get current user without redirect
const currentUser = Auth.getUser();
```

**Session Storage:**
```javascript
// Stored as JSON in localStorage
localStorage.setItem('cmms_user_session', JSON.stringify(userProfile));

// Session object structure:
{
  id: "uuid",
  username: "technician",
  full_name: "นาย ช่าง ซ่อม",
  role: "technician",
  email: "tech@example.com"
}
```

### Supabase Query Patterns

```javascript
// SELECT with filters
const { data, error } = await supabaseClient
  .from('tickets')
  .select('*')
  .eq('status', 'OPEN')
  .order('created_at', { ascending: false });

// INSERT
const { data, error } = await supabaseClient
  .from('tickets')
  .insert([{
    asset_id: assetId,
    requester_id: currentUser.id,
    status: 'OPEN'
  }]);

// UPDATE
const { data, error } = await supabaseClient
  .from('tickets')
  .update({ status: 'IN_PROGRESS', technician_id: currentUser.id })
  .eq('id', ticketId);

// JOIN with related tables
const { data } = await supabaseClient
  .from('tickets')
  .select(`
    *,
    requester:profiles!tickets_requester_id_fkey(full_name),
    asset:assets(name, asset_code, location)
  `);
```

### File Upload Pattern

```javascript
// 1. Get file from input
const file = fileInput.files[0];

// 2. Create unique filename
const filename = `${Date.now()}_${file.name}`;

// 3. Upload to Supabase Storage
const { data, error } = await supabaseClient.storage
  .from('repair-files')
  .upload(filename, file, {
    cacheControl: '3600',
    upsert: false
  });

// 4. Get public URL
const { data: { publicUrl } } = supabaseClient.storage
  .from('repair-files')
  .getPublicUrl(filename);

// 5. Save URL to database
await supabaseClient
  .from('media')
  .insert([{ ticket_id: ticketId, url: publicUrl }]);
```

---

## Code Style & Conventions

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Functions** | camelCase | `loadTickets()`, `handleSubmit()` |
| **Variables** | camelCase | `currentUser`, `ticketList` |
| **Constants** | UPPER_SNAKE_CASE | `SUPABASE_URL`, `SUPABASE_KEY` |
| **DOM IDs** | camelCase | `#finishModal`, `#jobContainer` |
| **CSS Classes** | kebab-case (Tailwind) | `.job-card`, `.media-grid` |
| **Database Tables** | snake_case | `spare_parts`, `issue_options` |

### Thai Language Usage

**All user-facing text is in Thai:**
- UI labels: `"เข้าสู่ระบบ"`, `"บันทึก"`, `"ยกเลิก"`
- Error messages: `"กรุณากรอกข้อมูลให้ครบถ้วน"`
- Comments can be in Thai or English

**Example:**
```javascript
// Thai UI text
alert('บันทึกข้อมูลสำเร็จ');

// Thai comments (optional)
// โหลดรายการงานซ่อมทั้งหมด
async function loadTickets() { /* ... */ }
```

### Color Theming by Role

```css
/* User Portal */
.bg-orange-500    /* Primary actions */
.text-orange-600  /* Highlights */

/* Technician Dashboard */
.bg-orange-500    /* Accept job buttons */
.bg-green-500     /* Complete buttons */

/* Manager Dashboard */
.bg-blue-500      /* Primary theme */

/* Admin Dashboard */
.bg-blue-600      /* Administrative actions */
.bg-green-500     /* Success states */

/* Inventory */
.bg-orange-500    /* Primary actions */
```

### Modal Pattern

```javascript
// 1. HTML structure
<div id="myModal" class="fixed inset-0 bg-gray-900/60 z-50 hidden flex items-center justify-center">
    <div class="bg-white w-full max-w-lg p-6 rounded-2xl">
        <!-- Modal content -->
    </div>
</div>

// 2. Show modal
function showModal() {
    document.getElementById('myModal').classList.remove('hidden');
}

// 3. Hide modal
function hideModal() {
    document.getElementById('myModal').classList.add('hidden');
}

// 4. Close on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});
```

### Loading State Pattern

```javascript
// 1. Start loading
const loader = document.getElementById('loadingOverlay');
loader.classList.remove('hidden');

try {
    // 2. Perform async operation
    await someAsyncFunction();

    // 3. Success feedback
    alert('สำเร็จ!');
} catch (error) {
    // 4. Error handling
    alert('เกิดข้อผิดพลาด: ' + error.message);
} finally {
    // 5. Always hide loader
    loader.classList.add('hidden');
}
```

### Date Formatting

```javascript
// Use Day.js (already imported in all pages)
const formatted = dayjs(dateString).format('DD/MM/YYYY HH:mm');

// Or use Utils from config.js
const formatted = Utils.formatDate(dateString);
```

---

## Common Development Tasks

### Adding a New Page

1. **Create HTML file** following the standard structure
2. **Import config.js** in `<head>`
3. **Add authentication** with `Auth.requireRole()`
4. **Style with Tailwind** utility classes
5. **Use Sarabun font** and Thai language
6. **Test on mobile** viewport

### Adding a New Database Table

1. Create table in Supabase dashboard
2. Update this CLAUDE.md with schema
3. Add relevant queries in application code
4. Test CRUD operations

### Adding a New Feature

1. **Identify target page** (which role uses it?)
2. **Update UI** with Tailwind components
3. **Add event listeners** for user interactions
4. **Implement Supabase queries** for data operations
5. **Add loading states** and error handling
6. **Test across roles** if applicable

### Modifying Authentication

**DO NOT MODIFY** the authentication system without careful consideration:
- `config.js` contains the central Auth logic
- All pages depend on `Auth.requireRole()`
- Session structure must remain consistent

### Adding New User Roles

1. Update `profiles` table in Supabase
2. Modify `Auth.requireRole()` in `config.js`
3. Update login redirect logic in `index.html`
4. Create new dashboard file if needed

---

## File Reference Guide

### config.js - Central Configuration (56 lines)

**Purpose:** Single source of truth for Supabase configuration and authentication

**Key Exports:**
```javascript
// Global objects (available in all pages)
supabaseClient    // Supabase client instance
Auth              // Authentication helpers
Utils             // Utility functions
```

**When to modify:**
- Never expose Supabase keys in commits
- Only modify Auth logic with extreme care
- Add new utilities to `Utils` object

---

### index.html - Login Portal (115 lines)

**Flow:**
1. User enters username/password
2. Try Supabase Auth first
3. Fallback to demo mode (username/password match)
4. Store session in localStorage
5. Redirect based on role

**Demo Accounts:**
- `user / 1234` → User dashboard
- `technician / 1234` → Technician dashboard
- `manager / 1234` → Manager dashboard
- `admin / 1234` → Admin dashboard

---

### repair_app_connected.html - User Dashboard (669 lines)

**Features:**
- QR code scanner for asset identification
- Issue type selection (from `issue_options` table)
- Photo upload for initial report
- Ticket history view
- Real-time status tracking

**Key Functions:**
- `startQrScanner()` - Activate camera for QR scanning
- `submitTicket()` - Create new maintenance request
- `loadMyTickets()` - Display user's ticket history

---

### technician_dashboard.html - Technician Workspace (625 lines)

**Three Tabs:**
1. **OPEN** - Available jobs (status: OPEN)
2. **MY_JOBS** - Jobs assigned to technician (status: IN_PROGRESS)
3. **HISTORY** - Completed jobs

**Key Features:**
- Accept job (OPEN → IN_PROGRESS)
- Voice-to-text repair notes (Web Speech API)
- Spare parts requisition with inventory modal
- Before/after photo upload
- Finish job modal (IN_PROGRESS → COMPLETED)

**Key Functions:**
- `acceptJob(ticketId)` - Assign job to technician
- `openFinishModal(ticketId)` - Open completion form
- `finishJob()` - Complete job with repair details

---

### manager_dashboard.html - Manager Analytics (393 lines)

**Features:**
- KPI cards (total tickets, open, in-progress, completed)
- Chart.js visualizations
- Status distribution pie chart
- Monthly trend line chart
- Navigation to inventory management

**Key Functions:**
- `loadDashboard()` - Fetch all analytics data
- `renderCharts()` - Display Chart.js graphs

---

### admin_dashboard.html - Admin Panel (429 lines)

**Features:**
- User management (CRUD profiles)
- Asset configuration (add/edit equipment)
- Issue type templates (customize issue_options)
- QR code generation for assets

**Key Functions:**
- `loadUsers()` - Display all profiles
- `loadAssets()` - Display all equipment
- `generateQrCode(assetCode)` - Create QR code for asset

---

### inventory_management.html - Spare Parts (573 lines)

**Features:**
- Category filtering
- Part search
- Stock level indicators
- Add/edit/delete parts
- Low stock warnings

**Key Functions:**
- `loadParts()` - Fetch spare parts inventory
- `savePart()` - Create/update spare part
- `deletePart(id)` - Remove spare part

---

### print_job_sheet.html - Job Sheet Printer (348 lines)

**Features:**
- A4 print layout
- Barcode generation (JSBarcode)
- Before/after photo grid
- Comprehensive job details
- Print-optimized CSS

**Usage:** Navigate with `?ticket_id=XXX` query parameter

---

### export_report.html - Excel Reports (285 lines)

**Features:**
- Monthly maintenance reports
- ExcelJS file generation
- Progress tracking
- Formatted Excel output (FM-MT-01-11 format)

**Key Functions:**
- `exportToExcel(month, year)` - Generate Excel report
- Format includes: asset, issue, status, dates, technician

---

## Important Notes for AI Assistants

### DO's ✅

1. **Always import config.js** in new pages
2. **Use Auth.requireRole()** for protected pages
3. **Follow Tailwind utility classes** (don't write custom CSS unless necessary)
4. **Use Thai language** for all user-facing text
5. **Test mobile responsiveness** (viewport meta tag required)
6. **Handle errors gracefully** with try/catch and user feedback
7. **Add loading states** for async operations
8. **Use dayjs for dates** (already imported)
9. **Check existing patterns** before implementing new features
10. **Update CLAUDE.md** when making structural changes

### DON'Ts ❌

1. **Don't modify config.js** without understanding the impact on all pages
2. **Don't remove Supabase imports** (required for all database operations)
3. **Don't hard-code credentials** (use config.js constants)
4. **Don't break mobile layout** (test on small viewports)
5. **Don't skip authentication checks** on protected pages
6. **Don't use English** in user-facing UI (keep Thai language)
7. **Don't create separate CSS files** (use embedded `<style>` tags)
8. **Don't add build tools** (this is intentionally a simple static site)
9. **Don't expose Supabase keys** in commits or logs
10. **Don't remove error handling** from existing code

### Common Pitfalls

1. **Forgetting to import config.js** → Auth/Supabase undefined
2. **Not handling null/undefined data** → Runtime errors
3. **Missing try/catch blocks** → Unhandled promise rejections
4. **Incorrect role checks** → Unauthorized access
5. **Breaking responsive design** → Poor mobile UX
6. **Not clearing forms** after submission → UX confusion
7. **Missing loading indicators** → User thinks app is frozen
8. **Hardcoding ticket IDs** → Use dynamic data instead

### Security Considerations

⚠️ **This is a DEMO application** with security limitations:

1. **Passwords stored in plain text** (profiles.password)
2. **Supabase keys exposed** in client-side code
3. **No server-side validation** (all logic client-side)
4. **Session in localStorage** (not secure cookies)

**For production deployment:**
- Implement proper authentication (Supabase Auth fully)
- Hash passwords (bcrypt/scrypt)
- Add server-side validation
- Use environment variables for keys
- Implement row-level security (RLS) in Supabase
- Add HTTPS enforcement
- Sanitize user inputs

### Performance Tips

1. **Minimize Supabase queries** - Use `.select()` with joins
2. **Cache frequently accessed data** - Store in variables
3. **Lazy load images** - Only load when visible
4. **Debounce search inputs** - Reduce query frequency
5. **Use pagination** - Don't load all records at once

### Debugging Tips

1. **Check browser console** for JavaScript errors
2. **Inspect Network tab** for failed Supabase requests
3. **Verify localStorage** for session data
4. **Test with different roles** (use demo login buttons)
5. **Check Supabase dashboard** for database state

---

## Development Workflow

### Local Development

```bash
# 1. Clone repository
git clone <repository-url>
cd wd-maintenance

# 2. Open in browser (no build step needed)
# Option A: Use a local server
python3 -m http.server 8000
# Then navigate to: http://localhost:8000

# Option B: Open directly in browser
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux

# 3. Login with demo credentials
# username: technician, password: 1234
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: Brief description in English"

# Push to remote
git push -u origin feature/your-feature-name

# Create pull request on GitHub/GitLab
```

### Testing Checklist

Before committing changes:

- [ ] Test login flow for all 4 roles
- [ ] Verify mobile responsiveness (DevTools mobile view)
- [ ] Check browser console for errors
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Verify photo uploads work
- [ ] Ensure Thai text displays correctly
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Check loading states and error handling

---

## Quick Reference

### Supabase Client Usage

```javascript
// SELECT all
const { data, error } = await supabaseClient.from('table_name').select('*');

// SELECT with filter
const { data } = await supabaseClient.from('tickets').select('*').eq('status', 'OPEN');

// INSERT
const { data, error } = await supabaseClient.from('tickets').insert([{ field: 'value' }]);

// UPDATE
const { data } = await supabaseClient.from('tickets').update({ status: 'COMPLETED' }).eq('id', ticketId);

// DELETE
const { data } = await supabaseClient.from('tickets').delete().eq('id', ticketId);

// ORDER BY
const { data } = await supabaseClient.from('tickets').select('*').order('created_at', { ascending: false });

// JOIN (using foreign key)
const { data } = await supabaseClient
  .from('tickets')
  .select('*, requester:profiles!tickets_requester_id_fkey(full_name)');
```

### Common Tailwind Classes

```html
<!-- Buttons -->
<button class="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600">
    บันทึก
</button>

<!-- Cards -->
<div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
    <!-- Content -->
</div>

<!-- Form Input -->
<input type="text" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 outline-none">

<!-- Modal Backdrop -->
<div class="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center">
    <!-- Modal content -->
</div>

<!-- Loading Spinner -->
<div class="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
```

### Font Awesome Icons

```html
<!-- Common icons used in this app -->
<i class="fas fa-tools"></i>          <!-- Tools/maintenance -->
<i class="fas fa-wrench"></i>         <!-- Wrench -->
<i class="fas fa-qrcode"></i>         <!-- QR code -->
<i class="fas fa-camera"></i>         <!-- Camera -->
<i class="fas fa-check"></i>          <!-- Checkmark -->
<i class="fas fa-times"></i>          <!-- Close/Cancel -->
<i class="fas fa-user"></i>           <!-- User -->
<i class="fas fa-cog"></i>            <!-- Settings -->
<i class="fas fa-chart-bar"></i>      <!-- Analytics -->
<i class="fas fa-box"></i>            <!-- Inventory -->
<i class="fas fa-print"></i>          <!-- Print -->
<i class="fas fa-download"></i>       <!-- Download -->
<i class="fas fa-power-off"></i>      <!-- Logout -->
<i class="fas fa-microphone"></i>     <!-- Voice input -->
```

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-24 | 1.0 | Initial CLAUDE.md creation |

---

## Contact & Support

**Organization:** WD Manufacturing Co., Ltd.
**System:** WD Maintenance CMMS
**Repository:** Thairoongkij/wd-maintenance

For questions or issues regarding this documentation, please create an issue in the repository.

---

**End of Documentation**
