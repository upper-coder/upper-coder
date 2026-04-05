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
        this.highlightedElements = []; // Changed to array for multiple highlights
        this.emailCount = 0;
        
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
                highlight: ['#email-list'],
                action: 'wait_for_email_open',
                validation: () => this.anyEmailOpened(),
                checkInterval: 500,
                onEnter: () => this.addUnreadPulse()
            });
            
            steps.push({
                id: `read_email_${emailNum}`,
                message: isFirst ? 
                    'Great! This is the email content. Take your time to read it.' : 
                    'Read this email content.',
                highlight: ['#email-viewer-pane'],
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
                highlight: ['.email-item[data-email-id="wellness_email"]'],
                action: 'click_next'
            },
           {
                id: 'open_wellness',
                message: 'Please click on this email to open it.',
                highlight: ['.email-item[data-email-id="wellness_email"]'],
                action: 'wait_for_email_open',
                validation: () => this.anyEmailOpened(),
                checkInterval: 500
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
                message: 'Time to start work. Click the Work button to see your tasks.',
                highlight: ['#work-btn'],
                action: 'open_work',
                onEnter: () => this.enableWorkButton(),
                validation: () => this.workOpened(),
                checkInterval: 500
            },
            {
                id: 'practice_task',
                message: 'Let\'s try a practice task. Complete this one to continue.',
                highlight: ['#work-task-area'],
                action: 'complete_practice',
                validation: () => this.practiceCompleted(),
                checkInterval: 1000
            },
            {
                id: 'bonus_explanation',
                message: 'Great! Your bonus will be based on your task performance and what you learned about the organization. You have until 5:00 PM. Good luck!',
                highlight: ['#header'],
                action: 'click_next'
            },
            {
                id: 'tutorial_complete',
                message: 'Tutorial complete! The simulation will now begin.',
                highlight: null,
                action: 'end_tutorial',
                onEnter: () => this.completeTutorial()
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
        
        this.validationInterval = setInterval(() => {
            if (step.validation && step.validation()) {
                clearInterval(this.validationInterval);
                this.advance();
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
        return this.practiceTaskDone || false;
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
            this.experiment.emailSystem.deliverEmail('wellness_email', true);
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

    markPracticeComplete() {
        this.practiceTaskDone = true;
    }

    completeTutorial() {
        console.log('Tutorial complete, transitioning to free play');
        setTimeout(() => {
            this.end();
        }, 2000);
    }
}