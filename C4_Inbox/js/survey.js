/**
 * EXIT SURVEY SYSTEM
 * Randomized Likert scale questions with blocks
 */

class Survey {
    constructor(experiment) {
        this.experiment = experiment;
        this.currentBlock = 0;
        this.blocks = [];
        this.responses = {};
        
        this.defineBlocks();
        this.randomizeBlocks();
    }

    /**
     * Define all survey blocks (measures)
     */
    defineBlocks() {
        this.blocks = [
            {
                id: 'job_satisfaction',
                title: 'Job Satisfaction',
                randomize: true,
                items: [
                    {
                        id: 'sat_1',
                        question: 'Overall, how satisfied do you feel about working at Optimo?',
                        type: 'likert',
                        scale: {
                            min: 1,
                            max: 7,
                            minLabel: 'Very dissatisfied',
                            maxLabel: 'Very satisfied'
                        }
                    }
                ]
            },
            {
                id: 'role_ambiguity',
                title: 'Role Clarity',
                instruction: 'How much do you agree with the following statements?',
                randomize: true,
                items: [
                    {
                        id: 'ambig_1',
                        question: 'I was not sure of what was expected of me at work.',
                        type: 'likert',
                        scale: {
                            min: 1,
                            max: 7,
                            minLabel: 'Strongly disagree',
                            maxLabel: 'Strongly agree'
                        }
                    },
                    {
                        id: 'ambig_2',
                        question: 'The requirements of my job were not always clear.',
                        type: 'likert',
                        scale: {
                            min: 1,
                            max: 7,
                            minLabel: 'Strongly disagree',
                            maxLabel: 'Strongly agree'
                        }
                    },
                    {
                        id: 'ambig_3',
                        question: "I didn't really know what's expected of me at work.",
                        type: 'likert',
                        scale: {
                            min: 1,
                            max: 7,
                            minLabel: 'Strongly disagree',
                            maxLabel: 'Strongly agree'
                        }
                    },
                    {
                        id: 'ambig_4',
                        question: 'My job duties were unclear.',
                        type: 'likert',
                        scale: {
                            min: 1,
                            max: 7,
                            minLabel: 'Strongly disagree',
                            maxLabel: 'Strongly agree'
                        }
                    }
                ]
            },
            {
                id: 'turnover_intentions',
                title: 'Future Intentions',
                instruction: 'If you were actually an employee at Optimo...',
                randomize: true,
                items: [
                    {
                        id: 'turnover_1',
                        question: 'How much would you want to quit your job?',
                        type: 'likert',
                        scale: {
                            min: 1,
                            max: 7,
                            minLabel: 'Not at all',
                            maxLabel: 'Very much'
                        }
                    },
                    {
                        id: 'turnover_2',
                        question: 'How likely are you to look for another job while working for Optimo?',
                        type: 'likert',
                        scale: {
                            min: 1,
                            max: 7,
                            minLabel: 'Not at all',
                            maxLabel: 'Very much'
                        }
                    }
                ]
            },
            {
                id: 'demographics',
                title: 'Background Information',
                randomize: false,
                items: [
                    {
                        id: 'prolific_id',
                        question: 'What is your Prolific ID?',
                        type: 'text',
                        required: true
                    },
                    {
                        id: 'age',
                        question: 'How many years old are you?',
                        type: 'number',
                        required: true,
                        min: 18,
                        max: 120
                    },
                    {
                        id: 'gender',
                        question: 'What is your gender?',
                        type: 'radio',
                        options: [
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other (please specify)', hasText: true }
                        ],
                        required: true
                    },
                    {
                        id: 'ethnicity',
                        question: 'What is your ethnicity?',
                        type: 'radio',
                        options: [
                            { value: 'white', label: 'White' },
                            { value: 'black', label: 'Black' },
                            { value: 'asian', label: 'Asian' },
                            { value: 'hispanic', label: 'Hispanic/Latino' },
                            { value: 'native_american', label: 'American Indian or Alaska Native' },
                            { value: 'pacific_islander', label: 'Native Hawaiian or Pacific Islander' },
                            { value: 'other', label: 'Other (please specify)', hasText: true }
                        ],
                        required: true
                    }
                ]
            }
        ];
    }
/**
     * Randomize block order (except demographics, which stays last)
     */
    randomizeBlocks() {
        const demographics = this.blocks.pop();
        
        for (let i = this.blocks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blocks[i], this.blocks[j]] = [this.blocks[j], this.blocks[i]];
        }
        
        this.blocks.forEach(block => {
            if (block.randomize) {
                this.shuffleArray(block.items);
            }
        });
        
        this.blocks.push(demographics);
        
        console.log('Survey blocks randomized. Order:', this.blocks.map(b => b.id));
    }

    /**
     * Shuffle array in place
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Start the survey
     */
    start() {
        document.getElementById('main-container').style.display = 'none';
        
        const surveyContainer = document.createElement('div');
        surveyContainer.id = 'survey-container';
        surveyContainer.style.cssText = `
            max-width: 800px;
            margin: 50px auto;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(surveyContainer);
        this.container = surveyContainer;
        
        this.showIntro();
    }

    /**
     * Show intro page
     */
    showIntro() {
        this.container.innerHTML = `
            <div style="text-align: center;">
                <h1 style="color: #2c3e50; margin-bottom: 20px;">Thank You!</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #34495e; margin-bottom: 30px;">
                    Thank you for completing the work simulation at Optimo. 
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #34495e; margin-bottom: 30px;">
                    We'd now like to ask you a few questions about your experience working at the company. 
                    This should only take a few minutes.
                </p>
                <button id="survey-start-btn" style="
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    font-size: 18px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 20px;
                ">Continue to Survey</button>
            </div>
        `;
        
        document.getElementById('survey-start-btn').addEventListener('click', () => {
            this.currentBlock = 0;
            this.showBlock(0);
        });
    }

    /**
     * Show a survey block
     */
    showBlock(blockIndex) {
        if (blockIndex >= this.blocks.length) {
            this.completeSurvey();
            return;
        }
        
        const block = this.blocks[blockIndex];
        
        let html = `
            <div class="survey-block">
                <h2 style="color: #2c3e50; margin-bottom: 10px;">${block.title}</h2>
                ${block.instruction ? `<p style="color: #7f8c8d; margin-bottom: 30px; font-style: italic;">${block.instruction}</p>` : ''}
                
                <form id="survey-form">
        `;
        
        block.items.forEach((item, index) => {
            html += this.renderItem(item, index);
        });
        
        html += `
                    <div style="margin-top: 40px; text-align: right;">
                        <button type="submit" style="
                            background-color: #27ae60;
                            color: white;
                            border: none;
                            padding: 12px 30px;
                            font-size: 16px;
                            border-radius: 6px;
                            cursor: pointer;
                        ">${blockIndex === this.blocks.length - 1 ? 'Submit Survey' : 'Next'}</button>
                    </div>
                </form>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        document.getElementById('survey-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBlock(block, blockIndex);
        });
        
        this.setupOtherTextFields();
    }

    /**
     * Render a survey item
     */
    renderItem(item, index) {
        let html = `<div class="survey-item" style="margin-bottom: 35px;">`;
        
        if (item.type === 'likert') {
            html += `
                <p style="font-weight: 600; color: #2c3e50; margin-bottom: 15px;">
                    ${item.question}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 13px; color: #7f8c8d;">${item.scale.minLabel}</span>
                    <div style="display: flex; gap: 15px;">
            `;
            
            for (let i = item.scale.min; i <= item.scale.max; i++) {
                html += `
                    <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                        <input type="radio" name="${item.id}" value="${i}" required 
                               style="margin-bottom: 5px; cursor: pointer;">
                        <span style="font-size: 14px; font-weight: 600; color: #34495e;">${i}</span>
                    </label>
                `;
            }
            
            html += `
                    </div>
                    <span style="font-size: 13px; color: #7f8c8d;">${item.scale.maxLabel}</span>
                </div>
            `;
            
        } else if (item.type === 'text') {
            html += `
                <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">
                    ${item.question}
                </label>
                <input type="text" name="${item.id}" ${item.required ? 'required' : ''} 
                       style="width: 100%; padding: 10px; border: 2px solid #bdc3c7; border-radius: 4px; font-size: 14px;">
            `;
            
        } else if (item.type === 'number') {
            html += `
                <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">
                    ${item.question}
                </label>
                <input type="number" name="${item.id}" ${item.required ? 'required' : ''} 
                       min="${item.min || ''}" max="${item.max || ''}"
                       style="width: 150px; padding: 10px; border: 2px solid #bdc3c7; border-radius: 4px; font-size: 14px;">
            `;
            
        } else if (item.type === 'radio') {
            html += `
                <p style="font-weight: 600; color: #2c3e50; margin-bottom: 15px;">
                    ${item.question}
                </p>
            `;
            
            item.options.forEach(option => {
                html += `
                    <div style="margin-bottom: 10px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="${item.id}" value="${option.value}" 
                                   ${item.required ? 'required' : ''} 
                                   ${option.hasText ? 'data-has-text="true"' : ''}
                                   style="margin-right: 10px; cursor: pointer;">
                            <span style="color: #34495e;">${option.label}</span>
                        </label>
                        ${option.hasText ? `
                            <input type="text" name="${item.id}_other_text" 
                                   class="other-text-field" 
                                   data-radio-value="${option.value}"
                                   data-radio-name="${item.id}"
                                   placeholder="Please specify"
                                   disabled
                                   style="margin-left: 30px; margin-top: 5px; padding: 8px; 
                                          border: 2px solid #bdc3c7; border-radius: 4px; width: 300px;">
                        ` : ''}
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        return html;
    }
    /**
     * Setup "other" text field enablement
     */
    setupOtherTextFields() {
        const radios = document.querySelectorAll('input[type="radio"][data-has-text="true"]');
        
        radios.forEach(radio => {
            const radioName = radio.name;
            const radioValue = radio.value;
            const textField = document.querySelector(`input[data-radio-name="${radioName}"][data-radio-value="${radioValue}"]`);
            
            radio.addEventListener('change', () => {
                if (radio.checked && textField) {
                    textField.disabled = false;
                    textField.required = true;
                }
            });
        });
        
        // Also handle when other radios are selected (disable "other" text fields)
        const allRadios = document.querySelectorAll('input[type="radio"]');
        allRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const radioName = radio.name;
                const allTextFields = document.querySelectorAll(`input[data-radio-name="${radioName}"]`);
                
                allTextFields.forEach(field => {
                    if (radio.dataset.hasText !== 'true' || radio.value !== field.dataset.radioValue) {
                        field.disabled = true;
                        field.required = false;
                        field.value = '';
                    }
                });
            });
        });
    }

    /**
     * Submit current block and move to next
     */
    submitBlock(block, blockIndex) {
        const formData = new FormData(document.getElementById('survey-form'));
        
        // Collect responses for this block
        const blockResponses = {};
        
        block.items.forEach(item => {
            const value = formData.get(item.id);
            blockResponses[item.id] = {
                question: item.question,
                value: value,
                type: item.type
            };
            
            // If this is a radio with "other" option, check for text
            if (item.type === 'radio') {
                const otherText = formData.get(`${item.id}_other_text`);
                if (otherText) {
                    blockResponses[item.id].otherText = otherText;
                }
            }
        });
        
        // Store responses
        this.responses[block.id] = {
            blockTitle: block.title,
            responses: blockResponses,
            timestamp: Date.now()
        };
        
        console.log('Block submitted:', block.id, blockResponses);
        
        // Move to next block
        this.currentBlock++;
        this.showBlock(this.currentBlock);
    }

    /**
     * Complete survey and export data
     */
    async completeSurvey() {
        console.log('Survey complete! All responses:', this.responses);
        
        // Save survey responses to experiment data
        if (this.experiment.data) {
            this.experiment.data.survey = this.responses;
        }
        
        // Show completion message
        this.container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h1 style="color: #27ae60; margin-bottom: 20px;">✓ Survey Complete</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #34495e; margin-bottom: 30px;">
                    Thank you for completing the survey! Your responses have been recorded.
                </p>
                <p style="font-size: 16px; color: #7f8c8d;">
                    Please wait while we save your data...
                </p>
                <div style="margin-top: 30px;">
                    <div class="loading-spinner" style="
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #3498db;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    "></div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Export all data to DataPipe
        try {
            const result = await this.experiment.dataPipe.exportData();
            
            if (result.success) {
                this.showThankYou(true);
            } else {
                this.showThankYou(false, result.error);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showThankYou(false, error.message);
        }
    }

    /**
     * Show final thank you page
     */
/**
 * Show final thank you page
 */
showThankYou(success, errorMessage = null) {
    // Prolific completion URL (placeholder for now)
    const prolificCompletionURL = 'https://app.prolific.co/submissions/complete?cc=PLACEHOLDER_CODE';
    
    this.container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            ${success ? `
                <h1 style="color: #27ae60; margin-bottom: 20px;">✓ All Done!</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #34495e; margin-bottom: 30px;">
                    Thank you for participating in this study! Your data has been successfully saved.
                </p>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 30px;">
                    Click the button below to return to Prolific and receive your completion code.
                </p>
                <button id="prolific-return-btn" style="
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    font-size: 18px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 20px;
                ">Return to Prolific</button>
            ` : `
                <h1 style="color: #e74c3c; margin-bottom: 20px;">⚠ Data Save Issue</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #34495e; margin-bottom: 20px;">
                    There was an issue saving your data to the server.
                </p>
                <p style="font-size: 14px; color: #7f8c8d; margin-bottom: 30px;">
                    Error: ${errorMessage || 'Unknown error'}
                </p>
                <p style="font-size: 16px; color: #34495e; margin-bottom: 30px;">
                    However, your data has been saved locally as a backup. 
                    Please contact the researcher with your Prolific ID.
                </p>
                <button id="prolific-return-btn" style="
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    font-size: 18px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 20px;
                ">Return to Prolific</button>
            `}
            <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 6px; max-width: 500px; margin-left: auto; margin-right: auto;">
                <p style="font-weight: 600; color: #2c3e50; margin-bottom: 10px;">
                    Study Information:
                </p>
                <p style="font-size: 14px; color: #7f8c8d;">
                    Participant ID: ${this.experiment.state.participantId}<br>
                    Condition: ${this.experiment.state.condition}<br>
                    Completion Time: ${new Date().toLocaleString()}
                </p>
            </div>
        </div>
    `;
    
    // Add click handler for return button
    const returnBtn = document.getElementById('prolific-return-btn');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.href = prolificCompletionURL;
        });
    }
    }
}