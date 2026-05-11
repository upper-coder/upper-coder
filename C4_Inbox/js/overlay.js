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
     * Load wellness exercise (5 pages: tensions scale, personal traits, personal reflection, org reflection, paradox mindset scale)
     */
    loadWellnessExercise(data) {
        // Determine condition (paradox vs control)
        const isParadox = this.experiment.state.mindset === 'paradox';
        
        // Store wellness data
        this.wellnessData = {
            condition: this.experiment.state.mindset,
            page: 1,
            experiencingTensions: {},
            personalTraits: {},
            personalReflections: {},
            orgReflection: '',
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
            <h2>Wellness Exercise - Part 1 of 5</h2>
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
     * Page 2: Personal Traits Elicitation
     */
    showWellnessPage2() {
        const isParadox = this.experiment.state.mindset === 'paradox';
        
        if (isParadox) {
            // PARADOX CONDITION
            this.bodyElement.innerHTML = `
                <h2>Wellness Exercise - Part 2 of 5</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 20px;">
                    People are complicated. Sometimes, parts of who you are seem to be inconsistent, 
                    even contradictory, to other parts of who you are. For example, sometimes you are 
                    kind and thoughtful and sometimes you are unkind and inconsiderate. Or, you may 
                    think of yourself as an environmentally-conscious person while at the same time 
                    really enjoying travel.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <img src="images/manipulation/masks.jpg" alt="Tragedy and Comedy Masks" 
                         style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
                
                <form id="wellness-page2-form">
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            1. On the one hand, I am 
                            <input type="text" name="pair1_trait1" required 
                                   style="width: 200px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin: 0 5px;">
                            . On the other hand, I am 
                            <input type="text" name="pair1_trait2" required 
                                   style="width: 200px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin: 0 5px;">
                            .
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            2. On the one hand, I am 
                            <input type="text" name="pair2_trait1" required 
                                   style="width: 200px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin: 0 5px;">
                            . On the other hand, I am 
                            <input type="text" name="pair2_trait2" required 
                                   style="width: 200px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin: 0 5px;">
                            .
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            3. On the one hand, I am 
                            <input type="text" name="pair3_trait1" required 
                                   style="width: 200px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin: 0 5px;">
                            . On the other hand, I am 
                            <input type="text" name="pair3_trait2" required 
                                   style="width: 200px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin: 0 5px;">
                            .
                        </label>
                    </div>
                    
                    <button type="submit" class="submit-btn" style="margin-top: 30px;">Continue</button>
                </form>
            `;
        } else {
            // CONTROL CONDITION
            this.bodyElement.innerHTML = `
                <h2>Wellness Exercise - Part 2 of 5</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 20px;">
                    People are complicated. There are multiple characteristics that make up who you are. 
                    For example, you can be kind, thoughtful, and environmentally conscious.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <img src="images/manipulation/masks.jpg" alt="Tragedy and Comedy Masks" 
                         style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
                
                <form id="wellness-page2-form">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            1. I am 
                            <input type="text" name="trait1" required 
                                   style="width: 300px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin-left: 5px;">
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            2. I am 
                            <input type="text" name="trait2" required 
                                   style="width: 300px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin-left: 5px;">
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            3. I am 
                            <input type="text" name="trait3" required 
                                   style="width: 300px; padding: 6px; border: 2px solid #bdc3c7; border-radius: 4px; margin-left: 5px;">
                        </label>
                    </div>
                    
                    <button type="submit" class="submit-btn" style="margin-top: 30px;">Continue</button>
                </form>
            `;
        }
        
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
        const formData = new FormData(document.getElementById('wellness-page2-form'));
        const isParadox = this.experiment.state.mindset === 'paradox';
        
        // Collect responses based on condition
        if (isParadox) {
            this.wellnessData.personalTraits = {
                pair1_trait1: formData.get('pair1_trait1').trim(),
                pair1_trait2: formData.get('pair1_trait2').trim(),
                pair2_trait1: formData.get('pair2_trait1').trim(),
                pair2_trait2: formData.get('pair2_trait2').trim(),
                pair3_trait1: formData.get('pair3_trait1').trim(),
                pair3_trait2: formData.get('pair3_trait2').trim()
            };
        } else {
            this.wellnessData.personalTraits = {
                trait1: formData.get('trait1').trim(),
                trait2: formData.get('trait2').trim(),
                trait3: formData.get('trait3').trim()
            };
        }
        
        console.log('Personal traits collected:', this.wellnessData.personalTraits);
        
        // Move to page 3
        this.wellnessData.page = 3;
        this.showWellnessPage3();
    }

    /**
     * Page 3: Personal Trait Reflection
     */
    showWellnessPage3() {
        const isParadox = this.experiment.state.mindset === 'paradox';
        const traits = this.wellnessData.personalTraits;
        
        // Track page start time for 20-second minimum
        this.page3StartTime = Date.now();
        
        if (isParadox) {
            // PARADOX CONDITION
            this.bodyElement.innerHTML = `
                <h2>Wellness Exercise - Part 3 of 5</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 20px;">
                    Earlier, you described yourself as <strong>${traits.pair1_trait1}</strong> but <strong>${traits.pair1_trait2}</strong>, 
                    <strong>${traits.pair2_trait1}</strong> but <strong>${traits.pair2_trait2}</strong>, and 
                    <strong>${traits.pair3_trait1}</strong> but <strong>${traits.pair3_trait2}</strong>.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 30px;">
                    Although they seem contradictory, we want to know how you are both (1) <strong>${traits.pair1_trait1}</strong> and <strong>${traits.pair1_trait2}</strong>, 
                    (2) <strong>${traits.pair2_trait1}</strong> and <strong>${traits.pair2_trait2}</strong>, and 
                    (3) <strong>${traits.pair3_trait1}</strong> and <strong>${traits.pair3_trait2}</strong>.
                </p>
                
                <p style="font-size: 15px; font-weight: 600; color: #2c3e50; margin-bottom: 20px;">
                    Using 2 to 3 sentences each, please explain, with concrete examples, how you are both...
                </p>
                
                <form id="wellness-page3-form">
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            ${traits.pair1_trait1} and ${traits.pair1_trait2}:
                        </label>
                        <textarea name="pair1_reflection" rows="4" required
                                  onpaste="return false" oncopy="return false" oncut="return false"
                                  style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            Character count: <span class="char-count" data-target="pair1_reflection">0</span> / 100 minimum
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            ${traits.pair2_trait1} and ${traits.pair2_trait2}:
                        </label>
                        <textarea name="pair2_reflection" rows="4" required
                                  onpaste="return false" oncopy="return false" oncut="return false"
                                  style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            Character count: <span class="char-count" data-target="pair2_reflection">0</span> / 100 minimum
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            ${traits.pair3_trait1} and ${traits.pair3_trait2}:
                        </label>
                        <textarea name="pair3_reflection" rows="4" required
                                  onpaste="return false" oncopy="return false" oncut="return false"
                                  style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            Character count: <span class="char-count" data-target="pair3_reflection">0</span> / 100 minimum
                        </div>
                    </div>
                    
                    <div class="bonus-reminder" style="background-color: #d4edda; border-left: 4px solid #28a745; 
                                                       padding: 15px 20px; border-radius: 6px; margin-top: 20px; 
                                                       font-weight: 600; color: #155724;">
                        💰 Participants who provide thoughtful and reflective responses receive a $5 bonus!
                    </div>
                    
                    <button type="submit" class="submit-btn" style="margin-top: 30px;">Continue</button>
                </form>
            `;
        } else {
            // CONTROL CONDITION
            this.bodyElement.innerHTML = `
                <h2>Wellness Exercise - Part 3 of 5</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 20px;">
                    Earlier, you described yourself as <strong>${traits.trait1}</strong>, <strong>${traits.trait2}</strong>, and <strong>${traits.trait3}</strong>.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 30px;">
                    We want to know how you are (1) <strong>${traits.trait1}</strong>, (2) <strong>${traits.trait2}</strong>, and (3) <strong>${traits.trait3}</strong>.
                </p>
                
                <p style="font-size: 15px; font-weight: 600; color: #2c3e50; margin-bottom: 20px;">
                    Using 2 to 3 sentences each, please explain, with concrete examples, how you are...
                </p>
                
                <form id="wellness-page3-form">
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            ${traits.trait1}:
                        </label>
                        <textarea name="trait1_reflection" rows="4" required
                                  onpaste="return false" oncopy="return false" oncut="return false"
                                  style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            Character count: <span class="char-count" data-target="trait1_reflection">0</span> / 100 minimum
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            ${traits.trait2}:
                        </label>
                        <textarea name="trait2_reflection" rows="4" required
                                  onpaste="return false" oncopy="return false" oncut="return false"
                                  style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            Character count: <span class="char-count" data-target="trait2_reflection">0</span> / 100 minimum
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            ${traits.trait3}:
                        </label>
                        <textarea name="trait3_reflection" rows="4" required
                                  onpaste="return false" oncopy="return false" oncut="return false"
                                  style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            Character count: <span class="char-count" data-target="trait3_reflection">0</span> / 100 minimum
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                            Which of the above describes you best (${traits.trait1}, ${traits.trait2}, or ${traits.trait3})? Why?
                        </label>
                        <textarea name="best_trait_reflection" rows="4" required
                                  onpaste="return false" oncopy="return false" oncut="return false"
                                  style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            Character count: <span class="char-count" data-target="best_trait_reflection">0</span> / 100 minimum
                        </div>
                    </div>
                    
                    <div class="bonus-reminder" style="background-color: #d4edda; border-left: 4px solid #28a745; 
                                                       padding: 15px 20px; border-radius: 6px; margin-top: 20px; 
                                                       font-weight: 600; color: #155724;">
                        💰 Participants who provide thoughtful and reflective responses receive a $5 bonus!
                    </div>
                    
                    <button type="submit" class="submit-btn" style="margin-top: 30px;">Continue</button>
                </form>
            `;
        }
        
        // Set up character counters for all textareas
        this.setupCharacterCounters();
        
        // Handle form submission
        document.getElementById('wellness-page3-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitWellnessPage3();
        });
    }

    /**
     * Setup character counters for textareas
     */
    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea');
        
        textareas.forEach(textarea => {
            const counterSpan = document.querySelector(`.char-count[data-target="${textarea.name}"]`);
            
            if (counterSpan) {
                textarea.addEventListener('input', () => {
                    const count = textarea.value.length;
                    counterSpan.textContent = count;
                    
                    // Change color when minimum is met
                    if (count >= 100) {
                        counterSpan.style.color = '#28a745';
                        counterSpan.style.fontWeight = '600';
                    } else {
                        counterSpan.style.color = '#7f8c8d';
                        counterSpan.style.fontWeight = 'normal';
                    }
                });
            }
        });
    }

    /**
     * Submit Page 3 and move to Page 4
     */
    submitWellnessPage3() {
        const formData = new FormData(document.getElementById('wellness-page3-form'));
        const isParadox = this.experiment.state.mindset === 'paradox';
        const timeSpent = Date.now() - this.page3StartTime;
        
        // Check time requirement (20 seconds)
        if (timeSpent < 20000) {
            const secondsLeft = Math.ceil((20000 - timeSpent) / 1000);
            alert(`Please spend more time reflecting on your responses before continuing. (${secondsLeft} seconds remaining)`);
            return;
        }
        
        // Collect responses based on condition
        if (isParadox) {
            const pair1 = formData.get('pair1_reflection').trim();
            const pair2 = formData.get('pair2_reflection').trim();
            const pair3 = formData.get('pair3_reflection').trim();
            
            // Validate character minimums
            if (pair1.length < 100) {
                alert('Please write at least 100 characters for your first reflection.');
                return;
            }
            if (pair2.length < 100) {
                alert('Please write at least 100 characters for your second reflection.');
                return;
            }
            if (pair3.length < 100) {
                alert('Please write at least 100 characters for your third reflection.');
                return;
            }
            
            this.wellnessData.personalReflections = {
                pair1_reflection: pair1,
                pair2_reflection: pair2,
                pair3_reflection: pair3,
                timeSpent: timeSpent
            };
        } else {
            const trait1 = formData.get('trait1_reflection').trim();
            const trait2 = formData.get('trait2_reflection').trim();
            const trait3 = formData.get('trait3_reflection').trim();
            const bestTrait = formData.get('best_trait_reflection').trim();
            
            // Validate character minimums
            if (trait1.length < 100) {
                alert('Please write at least 100 characters for your first trait reflection.');
                return;
            }
            if (trait2.length < 100) {
                alert('Please write at least 100 characters for your second trait reflection.');
                return;
            }
            if (trait3.length < 100) {
                alert('Please write at least 100 characters for your third trait reflection.');
                return;
            }
            if (bestTrait.length < 100) {
                alert('Please write at least 100 characters for your "best trait" reflection.');
                return;
            }
            
            this.wellnessData.personalReflections = {
                trait1_reflection: trait1,
                trait2_reflection: trait2,
                trait3_reflection: trait3,
                best_trait_reflection: bestTrait,
                timeSpent: timeSpent
            };
        }
        
        console.log('Personal reflections collected:', this.wellnessData.personalReflections);
        
        // Move to page 4
        this.wellnessData.page = 4;
        this.showWellnessPage4();
    }

    /**
     * Page 4: Organizational Reflection
     */
    showWellnessPage4() {
        const isParadox = this.experiment.state.mindset === 'paradox';
        
        // Track page start time for 20-second minimum
        this.page4StartTime = Date.now();
        
        if (isParadox) {
            // PARADOX CONDITION
            this.bodyElement.innerHTML = `
                <h2>Wellness Exercise - Part 4 of 5</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 20px;">
                    Like people, organizations such as Optimo also consist of multiple, sometimes contradictory characteristics.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 30px;">
                    <strong>Based on the emails you received from Optimo</strong>, think of some of the potentially 
                    contradictory characteristics at Optimo.
                </p>
                
                <p style="font-size: 15px; font-weight: 600; color: #2c3e50; margin-bottom: 20px;">
                    Write 2 to 3 sentences about some of the contradictions you might experience at Optimo, how the contradictory 
                    elements can both be true, and how the contradictory elements might actually complement each other.
                </p>
                
                <form id="wellness-page4-form">
                    <textarea name="org_reflection" rows="6" required
                              onpaste="return false" oncopy="return false" oncut="return false"
                              style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                    <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                        Character count: <span class="char-count" data-target="org_reflection">0</span> / 100 minimum
                    </div>
                    
                    <div class="bonus-reminder" style="background-color: #d4edda; border-left: 4px solid #28a745; 
                                                       padding: 15px 20px; border-radius: 6px; margin-top: 20px; 
                                                       font-weight: 600; color: #155724;">
                        💰 Participants who provide thoughtful and reflective responses receive a $5 bonus!
                    </div>
                    
                    <button type="submit" class="submit-btn" style="margin-top: 30px;">Continue</button>
                </form>
            `;
        } else {
            // CONTROL CONDITION
            this.bodyElement.innerHTML = `
                <h2>Wellness Exercise - Part 4 of 5</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 20px;">
                    Like people, organizations such as Optimo also consist of multiple characteristics.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #2c3e50; margin-bottom: 30px;">
                    <strong>Based on the emails you received from Optimo</strong>, think of some of the different characteristics at Optimo.
                </p>
                
                <p style="font-size: 15px; font-weight: 600; color: #2c3e50; margin-bottom: 20px;">
                    Write 2 to 3 sentences about what the different elements are, which you think is most representative of Optimo, and why.
                </p>
                
                <form id="wellness-page4-form">
                    <textarea name="org_reflection" rows="6" required
                              onpaste="return false" oncopy="return false" oncut="return false"
                              style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 6px; 
                                     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; resize: vertical;"></textarea>
                    <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                        Character count: <span class="char-count" data-target="org_reflection">0</span> / 100 minimum
                    </div>
                    
                    <div class="bonus-reminder" style="background-color: #d4edda; border-left: 4px solid #28a745; 
                                                       padding: 15px 20px; border-radius: 6px; margin-top: 20px; 
                                                       font-weight: 600; color: #155724;">
                        💰 Participants who provide thoughtful and reflective responses receive a $5 bonus!
                    </div>
                    
                    <button type="submit" class="submit-btn" style="margin-top: 30px;">Continue</button>
                </form>
            `;
        }
        
        // Set up character counter
        this.setupCharacterCounters();
        
        // Handle form submission
        document.getElementById('wellness-page4-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitWellnessPage4();
        });
    }

    /**
     * Submit Page 4 and move to Page 5
     */
    submitWellnessPage4() {
        const formData = new FormData(document.getElementById('wellness-page4-form'));
        const timeSpent = Date.now() - this.page4StartTime;
        
        // Check time requirement (20 seconds)
        if (timeSpent < 20000) {
            const secondsLeft = Math.ceil((20000 - timeSpent) / 1000);
            alert(`Please spend more time reflecting on your response before continuing. (${secondsLeft} seconds remaining)`);
            return;
        }
        
        const orgReflection = formData.get('org_reflection').trim();
        
        // Validate character minimum
        if (orgReflection.length < 100) {
            alert('Please write at least 100 characters for your organizational reflection.');
            return;
        }
        
        this.wellnessData.orgReflection = orgReflection;
        this.wellnessData.orgReflectionTimeSpent = timeSpent;
        
        console.log('Organizational reflection collected:', this.wellnessData.orgReflection);
        
        // Move to page 5
        this.wellnessData.page = 5;
        this.showWellnessPage5();
    }

    /**
     * Page 5: Paradox Mindset Scale
     */
    showWellnessPage5() {
        this.bodyElement.innerHTML = `
            <h2>Wellness Exercise - Part 5 of 5</h2>
            <p style="margin-bottom: 20px;">After completing the previous exercises, how much do you agree with the following statements?</p>
            
            <form id="wellness-page5-form">
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
        document.getElementById('wellness-page5-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitWellnessPage5();
        });
    }

    /**
     * Submit Page 5 and complete wellness exercise
     */
    submitWellnessPage5() {
        const formData = new FormData(document.getElementById('wellness-page5-form'));
        
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