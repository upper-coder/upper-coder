/**
 * EXPERIMENT CONTROLLER
 * Main orchestrator for the entire experiment
 * STATUS: IMPLEMENTED
 */

class Experiment {
    constructor() {
        this.state = {
            phase: 'INIT', // INIT, TUTORIAL, FREE_PLAY, COMPLETE
            condition: null,
            inconsistency: null,
            mindset: null,
            participantId: null,
            startTime: null,
            tutorialStep: 0
        };
        
        this.data = {
            tutorial: {},
            freePlay: {},
            tracking: []
        };
        
        // Component references
        this.clock = null;
        this.emailSystem = null;
        this.taskSystem = null;
        this.tutorial = null;
        this.overlay = null;
        this.tracker = null;
        this.panelManager = null;
        
        // Condition list for balanced randomization
        this.conditionList = [
            'none_coop_paradox',
            'none_coop_control',
            'none_comp_paradox',
            'none_comp_control',
            'low_paradox',
            'low_control',
            'high_paradox',
            'high_control'
        ];
        
        // Counter for balanced assignment (stored in localStorage)
        this.conditionCounterKey = 'experiment_condition_counter';
    }

    /**
     * Initialize experiment
     */
    async init() {
        console.log('Initializing experiment...');
        
        // Assign condition
        this.assignCondition();
        
        // Generate participant ID
        this.generateParticipantId();
        
        // Initialize all components
        await this.initializeComponents();
        
        console.log('Experiment initialized', this.state);
        
        // Start tutorial after brief delay
        setTimeout(() => {
            this.startTutorial();
        }, 1000);
    }

    /**
     * Assign experimental condition (balanced randomization with URL override)
     */
    assignCondition() {
        // Check for URL parameter override (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        const urlCondition = urlParams.get('condition');
        
        if (urlCondition && this.conditionList.includes(urlCondition)) {
            // Use URL-specified condition
            this.state.condition = urlCondition;
            console.log('⚙️ Condition set from URL:', urlCondition);
        } else {
            // Balanced randomization
            this.state.condition = this.getBalancedCondition();
            console.log('🎲 Condition randomly assigned:', this.state.condition);
        }
        
        // Parse condition into factors
        this.parseCondition();
        
        console.log('Assigned condition:', {
            condition: this.state.condition,
            inconsistency: this.state.inconsistency,
            mindset: this.state.mindset
        });
    }

    /**
     * Get balanced condition assignment
     * Uses round-robin to ensure equal distribution across conditions
     */
    getBalancedCondition() {
        // Get current counter from localStorage
        let counter = parseInt(localStorage.getItem(this.conditionCounterKey) || '0');
        
        // Assign condition based on counter
        const conditionIndex = counter % this.conditionList.length;
        const assignedCondition = this.conditionList[conditionIndex];
        
        // Increment and save counter
        counter++;
        localStorage.setItem(this.conditionCounterKey, counter.toString());
        
        return assignedCondition;
    }

    /**
     * Parse condition string into factors
     */
    parseCondition() {
        const condition = this.state.condition;
        
        // Extract inconsistency level
        if (condition.startsWith('none_coop')) {
            this.state.inconsistency = 'none_coop';
        } else if (condition.startsWith('none_comp')) {
            this.state.inconsistency = 'none_comp';
        } else if (condition.startsWith('low')) {
            this.state.inconsistency = 'low';
        } else if (condition.startsWith('high')) {
            this.state.inconsistency = 'high';
        }
        
        // Extract mindset condition
        if (condition.endsWith('paradox')) {
            this.state.mindset = 'paradox';
        } else if (condition.endsWith('control')) {
            this.state.mindset = 'control';
        }
    }

    /**
     * Generate unique participant ID
     */
    generateParticipantId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        this.state.participantId = `P_${timestamp}_${random}`;
        
        console.log('Participant ID:', this.state.participantId);
    }

    /**
     * Initialize all system components
     */
    async initializeComponents() {
        // Start clock but immediately pause it (tutorial will control it)
        this.clock = new Clock();
        this.clock.start();
        this.clock.pause();
        
        // Create overlay system
        this.overlay = new Overlay(this);
        
        // Create and load email system with condition-specific emails
        this.emailSystem = new EmailSystem(this);
        await this.emailSystem.loadEmails(this.state.condition);
        this.emailSystem.deliverInitialEmails();
        
        // Create task system
        this.taskSystem = new TaskSystem(this);
        
        // Create tracking system
        this.tracker = new Tracker(this);
        
        // Create panel system
        this.panelManager = new PanelManager(this);
        
        // Create tutorial system
        this.tutorial = new Tutorial(this);
        
        console.log('✓ All systems initialized');
    }

    /**
     * Start tutorial phase
     */
    startTutorial() {
        console.log('Starting tutorial...');
        this.state.phase = 'TUTORIAL';
        this.tutorial.start();
    }

    /**
     * Start free play phase
     */
startFreePlay() {    
    console.log('Starting free play...');
    this.state.phase = 'FREE_PLAY';
    this.state.startTime = Date.now();
        
        // Enable tracking when free play starts
        if (this.tracker) {
            this.tracker.startTracking();
            console.log('✓ Tracking enabled');
        }
        
        // Enable navigation
        if (this.panelManager) {
            this.panelManager.enableNavigation();
            console.log('✓ Navigation enabled');
        }
        
        // Start fresh task session (clear practice task, generate new one)
        if (this.taskSystem) {
            this.taskSystem.startFreshSession();
            console.log('✓ Task session reset');
        }
        
        // Schedule critical emails (5-15 minutes into free play)
        this.scheduleCriticalEmails();
        
        console.log('✓ Free play active - all systems running');
    }

    /**
     * Schedule critical emails at random times
     */
scheduleCriticalEmails() {
    // Don't schedule if tutorial is still active
    if (this.tutorial && this.tutorial.isActive) {
        console.log('⚠️ Tutorial still active, delaying email scheduling...');
        setTimeout(() => this.scheduleCriticalEmails(), 1000);
        return;
    }
    
    // Random times between 5 and 15 minutes (in real time)
    const minDelay = 5  * 50 * 1000; // 5 minutes
    const maxDelay = 15 * 60 *  1000; // 15 minutes
    
    // Random delay for prosocial email
    const prosocialDelay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    // Random delay for competition email
    const competitionDelay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    // Schedule prosocial email
    setTimeout(() => {
        if (this.emailSystem && this.state.phase === 'FREE_PLAY') {
            this.emailSystem.deliverEmail('prosocial_email', true);
            console.log('📧 Prosocial email delivered');
        }
    }, prosocialDelay);
    
    // Schedule competition email
    setTimeout(() => {
        if (this.emailSystem && this.state.phase === 'FREE_PLAY') {
            this.emailSystem.deliverEmail('competition_email', true);
            console.log('📧 Competition email delivered');
        }
    }, competitionDelay);
    
    console.log(`📅 Critical emails scheduled:`);
    console.log(`   - Prosocial: ${Math.round(prosocialDelay/1000)}s (${Math.round(prosocialDelay/60000)} min)`);
    console.log(`   - Competition: ${Math.round(competitionDelay/1000)}s (${Math.round(competitionDelay/60000)} min)`);
}

    /**
     * End experiment and show exit survey
     */
    endExperiment() {
        console.log('Ending experiment...');
        this.state.phase = 'COMPLETE';
        
        // Stop clock
        if (this.clock) {
            this.clock.stop();
        }
        
        // Stop tracking
        if (this.tracker) {
            this.tracker.stopTracking();
        }
        
        // Save all data
        this.saveData();
        
        // Show completion message (TODO: redirect to exit survey)
        alert('Experiment complete! Thank you for participating.\n\nYour data has been saved.');
        
        // TODO: Redirect to exit survey or show built-in survey
        console.log('TODO: Redirect to exit survey');
    }

    /**
     * Save all collected data
     */
    async saveData() {
        console.log('Saving data...');
        
        // Compile all data
        const experimentData = {
            participant: {
                id: this.state.participantId,
                condition: this.state.condition,
                inconsistency: this.state.inconsistency,
                mindset: this.state.mindset
            },
            timeline: {
                startTime: this.state.startTime,
                endTime: Date.now(),
                duration: Date.now() - this.state.startTime
            },
            tutorial: this.data.tutorial,
            tracking: this.tracker ? this.tracker.getAllData() : {},
            emails: this.emailSystem ? this.emailSystem.getTrackingData() : {},
            timestamp: new Date().toISOString()
        };
        
        console.log('Experiment data compiled:', experimentData);
        
        // TODO: Send to DataPipe
        if (this.tracker) {
            await this.tracker.exportToDataPipe();
        }
        
        // Also save to localStorage as backup
        localStorage.setItem(`experiment_data_${this.state.participantId}`, JSON.stringify(experimentData));
        console.log('✓ Data saved to localStorage as backup');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.experiment = new Experiment();
    window.experiment.init();
});