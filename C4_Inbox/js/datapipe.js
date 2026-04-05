/**
 * DATAPIPE INTEGRATION
 * Handles data export to OSF via DataPipe
 * STATUS: OUTLINE
 */

class DataPipeConnector {
    constructor(experiment) {
        this.experiment = experiment;
        this.sessionId = CONFIG.DATAPIPE_SESSION;
        this.baseUrl = 'https://pipe.jspsych.org/api/data/';
        this.saveAttempts = 0;
        this.maxRetries = 3;
    }

    /**
     * Save data to DataPipe
     */
    async saveData(data) {
        if (!this.sessionId || this.sessionId === 'YOUR_SESSION_ID') {
            console.error('DataPipe session ID not configured');
            console.log('Data that would be saved:', data);
            return { success: false, error: 'No session ID' };
        }

        this.saveAttempts++;

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionID: this.sessionId,
                    filename: this.generateFilename(),
                    data: JSON.stringify(data)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Data saved successfully to DataPipe');
            return { success: true, result: result };

        } catch (error) {
            console.error('Error saving to DataPipe:', error);
            
            // Retry if not exceeded max attempts
            if (this.saveAttempts < this.maxRetries) {
                console.log(`Retrying... (${this.saveAttempts}/${this.maxRetries})`);
                await this.delay(1000); // Wait 1 second before retry
                return this.saveData(data);
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate filename for saved data
     */
    generateFilename() {
        const participantId = this.experiment.state.participantId;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${participantId}_${timestamp}.json`;
    }

    /**
     * Compile all experiment data for export
     */
    compileExperimentData() {
        const data = {
            // Participant info
            participantId: this.experiment.state.participantId,
            condition: this.experiment.state.condition,
            startTime: this.experiment.state.startTime,
            endTime: Date.now(),
            
            // Tutorial data
            tutorial: this.experiment.data.tutorial,
            
            // Email data
            emails: this.experiment.emailSystem.getTrackingData(),
            
            // Tracking data (tabs, tasks, etc.)
            tracking: this.experiment.tracker.getAllData(),
            
            // Critical email interactions
            prosocialEmail: this.getProsocialEmailData(),
            competitionEmail: this.getCompetitionEmailData(),
            
            // Metadata
            metadata: {
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                windowSize: `${window.innerWidth}x${window.innerHeight}`,
                completedAt: new Date().toISOString()
            }
        };

        return data;
    }

    /**
     * Get prosocial email specific data
     */
    getProsocialEmailData() {
        const emailState = this.experiment.emailSystem.emailStates['prosocial_email'];
        
        if (!emailState) {
            return { opened: false };
        }

        return {
            opened: emailState.isRead,
            firstOpenLatency: emailState.firstOpenTime 
                ? emailState.firstOpenTime - emailState.deliveryTime 
                : null,
            totalTimeOpen: emailState.totalTimeOpen,
            timesOpened: emailState.timesOpened,
            response: emailState.response,
            helpProvided: this.experiment.tracker.helpData
        };
    }

    /**
     * Get competition email specific data
     */
    getCompetitionEmailData() {
        const emailState = this.experiment.emailSystem.emailStates['competition_email'];
        
        if (!emailState) {
            return { opened: false };
        }

        // Extract lying behavior from tracking events
        const bossResponseEvent = this.experiment.tracker.events.find(
            e => e.type === 'boss_response'
        );
        
        const bugReassignEvent = this.experiment.tracker.events.find(
            e => e.type === 'bugs_reassigned'
        );

        return {
            opened: emailState.isRead,
            firstOpenLatency: emailState.firstOpenTime 
                ? emailState.firstOpenTime - emailState.deliveryTime 
                : null,
            totalTimeOpen: emailState.totalTimeOpen,
            timesOpened: emailState.timesOpened,
            response: emailState.response,
            jiraChecked: bugReassignEvent ? true : false,
            bugsReassigned: bugReassignEvent ? bugReassignEvent.data.count : 0,
            reportedBugs: bossResponseEvent ? bossResponseEvent.data.reported : null,
            actualBugs: bossResponseEvent ? bossResponseEvent.data.actual : null,
            lied: bossResponseEvent ? bossResponseEvent.data.lied : false
        };
    }

    /**
     * Save experiment data at completion
     */
    async saveExperimentData() {
        console.log('Compiling experiment data...');
        
        const data = this.compileExperimentData();
        
        console.log('Saving to DataPipe...');
        const result = await this.saveData(data);
        
        if (result.success) {
            console.log('✓ Data saved successfully');
        } else {
            console.error('✗ Failed to save data:', result.error);
            // TODO: Implement fallback (e.g., download as JSON file)
            this.downloadDataAsBackup(data);
        }
        
        return result;
    }

    /**
     * Download data as JSON file (backup method)
     */
    downloadDataAsBackup(data) {
        console.log('Creating backup download...');
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = this.generateFilename();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Backup file downloaded');
    }

    /**
     * Save incremental data during experiment (optional)
     */
    async saveIncremental(eventType, eventData) {
        // TODO: Optionally save data incrementally during experiment
        // This could be useful for critical events
        // But may increase server load
        
        console.log('Incremental save:', eventType, eventData);
        
        // For now, just log - implement if needed
    }

    /**
     * Utility: delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test connection to DataPipe
     */
    async testConnection() {
        console.log('Testing DataPipe connection...');
        
        const testData = {
            test: true,
            participantId: this.experiment.state.participantId,
            timestamp: new Date().toISOString()
        };
        
        const result = await this.saveData(testData);
        
        if (result.success) {
            console.log('✓ DataPipe connection successful');
        } else {
            console.error('✗ DataPipe connection failed');
        }
        
        return result;
    }
}