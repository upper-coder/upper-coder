/**
 * DATAPIPE INTEGRATION
 * Exports data to DataPipe for storage
 */

class DataPipe {
    constructor(experiment) {
        this.experiment = experiment;
        this.experimentId = 'ACi4eJL8dZVT';
        this.dataFormat = 'json';
    }

    /**
     * Generate unique filename for this participant
     */
    generateFilename() {
        const participantId = this.experiment.state.participantId;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${participantId}_${timestamp}.json`;
    }

    /**
     * Export data to DataPipe
     */
/**
 * Export data to DataPipe
 */
async exportData() {
    try {
        // Get all experiment data
        const trackingData = this.experiment.tracker ? this.experiment.tracker.getAllData() : {};
        
        const exportData = {
            participantId: this.experiment.state.participantId,
            condition: this.experiment.state.condition,
            inconsistency: this.experiment.state.inconsistency,
            mindset: this.experiment.state.mindset,
            startTime: this.experiment.state.startTime,
            endTime: Date.now(),
            duration: Date.now() - this.experiment.state.startTime,
            tutorial: this.experiment.data ? this.experiment.data.tutorial : {},
            tracking: trackingData,
            emails: this.experiment.emailSystem ? this.experiment.emailSystem.getTrackingData() : {},
            survey: this.experiment.data ? this.experiment.data.survey : {},
            timestamp: new Date().toISOString()
        };

        // Convert to JSON string - ADD PROPER ENCODING
        const dataString = JSON.stringify(exportData);
        
        // Generate filename
        const filename = this.generateFilename();

        console.log('Sending data to DataPipe...');
        console.log('Filename:', filename);

        // Send to DataPipe - FIX THE REQUEST FORMAT
        const response = await fetch('https://pipe.jspsych.org/api/data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                experimentID: this.experimentId,
                filename: filename,
                data: dataString  // DataPipe expects the data as a STRING
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DataPipe error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✓ Data successfully sent to DataPipe:', result);
        
        // Also save to localStorage as backup
        localStorage.setItem(
            `experiment_data_${this.experiment.state.participantId}`, 
            dataString
        );
        console.log('✓ Data backed up to localStorage');
        
        return { success: true, result: result };
        
    } catch (error) {
        console.error('✗ Error sending data to DataPipe:', error);
        
        // Save to localStorage as fallback
        const fallbackData = {
            participantId: this.experiment.state.participantId,
            condition: this.experiment.state.condition,
            error: error.message,
            timestamp: new Date().toISOString(),
            data: this.experiment.tracker ? this.experiment.tracker.getAllData() : {}
        };
        
        localStorage.setItem(
            `experiment_data_backup_${this.experiment.state.participantId}`, 
            JSON.stringify(fallbackData)
        );
        
        console.log('✓ Data saved to localStorage backup');
        
        return { success: false, error: error.message };
    }
}
}