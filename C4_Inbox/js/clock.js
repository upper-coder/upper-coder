/**
 * CLOCK SYSTEM
 * Manages simulated time progression
 * STATUS: IMPLEMENTED
 */

class Clock {
    constructor() {
        this.realStartTime = null;
        this.simStartTime = null; // Minutes since midnight
        this.isRunning = false;
        this.isPaused = false;
        this.pauseStartTime = null;
        this.totalPausedTime = 0; // Track cumulative paused time
        
        this.element = document.getElementById('clock-container');
        
        // Calculate sim start time in minutes since midnight
        this.simStartTime = CONFIG.SIM_START_HOUR * 60 + CONFIG.SIM_START_MINUTE;
        
        console.log('Clock initialized. Sim start:', this.formatTime(CONFIG.SIM_START_HOUR, CONFIG.SIM_START_MINUTE));
    }

    /**
     * Start the clock
     */
    start() {
        if (this.isRunning) {
            console.warn('Clock already running');
            return;
        }
        
        this.realStartTime = Date.now();
        this.isRunning = true;
        this.isPaused = false;
        this.totalPausedTime = 0;
        
        console.log('Clock started at', new Date(this.realStartTime).toISOString());
        this.tick();
    }

    /**
     * Pause the clock (for tutorial, etc.)
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            console.warn('Cannot pause - clock not running or already paused');
            return;
        }
        
        this.isPaused = true;
        this.pauseStartTime = Date.now();
        
        console.log('Clock paused');
    }

    /**
     * Resume from pause
     */
    resume() {
        if (!this.isRunning || !this.isPaused) {
            console.warn('Cannot resume - clock not paused');
            return;
        }
        
        // Calculate how long we were paused and add to total
        const pauseDuration = Date.now() - this.pauseStartTime;
        this.totalPausedTime += pauseDuration;
        
        this.isPaused = false;
        this.pauseStartTime = null;
        
        console.log('Clock resumed. Total paused time:', this.totalPausedTime, 'ms');
    }

    /**
     * Jump to a specific time (for 9am jump after video)
     */
    jumpTo(hours, minutes) {
        const targetMinutes = hours * 60 + minutes;
        const currentSimMinutes = this.simStartTime + this.getSimulatedMinutesElapsed();
        const jumpAmount = targetMinutes - currentSimMinutes;
        
        console.log(`Jumping from ${this.formatTimeFromMinutes(currentSimMinutes)} to ${this.formatTime(hours, minutes)}`);
        
        // Adjust the real start time to simulate the jump
        // We need to "rewind" real time so that the sim time appears to have jumped forward
        const realMinutesToSubtract = jumpAmount / CONFIG.TIME_RATIO;
        const msToSubtract = realMinutesToSubtract * 60 * 1000;
        
        this.realStartTime -= msToSubtract;
        
        // Force update display
        this.updateDisplay();
        
        console.log('Clock jumped successfully');
    }

    /**
     * Get elapsed real time (accounting for pauses)
     */
    getRealElapsedMs() {
        if (!this.realStartTime) return 0;
        
        const totalElapsed = Date.now() - this.realStartTime;
        const effectiveElapsed = totalElapsed - this.totalPausedTime;
        
        return effectiveElapsed;
    }

    /**
     * Get current simulated time in minutes since start
     */
    getSimulatedMinutesElapsed() {
        const realElapsedMs = this.getRealElapsedMs();
        const realElapsedMinutes = realElapsedMs / 1000 / 60;
        
        // Apply speed multiplier if in debug mode
        const speedMultiplier = CONFIG.DEBUG ? CONFIG.DEBUG_SPEED_MULTIPLIER : 1;
        const simElapsed = realElapsedMinutes * CONFIG.TIME_RATIO * speedMultiplier;
        
        return Math.floor(simElapsed);
    }

    /**
     * Get current simulated time as {hours, minutes}
     */
    getCurrentSimTime() {
        const simMinutesElapsed = this.getSimulatedMinutesElapsed();
        const totalMinutes = this.simStartTime + simMinutesElapsed;
        
        return {
            hours: Math.floor(totalMinutes / 60) % 24,
            minutes: totalMinutes % 60
        };
    }

    /**
     * Format time as display string (e.g., "9:15 AM")
     */
    formatTime(hours, minutes) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${period}`;
    }

    /**
     * Format time from total minutes since midnight
     */
    formatTimeFromMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return this.formatTime(hours, minutes);
    }

    /**
     * Update the display (called by tick)
     */
    updateDisplay() {
        const { hours, minutes } = this.getCurrentSimTime();
        const timeString = this.formatTime(hours, minutes);
        this.element.textContent = timeString;
    }

    /**
     * Main tick function (updates display continuously)
     */
    tick() {
        if (!this.isRunning) return;

        // Update display even when paused (shows current frozen time)
        this.updateDisplay();

        // Check if workday has ended
        if (!this.isPaused) {
            const simElapsed = this.getSimulatedMinutesElapsed();
            
            if (simElapsed >= CONFIG.SIM_DURATION_MINUTES) {
                this.stop();
                console.log('Workday ended at', this.getCurrentSimTime());
                
                // Trigger experiment end
                if (window.experiment) {
                    window.experiment.endExperiment();
                }
                return;
            }
        }

        // Continue ticking
        requestAnimationFrame(() => this.tick());
    }

    /**
     * Stop the clock
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('Clock stopped at', this.getCurrentSimTime());
    }

    /**
     * Get progress percentage (0-100)
     */
    getProgress() {
        const simElapsed = this.getSimulatedMinutesElapsed();
        const progress = Math.min((simElapsed / CONFIG.SIM_DURATION_MINUTES) * 100, 100);
        return progress;
    }

    /**
     * Get time remaining in simulated minutes
     */
    getTimeRemaining() {
        const simElapsed = this.getSimulatedMinutesElapsed();
        return Math.max(CONFIG.SIM_DURATION_MINUTES - simElapsed, 0);
    }

    /**
     * Debug info
     */
    getDebugInfo() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            realElapsedMs: this.getRealElapsedMs(),
            simElapsedMinutes: this.getSimulatedMinutesElapsed(),
            currentSimTime: this.getCurrentSimTime(),
            progress: this.getProgress(),
            timeRemaining: this.getTimeRemaining()
        };
    }
}