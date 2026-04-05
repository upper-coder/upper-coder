/**
 * EXPERIMENT CONTROLLER
 * Main orchestrator for the entire experiment
 * STATUS: OUTLINE
 */

class Experiment {
    constructor() {
        this.state = {
            phase: 'INIT', // INIT, TUTORIAL, FREE_PLAY, COMPLETE
            condition: null,
            participantId: null,
            startTime: null,
            tutorialStep: 0
        };
        
        this.data = {
            tutorial: {},
            freePlay: {},
            tracking: []
        };
        
        // Component references (will be initialized)
        this.clock = null;
        this.emailSystem = null;
        this.taskSystem = null;
        this.tutorial = null;
        this.overlay = null;
        this.tracker = null;
    }

    /**
     * Initialize experiment
     */
    async init() {
        console.log('Initializing experiment...');
        
        // TODO: Assign condition (random or from URL param)
        this.assignCondition();
        
        // TODO: Generate participant ID
        this.generateParticipantId();
        
        // TODO: Load appropriate email pool based on condition
        await this.loadEmailPool();
        
        // TODO: Initialize all components
        this.initializeComponents();
        
        // TODO: Set up event listeners
        this.setupEventListeners();
        
        console.log('Experiment initialized', this.state);
    }

    /**
     * Assign experimental condition
     */
    assignCondition() {
        // TODO: Implement randomization or URL parameter reading
        // For now, placeholder:
        this.state.condition = 'PLACEHOLDER_CONDITION';
    }

    /**
     * Generate unique participant ID
     */
    generateParticipantId() {
        // TODO: Implement ID generation
        this.state.participantId = 'P_' + Date.now();
    }

    /**
     * Load email pool based on condition
     */
    async loadEmailPool() {
        // TODO: Fetch appropriate emails from data/emails.json
        console.log('Loading email pool for condition:', this.state.condition);
    }

    /**
     * Initialize all system components
     */
    initializeComponents() {
        // TODO: Initialize each component
        // this.clock = new Clock();
        // this.emailSystem = new EmailSystem();
        // etc.
    }

    /**
     * Set up event listeners for UI
     */
    setupEventListeners() {
        // TODO: Attach listeners to Work and Game buttons
        // TODO: Attach any other necessary UI listeners
    }

    /**
     * Start tutorial phase
     */
    startTutorial() {
        console.log('Starting tutorial...');
        this.state.phase = 'TUTORIAL';
        // TODO: Initialize tutorial system
        // this.tutorial.start();
    }

    /**
     * Start free play phase
     */
    startFreePlay() {
        console.log('Starting free play...');
        this.state.phase = 'FREE_PLAY';
        this.state.startTime = Date.now();
        
        // TODO: Start clock
        // this.clock.start();
        
        // TODO: Schedule critical emails
        // this.scheduleriticalEmails();
        
        // TODO: Start tracking
        // this.tracker.startTracking();
    }

    /**
     * End experiment and show exit survey
     */
    endExperiment() {
        console.log('Ending experiment...');
        this.state.phase = 'COMPLETE';
        
        // TODO: Stop clock
        // this.clock.stop();
        
        // TODO: Save all data
        // this.saveData();
        
        // TODO: Redirect to exit survey or show built-in survey
    }

    /**
     * Save all collected data
     */
    async saveData() {
        // TODO: Send data to DataPipe
        console.log('Saving data...', this.data);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.experiment = new Experiment();
    window.experiment.init();
});

// TEMPORARY TEST CODE - Testing email system
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Testing clock and email systems...');
    
    // Create test experiment object
    window.experiment = {
        state: { condition: 'test_condition' },
        tracker: null,
        overlay: null
    };
    
    // Start clock
    const testClock = new Clock();
    testClock.start();
    window.experiment.clock = testClock;
    
    // Create and test email system
    const emailSystem = new EmailSystem(window.experiment);
    await emailSystem.loadEmails('test_condition');
    emailSystem.deliverInitialEmails();
    
    window.experiment.emailSystem = emailSystem;
    
    console.log('Email system loaded! Try clicking on emails.');
});