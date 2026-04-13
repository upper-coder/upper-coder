/**
 * EXPERIMENT CONTROLLER
 * Main orchestrator for the entire experiment
 * STATUS: IMPLEMENTED
 */

class Experiment {
    constructor() {
        this.state = {
            phase: 'INIT', // INIT, CONSENT, INTRO, TUTORIAL, FREE_PLAY, COMPLETE
            condition: null,
            inconsistency: null,
            mindset: null,
            participantId: null,
            startTime: null,
            tutorialStep: 0
        };
        
        this.data = {
            consent: {},
            tutorial: {},
            freePlay: {},
            tracking: []
        };
        
        // Component references (initialized later)
        this.consentForm = null;
        this.introPages = null; // TODO: Will be implemented later
        this.clock = null;
        this.emailSystem = null;
        this.taskSystem = null;
        this.tutorial = null;
        this.overlay = null;
        this.tracker = null;
        this.panelManager = null;
        this.dataPipe = null;
        this.survey = null;
        
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
        
        this.state.phase = 'CONSENT';
        
        // Assign condition
        this.assignCondition();
        
        // Generate participant ID
        this.generateParticipantId();
        
        // Initialize basic systems
        this.initializeBasicSystems();
        
        console.log('Experiment initialized', this.state);
        
        // Show consent form first
        this.consentForm.show();
        
        // Everything else happens after consent in startAfterConsent()
    }

    /**
     * Initialize basic systems (consent, datapipe, survey)
     */
    initializeBasicSystems() {
        // Initialize consent form
        this.consentForm = new ConsentForm(this);
        
        // Initialize DataPipe
        this.dataPipe = new DataPipe(this);
        
        // Initialize survey
        this.survey = new Survey(this);
        
        console.log('✓ Basic systems initialized');
    }

    /**
     * Start experiment after consent (and intro pages when implemented)
     * Called by consent form or intro pages
     */
/**
 * Start experiment after consent
 * Called by consent form
 */
async startAfterConsent() {
    console.log('Starting intro pages...');
    
    // Initialize intro pages
    this.introPages = new IntroPages(this);
    
    // Show intro pages
    this.introPages.start();
}

/**
 * Start experiment after intro pages
 * Called by intro pages
 */
async startAfterIntro() {
    console.log('Starting experiment after intro pages...');
    
    this.state.phase = 'TUTORIAL';
    
    // Initialize all experiment components
    await this.initializeExperimentComponents();
    
    // Load emails for this condition
    const emailsLoaded = await this.emailSystem.loadEmails(this.state.condition);
    
    if (!emailsLoaded) {
        console.error('Failed to load emails');
        alert('Error loading experiment content. Please refresh and try again.');
        return;
    }
    
    // Deliver initial emails to inbox
    this.emailSystem.deliverInitialEmails();
    
    // Start tutorial after brief delay
    setTimeout(() => {
        this.startTutorial();
    }, 1000);
    
    console.log('✓ Experiment started');
}

    /**
     * Initialize all experiment components (after consent)
     */
    async initializeExperimentComponents() {
        // Start clock but immediately pause it (tutorial will control it)
        this.clock = new Clock();
        this.clock.start();
        this.clock.pause();
        
        // Create overlay system
        this.overlay = new Overlay(this);
        
        // Create email system (emails loaded separately)
        this.emailSystem = new EmailSystem(this);
        
        // Create task system
        this.taskSystem = new TaskSystem(this);
        
        // Create tracking system
        this.tracker = new Tracker(this);
        
        // Create panel system
        this.panelManager = new PanelManager(this);
        
        // Create tutorial system
        this.tutorial = new Tutorial(this);
        
        console.log('✓ All experiment systems initialized');
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
        const minDelay = 2 * 60 * 1000; // 2 minutes
        const maxDelay = 5 * 60 * 1000; // 5 minutes
        
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
        
        // Start exit survey (which will handle data export on completion)
        if (this.survey) {
            console.log('Starting exit survey...');
            this.survey.start();
        } else {
            console.error('Survey system not initialized!');
            alert('Error: Survey system not found. Please contact the researcher.');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.experiment = new Experiment();
    window.experiment.init();
});