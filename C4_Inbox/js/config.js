/**
 * EXPERIMENT CONFIGURATION
 * Central configuration file for all experimental parameters
 * STATUS: OUTLINE - Fill in actual values
 */

const CONFIG = {
    // ============================================
    // TIMING PARAMETERS
    // ============================================
    REAL_DURATION_MINUTES: 20,
    SIM_START_HOUR: 8,
    SIM_START_MINUTE: 45,
    SIM_END_HOUR: 17,
    SIM_END_MINUTE: 0,
    
    // Calculated automatically
    get SIM_DURATION_MINUTES() {
        return (this.SIM_END_HOUR * 60 + this.SIM_END_MINUTE) - 
               (this.SIM_START_HOUR * 60 + this.SIM_START_MINUTE);
    },
    
    get TIME_RATIO() {
        return this.SIM_DURATION_MINUTES / this.REAL_DURATION_MINUTES;
    },

    // ============================================
    // CRITICAL EMAIL TIMING
    // ============================================
    CRITICAL_EMAIL_WINDOW: {
        minMinute: 5,    // earliest real minute
        maxMinute: 15    // latest real minute
    },

    // ============================================
    // DATA COLLECTION
    // ============================================
    DATAPIPE_SESSION: 'YOUR_SESSION_ID', // TODO: Fill from OSF
    
    // ============================================
    // EXPERIMENTAL CONDITIONS
    // ============================================
    CONDITIONS: {
        // TODO: Define your condition names
        // Example: 'high_competition', 'high_cooperation', 'control'
    },

    // ============================================
    // TASK PARAMETERS
    // ============================================
    TASK_POOL_SIZE: 50, // TODO: Decide final number
    PRACTICE_TASKS: 1,

    // ============================================
    // TUTORIAL SETTINGS
    // ============================================
    GAME_MIN_DURATION: 60000, // 1 minute in milliseconds
    
    // ============================================
    // DEBUG MODE
    // ============================================
    DEBUG: true, // Set to false for production
    DEBUG_SPEED_MULTIPLIER: 1 // Increase to speed up time in testing
};

// Freeze config to prevent accidental modification
Object.freeze(CONFIG);