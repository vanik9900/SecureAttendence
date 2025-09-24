// Admin Dashboard
// Global variables
let currentSection = 'dashboard';
let currentPage = 1;
let recordsPerPage = 10;
let allUsers = [];
let filteredUsers = [];
let allAttendance = [];
let authToken = '';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupNavigation();
    setupEventListeners();
    loadDashboardData();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

function initializeDashboard() {
    // Check authentication
    const authData = localStorage.getItem('secureAttendAuth');
    if (!authData) {
        window.location.href = 'login.html';
        return;
    }
    
    const userData = JSON.parse(authData);
    if (userData.role !== 'Admin') {
        window.location.href = 'user-dashboard.html';
        return;
    }
    
    // Store auth token for API calls
    authToken = userData.token;
    
    // Update admin info
    document.getElementById('adminName').textContent = userData.username || 'Administrator';
    
    // Load data from backend
    loadBackendData();
}

// Load data from backend API
async function loadBackendData() {
    try {
        // Load dashboard stats
        const dashboardResponse = await fetch('http://localhost:8000/admin/dashboard');
        const dashboardData = await dashboardResponse.json();
        
        // Load all attendance records
        const attendanceResponse = await fetch('http://localhost:8000/admin/attendance/all');
        allAttendance = await attendanceResponse.json();
        
        // Update UI with real data
        updateDashboardWithBackendData(dashboardData);
        
    } catch (error) {
        console.error('Error loading backend data:', error);
        // Fall back to sample data
        initializeSampleData();
    }
}

function updateDashboardWithBackendData(data) {
    document.getElementById('presentToday').textContent = data.present_today;
    document.getElementById('absentToday').textContent = data.absent_today;
    document.getElementById('totalUsers').textContent = data.total_users;
    document.getElementById('onlineUsers').textContent = data.present_today;
    
    // Update attendance records
    attendanceRecords = allAttendance;
    
    // Load recent activity from attendance records
    loadRecentActivityFromBackend();
}

function loadRecentActivityFromBackend() {
    const activityList = document.getElementById('recentActivity');
    const recentRecords = allAttendance.slice(-5).reverse();
    
    activityList.innerHTML = recentRecords.map(record => `
        <div class="activity-item">
            <div class="activity-icon success">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
                <p><strong>${record.user_name}</strong> marked attendance</p>
                <small>${record.time} on ${record.date}</small>
            </div>
        </div>
    `).join('');
}

function initializeSampleData() {
    // Initialize sample data as fallback
    allUsers = [
        {
            id: 'STU001',
            name: 'Alice Johnson',
            employeeId: 'STU001',
            type: 'student',
            department: 'engineering',
            status: 'active',
            email: 'alice.johnson@university.edu',
            phone: '+1234567890',
            lastAttendance: '2024-09-14 09:30:00',
            photo: null
        },
        {
            id: 'EMP001',
            name: 'Bob Smith',
            employeeId: 'EMP001',
            type: 'worker',
            department: 'hr',
            status: 'active',
            email: 'bob.smith@company.com',
            phone: '+1234567891',
            lastAttendance: '2024-09-14 08:45:00',
            photo: null
        },
        {
            id: 'STU002',
            name: 'Carol Davis',
            employeeId: 'STU002',
            type: 'student',
            department: 'marketing',
            status: 'inactive',
            email: 'carol.davis@university.edu',
            phone: '+1234567892',
            lastAttendance: '2024-09-13 10:15:00',
            photo: null
        },
        {
            id: 'EMP002',
            name: 'David Wilson',
            employeeId: 'EMP002',
            type: 'worker',
            department: 'finance',
            status: 'active',
            email: 'david.wilson@company.com',
            phone: '+1234567893',
            lastAttendance: '2024-09-14 09:00:00',
            photo: null
        }
    ];

    attendanceRecords = [
        {
            id: 1,
            userId: 'STU001',
            userName: 'Alice Johnson',
            employeeId: 'STU001',
            date: '2024-09-14',
            checkIn: '09:30:00',
            checkOut: null,
            status: 'present',
            confidence: 0.96,
            duration: null
        },
        {
            id: 2,
            userId: 'EMP001',
            userName: 'Bob Smith',
            employeeId: 'EMP001',
            date: '2024-09-14',
            checkIn: '08:45:00',
            checkOut: null,
            status: 'present',
            confidence: 0.94,
            duration: null
        },
        {
            id: 3,
            userId: 'EMP002',
            userName: 'David Wilson',
            employeeId: 'EMP002',
            date: '2024-09-14',
            checkIn: '09:00:00',
            checkOut: null,
            status: 'present',
            confidence: 0.92,
            duration: null
        }
    ];

    securityAlerts = [
        {
            id: 1,
            type: 'mask_detected',
            message: 'Mask detected during attendance marking',
            userId: 'STU001',
            userName: 'Alice Johnson',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            severity: 'warning',
            resolved: false
        },
        {
            id: 2,
            type: 'duplicate_attempt',
            message: 'Multiple attendance attempts detected',
            userId: 'EMP001',
            userName: 'Bob Smith',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            severity: 'high',
            resolved: false
        },
        {
            id: 3,
            type: 'spoofing_detected',
            message: 'Potential spoofing attempt detected',
            userId: 'unknown',
            userName: 'Unknown User',
            timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            severity: 'critical',
            resolved: false
        }
    ];

    filteredUsers = [...allUsers];
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Sidebar toggle
    document.querySelector('.sidebar-toggle').addEventListener('click', toggleSidebar);

    // Settings sliders
    const confidenceSlider = document.getElementById('confidenceThreshold');
    if (confidenceSlider) {
        confidenceSlider.addEventListener('input', (e) => {
            document.getElementById('confidenceValue').textContent = 
                Math.round(e.target.value * 100) + '%';
        });
    }
}

function switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard Overview',
        users: 'Users Management',
        attendance: 'Attendance Records',
        alerts: 'Security Alerts',
        reports: 'Reports & Analytics',
        settings: 'System Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName];

    currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
        case 'users':
            loadUsersTable();
            break;
        case 'attendance':
            loadAttendanceTable();
            break;
        case 'alerts':
            loadSecurityAlerts();
            break;
    }
}

function loadDashboardData() {
    // Update statistics
    const presentToday = attendanceRecords.filter(r => r.status === 'present').length;
    const lateToday = attendanceRecords.filter(r => r.status === 'late').length;
    const absentToday = allUsers.length - presentToday - lateToday;

    document.getElementById('presentToday').textContent = presentToday;
    document.getElementById('lateToday').textContent = lateToday;
    document.getElementById('absentToday').textContent = absentToday;
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('onlineUsers').textContent = presentToday;
    document.getElementById('alertCount').textContent = securityAlerts.filter(a => !a.resolved).length;

    // Load recent activity
    loadRecentActivity();
    loadSecurityAlertsPreview();
}

function loadRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    const recentActivities = [
        {
            user: 'Alice Johnson',
            action: 'marked attendance',
            time: '2 minutes ago',
            icon: 'fa-check-circle',
            color: 'success'
        },
        {
            user: 'Bob Smith',
            action: 'attempted duplicate attendance',
            time: '15 minutes ago',
            icon: 'fa-exclamation-triangle',
            color: 'warning'
        },
        {
            user: 'David Wilson',
            action: 'marked attendance',
            time: '30 minutes ago',
            icon: 'fa-check-circle',
            color: 'success'
        }
    ];

    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.color}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p><strong>${activity.user}</strong> ${activity.action}</p>
                <small>${activity.time}</small>
            </div>
        </div>
    `).join('');
}

function loadSecurityAlertsPreview() {
    const alertsList = document.getElementById('securityAlerts');
    const recentAlerts = securityAlerts.slice(0, 3);

    alertsList.innerHTML = recentAlerts.map(alert => `
        <div class="alert-item ${alert.severity}">
            <div class="alert-icon">
                <i class="fas ${getAlertIcon(alert.type)}"></i>
            </div>
            <div class="alert-content">
                <p><strong>${alert.userName}</strong></p>
                <small>${alert.message}</small>
                <div class="alert-time">${formatTimeAgo(alert.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);

    tbody.innerHTML = pageUsers.map(user => `
        <tr>
            <td>
                <input type="checkbox" class="user-checkbox" value="${user.id}">
            </td>
            <td>
                <div class="user-photo">
                    <i class="fas fa-user"></i>
                </div>
            </td>
            <td>
                <div class="user-info">
                    <strong>${user.name}</strong>
                    <small>${user.email}</small>
                </div>
            </td>
            <td>${user.employeeId}</td>
            <td>
                <span class="type-badge ${user.type}">${user.type}</span>
            </td>
            <td>${user.department}</td>
            <td>
                <span class="status-badge ${user.status}">${user.status}</span>
            </td>
            <td>${formatDateTime(user.lastAttendance)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn view" onclick="viewUser('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updatePagination();
}

function loadAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    const records = allAttendance.length > 0 ? allAttendance : attendanceRecords;
    
    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${record.date}</td>
            <td>
                <div class="user-info">
                    <strong>${record.user_name || record.userName}</strong>
                    <small>${record.user_id || record.employeeId}</small>
                </div>
            </td>
            <td>${record.user_id || record.employeeId}</td>
            <td>${record.time || record.checkIn || '-'}</td>
            <td>${record.checkOut || 'Still Present'}</td>
            <td>${calculateDuration(record.time || record.checkIn, record.checkOut)}</td>
            <td>
                <span class="status-badge ${record.status}">${record.status}</span>
            </td>
            <td>${Math.round((record.confidence || record.liveness_score || 0.95) * 100)}%</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewAttendanceDetails('${record.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editAttendance('${record.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadSecurityAlerts() {
    const container = document.getElementById('alertsContainer');
    
    container.innerHTML = securityAlerts.map(alert => `
        <div class="security-alert ${alert.severity} ${alert.resolved ? 'resolved' : ''}">
            <div class="alert-header">
                <div class="alert-type">
                    <i class="fas ${getAlertIcon(alert.type)}"></i>
                    <span>${formatAlertType(alert.type)}</span>
                </div>
                <div class="alert-actions">
                    ${!alert.resolved ? `
                        <button class="btn btn-sm btn-primary" onclick="resolveAlert(${alert.id})">
                            <i class="fas fa-check"></i>
                            Resolve
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-secondary" onclick="viewAlertDetails(${alert.id})">
                        <i class="fas fa-eye"></i>
                        Details
                    </button>
                </div>
            </div>
            <div class="alert-body">
                <h4>${alert.userName} (${alert.userId})</h4>
                <p>${alert.message}</p>
                <div class="alert-meta">
                    <span class="alert-time">
                        <i class="fas fa-clock"></i>
                        ${formatDateTime(alert.timestamp)}
                    </span>
                    <span class="alert-severity severity-${alert.severity}">
                        ${alert.severity.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// User Management Functions
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('active');
    document.getElementById('addUserForm').reset();
}

function addUser() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    
    const newUser = {
        id: generateUserId(formData.get('userType')),
        name: formData.get('name'),
        employeeId: formData.get('employeeId'),
        type: formData.get('userType'),
        department: formData.get('department'),
        status: 'active',
        email: formData.get('email'),
        phone: formData.get('phone'),
        lastAttendance: null,
        photo: null
    };

    allUsers.push(newUser);
    filteredUsers = [...allUsers];
    
    showToast('success', 'User Added', `${newUser.name} has been added successfully`);
    closeAddUserModal();
    
    if (currentSection === 'users') {
        loadUsersTable();
    }
    
    updateDashboardStats();
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        showToast('info', 'Edit User', `Editing ${user.name} - Feature coming soon`);
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        allUsers = allUsers.filter(u => u.id !== userId);
        filteredUsers = filteredUsers.filter(u => u.id !== userId);
        
        showToast('success', 'User Deleted', 'User has been deleted successfully');
        
        if (currentSection === 'users') {
            loadUsersTable();
        }
        
        updateDashboardStats();
    }
}

function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        showToast('info', 'View User', `Viewing ${user.name} - Feature coming soon`);
    }
}

// Filter and Search Functions
function filterUsers() {
    const typeFilter = document.getElementById('userTypeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredUsers = allUsers.filter(user => {
        const typeMatch = typeFilter === 'all' || user.type === typeFilter;
        const statusMatch = statusFilter === 'all' || user.status === statusFilter;
        return typeMatch && statusMatch;
    });
    
    currentPage = 1;
    loadUsersTable();
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    
    filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.employeeId.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    loadUsersTable();
}

// Attendance Functions
async function downloadAttendance() {
    try {
        const response = await fetch('http://localhost:8000/admin/attendance/download');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'attendance_records.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showToast('success', 'Download Started', 'Attendance report is being downloaded');
        } else {
            throw new Error('Download failed');
        }
    } catch (error) {
        console.error('Download error:', error);
        // Fallback to local CSV generation
        const csvContent = generateAttendanceCSV();
        downloadCSV(csvContent, 'attendance_report.csv');
        showToast('success', 'Download Started', 'Attendance report is being downloaded');
    }
}

async function refreshAttendance() {
    try {
        const response = await fetch('http://localhost:8000/admin/attendance/all');
        allAttendance = await response.json();
        attendanceRecords = allAttendance;
        
        if (currentSection === 'attendance') {
            loadAttendanceTable();
        }
        
        showToast('success', 'Refreshed', 'Attendance data has been refreshed');
    } catch (error) {
        console.error('Refresh error:', error);
        showToast('error', 'Error', 'Failed to refresh attendance data');
    }
}

function generateAttendanceCSV() {
    const headers = ['Date', 'Name', 'Employee ID', 'Check In', 'Check Out', 'Duration', 'Status', 'Confidence'];
    const rows = attendanceRecords.map(record => [
        record.date,
        record.userName,
        record.employeeId,
        record.checkIn || '',
        record.checkOut || '',
        calculateDuration(record.checkIn, record.checkOut),
        record.status,
        Math.round(record.confidence * 100) + '%'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Alert Functions
function resolveAlert(alertId) {
    const alert = securityAlerts.find(a => a.id === alertId);
    if (alert) {
        alert.resolved = true;
        showToast('success', 'Alert Resolved', 'Security alert has been marked as resolved');
        
        if (currentSection === 'alerts') {
            loadSecurityAlerts();
        }
        
        updateDashboardStats();
    }
}

function clearAllAlerts() {
    if (confirm('Are you sure you want to clear all alerts?')) {
        securityAlerts.forEach(alert => alert.resolved = true);
        showToast('success', 'Alerts Cleared', 'All security alerts have been cleared');
        
        if (currentSection === 'alerts') {
            loadSecurityAlerts();
        }
        
        updateDashboardStats();
    }
}

// Settings Functions
function saveSettings() {
    const settings = {
        confidenceThreshold: document.getElementById('confidenceThreshold').value,
        maskDetection: document.getElementById('maskDetection').checked,
        livenessDetection: document.getElementById('livenessDetection').checked,
        duplicateAlerts: document.getElementById('duplicateAlerts').checked,
        maskAlerts: document.getElementById('maskAlerts').checked,
        spoofingAlerts: document.getElementById('spoofingAlerts').checked
    };
    
    localStorage.setItem('secureAttendSettings', JSON.stringify(settings));
    showToast('success', 'Settings Saved', 'System settings have been updated');
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        localStorage.removeItem('secureAttendSettings');
        location.reload();
    }
}

// Utility Functions
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('currentTime').textContent = timeString;
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
}

function calculateDuration(checkIn, checkOut) {
    if (!checkIn) return '-';
    if (!checkOut) return 'In Progress';
    
    const start = new Date(`2024-01-01 ${checkIn}`);
    const end = new Date(`2024-01-01 ${checkOut}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    return `${diffHours}h ${diffMins}m`;
}

function getAlertIcon(type) {
    const icons = {
        mask_detected: 'fa-mask',
        duplicate_attempt: 'fa-copy',
        spoofing_detected: 'fa-user-secret',
        unauthorized_access: 'fa-ban'
    };
    return icons[type] || 'fa-exclamation-triangle';
}

function formatAlertType(type) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function generateUserId(type) {
    const prefix = type === 'student' ? 'STU' : 'EMP';
    const count = allUsers.filter(u => u.id.startsWith(prefix)).length + 1;
    return `${prefix}${count.toString().padStart(3, '0')}`;
}

function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                      type === 'error' ? 'fa-times-circle' : 
                      type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function updateDashboardStats() {
    const presentToday = attendanceRecords.filter(r => r.status === 'present').length;
    const lateToday = attendanceRecords.filter(r => r.status === 'late').length;
    const absentToday = allUsers.length - presentToday - lateToday;
    const unresolved = securityAlerts.filter(a => !a.resolved).length;

    document.getElementById('presentToday').textContent = presentToday;
    document.getElementById('lateToday').textContent = lateToday;
    document.getElementById('absentToday').textContent = absentToday;
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('onlineUsers').textContent = presentToday;
    document.getElementById('alertCount').textContent = unresolved;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startRecord = (currentPage - 1) * usersPerPage + 1;
    const endRecord = Math.min(currentPage * usersPerPage, filteredUsers.length);
    
    document.getElementById('showingStart').textContent = startRecord;
    document.getElementById('showingEnd').textContent = endRecord;
    document.getElementById('totalRecords').textContent = filteredUsers.length;
    
    // Update page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    } else if (typeof direction === 'number') {
        currentPage = direction;
    }
    
    loadUsersTable();
}

// Import session utility from auth.js
function getCurrentSession() {
    const session = localStorage.getItem('secureAttendSession') || 
                   sessionStorage.getItem('secureAttendSession');
    
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const now = new Date();
            const expires = new Date(sessionData.expiresAt);
            
            if (now < expires) {
                return sessionData;
            }
        } catch (error) {
            console.error('Session parsing error:', error);
        }
    }
    
    return null;
}

function logout() {
    localStorage.removeItem('secureAttendSession');
    sessionStorage.removeItem('secureAttendSession');
    window.location.href = 'login.html';
}
