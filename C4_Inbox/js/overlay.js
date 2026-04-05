/**
 * OVERLAY SYSTEM
 * Multi-purpose overlay for wellness exercise, game, video, work tasks
 * STATUS: OUTLINE
 */

class Overlay {
    constructor() {
        this.isVisible = false;
        this.currentType = null;
        this.onCloseCallback = null;
        
        this.createOverlayElement();
    }

    /**
     * Create the overlay DOM element
     */
    createOverlayElement() {
        // TODO: Create overlay structure
        // Should include:
        // - Dark background
        // - Content container
        // - Close button (optional, depends on context)
        
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.className = 'overlay hidden';
        overlay.innerHTML = `
            <div class="overlay-background"></div>
            <div class="overlay-content">
                <button class="overlay-close" id="overlay-close">×</button>
                <div id="overlay-body"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        this.element = overlay;
        this.bodyElement = document.getElementById('overlay-body');
        this.closeButton = document.getElementById('overlay-close');
        
        // TODO: Add event listener for close button
        this.closeButton.addEventListener('click', () => this.hide());
    }

    /**
     * Show overlay with specific content type
     * @param {string} type - 'wellness', 'game', 'video', 'work'
     * @param {object} data - Data specific to the content type
     * @param {function} onClose - Callback when overlay closes
     */
    show(type, data = {}, onClose = null) {
        this.currentType = type;
        this.onCloseCallback = onClose;
        
        // Clear previous content
        this.bodyElement.innerHTML = '';
        
        // Load appropriate content
        switch(type) {
            case 'wellness':
                this.loadWellnessExercise(data);
                break;
            case 'game':
                this.loadGame(data);
                break;
            case 'video':
                this.loadVideo(data);
                break;
            case 'work':
                this.loadWorkTasks(data);
                break;
            case 'jira':
                this.loadJiraSystem(data);
                break;
            default:
                console.error('Unknown overlay type:', type);
                return;
        }
        
        // Show overlay
        this.element.classList.remove('hidden');
        this.isVisible = true;
        
        console.log('Overlay shown:', type);
    }

    /**
     * Hide overlay
     */
    hide() {
        if (!this.isVisible) return;
        
        this.element.classList.add('hidden');
        this.isVisible = false;
        
        // Execute callback if provided
        if (this.onCloseCallback) {
            this.onCloseCallback();
            this.onCloseCallback = null;
        }
        
        console.log('Overlay hidden');
    }

    /**
     * Load wellness exercise (paradox mindset manipulation)
     */
    loadWellnessExercise(data) {
        // TODO: Create form with open-ended prompts
        // TODO: Add manipulation check questions
        // TODO: Add submit button that validates completion
        
        this.bodyElement.innerHTML = `
            <h2>Wellness Exercise</h2>
            <p>TODO: Add wellness exercise instructions</p>
            
            <div class="wellness-form">
                <!-- TODO: Add open-ended text areas -->
                <!-- TODO: Add manipulation check questions -->
            </div>
            
            <button id="wellness-submit" class="submit-btn">Complete Exercise</button>
        `;
        
        // Hide close button (required to complete)
        this.closeButton.style.display = 'none';
        
        // TODO: Add submit handler
    }

    /**
     * Load Snake game
     */
    loadGame(data) {
        // TODO: Implement or embed Snake game
        this.bodyElement.innerHTML = `
            <h2>Break Room - Snake Game</h2>
            <div id="game-canvas-container">
                <!-- TODO: Add canvas for Snake game -->
                <p>Game will be implemented here</p>
            </div>
        `;
        
        // Show close button (optional activity)
        this.closeButton.style.display = 'block';
    }

    /**
     * Load video player
     */
    loadVideo(data) {
        // TODO: Load and autoplay video
        this.bodyElement.innerHTML = `
            <video id="overlay-video" autoplay>
                <source src="${data.videoUrl}" type="video/mp4">
            </video>
        `;
        
        // Hide close button (must watch)
        this.closeButton.style.display = 'none';
        
        // TODO: Auto-close when video ends
        const video = document.getElementById('overlay-video');
        video.addEventListener('ended', () => {
            this.hide();
        });
    }

    /**
     * Load work tasks (for helping coworker)
     */
    loadWorkTasks(data) {
        // TODO: Load task interface
        // Same as main work tab but for helping
        this.bodyElement.innerHTML = `
            <h2>${data.isHelping ? "Helping Coworker" : "Your Tasks"}</h2>
            <div id="overlay-task-container">
                <!-- TODO: Task interface will go here -->
            </div>
        `;
        
        this.closeButton.style.display = 'block';
    }

    /**
     * Load Jira bug assignment system
     */
    loadJiraSystem(data) {
        // TODO: Create simple Jira-like interface
        this.bodyElement.innerHTML = `
            <h2>Bug Tracking System</h2>
            <div class="jira-container">
                <h3>Open Bugs by Team Member</h3>
                <!-- TODO: Show bug counts -->
                <!-- TODO: Allow reassignment -->
            </div>
        `;
        
        this.closeButton.style.display = 'block';
    }
}