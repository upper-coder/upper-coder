/**
 * CONSENT FORM SYSTEM
 * Handles informed consent before experiment begins
 */

class ConsentForm {
    constructor(experiment) {
        this.experiment = experiment;
        this.consented = false;
    }

    /**
     * Show consent form
     */
    show() {
        // Hide main experiment container
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }

        // Create consent container
        const consentContainer = document.createElement('div');
        consentContainer.id = 'consent-container';
        consentContainer.style.cssText = `
            max-width: 800px;
            margin: 50px auto;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        consentContainer.innerHTML = `
            <h1 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">Informed Consent</h1>
            
            <div style="margin-bottom: 30px; line-height: 1.6; color: #34495e;">
                <h2 style="color: #2c3e50; font-size: 20px; margin-top: 30px;">Study Purpose</h2>
                <p>[Placeholder text: This study investigates workplace experiences and decision-making...]</p>
                
                <h2 style="color: #2c3e50; font-size: 20px; margin-top: 30px;">What You Will Do</h2>
                <p>[Placeholder text: You will participate in a work simulation that will take approximately 30 minutes...]</p>
                
                <h2 style="color: #2c3e50; font-size: 20px; margin-top: 30px;">Risks and Benefits</h2>
                <p>[Placeholder text: There are no anticipated risks beyond those encountered in daily life...]</p>
                
                <h2 style="color: #2c3e50; font-size: 20px; margin-top: 30px;">Confidentiality</h2>
                <p>[Placeholder text: Your data will be kept confidential and stored securely...]</p>
                
                <h2 style="color: #2c3e50; font-size: 20px; margin-top: 30px;">Voluntary Participation</h2>
                <p>[Placeholder text: Your participation is completely voluntary. You may withdraw at any time...]</p>
                
                <h2 style="color: #2c3e50; font-size: 20px; margin-top: 30px;">Contact Information</h2>
                <p>[Placeholder text: If you have questions, please contact: researcher@university.edu]</p>
            </div>

            <form id="consent-form" style="margin-top: 40px;">
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; border: 2px solid #dee2e6;">
                    <p style="font-weight: 600; color: #2c3e50; margin-bottom: 20px; font-size: 16px;">
                        Please indicate your consent to participate:
                    </p>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer; font-size: 15px;">
                        <input type="radio" name="consent" value="yes" required 
                               style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                        <span style="color: #27ae60; font-weight: 600;">I consent to participate in this study</span>
                    </label>
                    
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 15px;">
                        <input type="radio" name="consent" value="no" required 
                               style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                        <span style="color: #e74c3c; font-weight: 600;">I do <strong>not</strong> consent to participate in this study</span>
                    </label>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <button type="submit" style="
                        background-color: #3498db;
                        color: white;
                        border: none;
                        padding: 15px 50px;
                        font-size: 18px;
                        font-weight: 600;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    ">Submit</button>
                </div>
            </form>
        `;

        document.body.appendChild(consentContainer);
        this.container = consentContainer;

        // Add form submit handler
        document.getElementById('consent-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Add hover effect to submit button
        const submitBtn = consentContainer.querySelector('button[type="submit"]');
        submitBtn.addEventListener('mouseenter', () => {
            submitBtn.style.backgroundColor = '#2980b9';
        });
        submitBtn.addEventListener('mouseleave', () => {
            submitBtn.style.backgroundColor = '#3498db';
        });
    }

    /**
     * Handle consent form submission
     */
    handleSubmit() {
        const formData = new FormData(document.getElementById('consent-form'));
        const consentValue = formData.get('consent');

        if (consentValue === 'yes') {
            // User consented
            this.consented = true;
            console.log('✓ User consented to participate');

            // Record consent
            if (this.experiment.data) {
                this.experiment.data.consent = {
                    consented: true,
                    timestamp: new Date().toISOString()
                };
            }

            // Remove consent form
            this.container.remove();

            // Show main container
            const mainContainer = document.getElementById('main-container');
            if (mainContainer) {
                mainContainer.style.display = 'block';
            }

            // Start intro pages (when implemented) or skip to experiment
            if (this.experiment.introPages) {
                // TODO: Implement intro pages
                console.log('Starting intro pages...');
                this.experiment.introPages.start();
            } else {
                // For now: skip intro pages and start experiment directly
                console.log('Skipping intro pages (not yet implemented), starting experiment...');
                this.experiment.startAfterConsent();
            }

        } else {
            // User did not consent
            this.consented = false;
            console.log('✗ User did not consent to participate');

            // Record non-consent
            if (this.experiment.data) {
                this.experiment.data.consent = {
                    consented: false,
                    timestamp: new Date().toISOString()
                };
            }

            // Show termination message
            this.showTermination();
        }
    }

    /**
     * Show termination message for non-consent
     */
    showTermination() {
        this.container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h1 style="color: #e74c3c; margin-bottom: 20px;">Study Declined</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #34495e; margin-bottom: 30px;">
                    You have chosen not to participate in this study.
                </p>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 30px;">
                    Thank you for your time. You may now close this window.
                </p>
                <p style="font-size: 14px; color: #95a5a6;">
                    No data has been collected.
                </p>
            </div>
        `;

        console.log('Study terminated - user did not consent');
    }
}