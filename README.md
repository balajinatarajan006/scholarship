# Scholarship Management System

A complete, responsive, modern, and fully functional **Scholarship Management System web application** built from scratch with pure HTML5, CSS3, Vanilla JavaScript, and Browser LocalStorage data persistence.

> [!NOTE]
> This project is a frontend-only prototype and uses browser LocalStorage instead of a production database.

---

## 🌟 Key Features

### 🎓 Student Portal
- **User Authentication**: Student registration with inline validation (duplicate email & register number prevention) and login authentication.
- **Student Dashboard**: Real-time statistics cards (Total Applications, Approved Applications, Scholarship Amount, Academic Year), recent applications queue, and quick action cards.
- **Scholarship Application**: Pre-filled student profile data, dynamic scholarship scheme selection, financial income/CGPA validation, bank account details, and document attachment upload previews.
- **Application Tracking & Filters**: View all submitted applications, search by Application ID or Scheme Name, status filter pills (`All`, `Pending`, `Under Review`, `Approved`, `Rejected`), and detail view modal.
- **Student Profile Management**: View profile attributes and edit mobile number, department, college, and academic year with immediate state synchronization.
- **Notification Center**: Real-time status update alerts, unread counter badges on top navigation header across all pages, mark as read, and deletion options.

### 🛡️ Administrator Portal
- **Default Admin Account**: Direct login using default administrator credentials.
- **Admin Analytics Dashboard**: System statistics (Total Students, Total Applications, Pending Queue, Approved Count, Rejected Count, Total Approved Fund).
- **Application Approval Workflow**: Verification queue with one-click status transitions (`Approve`, `Reject`, `Set Under Review`) that automatically dispatch real-time student notifications.
- **Student Directory Management**: View registered students list with account deletion control and safety confirmation.
- **Scholarship Scheme Management (CRUD)**: Create new scholarship schemes, view active/inactive status, toggle scheme availability, and delete schemes.
- **Visual Analytics Reports**: CSS-based progress charts representing applications breakdown by status.

---

## 🛠️ Technology Stack

- **Markup**: HTML5 Semantic Elements
- **Styling**: CSS3 (CSS Custom Properties, Flexbox, CSS Grid, Glassmorphism backdrop-blur, CSS Animations)
- **Scripting**: Vanilla JavaScript (ES6+, DOM Manipulation, Event Handling)
- **Typography**: Google Fonts — Poppins
- **Icons**: Font Awesome 6 CDN
- **Persistence**: Browser `localStorage`

---

## 📁 Project Structure

```text
Scholarship-Management-System/
│
├── index.html           # Login Portal (Student & Admin toggle)
├── register.html        # Student Account Registration Form
├── dashboard.html       # Student Dashboard (Stats & Recent Queue)
├── apply.html           # Apply Scholarship Form with Auto-fill & Uploads
├── applications.html    # My Applications List (Search, Filter, Modal View)
├── profile.html         # Student Profile View & Edit Modal
├── notifications.html   # Notification Center & Unread Count Badge
├── admin.html           # Admin Portal (App Workflow, Student & Scheme Management, Reports)
│
├── style.css            # Master Design System & Component Styles
├── script.js            # Core App Logic, LocalStorage CRUD & Auth Routing
│
└── README.md            # Documentation & Guide
```

---

## 🔑 Default Credentials

### Administrator Account
- **Email**: `admin@scholarship.com`
- **Password**: `admin123`

### Demo Student Account (Auto-seeded on first load)
- **Email**: `alex.morgan@university.edu`
- **Password**: `password123`

*(You can also register a brand new student account on `register.html`)*

---

## 🚀 How to Run

1. Simply double click `index.html` or open it in any modern web browser (Chrome, Firefox, Edge, Safari).
2. Alternatively, serve via any simple static HTTP server:
   ```bash
   npx serve .
   ```
   or
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

---

## 🗄️ LocalStorage Data Schema

The system relies on the following LocalStorage keys:

| Key | Description |
| :--- | :--- |
| `users` | Array of registered student objects |
| `currentUser` | Currently authenticated student session object |
| `adminLoggedIn` | Boolean string (`"true"`) for admin session state |
| `scholarships` | Array of scholarship schemes with slots, amount, and status |
| `applications` | Array of submitted applications with `applicationId` (e.g. `SCH-2026-0001`) |
| `notifications` | Array of notifications dispatched to students |

---

## 🔄 Status Workflow Architecture

```text
Student Registers
        ↓
Student Logs In
        ↓
Dashboard Overview
        ↓
Apply Scholarship Scheme
        ↓
Form Validation & Document Upload Previews
        ↓
Submission -> ID Generated (SCH-2026-XXXX) -> Status: Pending
        ↓
Admin Login (admin@scholarship.com / admin123)
        ↓
Admin Application Queue
        ↓
Admin Reviews -> Change Status (Under Review / Approved / Rejected)
        ↓
System Automatically Generates Student Notification
        ↓
Student Receives Alert & Unread Badge Count Updates
        ↓
Student Views Updated Status & Detail Modal
```
