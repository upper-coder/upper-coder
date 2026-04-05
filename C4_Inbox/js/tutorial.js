/**
 * TUTORIAL SYSTEM
 * Spotlight/guided tutorial with step-by-step instructions
 * STATUS: OUTLINE
 */

class Tutorial {
    constructor(experiment) {
        this.experiment = experiment;
        this.currentStep = 0;
        this.steps = this.defineSteps();
        this.isActive = false;
        this.highlightedElement = null;
        
        this.createSpotlightElements();
    }

    /**
     * Create spotlight overlay elements
     */
    createSpotlightElements() {
        // TODO: Create dark overlay with transparent spotlight
        const spotlight = document.createElement('div');
        spotlight.id = 'tutorial-spotlight';
        spotlight.className = 'tutorial-spotlight hidden';
        spotlight.innerHTML = `
            <div class="tutorial-overlay"></div>
            <div class="tutorial-message-container">
                <div class="tutorial-message">
                    <div id="tutorial-text"></div>
                    <button id="tutorial-next" class="tutorial-btn">Next</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(spotlight);
        
        this.element = spotlight;
        this.overlayElement = spotlight.querySelector('.tutorial-overlay');
        this.textElement = document.getElementById('tutorial-text');
        this.nextButton = document.getElementById('tutorial-next');
        
        // TODO: Add click handler for next button
        this.nextButton.addEventListener('click', () => this.advance());
    }

    /**
     * Define all tutorial steps
     */
    defineSteps() {
        return [
            {
                id: 'welcome',
                message: 'Welcome! Let me show you around your workspace.',
                highlight: null,
                action: 'click_next'
            },
            {
                id: 'email_list',
                message: 'Here are your emails. Please read all of them before continuing.',
                highlight: '#email-list',
                action: 'read_all_emails',
                validation: () => this.allEmailsRead()
            },
            {
                id: 'new_email_arrives',
                message: 'You may receive new emails throughout the day. A new one just arrived!',
                highlight: null,
                action: 'trigger_wellness_email',
                onEnter: () => this.deliverWellnessEmail()
            },
            {
                id: 'open_wellness',
                message: 'Please open this email and complete the wellness exercise.',
                highlight: '#email-list .email-item:first-child',
                action: 'complete_wellness',
                validation: () => this.wellnessCompleted()
            },
            {
                id: 'clock_intro',
                message: 'Notice the time - you arrived early! Feel free to relax before work starts.',
                highlight: '#clock-container',
                action: 'click_next'
            },
            {
                id: 'game_intro',
                message: 'You can take a break anytime by clicking the Game button.',
                highlight: '#game-btn',
                action: 'open_game',
                onEnter: () => this.enableGameButton()
            },
            {
                id: 'boss_arrives',
                message: 'It\'s 9:00 AM - your manager has arrived!',
                highlight: null,
                action: 'play_video',
                onEnter: () => this.triggerBossVideo()
            },
            {
                id: 'work_intro',
                message: 'Time to start work. Click the Work button to see your tasks.',
                highlight: '#work-btn',
                action: 'open_work',
                onEnter: () => this.enableWorkButton()
            },
            {
                id: 'practice_task',
                message: 'Let\'s try a practice task. Complete this one to continue.',
                highlight: null,
                action: 'complete_practice',
                validation: () => this.practiceCompleted()
            },
            {
                id: 'bonus_explanation',
                message: 'Your bonus will be based on your task performance and what you learned about the organization. You have until 5:00 PM. Good luck!',
                highlight: '#clock-container',
                action: 'click_next'
            },
            {
                id: 'tutorial_complete',
                message: 'Tutorial complete! The simulation will now begin.',
                highlight: null,
                action: 'end_tutorial',
                onEnter: () => this.completeTutorial()
            }
        ];
    }

    /**
     * Start the tutorial
     */
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.element.classList.remove('hidden');
        this.showStep(0);
        
        console.log('Tutorial started');
    }

    /**
     * Show a specific step
     */
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.end();
            return;
        }

        const step = this.steps[stepIndex];
        
        // Update message
        this.textElement.innerHTML = step.message;
        
        // Highlight element if specified
        if (step.highlight) {
            this.highlightElement(step.highlight);
        } else {
            this.clearHighlight();
        }
        
        // Handle step-specific actions on enter
        if (step.onEnter) {
            step.onEnter();
        }
        
        // Configure next button
        if (step.action === 'click_next') {
            this.nextButton.style.display = 'block';
            this.nextButton.disabled = false;
        } else {
            this.nextButton.style.display = 'none';
        }
        
        console.log('Tutorial step:', step.id);
    }

    /**
     * Highlight a specific element (spotlight effect)
     */
    highlightElement(selector) {
        this.clearHighlight();
        
        const element = document.querySelector(selector);
        if (!element) {
            console.warn('Element not found:', selector);
            return;
        }
        
        this.highlightedElement = element;
        element.classList.add('tutorial-highlighted');
        
        // TODO: Position the spotlight cutout around the element
        // This involves CSS with clip-path or box-shadow tricks
    }

    /**
     * Clear current highlight
     */
    clearHighlight() {
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove('tutorial-highlighted');
            this.highlightedElement = null;
        }
    }

    /**
     * Advance to next step
     */
    advance() {
        const currentStepData = this.steps[this.currentStep];
        
        // Validate if needed
        if (currentStepData.validation && !currentStepData.validation()) {
            console.log('Validation failed, cannot advance');
            return;
        }
        
        this.currentStep++;
        this.showStep(this.currentStep);
    }

    /**
     * Force advance (called by external events)
     */
    forceAdvance() {
        this.currentStep++;
        this.showStep(this.currentStep);
    }

    /**
     * End tutorial
     */
    end() {
        this.isActive = false;
        this.clearHighlight();
        this.element.classList.add('hidden');
        
        console.log('Tutorial ended');
        
        // TODO: Trigger start of free play
        this.experiment.startFreePlay();
    }

    // ==========================================
    // VALIDATION METHODS
    // ==========================================

    /**
     * Check if all initial emails have been read
     */
    allEmailsRead() {
        // TODO: Check email system state
        // return this.experiment.emailSystem.allInitialEmailsRead();
        return true; // Placeholder
    }

    /**
     * Check if wellness exercise completed
     */
    wellnessCompleted() {
        // TODO: Check if wellness exercise was submitted
        return true; // Placeholder
    }

    /**
     * Check if practice task completed
     */
    practiceCompleted() {
        // TODO: Check if practice task was completed correctly
        return true; // Placeholder
    }

    // ==========================================
    // STEP-SPECIFIC ACTIONS
    // ==========================================

    /**
     * Deliver wellness email
     */
    deliverWellnessEmail() {
        // TODO: Add wellness email to inbox
        console.log('Delivering wellness email');
    }

    /**
     * Enable game button for interaction
     */
    enableGameButton() {
        const gameBtn = document.getElementById('game-btn');
        gameBtn.disabled = false;
        // TODO: Add click listener that advances tutorial when clicked
    }

    /**
     * Trigger boss arrival video
     */
    triggerBossVideo() {
        // TODO: Show video overlay
        // TODO: Jump clock to 9:00 AM after video
        // TODO: Auto-advance tutorial when video ends
        console.log('Playing boss arrival video');
    }

    /**
     * Enable work button
     */
    enableWorkButton() {
        const workBtn = document.getElementById('work-btn');
        workBtn.disabled = false;
        // TODO: Add click listener that advances tutorial when clicked
    }

    /**
     * Complete tutorial and transition to free play
     */
    completeTutorial() {
        // TODO: Any final setup before free play
        console.log('Tutorial complete, starting free play');
    }
}