// SCORM API wrapper and tracking for MuJoCo simulation
let API = null;
let initialized = false;

// Find SCORM API
function findAPI(win) {
    let findAttempts = 0;
    while ((!win.API && !win.API_1484_11) &&
           (win.parent && win.parent != win) &&
           (findAttempts < 500)) {
        findAttempts++;
        win = win.parent;
    }
    return win.API || win.API_1484_11;
}

// Initialize SCORM connection
function initSCORM() {
    if (initialized) return true;

    // Search for SCORM API
    API = findAPI(window);
    
    if (!API) {
        console.warn("SCORM API not found - running in standalone mode");
        return false;
    }

    // Initialize communication with LMS
    const result = API.LMSInitialize("");
    if (result === "true" || result === true) {
        initialized = true;
        // Set initial status
        API.LMSSetValue("cmi.core.lesson_status", "incomplete");
        API.LMSSetValue("cmi.core.score.min", "0");
        API.LMSSetValue("cmi.core.score.max", "100");
        API.LMSCommit("");
        return true;
    }
    
    console.error("Failed to initialize SCORM API");
    return false;
}

// Track simulation progress
function trackProgress(progress) {
    if (!initialized) return;
    
    // Update progress
    API.LMSSetValue("cmi.core.score.raw", Math.round(progress * 100));
    
    // Mark as completed if progress is 100%
    if (progress >= 1.0) {
        API.LMSSetValue("cmi.core.lesson_status", "completed");
    }
    
    API.LMSCommit("");
}

// Track simulation completion
function trackCompletion(success = true) {
    if (!initialized) return;
    
    API.LMSSetValue("cmi.core.lesson_status", success ? "completed" : "failed");
    API.LMSCommit("");
}

// Clean up SCORM connection
function terminateSCORM() {
    if (!initialized) return;
    
    API.LMSFinish("");
    initialized = false;
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    terminateSCORM();
});

// Export SCORM tracking functions
export const SCORMTracker = {
    init: initSCORM,
    trackProgress,
    trackCompletion,
    terminate: terminateSCORM
};
