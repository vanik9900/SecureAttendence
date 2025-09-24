// User Dashboard JavaScript
let video = null;
let canvas = null;
let stream = null;
let isProcessing = false;
let attendanceMarked = false;
let currentUser = null;
let authToken = '';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupCamera();
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
    if (userData.role === 'Admin') {
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    currentUser = userData;
    authToken = userData.token;
    
    // Update user info
    document.getElementById('userName').textContent = userData.username || 'User';
    document.getElementById('userRole').textContent = userData.role || 'Employee';
    
    // Update today's date
    const today = new Date();
    document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Load user's attendance history
    loadAttendanceHistory();
    
    // Check if attendance already marked today
    checkTodayAttendance();
}

async function setupCamera() {
    try {
        updateCameraStatus('Requesting camera access...', 'info');
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        video = document.getElementById('video');
        video.srcObject = stream;
        
        video.addEventListener('loadedmetadata', () => {
            updateCameraStatus('Camera ready - Position your face in the frame', 'success');
            startFaceDetection();
        });

        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            updateCameraStatus('Camera error occurred', 'error');
        });

    } catch (error) {
        console.error('Camera access error:', error);
        updateCameraStatus('Camera access denied - Please allow camera permissions', 'error');
        showCameraFallback();
    }
}

function startFaceDetection() {
    // Simulate real-time face detection
    faceDetectionInterval = setInterval(() => {
        if (!isProcessing) {
            simulateFaceDetection();
        }
    }, 500);
}

function simulateFaceDetection() {
    // Simulate face detection logic
    const randomFactor = Math.random();
    
    // Simulate face detection (70% chance when user is present)
    faceDetected = randomFactor > 0.3;
    
    // Simulate mask detection (20% chance when face is detected)
    maskDetected = faceDetected && randomFactor > 0.8;
    
    // Simulate liveness detection (90% chance when face is detected)
    livenessVerified = faceDetected && randomFactor > 0.1;
    
    // Calculate confidence score
    confidenceScore = faceDetected ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3;

    updateDetectionIndicators();
    updateFaceGuide();
}

function updateDetectionIndicators() {
    const faceIndicator = document.getElementById('faceDetected');
    const livenessIndicator = document.getElementById('livenessCheck');
    const maskIndicator = document.getElementById('maskDetection');

    // Face detection indicator
    faceIndicator.className = `indicator ${faceDetected ? 'active' : ''}`;
    
    // Liveness indicator
    livenessIndicator.className = `indicator ${livenessVerified ? 'active' : ''}`;
    
    // Mask detection indicator
    maskIndicator.className = `indicator ${maskDetected ? 'warning' : faceDetected ? 'active' : ''}`;
    
    // Update capture button state
    const captureBtn = document.getElementById('captureBtn');
    if (attendanceMarked) {
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-check"></i><span>Already Marked</span>';
    } else if (maskDetected) {
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-mask"></i><span>Remove Mask</span>';
    } else if (faceDetected && livenessVerified) {
        captureBtn.disabled = false;
        captureBtn.innerHTML = '<i class="fas fa-camera"></i><span>Capture Attendance</span>';
    } else {
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-user"></i><span>Position Face</span>';
    }
}

function updateFaceGuide() {
    const faceGuide = document.getElementById('faceGuide');
    const guideText = document.getElementById('guideText');
    const scanLine = document.getElementById('scanLine');

    if (faceDetected) {
        faceGuide.classList.add('face-detected');
        scanLine.classList.add('active');
        
        if (maskDetected) {
            guideText.textContent = 'Please remove your mask';
            guideText.style.color = '#ffc107';
        } else if (livenessVerified) {
            guideText.textContent = 'Face detected - Ready to capture';
            guideText.style.color = '#00ff88';
        } else {
            guideText.textContent = 'Look directly at the camera';
            guideText.style.color = '#00ffff';
        }
    } else {
        faceGuide.classList.remove('face-detected');
        scanLine.classList.remove('active');
        guideText.textContent = 'Position your face here';
        guideText.style.color = '#00ffff';
    }
}

async function captureAttendance() {
    if (isProcessing || !faceDetected || !livenessVerified || maskDetected || attendanceMarked) {
        return;
    }

    try {
        isProcessing = true;
        
        // Hide other cards and show processing
        hideAllCards();
        document.getElementById('processingCard').classList.remove('hidden');
        
        // Stop face detection during processing
        if (faceDetectionInterval) {
            clearInterval(faceDetectionInterval);
        }

        // Simulate processing steps
        await simulateProcessingSteps();
        
        // Capture image
        const imageBlob = await captureImage();
        
        // Process attendance
        const result = await processAttendanceAPI(imageBlob);
        
        // Show result
        showResult(result);
        
        if (result.success) {
            attendanceMarked = true;
            updateAttendanceStatus(result);
            updateSummary(result);
            addToHistory(result);
            
            // Send alert to admin if needed
            if (result.alerts && result.alerts.length > 0) {
                sendAdminAlerts(result.alerts);
            }
        }
        
    } catch (error) {
        console.error('Attendance capture error:', error);
        showAlert({
            success: false,
            type: 'error',
            title: 'Capture Failed',
            message: 'An error occurred while processing your attendance. Please try again.',
            error: error.message
        });
    } finally {
        isProcessing = false;
        
        // Restart face detection if attendance not marked
        if (!attendanceMarked) {
            startFaceDetection();
        }
    }
}

async function simulateProcessingSteps() {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    for (let i = 0; i < steps.length; i++) {
        // Mark current step as active
        document.getElementById(steps[i]).classList.add('active');
        
        // Update progress
        const progress = ((i + 1) / steps.length) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        // Mark step as completed
        document.getElementById(steps[i]).classList.remove('active');
        document.getElementById(steps[i]).classList.add('completed');
    }
}

async function captureImage() {
    return new Promise((resolve) => {
        if (!canvas) {
            canvas = document.getElementById('canvas');
        }
        
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.8);
    });
}

async function processAttendanceAPI(imageBlob) {
    // Simulate API call to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate different scenarios based on detection results
    const scenarios = {
        success: 0.7,
        maskDetected: maskDetected ? 0.9 : 0,
        duplicateAttempt: attendanceMarked ? 0.8 : 0.05,
        spoofingDetected: !livenessVerified ? 0.6 : 0.02,
        lowConfidence: confidenceScore < 0.8 ? 0.4 : 0.1
    };
    
    const random = Math.random();
    
    if (scenarios.duplicateAttempt > random) {
        return {
            success: false,
            type: 'duplicate_attempt',
            title: 'Duplicate Attempt Detected',
            message: 'You have already marked your attendance today.',
            alerts: [{
                type: 'duplicate_attempt',
                userId: currentUser.id,
                userName: currentUser.name,
                message: `${currentUser.name} attempted to mark attendance multiple times`,
                severity: 'high'
            }]
        };
    }
    
    if (scenarios.maskDetected > random) {
        return {
            success: false,
            type: 'mask_detected',
            title: 'Mask Detected',
            message: 'Please remove your mask and try again for accurate facial recognition.',
            alerts: [{
                type: 'mask_detected',
                userId: currentUser.id,
                userName: currentUser.name,
                message: `Mask detected during attendance marking by ${currentUser.name}`,
                severity: 'warning'
            }]
        };
    }
    
    if (scenarios.spoofingDetected > random) {
        return {
            success: false,
            type: 'spoofing_detected',
            title: 'Liveness Check Failed',
            message: 'Please ensure you are looking directly at the camera and try again.',
            alerts: [{
                type: 'spoofing_detected',
                userId: currentUser.id,
                userName: currentUser.name,
                message: `Potential spoofing attempt detected from ${currentUser.name}`,
                severity: 'critical'
            }]
        };
    }
    
    if (scenarios.lowConfidence > random) {
        return {
            success: false,
            type: 'low_confidence',
            title: 'Recognition Failed',
            message: 'Face recognition confidence too low. Please ensure good lighting and try again.',
            confidence: confidenceScore
        };
    }
    
    // Success scenario
    return {
        success: true,
        type: 'success',
        title: 'Attendance Marked Successfully!',
        message: `Welcome ${currentUser.name}! Your attendance has been recorded.`,
        user_id: currentUser.id,
        user_name: currentUser.name,
        confidence: confidenceScore,
        timestamp: new Date().toISOString(),
        status: 'present'
    };
}

function showResult(result) {
    hideAllCards();
    
    if (result.success) {
        const resultCard = document.getElementById('resultCard');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        const resultTime = document.getElementById('resultTime');
        const resultConfidence = document.getElementById('resultConfidence');
        const resultStatus = document.getElementById('resultStatus');
        
        resultIcon.className = 'result-icon success';
        resultTitle.textContent = result.title;
        resultMessage.textContent = result.message;
        resultTime.textContent = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        resultConfidence.textContent = Math.round(result.confidence * 100) + '%';
        resultStatus.textContent = result.status || 'Present';
        
        resultCard.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            resultCard.classList.add('hidden');
        }, 5000);
        
    } else {
        showAlert(result);
    }
}

function showAlert(alert) {
    hideAllCards();
    
    const alertCard = document.getElementById('alertCard');
    const alertIcon = document.getElementById('alertIcon');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    
    alertTitle.textContent = alert.title;
    alertMessage.textContent = alert.message;
    
    // Set icon based on alert type
    const iconMap = {
        mask_detected: 'fa-mask',
        duplicate_attempt: 'fa-copy',
        spoofing_detected: 'fa-user-secret',
        low_confidence: 'fa-exclamation-triangle'
    };
    
    alertIcon.innerHTML = `<i class="fas ${iconMap[alert.type] || 'fa-exclamation-triangle'}"></i>`;
    
    alertCard.classList.remove('hidden');
}

function hideAllCards() {
    document.getElementById('processingCard').classList.add('hidden');
    document.getElementById('resultCard').classList.add('hidden');
    document.getElementById('alertCard').classList.add('hidden');
}

function retryAttendance() {
    hideAllCards();
    
    // Reset processing steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = '0%';
    
    // Restart face detection
    if (!attendanceMarked) {
        startFaceDetection();
    }
}

function contactSupport() {
    showNotification('info', 'Support Contact', 'Please contact your system administrator for assistance.');
}

function updateAttendanceStatus(result) {
    document.getElementById('attendanceStatus').textContent = 'Present';
    document.getElementById('attendanceStatus').style.color = '#00ff88';
    
    document.getElementById('checkInTime').textContent = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function updateSummary(result) {
    const checkInTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    document.getElementById('summaryCheckIn').textContent = checkInTime;
    
    // Calculate duration (assuming 8-hour workday)
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM start
    
    const duration = Math.max(0, now - startOfDay);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('summaryDuration').textContent = `${hours}h ${minutes}m`;
}

function addToHistory(result) {
    const historyList = document.getElementById('historyList');

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';

    const today = new Date();
    historyItem.innerHTML = `
        <div class="history-date">
            <div class="history-icon">
                <i class="fas fa-check"></i>
            </div>
            <div class="history-info">
                <h4>${today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                <p>Check-in: ${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
        </div>
        <div class="history-status">
            <span class="status-badge present">Present</span>
            <small>${Math.round(result.confidence * 100)}% confidence</small>
        </div>
    `;

    // Add to top of list
    historyList.insertBefore(historyItem, historyList.firstChild);
}

function sendAdminAlerts(alerts) {
    // Simulate sending alerts to admin dashboard
    alerts.forEach(alert => {
        console.log('Admin Alert:', alert);
        // In real implementation, this would send to backend API
    });
}

function checkTodayAttendance() {
    // Simulate checking if attendance already marked today
    const lastAttendance = localStorage.getItem(`attendance_${currentUser.id}_${new Date().toDateString()}`);
    
    if (lastAttendance) {
        attendanceMarked = true;
        const attendanceData = JSON.parse(lastAttendance);
        
        document.getElementById('attendanceStatus').textContent = 'Present';
        document.getElementById('attendanceStatus').style.color = '#00ff88';
        document.getElementById('checkInTime').textContent = attendanceData.checkInTime;
        document.getElementById('summaryCheckIn').textContent = attendanceData.checkInTime;
        
        // Update capture button
        const captureBtn = document.getElementById('captureBtn');
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-check"></i><span>Already Marked</span>';
    }
}

function loadUserData() {
    // Load sample history data
    const historyList = document.getElementById('historyList');
    const sampleHistory = [
        {
            date: 'Yesterday',
            checkIn: '09:15 AM',
            status: 'present',
            confidence: 94
        },
        {
            date: 'Tuesday',
            checkIn: '09:30 AM',
            status: 'late',
            confidence: 96
        },
        {
            date: 'Monday',
            checkIn: '08:45 AM',
            status: 'present',
            confidence: 98
        }
    ];
    
    sampleHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-date">
                <div class="history-icon">
                    <i class="fas ${item.status === 'present' ? 'fa-check' : item.status === 'late' ? 'fa-clock' : 'fa-times'}"></i>
                </div>
                <div class="history-info">
                    <h4>${item.date}</h4>
                    <p>Check-in: ${item.checkIn}</p>
                </div>
            </div>
            <div class="history-status">
                <span class="status-badge ${item.status}">${item.status}</span>
                <small>${item.confidence}% confidence</small>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

function setupEventListeners() {
    // Help modal
    window.showHelpModal = () => {
        document.getElementById('helpModal').classList.add('active');
    };
    
    window.closeHelpModal = () => {
        document.getElementById('helpModal').classList.remove('active');
    };
    
    // View full history
    window.viewFullHistory = () => {
        showNotification('info', 'Full History', 'Full history view coming soon!');
    };
}

function updateCameraStatus(message, type) {
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    
    statusText.textContent = message;
    
    // Update status dot color
    const colors = {
        success: '#00ff88',
        error: '#ff4757',
        warning: '#ffc107',
        info: '#00ffff'
    };
    
    statusDot.style.background = colors[type] || colors.info;
}

function showCameraFallback() {
    const cameraFrame = document.querySelector('.camera-frame');
    cameraFrame.innerHTML = `
        <div class="camera-fallback">
            <i class="fas fa-camera-slash"></i>
            <h3>Camera Not Available</h3>
            <p>Please allow camera access to mark attendance</p>
            <button class="btn btn-primary" onclick="location.reload()">
                <i class="fas fa-redo"></i>
                Retry Camera Access
            </button>
        </div>
    `;
}

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

function showNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-times-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    document.getElementById('notificationContainer').appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Utility functions
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
    // Stop camera stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    // Clear intervals
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
    }
    
    // Clear session
    localStorage.removeItem('secureAttendSession');
    sessionStorage.removeItem('secureAttendSession');
    
    window.location.href = 'login.html';
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
    }
});

// Make functions globally available
window.captureAttendance = captureAttendance;
window.retryAttendance = retryAttendance;
window.contactSupport = contactSupport;
window.logout = logout;
