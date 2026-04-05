/**
 * EMAIL SYSTEM
 * Manages email display, interaction, and tracking
 * STATUS: IMPLEMENTED
 */

class EmailSystem {
    constructor(experiment) {
        this.experiment = experiment;
        this.emailData = null; // All email definitions
        this.emails = []; // Emails for this participant's condition
        this.emailStates = {}; // Track state of each email
        this.currentlyOpen = null; // Currently viewing email
        this.readOrderCounter = 0;
        
        this.listElement = document.getElementById('email-list');
        
        // Set up inbox folder click
        this.setupInboxFolderClick();
    }

        /**
     * Set up inbox folder click handler
     */
    setupInboxFolderClick() {
        const inboxFolder = document.querySelector('.folder-item.active');
        if (inboxFolder) {
            inboxFolder.addEventListener('click', () => {
                // Switch to email panel if not already there
                if (this.experiment.panelManager) {
                    this.experiment.panelManager.switchPanel('email');
                }
                // Then close email viewer if one is open
                this.closeEmailViewer();
            });
        }
    }

    /**
     * Load emails from JSON file
     */
    async loadEmails(condition) {
        try {
            const response = await fetch('data/emails.json');
            this.emailData = await response.json();
            
            // Get emails for this condition
            const conditionData = this.emailData.conditions[condition];
            
            if (!conditionData) {
                console.error('Condition not found:', condition);
                return false;
            }
            
            // Load initial emails
            this.emails = conditionData.initial_emails.map(id => 
                this.emailData.emails[id]
            );
            
            // Also store references to critical emails
            this.criticalEmails = {
                wellness: this.emailData.emails.wellness_email,
                prosocial: this.emailData.emails[conditionData.critical_emails.prosocial],
                competition: this.emailData.emails[conditionData.critical_emails.competition]
            };
            
            console.log('Emails loaded for condition:', condition);
            console.log('Initial emails:', this.emails.length);
            
            return true;
            
        } catch (error) {
            console.error('Error loading emails:', error);
            return false;
        }
    }

    /**
     * Get initial emails (shown at start of tutorial)
     */
    getInitialEmails() {
        return this.emails;
    }

    /**
     * Deliver initial emails to inbox
     */
    deliverInitialEmails() {
        // Clear the email list first
        this.listElement.innerHTML = '';
        
        // Deliver each initial email
        this.emails.forEach(email => {
            this.deliverEmail(email.id, false);
        });
        
        console.log('Initial emails delivered:', this.emails.length);
    }

    /**
     * Add email to inbox
     */
    deliverEmail(emailId, animate = true) {
        // Find email in the data
        let email = this.emails.find(e => e.id === emailId);
        
        // Check if it's a special email
        if (!email) {
            email = Object.values(this.criticalEmails).find(e => e && e.id === emailId);
        }
        
        if (!email) {
            console.error('Email not found:', emailId);
            return;
        }

        // Initialize state
        this.emailStates[emailId] = {
            delivered: true,
            deliveryTime: Date.now(),
            firstOpenTime: null,
            totalTimeOpen: 0,
            openStartTime: null,
            timesOpened: 0,
            isRead: false,
            response: null,
            readOrder: null
        };

        // Add to DOM
        this.renderEmailInList(email, animate);
        
        // Update inbox count
        this.updateInboxCount();
        
        console.log('Email delivered:', emailId);
    }

    /**
     * Render email in the list
     */
    renderEmailInList(email, animate = false) {
        const emailItem = document.createElement('div');
        emailItem.className = 'email-item unread';
        emailItem.dataset.emailId = email.id;
        
        emailItem.innerHTML = `
            <div class="email-sender">${email.from}</div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-preview">${this.getPreview(email.body)}</div>
            <div class="email-time">Just now</div>
        `;
        
        // Add click listener
        emailItem.addEventListener('click', () => this.openEmail(email.id));
        
        // Add to list (at top)
        this.listElement.insertBefore(emailItem, this.listElement.firstChild);
        
        // Animate if specified
        if (animate) {
            emailItem.classList.add('email-animate-in');
        }
    }

    /**
     * Get email preview text
     */
    getPreview(body) {
        const maxLength = 150;
        const stripped = body.replace(/<[^>]*>/g, ''); // Remove HTML tags
        return stripped.length > maxLength 
            ? stripped.substring(0, maxLength) + '...'
            : stripped;
    }

    /**
     * Open email for reading
     */
    openEmail(emailId) {
        // Close currently open email first
        if (this.currentlyOpen && this.currentlyOpen !== emailId) {
            this.closeEmail();
        }
        
        // Find email
        let email = this.emails.find(e => e.id === emailId);
        if (!email) {
            email = Object.values(this.criticalEmails).find(e => e && e.id === emailId);
        }
        
        const state = this.emailStates[emailId];
        
        if (!email || !state) {
            console.error('Email or state not found:', emailId);
            return;
        }

        // Track opening
        if (!state.firstOpenTime) {
            state.firstOpenTime = Date.now();
            state.readOrder = ++this.readOrderCounter;
        }
        
        state.timesOpened++;
        state.openStartTime = Date.now();
        
        // Mark as read
        state.isRead = true;
        const emailElement = this.listElement.querySelector(`[data-email-id="${emailId}"]`);
        if (emailElement) {
            emailElement.classList.remove('unread');
        }
        
        // Show email content
        this.displayEmailContent(email);
        this.currentlyOpen = emailId;
        
        // Update inbox count
        this.updateInboxCount();
        
        // Track event
        if (this.experiment.tracker && this.experiment.tracker.isTracking) {
            this.experiment.tracker.logEvent('email_opened', {
                emailId: emailId,
                timesOpened: state.timesOpened
            });
        }
        
        console.log('Email opened:', emailId, 'Times opened:', state.timesOpened);
    }

    /**
     * Display email content in viewer (replaces list view)
     */
    displayEmailContent(email) {
        // Hide the email list
        const emailList = document.getElementById('email-list');
        emailList.style.display = 'none';
        
        // Find or create email viewer
        let viewer = document.getElementById('email-viewer-pane');
        
        if (!viewer) {
            // Create email viewer
            viewer = document.createElement('div');
            viewer.className = 'email-viewer';
            viewer.id = 'email-viewer-pane';
            
            // Insert it where the email list is
            emailList.parentNode.insertBefore(viewer, emailList);
        }
        
        // Populate viewer with email content
        viewer.innerHTML = `
            <div class="email-full-header">
                <div class="email-full-from">From: ${email.from}</div>
                <div class="email-full-subject">${email.subject}</div>
                <div class="email-full-time">Just now</div>
            </div>
            <div class="email-full-body">${email.body}</div>
            ${email.hasButton ? `
                <button class="email-action-btn" data-action="${email.buttonAction}">
                    ${email.buttonText}
                </button>
            ` : ''}
            ${email.canReply ? `
                <div class="email-reply-box">
                    <h4>Reply:</h4>
                    <textarea id="email-reply-text" placeholder="Type your response..."></textarea>
                    <button class="email-reply-btn" id="email-send-reply">Send Reply</button>
                </div>
            ` : ''}
        `;
        
        // Make viewer visible
        viewer.style.display = 'block';
        
        // Add event listeners for buttons
        if (email.hasButton) {
            const actionBtn = viewer.querySelector('.email-action-btn');
            actionBtn.addEventListener('click', () => this.handleEmailAction(email.buttonAction, email));
        }
        
        if (email.canReply) {
            const replyBtn = viewer.querySelector('#email-send-reply');
            replyBtn.addEventListener('click', () => this.submitResponse(email.id));
        }
    }

    /**
     * Handle email action buttons (wellness, help, jira)
     */
    handleEmailAction(action, email) {
        console.log('Email action:', action);
        
        switch(action) {
            case 'open_wellness':
                if (this.experiment.overlay) {
                    this.experiment.overlay.show('wellness', {}, () => {
                        console.log('Wellness exercise completed');
                    });
                }
                break;
                
            case 'open_help_tasks':
                if (this.experiment.overlay) {
                    this.experiment.overlay.show('work', { isHelping: true });
                }
                break;
                
            case 'open_jira':
                if (this.experiment.overlay) {
                    this.experiment.overlay.show('jira', {});
                }
                break;
        }
    }

    /**
     * Close currently open email (track time)
     */
    closeEmail() {
        if (!this.currentlyOpen) return;
        
        const state = this.emailStates[this.currentlyOpen];
        
        // Track time spent
        if (state && state.openStartTime) {
            const timeSpent = Date.now() - state.openStartTime;
            state.totalTimeOpen += timeSpent;
            state.openStartTime = null;
        }
        
        console.log('Email closed:', this.currentlyOpen, 'Total time:', state ? state.totalTimeOpen : 0);
        
        this.currentlyOpen = null;
    }

    /**
     * Close email viewer and return to inbox list view
     */
    closeEmailViewer() {
        // Close and track current email
        this.closeEmail();
        
        // Hide the viewer
        const viewer = document.getElementById('email-viewer-pane');
        if (viewer) {
            viewer.style.display = 'none';
        }
        
        // Show the email list again
        const emailList = document.getElementById('email-list');
        if (emailList) {
            emailList.style.display = 'flex';
        }
        
        console.log('Email viewer closed, returned to inbox');
    }

    /**
     * Submit email response
     */
    submitResponse(emailId) {
        const responseText = document.getElementById('email-reply-text').value.trim();
        
        if (!responseText) {
            alert('Please enter a response');
            return;
        }
        
        const state = this.emailStates[emailId];
        
        if (!state) {
            console.error('Email state not found:', emailId);
            return;
        }
        
        state.response = {
            text: responseText,
            timestamp: Date.now()
        };
        
        // Track event
        if (this.experiment.tracker && this.experiment.tracker.isTracking) {
            this.experiment.tracker.logEvent('email_response', {
                emailId: emailId,
                responseLength: responseText.length
            });
        }
        
        console.log('Response submitted for:', emailId);
        
        // Show confirmation
        alert('Response sent!');
        
        // Clear text area
        const textArea = document.getElementById('email-reply-text');
        if (textArea) {
            textArea.value = '';
        }
    }

    /**
     * Update inbox count
     */
    updateInboxCount() {
        const unreadCount = Object.values(this.emailStates)
            .filter(s => s.delivered && !s.isRead)
            .length;
        
        const countElement = document.querySelector('.folder-item.active .folder-count');
        if (countElement) {
            countElement.textContent = unreadCount;
        }
    }

    /**
     * Check if all initial emails have been read
     */
    allInitialEmailsRead() {
        const initialEmailIds = this.emails.map(e => e.id);
        
        return initialEmailIds.every(id => {
            const state = this.emailStates[id];
            return state && state.isRead;
        });
    }

    /**
     * Get all email tracking data for export
     */
    getTrackingData() {
        return {
            emailStates: this.emailStates,
            readOrder: Object.entries(this.emailStates)
                .filter(([id, state]) => state.readOrder !== null)
                .sort((a, b) => a[1].readOrder - b[1].readOrder)
                .map(([id, state]) => ({
                    emailId: id,
                    order: state.readOrder,
                    firstOpenTime: state.firstOpenTime,
                    totalTimeOpen: state.totalTimeOpen,
                    timesOpened: state.timesOpened,
                    response: state.response
                }))
        };
    }
}