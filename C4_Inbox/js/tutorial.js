/**
 * TUTORIAL SYSTEM
 * Spotlight/guided tutorial with step-by-step instructions
 * STATUS: IMPLEMENTED
 */

class Tutorial {
constructor(experiment) {
    this.experiment = experiment;
    this.currentStep = 0;
    this.steps = [];
    this.isActive = false;
    this.highlightedElements = [];
    this.emailCount = 0;
    this.emailsReadDuringTutorial = new Set(); // ADD THIS
    
    this.createSpotlightElements();
}

    /**
     * Create spotlight overlay elements
     */
    createSpotlightElements() {
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
        
        this.nextButton.addEventListener('click', () => this.advance());
    }

    /**
     * Define all tutorial steps dynamically based on email count
     */
    defineSteps() {
        this.emailCount = this.experiment.emailSystem ? 
            this.experiment.emailSystem.getInitialEmails().length : 3;
        
        const steps = [
            {
                id: 'welcome',
                message: 'Welcome to your first day at Acme Corp! Let me show you around your workspace.',
                highlight: null,
                action: 'click_next'
            },
            {
                id: 'email_intro',
                message: 'This is your email inbox. You have several emails waiting for you.',
                highlight: ['#inbox-content'],
                action: 'click_next'
            }
        ];
        
// Dynamically create steps for each email
        for (let i = 0; i < this.emailCount; i++) {
            const emailNum = i + 1;
            const isFirst = i === 0;
            const isLast = i === this.emailCount - 1;
            
steps.push({
    id: `open_email_${emailNum}`,
    message: isFirst ? 
        'Click on any email in the list to read it.' : 
        `Now click on ${isLast ? 'the last' : 'another'} unread email (marked with blue background).`,
    highlight: ['#email-list', '.folder-item.active', '#email-viewer-pane'], // Added viewer pane
    action: 'wait_for_email_open',
    validation: () => this.emailOpenedAndTracked(emailNum),
    checkInterval: 500,
    onEnter: () => this.addUnreadPulse()
});      
            steps.push({
    id: `read_email_${emailNum}`,
    message: isFirst ? 
        'Great! This is the email content. Take your time to read it.' : 
        'Read this email content.',
    highlight: ['#email-viewer-pane', '.folder-item.active'], // ADD inbox button here
    action: 'click_next',
    onEnter: () => {
        this.removeUnreadPulse();
        // Deliver wellness email while reading the LAST email
        if (isLast) {
            this.deliverWellnessEmail();
        }
    }
});
            
            steps.push({
                id: `return_inbox_${emailNum}`,
                message: isFirst ?
                    'To return to your inbox and read other emails, click the Inbox button on the left.' :
                    (isLast ? 'Click the Inbox button. You have a new email waiting!' : 'Click the Inbox button to return to your email list.'),
                highlight: ['#email-viewer-pane', '.folder-item.active'],
                action: 'wait_for_inbox_click',
                validation: () => this.inboxClicked(),
                checkInterval: 500
            });
        }
        
        steps.push(
{
                id: 'new_email_notice',
                message: 'Great! Notice the new email that just arrived at the top of your inbox.',
                highlight: null,  // Will be set dynamically
                action: 'click_next',
                onEnter: () => {
                    // Set highlight dynamically
                    const selector = this.getWellnessEmailSelector();
                    this.highlightElements([selector]);
                }
            },
            {
                id: 'open_wellness',
                message: 'Please click on this email to open it.',
                highlight: null,  // Will be set dynamically
                action: 'wait_for_email_open',
                validation: () => this.anyEmailOpened(),
                checkInterval: 500,
                onEnter: () => {
                    // Set highlight dynamically
                    const selector = this.getWellnessEmailSelector();
                    this.highlightElements([selector]);
                }
            },
            {
                id: 'read_wellness',
                message: 'Read the email and click the "Start Exercise" button to complete the wellness exercise.',
                highlight: ['#email-viewer-pane'],
                action: 'complete_wellness',
                validation: () => this.wellnessCompleted(),
                checkInterval: 1000,
                onEnter: () => {
                    // Pause clock during wellness exercise
                    if (this.experiment.clock && this.experiment.clock.isRunning && !this.experiment.clock.isPaused) {
                        this.experiment.clock.pause();
                    }
                }
            },
            {
                id: 'clock_intro',
                message: 'Notice the time - you arrived early! Feel free to relax before work starts at 9:00 AM.',
                highlight: ['#header'],
                action: 'click_next'
            },
            {
                id: 'game_intro',
                message: 'You can take a break anytime by clicking the Game button. Try it now!',
                highlight: ['#game-btn'],
                action: 'open_game',
                onEnter: () => this.enableGameButton(),
                validation: () => this.gameOpened(),
                checkInterval: 500
            },
{
                id: 'game_play',
                message: 'Feel free to play for a moment, or click "Close Game" to continue. The workday will start soon...',
                highlight: ['#game-area'],
                action: 'wait_for_game_done',
                onEnter: () => this.waitForGameTime(),
                validation: () => this.gameTimeDone(),
                checkInterval: 500
            },
 {
                id: 'boss_arrives',
                message: 'It\'s 9:00 AM - your manager has arrived!',
                highlight: null,
                action: 'play_video',
                onEnter: () => {
                    // Clean up game timers
                    if (this.gameTimer) clearTimeout(this.gameTimer);
                    if (this.gameCheckInterval) clearInterval(this.gameCheckInterval);
                    
                    // Jump to 9am
                    if (this.experiment.clock) {
                        this.experiment.clock.jumpTo(9, 0);
                        // Resume clock after jump
                        if (this.experiment.clock.isPaused) {
                            this.experiment.clock.resume();
                        }
                    }
                    
                    this.triggerBossVideo();
                }
            },
{
                id: 'work_intro',
                message: 'Time to start work. At Optimo, your task is to plan optimal delivery routes for our clients. Click the Work button to begin!',
                highlight: ['#work-btn'],
                action: 'open_work',
                onEnter: () => this.enableWorkButton(),
                validation: () => this.workOpened(),
                checkInterval: 500
            },
{
    id: 'practice_task',
    message: 'Plan an efficient delivery route for this client. Select stops in order to minimize total distance, then submit your route.',
    highlight: ['#work-task-area'],
    action: 'complete_practice',
    validation: () => this.practiceCompleted(),
    checkInterval: 1000,
    onEnter: () => {
        // Pause clock during practice task
        if (this.experiment.clock && this.experiment.clock.isRunning && !this.experiment.clock.isPaused) {
            this.experiment.clock.pause();
        }
        
        // Show practice task explicitly
        if (this.experiment.taskSystem) {
            const taskArea = document.getElementById('work-task-area');
            if (taskArea) {
                this.experiment.taskSystem.showTaskInterface(taskArea, true, false);  // isPractice = TRUE!
            }
        }
    }
},
{
    id: 'ready_for_work',
    message: 'Excellent work! You\'re now ready to start your workday at Optimo.',
    highlight: null,
    action: 'click_next',
    onEnter: () => {
        // Switch back to email panel first
        if (this.experiment.panelManager) {
            this.experiment.panelManager.switchPanel('email');
        }
        
        // Jump clock to 9:30 AM
        if (this.experiment.clock) {
            this.experiment.clock.jumpTo(9, 30);
            // Resume clock
            if (this.experiment.clock.isPaused) {
                this.experiment.clock.resume();
            }
        }
    }
},
            {
                id: 'final_reminder',
                message: 'Your bonus will be based on your task performance and other factors. Work efficiently and check your emails regularly.',
                highlight: ['#header'],
                action: 'click_next'
            },
{
    id: 'tutorial_complete',
    message: 'Tutorial complete! You have until 5:00 PM Click "Next" when you\'re ready to begin.',
    highlight: null,
    action: 'click_next'
    // Remove the onEnter completely
}
        );
        
        return steps;
    }

    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.steps = this.defineSteps();
        this.element.classList.remove('hidden');
        
        if (this.experiment.clock) {
            this.experiment.clock.pause();
        }
        
        this.showStep(0);
        console.log('Tutorial started with', this.emailCount, 'initial emails');
    }

    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.end();
            return;
        }

        const step = this.steps[stepIndex];
        this.textElement.innerHTML = step.message;
        
        const messageContainer = document.querySelector('.tutorial-message-container');
        messageContainer.classList.remove('bottom-right', 'bottom-left', 'top-left', 'center-bottom', 'top-right');
        
        if (step.highlight && step.highlight.length > 0) {
            const firstHighlight = step.highlight[0];
            switch(firstHighlight) {
                case '#email-list':
                case '#inbox-content':
                case '#email-list .email-item:first-child':
                case '#email-viewer-pane':
                case '.folder-item.active':
                case '#game-btn':
                case '#work-btn':
                    messageContainer.classList.add('top-right');
                    break;
                case '#header':
                case '#clock-container':
                    messageContainer.classList.add('bottom-right');
                    break;
                case '#work-task-area':
                    messageContainer.classList.add('bottom-left');
                    break;
                default:
                    messageContainer.classList.add('top-right');
            }
        } else {
            messageContainer.classList.add('center-bottom');
        }
        
        if (step.highlight) {
            this.highlightElements(step.highlight);
        } else {
            this.clearHighlight();
        }
        
        if (step.onEnter) {
            step.onEnter();
        }
        
        if (step.action === 'click_next') {
            this.nextButton.style.display = 'block';
            this.nextButton.disabled = false;
        } else {
            this.nextButton.style.display = 'none';
            if (step.validation && step.checkInterval) {
                this.startValidationCheck(step);
            }
        }
        
        console.log('Tutorial step:', step.id);
    }

startValidationCheck(step) {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
        
        console.log('Starting validation for step:', step.id);
        
        this.validationInterval = setInterval(() => {
            console.log('Checking validation for:', step.id);
            if (step.validation && step.validation()) {
                console.log('✓ Validation passed! Advancing...');
                clearInterval(this.validationInterval);
                this.advance();
            } else {
                console.log('✗ Validation failed, will check again');
            }
        }, step.checkInterval);
    }

    highlightElements(selectors) {
        this.clearHighlight();
        
        if (!Array.isArray(selectors)) {
            selectors = [selectors];
        }
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (!element) {
                console.warn('Element not found for highlight:', selector);
                return;
            }
            
            this.highlightedElements.push(element);
            element.classList.add('tutorial-highlighted');
            
            if (this.highlightedElements.length === 1) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    clearHighlight() {
        this.highlightedElements.forEach(element => {
            element.classList.remove('tutorial-highlighted');
        });
        this.highlightedElements = [];
    }

    advance() {
        const currentStepData = this.steps[this.currentStep];
        
        if (currentStepData.validation && !currentStepData.validation()) {
            console.log('Validation failed, cannot advance');
            return;
        }
        
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
        
        this.currentStep++;
        this.showStep(this.currentStep);
    }

    forceAdvance() {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
        this.currentStep++;
        this.showStep(this.currentStep);
    }

    end() {
        this.isActive = false;
        this.clearHighlight();
        this.element.classList.add('hidden');
        
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
        
        console.log('Tutorial ended');
        
        if (this.experiment.clock) {
            this.experiment.clock.resume();
        }
        
        if (this.experiment.startFreePlay) {
            this.experiment.startFreePlay();
        }
    }

    // Validation Methods
/**
 * Check if an email is open AND we've read the required number of unique emails
 */
emailOpenedAndTracked(requiredCount) {
    if (!this.experiment.emailSystem) return false;
    
    const viewer = document.getElementById('email-viewer-pane');
    const isViewerOpen = this.experiment.emailSystem.currentlyOpen !== null && 
           viewer && 
           viewer.style.display !== 'none';
    
    // If an email is currently open, track it
    if (isViewerOpen && this.experiment.emailSystem.currentlyOpen) {
        const emailId = this.experiment.emailSystem.currentlyOpen;
        if (!this.emailsReadDuringTutorial.has(emailId)) {
            this.emailsReadDuringTutorial.add(emailId);
            console.log(`Email read: ${emailId}. Total unique emails read: ${this.emailsReadDuringTutorial.size}`);
        }
    }
    
    // Only advance if we've read enough unique emails AND an email is currently open
    return this.emailsReadDuringTutorial.size >= requiredCount && isViewerOpen;
}    
anyEmailOpened() {
    if (!this.experiment.emailSystem) return false;
    const viewer = document.getElementById('email-viewer-pane');
    return this.experiment.emailSystem.currentlyOpen !== null && 
           viewer && 
           viewer.style.display !== 'none';
}

    inboxClicked() {
        if (!this.experiment.emailSystem) return false;
        const viewer = document.getElementById('email-viewer-pane');
        return !viewer || viewer.style.display === 'none';
    }

    allEmailsRead() {
        if (!this.experiment.emailSystem) return false;
        return this.experiment.emailSystem.allInitialEmailsRead();
    }

    wellnessCompleted() {
        if (!this.experiment.data.tutorial) return false;
        return this.experiment.data.tutorial.wellnessExercise !== undefined;
    }

    gameOpened() {
        if (!this.experiment.panelManager) return false;
        return this.experiment.panelManager.getCurrentPanel() === 'game';
    }

    workOpened() {
        if (!this.experiment.panelManager) return false;
        return this.experiment.panelManager.getCurrentPanel() === 'work';
    }

practiceCompleted() {
        // Check tutorial flag first
        if (this.practiceTaskDone) {
            console.log('Practice complete: TRUE (tutorial flag)');
            return true;
        }
        
        // Check task system flag
        if (this.experiment.taskSystem && this.experiment.taskSystem.practiceComplete) {
            console.log('Practice complete: TRUE (task system flag)');
            return true;
        }
        
        console.log('Practice complete: FALSE');
        return false;
    }

    // Helper Methods
    addUnreadPulse() {
        const unreadEmails = document.querySelectorAll('.email-item.unread');
        unreadEmails.forEach(email => {
            email.classList.add('tutorial-pulse');
        });
    }

    removeUnreadPulse() {
        const pulsing = document.querySelectorAll('.tutorial-pulse');
        pulsing.forEach(email => {
            email.classList.remove('tutorial-pulse');
        });
    }

    deliverWellnessEmail() {
        if (this.experiment.emailSystem) {
            const wellnessId = this.experiment.emailSystem.wellnessEmailId || 'wellness_paradox';
            this.experiment.emailSystem.deliverEmail(wellnessId, true);
        }
    }

    enableGameButton() {
        const gameBtn = document.getElementById('game-btn');
        if (gameBtn) {
            gameBtn.disabled = false;
        }
    }

    waitForNineAM() {
        setTimeout(() => {
            if (this.experiment.clock) {
                this.experiment.clock.jumpTo(9, 0);
            }
            this.forceAdvance();
        }, 5000);
    }

    waitForGameTime() {
        this.gameStartTime = Date.now();
        this.gameTimeComplete = false;
        
        this.gameTimer = setTimeout(() => {
            this.gameTimeComplete = true;
        }, 30000);
        
        this.gameCheckInterval = setInterval(() => {
            if (this.experiment.panelManager && 
                this.experiment.panelManager.getCurrentPanel() !== 'game') {
                this.gameTimeComplete = true;
                if (this.gameTimer) clearTimeout(this.gameTimer);
                if (this.gameCheckInterval) clearInterval(this.gameCheckInterval);
            }
        }, 500);
    }

    gameTimeDone() {
        return this.gameTimeComplete || false;
    }

    triggerBossVideo() {
        if (this.experiment.overlay) {
            alert('Boss arrival video would play here. For testing, we will skip it.');
            this.forceAdvance();
        }
    }

    enableWorkButton() {
        const workBtn = document.getElementById('work-btn');
        if (workBtn) {
            workBtn.disabled = false;
        }
    }

    completeTutorial() {
        console.log('Tutorial complete, transitioning to free play');
        setTimeout(() => {
            this.end();
        }, 2000);
    }
        getWellnessEmailSelector() {
        const wellnessId = this.experiment.emailSystem.wellnessEmailId || 'wellness_paradox';
        return `.email-item[data-email-id="${wellnessId}"]`;
    }
}

