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
/**
 * Load wellness exercise (3 pages: pre-test, manipulation, post-test)
 */
loadWellnessExercise(data) {
    // Determine condition (paradox vs control)
    const isParadox = this.experiment.state.mindset === 'paradox';
    
    // Store wellness data
    this.wellnessData = {
        condition: this.experiment.state.mindset,
        page: 1,
        experiencingTensions: {},
        manipulationResponse: '',
        paradoxMindset: {},
        startTime: Date.now()
    };
    
    // Randomize scale items
    this.experiencingTensionsItems = this.shuffleArray([
        { id: 'et_1', text: 'I have competing demands that need to be addressed at the same time.' },
        { id: 'et_2', text: 'I sometimes hold two ideas in mind that seem contradictory when appearing together.' },
        { id: 'et_3', text: 'I have goals that contradict each other.' },
        { id: 'et_4', text: 'I have to meet contradictory requirements.' },
        { id: 'et_5', text: 'When I examine a problem, the possible solutions seem contradictory.' },
        { id: 'et_6', text: 'I need to decide between opposing alternatives.' },
        { id: 'et_7', text: 'Work is filled with tensions and contradictions.' }
    ]);
    
    this.paradoxMindsetItems = this.shuffleArray([
        { id: 'pm_1', text: 'When I consider conflicting perspectives, I gain a better understanding of an issue.' },
        { id: 'pm_2', text: 'I am comfortable dealing with conflicting demands at the same time.' },
        { id: 'pm_3', text: 'Accepting contradictions is essential for my success.' },
        { id: 'pm_4', text: 'Tension between ideas energizes me.' },
        { id: 'pm_5', text: 'I enjoy it when I manage to pursue contradictory goals.' },
        { id: 'pm_6', text: 'I experience myself as simultaneously embracing conflicting demands.' },
        { id: 'pm_7', text: 'I am comfortable working on tasks that contradict each other.' },
        { id: 'pm_8', text: 'I feel uplifted when I realize that two opposites can be true.' },
        { id: 'pm_9', text: 'I feel energized when I manage to address contradictory issues.' }
    ]);
    
    // Show first page
    this.showWellnessPage1();
}

/**
 * Shuffle array helper
 */
shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Page 1: Experiencing Tensions Scale
 */
showWellnessPage1() {
    this.bodyElement.innerHTML = `
        <h2>Wellness Exercise - Part 1 of 3</h2>
        <p style="margin-bottom: 20px;">Think about what you think it's like working at Optimo when you answer the following questions.</p>
        
        <form id="wellness-page1-form">
            ${this.experiencingTensionsItems.map(item => `
                <div class="wellness-scale-item">
                    <p style="font-weight: 600; margin-bottom: 10px;">${item.text}</p>
                    <div class="likert-scale">
                        <label class="likert-label-start">Strongly disagree</label>
                        <div class="likert-options">
                            ${[1, 2, 3, 4, 5, 6, 7].map(val => `
                                <label class="likert-option">
                                    <input type="radio" name="${item.id}" value="${val}" required>
                                    <span>${val}</span>
                                </label>
                            `).join('')}
                        </div>
                        <label class="likert-label-end">Strongly agree</label>
                    </div>
                </div>
            `).join('')}
            
            <button type="submit" class="submit-btn" style="margin-top: 30px;">Continue</button>
        </form>
    `;
    
    // Hide close button
    this.closeButton.style.display = 'none';
    
    // Handle form submission
    document.getElementById('wellness-page1-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitWellnessPage1();
    });
}

/**
 * Submit Page 1 and move to Page 2
 */
submitWellnessPage1() {
    const formData = new FormData(document.getElementById('wellness-page1-form'));
    
    // Collect responses
    this.experiencingTensionsItems.forEach(item => {
        this.wellnessData.experiencingTensions[item.id] = parseInt(formData.get(item.id));
    });
    
    console.log('Experiencing tensions responses:', this.wellnessData.experiencingTensions);
    
    // Move to page 2
    this.wellnessData.page = 2;
    this.showWellnessPage2();
}

/**
 * Page 2: Paradox Mindset Manipulation
 */
showWellnessPage2() {
    const isParadox = this.experiment.state.mindset === 'paradox';
    
    // Placeholder prompts for both conditions
    const prompt = isParadox 
        ? "In today’s rapidly changing and volatile business environment, employees are increasingly confronted with paradoxical tensions. These tensions stem from competing demands, diverse values, and contrasting perspectives, often turning decision-making into a constant tug-of-war. For example, how can we develop new skills while honing existing skills? How can we be flexible while also complying with company policies? How can we be a good team player while striving to be the best? <br><br> Such tensions can feel paralyzing, but they don’t have to be. In fact, embracing these tensions and contradictions is beneficial. Instead of thinking of whether to do one or the other, thinking of how one can do both helps people generate innovative solutions that help them navigate these tensions. <br><br>Here at Optimo, we’re certain that employees face similar types of tensions, but we want to help you manage them. Think about some of the tensions you might’ve experienced here at Optimo. They could be mixed signals from your coworkers or supervisors about what you should do, whether you should compete against or cooperate with one another, and so on. Then, think carefully about how these things in tension might actually complement each other. For instance, how can you both be a team player and strive to be better than those around you without compromising on either? <br><br>Please write 2 to 3 sentences about some tensions you experience at Optimo and how you can deal with them."
        : "In today’s rapidly changing and volatile business environment, employees are increasingly confronted with paradoxical tensions. These tensions stem from competing demands, diverse values, and contrasting perspectives, often turning decision-making into a constant tug-of-war. For example, how can we develop new skills while honing existing skills? How can we be flexible while also complying with company policies? How can we be a good team player while striving to be the best? <br><br>Such tensions can feel paralyzing, but they don’t have to be. In fact, prioritizing certain elements that seem to contradict or be in tension with other elements is beneficial. Choosing whether to do one or the other helps people navigate these tensions. <br><br>Here at Optimo, we’re certain that employees face similar types of tensions, but we want to help you manage them. Think about some of the tensions you might’ve experienced here at Optimo. They could be mixed signals from your coworkers or supervisors about what you should do, whether you should compete against or cooperate with one another, and so on. Then, think carefully about what you would prioritize among these things in tension. For instance, should you be more of a team player or strive to be better than those around you?<br><br>Please write 2 to 3 sentences about some tensions you experience at Optimo and how you can deal with them.";
    
    this.bodyElement.innerHTML = `
        <h2>Wellness Exercise - Part 2 of 3</h2>
        <p style="margin-bottom: 20px;">${prompt}</p>
        
        <form id="wellness-page2-form">
            <textarea id="wellness-manipulation-response" 
                      rows="8" 
                      placeholder="Type your response here..." 
                      required
                      style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
            
            <button type="submit" class="submit-btn" style="margin-top: 20px;">Continue</button>
        </form>
    `;
    
    // Handle form submission
    document.getElementById('wellness-page2-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitWellnessPage2();
    });
}

/**
 * Submit Page 2 and move to Page 3
 */
submitWellnessPage2() {
    const response = document.getElementById('wellness-manipulation-response').value.trim();
    
    if (!response) {
        alert('Please enter a response before continuing.');
        return;
    }
    
    this.wellnessData.manipulationResponse = response;
    console.log('Manipulation response recorded');
    
    // Move to page 3
    this.wellnessData.page = 3;
    this.showWellnessPage3();
}

/**
 * Page 3: Paradox Mindset Scale
 */
showWellnessPage3() {
    this.bodyElement.innerHTML = `
        <h2>Wellness Exercise - Part 3 of 3</h2>
        <p style="margin-bottom: 20px;">After completing the exercise on the previous page, how much do you agree with the following statements?</p>
        
        <form id="wellness-page3-form">
            ${this.paradoxMindsetItems.map(item => `
                <div class="wellness-scale-item">
                    <p style="font-weight: 600; margin-bottom: 10px;">${item.text}</p>
                    <div class="likert-scale">
                        <label class="likert-label-start">Strongly disagree</label>
                        <div class="likert-options">
                            ${[1, 2, 3, 4, 5, 6, 7].map(val => `
                                <label class="likert-option">
                                    <input type="radio" name="${item.id}" value="${val}" required>
                                    <span>${val}</span>
                                </label>
                            `).join('')}
                        </div>
                        <label class="likert-label-end">Strongly agree</label>
                    </div>
                </div>
            `).join('')}
            
            <button type="submit" class="submit-btn" style="margin-top: 30px;">Complete Exercise</button>
        </form>
    `;
    
    // Handle form submission
    document.getElementById('wellness-page3-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitWellnessPage3();
    });
}

/**
 * Submit Page 3 and complete wellness exercise
 */
submitWellnessPage3() {
    const formData = new FormData(document.getElementById('wellness-page3-form'));
    
    // Collect responses
    this.paradoxMindsetItems.forEach(item => {
        this.wellnessData.paradoxMindset[item.id] = parseInt(formData.get(item.id));
    });
    
    // Record completion time
    this.wellnessData.completionTime = Date.now();
    this.wellnessData.totalTime = this.wellnessData.completionTime - this.wellnessData.startTime;
    
    console.log('Wellness exercise completed:', this.wellnessData);
    
    // Save to experiment data
    if (this.experiment.data) {
        this.experiment.data.tutorial = this.experiment.data.tutorial || {};
        this.experiment.data.tutorial.wellnessExercise = this.wellnessData;
    }
    
    // Track event
    if (this.experiment.tracker && this.experiment.tracker.isTracking) {
        this.experiment.tracker.logEvent('wellness_completed', {
            condition: this.wellnessData.condition,
            totalTime: this.wellnessData.totalTime
        });
    }
    
    // Close overlay
    this.hide();
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