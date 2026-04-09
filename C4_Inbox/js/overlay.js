/**
 * OVERLAY SYSTEM
 * Multi-purpose overlay for wellness exercise, game, video, work tasks, Jira
 * STATUS: IMPLEMENTED
 */

class Overlay {
    constructor(experiment) {
        this.experiment = experiment;
        this.isVisible = false;
        this.currentType = null;
        this.onCloseCallback = null;
        
        this.createOverlayElement();
    }

    /**
     * Create the overlay DOM element
     */
    createOverlayElement() {
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
        
        // Add event listener for close button
        this.closeButton.addEventListener('click', () => this.hide());
        
        // Close on background click (optional)
        const background = overlay.querySelector('.overlay-background');
        background.addEventListener('click', () => {
            // Only close if close button is visible (not required overlays)
            if (this.closeButton.style.display !== 'none') {
                this.hide();
            }
        });
    }

    /**
     * Show overlay with specific content type
     * @param {string} type - 'wellness', 'video', 'work', 'jira'
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
        this.bodyElement.innerHTML = `
            <h2>Wellness Exercise</h2>
            <p>Take a few moments to reflect on the following prompts. Your responses will help us understand your perspective.</p>
            
            <div class="wellness-form">
                <div class="wellness-prompt">
                    <label>Prompt 1: Think about a time when you experienced both positive and negative aspects of a situation simultaneously.</label>
                    <textarea id="wellness-prompt-1" rows="4" placeholder="Type your response here..."></textarea>
                </div>
                
                <div class="wellness-prompt">
                    <label>Prompt 2: How do you typically handle situations where there are conflicting demands or contradictory information?</label>
                    <textarea id="wellness-prompt-2" rows="4" placeholder="Type your response here..."></textarea>
                </div>
                
                <div class="wellness-prompt">
                    <label>Prompt 3: Describe a recent work situation where you had to balance competing priorities.</label>
                    <textarea id="wellness-prompt-3" rows="4" placeholder="Type your response here..."></textarea>
                </div>
            </div>
            
            <button id="wellness-submit" class="submit-btn">Complete Exercise</button>
        `;
        
        // Hide close button (required to complete)
        this.closeButton.style.display = 'none';
        
        // Add submit handler
        const submitBtn = document.getElementById('wellness-submit');
        submitBtn.addEventListener('click', () => this.submitWellnessExercise());
    }

    /**
     * Submit wellness exercise
     */
    submitWellnessExercise() {
        const response1 = document.getElementById('wellness-prompt-1').value.trim();
        const response2 = document.getElementById('wellness-prompt-2').value.trim();
        const response3 = document.getElementById('wellness-prompt-3').value.trim();
        
        // Validate responses
        if (!response1 || !response2 || !response3) {
            alert('Please complete all prompts before submitting.');
            return;
        }
        
        // Store responses
        const wellnessData = {
            prompt1: response1,
            prompt2: response2,
            prompt3: response3,
            timestamp: Date.now(),
            timeSpent: Date.now() - this.wellnessStartTime
        };
        
        // Save to experiment data
        if (this.experiment.data) {
            this.experiment.data.tutorial = this.experiment.data.tutorial || {};
            this.experiment.data.tutorial.wellnessExercise = wellnessData;
        }
        
        // Track event
        if (this.experiment.tracker && this.experiment.tracker.isTracking) {
            this.experiment.tracker.logEvent('wellness_completed', {
                responseLength: response1.length + response2.length + response3.length
            });
        }
        
        console.log('Wellness exercise completed');
        
        // Close overlay
        this.hide();
    }

    /**
     * Load video player
     */
    loadVideo(data) {
        if (!data.videoUrl) {
            console.error('No video URL provided');
            return;
        }
        
        this.bodyElement.innerHTML = `
            <video id="overlay-video" controls autoplay style="width: 100%; max-width: 800px;">
                <source src="${data.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        
        // Hide close button (must watch)
        this.closeButton.style.display = 'none';
        
        // Auto-close when video ends
        const video = document.getElementById('overlay-video');
        video.addEventListener('ended', () => {
            console.log('Video ended');
            this.hide();
        });
        
        // Track video start
        if (this.experiment.tracker && this.experiment.tracker.isTracking) {
            this.experiment.tracker.logEvent('video_started', {
                videoUrl: data.videoUrl
            });
        }
    }

    /**
 /**
 * Load work tasks (for helping coworker)
 */
loadWorkTasks(data) {
    const isHelping = data.isHelping || false;
    
    console.log('loadWorkTasks called with isHelping:', isHelping);
    
    this.bodyElement.innerHTML = `
        <h2>${isHelping ? "Help Alex Martinez" : "Your Tasks"}</h2>
        <p>${isHelping ? "Complete delivery routes to help Alex meet their deadline." : "Complete your assigned tasks."}</p>
        ${isHelping ? `
            <div class="help-stats">
                <span id="help-completed-count">Routes completed for Alex: 0</span>
            </div>
        ` : ''}
        <div id="overlay-task-container" style="width: 100%; position: relative;">
            <p class="placeholder">Loading tasks...</p>
        </div>
    `;
    
    // Show close button
    this.closeButton.style.display = 'block';
    
    console.log('About to call showTaskInterface...');
    
    // Load tasks if task system exists
    if (this.experiment.taskSystem) {
        const container = document.getElementById('overlay-task-container');
        console.log('Container found:', !!container);
        
        if (container) {
            // Wait a bit longer for overlay to fully render
            setTimeout(() => {
                this.experiment.taskSystem.showTaskInterface(container, false, isHelping);
                console.log('showTaskInterface called');
            }, 300);
        }
    }
}

    /**
     * Load Jira bug assignment system
     */
    loadJiraSystem(data) {
        // Default bug data
        const bugData = {
            participant: 12,
            teammates: [
                { name: 'Alex Martinez', bugs: 8 },
                { name: 'Jordan Lee', bugs: 6 },
                { name: 'Sam Chen', bugs: 7 }
            ]
        };
        
        this.bodyElement.innerHTML = `
            <h2>Bug Tracking System</h2>
            <p>Review your current bug assignments and manage your workload.</p>
            
            <div class="jira-container">
                <h3>Open Bugs by Team Member</h3>
                <div class="bug-list">
                    <div class="bug-item" style="background-color: #fee;">
                        <div>
                            <div class="bug-user">You</div>
                        </div>
                        <div class="bug-count" id="participant-bug-count">12</div>
                    </div>
                    
                    ${bugData.teammates.map(teammate => `
                        <div class="bug-item">
                            <div class="bug-user">${teammate.name}</div>
                            <div class="bug-count teammate-bugs" data-name="${teammate.name}">${teammate.bugs}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
                    <h4>Reassign Bugs</h4>
                    <p>You can reassign some of your bugs to teammates if needed.</p>
                    
                    <div style="display: flex; gap: 15px; align-items: center; margin-top: 15px;">
                        <label>Reassign to:</label>
                        <select id="reassign-to" style="padding: 8px; border-radius: 4px; border: 2px solid #bdc3c7;">
                            ${bugData.teammates.map(teammate => 
                                `<option value="${teammate.name}">${teammate.name}</option>`
                            ).join('')}
                        </select>
                        
                        <label>Number of bugs:</label>
                        <input type="number" id="reassign-count" min="1" max="12" value="1" 
                               style="width: 80px; padding: 8px; border-radius: 4px; border: 2px solid #bdc3c7;">
                        
                        <button id="reassign-btn" class="bug-reassign-btn" style="padding: 8px 20px;">
                            Reassign
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 6px; border-left: 4px solid #4caf50;">
                    <strong>Note:</strong> Your manager will ask you how many bugs you currently have. 
                    You can check this system anytime to see your current count.
                </div>
            </div>
        `;
        
        // Show close button
        this.closeButton.style.display = 'block';
        
        // Track bugs
        let participantBugs = bugData.participant;
        const reassignments = [];
        
        // Add reassign button handler
        const reassignBtn = document.getElementById('reassign-btn');
        reassignBtn.addEventListener('click', () => {
            const toName = document.getElementById('reassign-to').value;
            const count = parseInt(document.getElementById('reassign-count').value);
            
            if (count > participantBugs) {
                alert(`You only have ${participantBugs} bugs to reassign.`);
                return;
            }
            
            if (count < 1) {
                alert('Please enter a valid number of bugs.');
                return;
            }
            
            // Update counts
            participantBugs -= count;
            document.getElementById('participant-bug-count').textContent = participantBugs;
            
            // Update teammate count
            const teammateElement = document.querySelector(`[data-name="${toName}"]`);
            if (teammateElement) {
                const currentCount = parseInt(teammateElement.textContent);
                teammateElement.textContent = currentCount + count;
            }
            
            // Track reassignment
            reassignments.push({
                to: toName,
                count: count,
                timestamp: Date.now()
            });
            
            // Log event
            if (this.experiment.tracker && this.experiment.tracker.isTracking) {
                this.experiment.tracker.recordBugReassignment('You', toName, count);
            }
            
            console.log(`Reassigned ${count} bugs to ${toName}. You now have ${participantBugs} bugs.`);
            
            alert(`Successfully reassigned ${count} bug(s) to ${toName}.`);
        });
        
        // Store Jira state for later retrieval
        this.jiraState = {
            participantBugs: participantBugs,
            actualBugs: bugData.participant,
            reassignments: reassignments,
            getParticipantBugs: () => participantBugs
        };
    }

    /**
     * Get current Jira state (for competition email response)
     */
    getJiraState() {
        return this.jiraState;
    }
}