/* ==========================================================================
   SCHOLARSHIP MANAGEMENT SYSTEM - CORE SCRIPT
   Handles Auth, LocalStorage State, Page Routing, Modals, Toasts & Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initDefaultData();
    setupGlobalNavigation();
    routePage();
});

/* ==========================================
   1. LOCAL STORAGE ENGINE & HELPERS
   ========================================== */
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

function getApplications() {
    return JSON.parse(localStorage.getItem('applications')) || [];
}

function saveApplications(apps) {
    localStorage.setItem('applications', JSON.stringify(apps));
}

function getScholarships() {
    return JSON.parse(localStorage.getItem('scholarships')) || [];
}

function saveScholarships(scholarships) {
    localStorage.setItem('scholarships', JSON.stringify(scholarships));
}

function getNotifications() {
    return JSON.parse(localStorage.getItem('notifications')) || [];
}

function saveNotifications(notifications) {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

function setAdminLoggedIn(status) {
    if (status) {
        localStorage.setItem('adminLoggedIn', 'true');
    } else {
        localStorage.removeItem('adminLoggedIn');
    }
}

function logout() {
    setCurrentUser(null);
    setAdminLoggedIn(false);
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

/* ==========================================
   2. INITIALIZE DEFAULT DEMO DATA
   ========================================== */
function initDefaultData() {
    // Seed default scholarships if empty
    if (!localStorage.getItem('scholarships')) {
        const defaultScholarships = [
            { id: 1, name: 'Merit Scholarship', type: 'Merit-Based', amount: 50000, academicYear: '2025-2026', slots: 100, status: 'Active', description: 'Awarded to students with outstanding academic performance (CGPA > 8.5).' },
            { id: 2, name: 'Government Scholarship', type: 'State Sponsored', amount: 40000, academicYear: '2025-2026', slots: 200, status: 'Active', description: 'State government financial aid for eligible low-income families.' },
            { id: 3, name: 'First Graduate Scholarship', type: 'Need-Based', amount: 30000, academicYear: '2025-2026', slots: 150, status: 'Active', description: 'For students who are the first in their immediate family to pursue higher education.' },
            { id: 4, name: 'Women Education Scholarship', type: 'Empowerment', amount: 35000, academicYear: '2025-2026', slots: 80, status: 'Active', description: 'Special scholarship scheme promoting higher education for female students.' },
            { id: 5, name: 'SC/ST Scholarship', type: 'Government Category', amount: 45000, academicYear: '2025-2026', slots: 120, status: 'Active', description: 'Government tuition fee waiver for SC/ST category students.' },
            { id: 6, name: 'Minority Scholarship', type: 'Category-Based', amount: 30000, academicYear: '2025-2026', slots: 90, status: 'Active', description: 'Financial support for minority religious community students.' },
            { id: 7, name: 'Sports Scholarship', type: 'Talent-Based', amount: 25000, academicYear: '2025-2026', slots: 50, status: 'Active', description: 'For students representing the institution at district, state, or national level sports.' },
            { id: 8, name: 'Research Scholarship', type: 'Postgraduate', amount: 60000, academicYear: '2025-2026', slots: 30, status: 'Active', description: 'Funding support for research projects and innovative academic papers.' }
        ];
        saveScholarships(defaultScholarships);
    }

    // Seed default sample user & application if empty
    if (!localStorage.getItem('users')) {
        const demoUser = {
            fullName: 'Alex Morgan',
            email: 'alex.morgan@university.edu',
            registerNumber: 'REG2026001',
            mobile: '9876543210',
            department: 'Computer Science & Engineering',
            college: 'National Institute of Technology',
            academicYear: '3rd Year',
            dob: '2004-05-15',
            password: 'password123'
        };
        saveUsers([demoUser]);
    }
}

/* ==========================================
   3. TOAST NOTIFICATION UTILITY
   ========================================== */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'danger') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <div class="toast-message">${escapeHTML(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s reverse forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/* ==========================================
   4. MODAL HELPERS
   ========================================== */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/* Close modal when clicking backdrop or close button */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('active');
    }
    if (e.target.closest('.modal-close')) {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
    }
});

/* ==========================================
   5. ROUTER & AUTH GUARD
   ========================================== */
function routePage() {
    const page = window.location.pathname.split('/').pop().toLowerCase();
    const currentUser = getCurrentUser();
    const adminActive = isAdminLoggedIn();

    // Protection logic
    const studentProtectedPages = ['dashboard.html', 'apply.html', 'applications.html', 'profile.html', 'notifications.html'];
    
    if (studentProtectedPages.includes(page)) {
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        updateHeaderUser(currentUser);
        updateNotificationBadge();
    } else if (page === 'admin.html') {
        if (!adminActive) {
            window.location.href = 'index.html';
            return;
        }
        updateHeaderUser({ fullName: 'Administrator', role: 'System Admin' });
    } else if (page === 'index.html' || page === 'register.html' || page === '') {
        if (currentUser) {
            window.location.href = 'dashboard.html';
            return;
        }
        if (adminActive) {
            window.location.href = 'admin.html';
            return;
        }
    }

    // Page-specific initializers
    if (page === 'index.html' || page === '') initLogin();
    else if (page === 'register.html') initRegister();
    else if (page === 'dashboard.html') initDashboard();
    else if (page === 'apply.html') initApply();
    else if (page === 'applications.html') initApplications();
    else if (page === 'profile.html') initProfile();
    else if (page === 'notifications.html') initNotifications();
    else if (page === 'admin.html') initAdmin();
}

function updateHeaderUser(user) {
    const userNameEls = document.querySelectorAll('.user-name-display');
    const userRoleEls = document.querySelectorAll('.user-role-display');
    const avatarEls = document.querySelectorAll('.avatar');

    userNameEls.forEach(el => el.textContent = user.fullName || 'User');
    userRoleEls.forEach(el => el.textContent = user.role || 'Student');
    
    const initials = (user.fullName || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEls.forEach(el => el.textContent = initials);
}

function setupGlobalNavigation() {
    // Mobile Drawer Toggle
    const hamburger = document.getElementById('hamburger-toggle');
    const sidebar = document.getElementById('app-sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Attach logout listeners
    const logoutBtns = document.querySelectorAll('.btn-logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
}

function updateNotificationBadge() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const notifications = getNotifications().filter(n => n.userEmail === currentUser.email && !n.read);
    const badgeEls = document.querySelectorAll('.notification-badge-count');
    
    badgeEls.forEach(badge => {
        if (notifications.length > 0) {
            badge.textContent = notifications.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

/* ==========================================
   6. LOGIN PAGE LOGIC (index.html)
   ========================================== */
function initLogin() {
    const loginForm = document.getElementById('login-form');
    const togglePassBtn = document.getElementById('toggle-password');
    const passInput = document.getElementById('login-password');

    if (togglePassBtn && passInput) {
        togglePassBtn.addEventListener('click', () => {
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            togglePassBtn.classList.toggle('fa-eye-slash');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = passInput.value.trim();

            if (!email || !password) {
                showToast('Please fill in all fields', 'warning');
                return;
            }

            // Check Admin Credentials
            if (email === 'admin@scholarship.com' && password === 'admin123') {
                setAdminLoggedIn(true);
                showToast('Welcome, Administrator!', 'success');
                setTimeout(() => window.location.href = 'admin.html', 500);
                return;
            }

            // Check Student Users
            const users = getUsers();
            if (users.length === 0) {
                showToast('Please register first.', 'warning');
                return;
            }

            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (user) {
                setCurrentUser(user);
                showToast('Login successful.', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 500);
            } else {
                showToast('Invalid email or password.', 'danger');
            }
        });
    }
}

/* ==========================================
   7. REGISTER PAGE LOGIC (register.html)
   ========================================== */
function initRegister() {
    const regForm = document.getElementById('register-form');
    const togglePassBtn = document.getElementById('toggle-reg-password');
    const passInput = document.getElementById('reg-password');

    if (togglePassBtn && passInput) {
        togglePassBtn.addEventListener('click', () => {
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            togglePassBtn.classList.toggle('fa-eye-slash');
        });
    }

    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Clear previous errors
            document.querySelectorAll('.form-group').forEach(fg => fg.classList.remove('has-error'));

            const fullName = document.getElementById('reg-fullname').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const registerNumber = document.getElementById('reg-regno').value.trim();
            const mobile = document.getElementById('reg-mobile').value.trim();
            const department = document.getElementById('reg-department').value.trim();
            const college = document.getElementById('reg-college').value.trim();
            const academicYear = document.getElementById('reg-year').value.trim();
            const dob = document.getElementById('reg-dob').value;
            const password = passInput.value.trim();
            const confirmPassword = document.getElementById('reg-confirm-password').value.trim();

            let isValid = true;

            // Validations
            if (!fullName) setError('reg-fullname', 'Full Name is required');
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) setError('reg-email', 'Enter a valid email address');

            if (!registerNumber) setError('reg-regno', 'Register number cannot be empty');

            const mobileRegex = /^[0-9]{10}$/;
            if (!mobile || !mobileRegex.test(mobile)) setError('reg-mobile', 'Enter a valid 10-digit mobile number');

            if (!department) setError('reg-department', 'Department is required');
            if (!college) setError('reg-college', 'College name is required');
            if (!academicYear) setError('reg-year', 'Select academic year');
            if (!dob) setError('reg-dob', 'Date of birth is required');

            if (!password || password.length < 6) setError('reg-password', 'Password must be at least 6 characters');
            if (password !== confirmPassword) setError('reg-confirm-password', 'Passwords do not match');

            if (!isValid) {
                showToast('Please fix the errors in the form', 'warning');
                return;
            }

            // Duplicate Checks
            const users = getUsers();
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                setError('reg-email', 'An account with this email already exists');
                showToast('Email already registered', 'danger');
                return;
            }

            if (users.some(u => u.registerNumber.toLowerCase() === registerNumber.toLowerCase())) {
                setError('reg-regno', 'Register number already registered');
                showToast('Register number already exists', 'danger');
                return;
            }

            // Save user
            const newUser = {
                fullName,
                email,
                registerNumber,
                mobile,
                department,
                college,
                academicYear,
                dob,
                password
            };

            users.push(newUser);
            saveUsers(users);

            showToast('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        });
    }

    function setError(inputId, message) {
        const input = document.getElementById(inputId);
        if (input) {
            const group = input.closest('.form-group');
            if (group) {
                group.classList.add('has-error');
                const errSpan = group.querySelector('.error-message');
                if (errSpan) errSpan.textContent = message;
            }
        }
        isValid = false;
    }
}

/* ==========================================
   8. DASHBOARD LOGIC (dashboard.html)
   ========================================== */
function initDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    // Welcome title & cards
    const welcomeTitle = document.getElementById('dash-welcome-name');
    if (welcomeTitle) welcomeTitle.textContent = user.fullName;

    const apps = getApplications().filter(a => a.userEmail === user.email);

    // Compute stats
    const totalApps = apps.length;
    const approvedApps = apps.filter(a => a.status === 'Approved');
    const approvedCount = approvedApps.length;
    const totalAmount = approvedApps.reduce((sum, a) => sum + Number(a.amount || 0), 0);

    const totalEl = document.getElementById('stat-total-apps');
    const approvedEl = document.getElementById('stat-approved-apps');
    const amountEl = document.getElementById('stat-total-amount');
    const yearEl = document.getElementById('stat-academic-year');

    if (totalEl) totalEl.textContent = totalApps;
    if (approvedEl) approvedEl.textContent = approvedCount;
    if (amountEl) amountEl.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    if (yearEl) yearEl.textContent = user.academicYear || 'N/A';

    // Render Recent Applications Table
    const tbody = document.getElementById('recent-apps-tbody');
    const emptyState = document.getElementById('recent-apps-empty');

    if (tbody) {
        tbody.innerHTML = '';
        const recentApps = apps.slice(-5).reverse();

        if (recentApps.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            tbody.closest('table').style.display = 'none';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            tbody.closest('table').style.display = 'table';

            recentApps.forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${escapeHTML(app.scholarshipName)}</strong></td>
                    <td><code>${escapeHTML(app.applicationId)}</code></td>
                    <td>${escapeHTML(app.applicationDate)}</td>
                    <td>₹${Number(app.amount).toLocaleString('en-IN')}</td>
                    <td><span class="status-badge ${getStatusClass(app.status)}">${escapeHTML(app.status)}</span></td>
                    <td>
                        <a href="applications.html" class="btn btn-sm btn-secondary">
                            <i class="fas fa-eye"></i> View
                        </a>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }
}

/* ==========================================
   9. APPLY SCHOLARSHIP LOGIC (apply.html)
   ========================================== */
function initApply() {
    const user = getCurrentUser();
    if (!user) return;

    // Auto-fill student information
    document.getElementById('apply-name').value = user.fullName || '';
    document.getElementById('apply-regno').value = user.registerNumber || '';
    document.getElementById('apply-email').value = user.email || '';
    document.getElementById('apply-mobile').value = user.mobile || '';
    document.getElementById('apply-dept').value = user.department || '';
    document.getElementById('apply-college').value = user.college || '';
    document.getElementById('apply-year').value = user.academicYear || '';

    // Populate Active Scholarships Dropdown
    const scholarshipSelect = document.getElementById('apply-scholarship-name');
    const scholarships = getScholarships().filter(s => s.status === 'Active');

    if (scholarshipSelect) {
        scholarshipSelect.innerHTML = '<option value="">-- Select Scholarship Scheme --</option>';
        scholarships.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.name;
            opt.dataset.amount = s.amount;
            opt.textContent = `${s.name} (₹${s.amount.toLocaleString('en-IN')})`;
            scholarshipSelect.appendChild(opt);
        });

        scholarshipSelect.addEventListener('change', () => {
            const selectedOpt = scholarshipSelect.options[scholarshipSelect.selectedIndex];
            const amountInput = document.getElementById('apply-amount');
            if (amountInput && selectedOpt.dataset.amount) {
                amountInput.value = `₹${Number(selectedOpt.dataset.amount).toLocaleString('en-IN')}`;
            }
        });
    }

    // Handle File Upload Previews
    const fileInputs = document.querySelectorAll('.file-input-field');
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const fileNameSpan = input.closest('.form-group').querySelector('.selected-file-name');
            if (fileNameSpan) {
                if (input.files.length > 0) {
                    fileNameSpan.textContent = `Attached: ${input.files[0].name}`;
                    fileNameSpan.style.display = 'block';
                } else {
                    fileNameSpan.textContent = '';
                    fileNameSpan.style.display = 'none';
                }
            }
        });
    });

    // Form Submit
    const applyForm = document.getElementById('scholarship-apply-form');
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const scholarshipName = scholarshipSelect.value;
            const academicYear = document.getElementById('apply-year').value;
            const familyIncome = document.getElementById('apply-income').value;
            const percentage = document.getElementById('apply-cgpa').value;
            const bankAccount = document.getElementById('apply-bankno').value;
            const ifscCode = document.getElementById('apply-ifsc').value;

            if (!scholarshipName || !familyIncome || !percentage || !bankAccount || !ifscCode) {
                showToast('Please complete all required fields.', 'warning');
                return;
            }

            const selectedScholarship = scholarships.find(s => s.name === scholarshipName);
            const amount = selectedScholarship ? selectedScholarship.amount : 30000;

            const appId = generateApplicationId();
            const today = new Date().toISOString().split('T')[0];

            const newApp = {
                applicationId: appId,
                userEmail: user.email,
                studentName: user.fullName,
                registerNumber: user.registerNumber,
                department: user.department,
                college: user.college,
                scholarshipName: scholarshipName,
                scholarshipType: selectedScholarship ? selectedScholarship.type : 'General',
                academicYear: academicYear,
                familyIncome: familyIncome,
                percentage: percentage,
                bankAccount: bankAccount,
                ifscCode: ifscCode,
                amount: amount,
                applicationDate: today,
                status: 'Pending',
                documentsAttached: true
            };

            const apps = getApplications();
            apps.push(newApp);
            saveApplications(apps);

            // Add notification
            addNotification(
                user.email,
                `Application ${appId} submitted successfully for ${scholarshipName}.`,
                'info'
            );

            showToast(`Application submitted successfully! ID: ${appId}`, 'success');

            setTimeout(() => {
                window.location.href = 'applications.html';
            }, 1200);
        });
    }
}

function generateApplicationId() {
    const apps = getApplications();
    const count = apps.length + 1;
    const year = new Date().getFullYear();
    const pad = String(count).padStart(4, '0');
    return `SCH-${year}-${pad}`;
}

/* ==========================================
   10. MY APPLICATIONS LOGIC (applications.html)
   ========================================== */
function initApplications() {
    const user = getCurrentUser();
    if (!user) return;

    let userApps = getApplications().filter(a => a.userEmail === user.email);

    const tbody = document.getElementById('my-apps-tbody');
    const emptyState = document.getElementById('my-apps-empty');
    const searchInput = document.getElementById('apps-search');
    const filterPills = document.querySelectorAll('.filter-pill');

    let currentFilter = 'All';

    function renderApps() {
        if (!tbody) return;
        tbody.innerHTML = '';

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        let filtered = userApps.filter(app => {
            const matchesFilter = currentFilter === 'All' || app.status.toLowerCase() === currentFilter.toLowerCase();
            const matchesSearch = app.applicationId.toLowerCase().includes(searchTerm) ||
                                  app.scholarshipName.toLowerCase().includes(searchTerm) ||
                                  app.academicYear.toLowerCase().includes(searchTerm);
            return matchesFilter && matchesSearch;
        });

        if (filtered.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            tbody.closest('table').style.display = 'none';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            tbody.closest('table').style.display = 'table';

            filtered.reverse().forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><code>${escapeHTML(app.applicationId)}</code></td>
                    <td><strong>${escapeHTML(app.scholarshipName)}</strong></td>
                    <td>${escapeHTML(app.academicYear)}</td>
                    <td>${escapeHTML(app.applicationDate)}</td>
                    <td>₹${Number(app.amount).toLocaleString('en-IN')}</td>
                    <td><span class="status-badge ${getStatusClass(app.status)}">${escapeHTML(app.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary view-app-btn" data-id="${app.applicationId}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    renderApps();

    // Event Listeners for Filters & Search
    if (searchInput) {
        searchInput.addEventListener('input', renderApps);
    }

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter;
            renderApps();
        });
    });

    // View Modal Trigger
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-app-btn');
            if (viewBtn) {
                const appId = viewBtn.dataset.id;
                const app = userApps.find(a => a.applicationId === appId);
                if (app) {
                    showApplicationDetailsModal(app);
                }
            }
        });
    }
}

function showApplicationDetailsModal(app) {
    const modalBody = document.getElementById('view-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <label>Application ID</label>
                <p><code>${escapeHTML(app.applicationId)}</code></p>
            </div>
            <div class="detail-item">
                <label>Current Status</label>
                <p><span class="status-badge ${getStatusClass(app.status)}">${escapeHTML(app.status)}</span></p>
            </div>
            <div class="detail-item">
                <label>Scholarship Name</label>
                <p>${escapeHTML(app.scholarshipName)}</p>
            </div>
            <div class="detail-item">
                <label>Grant Amount</label>
                <p>₹${Number(app.amount).toLocaleString('en-IN')}</p>
            </div>
            <div class="detail-item">
                <label>Student Name</label>
                <p>${escapeHTML(app.studentName)}</p>
            </div>
            <div class="detail-item">
                <label>Register Number</label>
                <p>${escapeHTML(app.registerNumber)}</p>
            </div>
            <div class="detail-item">
                <label>Academic Year</label>
                <p>${escapeHTML(app.academicYear)}</p>
            </div>
            <div class="detail-item">
                <label>Submission Date</label>
                <p>${escapeHTML(app.applicationDate)}</p>
            </div>
            <div class="detail-item">
                <label>Family Income (Annual)</label>
                <p>₹${Number(app.familyIncome || 0).toLocaleString('en-IN')}</p>
            </div>
            <div class="detail-item">
                <label>CGPA / Percentage</label>
                <p>${escapeHTML(app.percentage)}%</p>
            </div>
            <div class="detail-item">
                <label>Bank Account Number</label>
                <p>${escapeHTML(app.bankAccount)}</p>
            </div>
            <div class="detail-item">
                <label>IFSC Code</label>
                <p>${escapeHTML(app.ifscCode)}</p>
            </div>
        </div>
    `;

    openModal('view-app-modal');
}

/* ==========================================
   11. PROFILE LOGIC (profile.html)
   ========================================== */
function initProfile() {
    const user = getCurrentUser();
    if (!user) return;

    renderProfileInfo(user);

    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            document.getElementById('edit-fullname').value = user.fullName || '';
            document.getElementById('edit-mobile').value = user.mobile || '';
            document.getElementById('edit-dept').value = user.department || '';
            document.getElementById('edit-college').value = user.college || '';
            document.getElementById('edit-year').value = user.academicYear || '';
            openModal('edit-profile-modal');
        });
    }

    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const updatedName = document.getElementById('edit-fullname').value.trim();
            const updatedMobile = document.getElementById('edit-mobile').value.trim();
            const updatedDept = document.getElementById('edit-dept').value.trim();
            const updatedCollege = document.getElementById('edit-college').value.trim();
            const updatedYear = document.getElementById('edit-year').value.trim();

            if (!updatedName || !updatedMobile || !updatedDept || !updatedCollege || !updatedYear) {
                showToast('All fields are required.', 'warning');
                return;
            }

            // Update in Users array & CurrentUser
            const users = getUsers();
            const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());

            if (index !== -1) {
                users[index].fullName = updatedName;
                users[index].mobile = updatedMobile;
                users[index].department = updatedDept;
                users[index].college = updatedCollege;
                users[index].academicYear = updatedYear;
                
                saveUsers(users);
                setCurrentUser(users[index]);

                renderProfileInfo(users[index]);
                updateHeaderUser(users[index]);

                addNotification(user.email, 'Profile updated successfully.', 'info');
                showToast('Profile updated successfully.', 'success');
                closeModal('edit-profile-modal');
            }
        });
    }
}

function renderProfileInfo(user) {
    const elName = document.getElementById('prof-name');
    const elEmail = document.getElementById('prof-email');
    const elRegNo = document.getElementById('prof-regno');
    const elMobile = document.getElementById('prof-mobile');
    const elDept = document.getElementById('prof-dept');
    const elCollege = document.getElementById('prof-college');
    const elYear = document.getElementById('prof-year');
    const elDob = document.getElementById('prof-dob');
    const elAvatar = document.getElementById('prof-avatar-large');

    if (elName) elName.textContent = user.fullName;
    if (elEmail) elEmail.textContent = user.email;
    if (elRegNo) elRegNo.textContent = user.registerNumber;
    if (elMobile) elMobile.textContent = user.mobile;
    if (elDept) elDept.textContent = user.department;
    if (elCollege) elCollege.textContent = user.college;
    if (elYear) elYear.textContent = user.academicYear;
    if (elDob) elDob.textContent = user.dob || 'N/A';

    if (elAvatar) {
        const initials = (user.fullName || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        elAvatar.textContent = initials;
    }
}

/* ==========================================
   12. NOTIFICATIONS LOGIC (notifications.html)
   ========================================== */
function initNotifications() {
    const user = getCurrentUser();
    if (!user) return;

    renderNotifications();

    const markAllBtn = document.getElementById('mark-all-read-btn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            const notifications = getNotifications();
            notifications.forEach(n => {
                if (n.userEmail === user.email) n.read = true;
            });
            saveNotifications(notifications);
            renderNotifications();
            updateNotificationBadge();
            showToast('All notifications marked as read', 'success');
        });
    }
}

function renderNotifications() {
    const user = getCurrentUser();
    if (!user) return;

    const notifications = getNotifications().filter(n => n.userEmail === user.email);
    const container = document.getElementById('notifications-container');
    const emptyState = document.getElementById('notifications-empty');

    if (!container) return;
    container.innerHTML = '';

    if (notifications.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (emptyState) emptyState.style.display = 'none';

        notifications.reverse().forEach(n => {
            const item = document.createElement('div');
            item.className = `notification-item ${n.read ? '' : 'unread'} ${n.type || ''}`;
            item.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${getNotificationIcon(n.type)}"></i>
                </div>
                <div class="notification-content">
                    <p>${escapeHTML(n.message)}</p>
                    <span class="notification-time">${escapeHTML(n.date)}</span>
                </div>
                <div class="notification-actions">
                    ${!n.read ? `<button class="btn btn-sm btn-secondary mark-read-btn" data-id="${n.id}"><i class="fas fa-check"></i> Read</button>` : ''}
                    <button class="btn btn-sm btn-danger delete-notif-btn" data-id="${n.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(item);
        });

        // Event listeners inside container
        container.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const notifId = Number(btn.dataset.id);
                const allNotifs = getNotifications();
                const target = allNotifs.find(n => n.id === notifId);
                if (target) {
                    target.read = true;
                    saveNotifications(allNotifs);
                    renderNotifications();
                    updateNotificationBadge();
                }
            });
        });

        container.querySelectorAll('.delete-notif-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const notifId = Number(btn.dataset.id);
                let allNotifs = getNotifications();
                allNotifs = allNotifs.filter(n => n.id !== notifId);
                saveNotifications(allNotifs);
                renderNotifications();
                updateNotificationBadge();
                showToast('Notification deleted', 'info');
            });
        });
    }
}

function addNotification(userEmail, message, type = 'info') {
    const notifications = getNotifications();
    const newNotif = {
        id: Date.now(),
        userEmail: userEmail,
        message: message,
        date: new Date().toLocaleString(),
        read: false,
        type: type
    };
    notifications.push(newNotif);
    saveNotifications(notifications);
    updateNotificationBadge();
}

function getNotificationIcon(type) {
    if (type === 'approved') return 'fa-check-circle';
    if (type === 'rejected') return 'fa-times-circle';
    if (type === 'under-review') return 'fa-clock';
    return 'fa-bell';
}

/* ==========================================
   13. ADMIN PORTAL LOGIC (admin.html)
   ========================================== */
function initAdmin() {
    setupAdminTabs();
    renderAdminStats();
    renderAdminApplications();
    renderAdminStudents();
    renderAdminScholarships();
    renderAdminReports();
}

function setupAdminTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.dataset.target;
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

function renderAdminStats() {
    const students = getUsers();
    const apps = getApplications();

    const totalStudents = students.length;
    const totalApps = apps.length;
    const pendingApps = apps.filter(a => a.status === 'Pending').length;
    const approvedApps = apps.filter(a => a.status === 'Approved').length;
    const rejectedApps = apps.filter(a => a.status === 'Rejected').length;
    const totalApprovedAmount = apps.filter(a => a.status === 'Approved').reduce((s, a) => s + Number(a.amount || 0), 0);

    setElText('admin-stat-students', totalStudents);
    setElText('admin-stat-apps', totalApps);
    setElText('admin-stat-pending', pendingApps);
    setElText('admin-stat-approved', approvedApps);
    setElText('admin-stat-rejected', rejectedApps);
    setElText('admin-stat-amount', `₹${totalApprovedAmount.toLocaleString('en-IN')}`);
}

function renderAdminApplications() {
    const apps = getApplications();
    const tbody = document.getElementById('admin-apps-tbody');
    const emptyState = document.getElementById('admin-apps-empty');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (apps.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        tbody.closest('table').style.display = 'none';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        tbody.closest('table').style.display = 'table';

        apps.slice().reverse().forEach(app => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${escapeHTML(app.applicationId)}</code></td>
                <td><strong>${escapeHTML(app.studentName)}</strong></td>
                <td>${escapeHTML(app.registerNumber)}</td>
                <td>${escapeHTML(app.scholarshipName)}</td>
                <td>${escapeHTML(app.applicationDate)}</td>
                <td>₹${Number(app.amount).toLocaleString('en-IN')}</td>
                <td><span class="status-badge ${getStatusClass(app.status)}">${escapeHTML(app.status)}</span></td>
                <td>
                    <div style="display: flex; gap: 0.35rem;">
                        <button class="btn btn-sm btn-secondary admin-view-btn" data-id="${app.applicationId}" title="View Details"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-success admin-status-btn" data-id="${app.applicationId}" data-status="Approved" title="Approve"><i class="fas fa-check"></i></button>
                        <button class="btn btn-sm btn-primary admin-status-btn" data-id="${app.applicationId}" data-status="Under Review" title="Set Under Review"><i class="fas fa-clock"></i></button>
                        <button class="btn btn-sm btn-danger admin-status-btn" data-id="${app.applicationId}" data-status="Rejected" title="Reject"><i class="fas fa-times"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Event listener for action buttons
        tbody.querySelectorAll('.admin-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const appId = btn.dataset.id;
                const newStatus = btn.dataset.status;
                updateApplicationStatus(appId, newStatus);
            });
        });

        tbody.querySelectorAll('.admin-view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const appId = btn.dataset.id;
                const app = apps.find(a => a.applicationId === appId);
                if (app) showApplicationDetailsModal(app);
            });
        });
    }
}

function updateApplicationStatus(appId, newStatus) {
    const apps = getApplications();
    const app = apps.find(a => a.applicationId === appId);

    if (app) {
        app.status = newStatus;
        saveApplications(apps);

        let type = 'info';
        if (newStatus === 'Approved') type = 'approved';
        if (newStatus === 'Rejected') type = 'rejected';
        if (newStatus === 'Under Review') type = 'under-review';

        addNotification(
            app.userEmail,
            `Your scholarship application ${appId} status has been updated to "${newStatus}".`,
            type
        );

        showToast(`Application ${appId} set to ${newStatus}`, 'success');
        
        renderAdminStats();
        renderAdminApplications();
        renderAdminReports();
    }
}

function renderAdminStudents() {
    const students = getUsers();
    const tbody = document.getElementById('admin-students-tbody');
    const emptyState = document.getElementById('admin-students-empty');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (students.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        tbody.closest('table').style.display = 'none';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        tbody.closest('table').style.display = 'table';

        students.forEach((student, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHTML(student.fullName)}</strong></td>
                <td>${escapeHTML(student.email)}</td>
                <td><code>${escapeHTML(student.registerNumber)}</code></td>
                <td>${escapeHTML(student.department)}</td>
                <td>${escapeHTML(student.college)}</td>
                <td>${escapeHTML(student.academicYear)}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-student-btn" data-email="${student.email}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.delete-student-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.dataset.email;
                if (confirm(`Are you sure you want to delete student account (${email})?`)) {
                    let updatedUsers = getUsers().filter(u => u.email !== email);
                    saveUsers(updatedUsers);
                    renderAdminStudents();
                    renderAdminStats();
                    showToast('Student deleted successfully', 'info');
                }
            });
        });
    }
}

function renderAdminScholarships() {
    const scholarships = getScholarships();
    const tbody = document.getElementById('admin-scholarships-tbody');
    
    if (!tbody) return;
    tbody.innerHTML = '';

    scholarships.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHTML(s.name)}</strong></td>
            <td>${escapeHTML(s.type)}</td>
            <td>₹${Number(s.amount).toLocaleString('en-IN')}</td>
            <td>${escapeHTML(s.academicYear)}</td>
            <td>${s.slots}</td>
            <td><span class="status-badge ${s.status === 'Active' ? 'active' : 'inactive'}">${s.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary toggle-scholarship-btn" data-id="${s.id}">
                    ${s.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-sm btn-danger delete-scholarship-btn" data-id="${s.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.toggle-scholarship-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const list = getScholarships();
            const target = list.find(s => s.id === id);
            if (target) {
                target.status = target.status === 'Active' ? 'Inactive' : 'Active';
                saveScholarships(list);
                renderAdminScholarships();
                showToast(`Scholarship ${target.status}`, 'info');
            }
        });
    });

    tbody.querySelectorAll('.delete-scholarship-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            if (confirm('Delete this scholarship scheme?')) {
                let list = getScholarships().filter(s => s.id !== id);
                saveScholarships(list);
                renderAdminScholarships();
                showToast('Scholarship deleted', 'info');
            }
        });
    });

    // Add Scholarship Form inside Modal
    const addForm = document.getElementById('add-scholarship-form');
    if (addForm && !addForm.dataset.bound) {
        addForm.dataset.bound = "true";
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('sch-name').value.trim();
            const type = document.getElementById('sch-type').value.trim();
            const amount = Number(document.getElementById('sch-amount').value);
            const year = document.getElementById('sch-year').value.trim();
            const slots = Number(document.getElementById('sch-slots').value);
            const desc = document.getElementById('sch-desc').value.trim();

            if (!name || !amount || !slots) {
                showToast('Please complete required fields', 'warning');
                return;
            }

            const list = getScholarships();
            const newSch = {
                id: Date.now(),
                name,
                type,
                amount,
                academicYear: year,
                slots,
                status: 'Active',
                description: desc
            };

            list.push(newSch);
            saveScholarships(list);
            renderAdminScholarships();
            closeModal('add-scholarship-modal');
            addForm.reset();
            showToast('New Scholarship added successfully!', 'success');
        });
    }
}

function renderAdminReports() {
    const apps = getApplications();
    const total = apps.length || 1;

    const pending = apps.filter(a => a.status === 'Pending').length;
    const review = apps.filter(a => a.status === 'Under Review').length;
    const approved = apps.filter(a => a.status === 'Approved').length;
    const rejected = apps.filter(a => a.status === 'Rejected').length;

    setBarWidth('bar-pending', (pending / total) * 100, `${pending} Applications`);
    setBarWidth('bar-review', (review / total) * 100, `${review} Applications`);
    setBarWidth('bar-approved', (approved / total) * 100, `${approved} Applications`);
    setBarWidth('bar-rejected', (rejected / total) * 100, `${rejected} Applications`);
}

function setBarWidth(id, pct, countText) {
    const el = document.getElementById(id);
    if (el) {
        el.style.width = `${Math.max(pct, 5)}%`;
        const countSpan = el.closest('.bar-item')?.querySelector('.bar-count');
        if (countSpan) countSpan.textContent = countText;
    }
}

/* Helper Utilities */
function getStatusClass(status) {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
        case 'approved': return 'approved';
        case 'rejected': return 'rejected';
        case 'under review': return 'under-review';
        default: return 'pending';
    }
}

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
