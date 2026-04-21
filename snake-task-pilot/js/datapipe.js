/**
 * DATAPIPE INTEGRATION
 * Sends data to DataPipe for storage
 */

class DataPipe {
    constructor(experimentId) {
        this.experimentId = experimentId;
    }

    async save(data) {
        try {
            const participantId = data.participantId || 'unknown';
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${participantId}_${timestamp}.json`;
            
            const dataString = JSON.stringify(data, null, 2);
            
            console.log('Sending to DataPipe...');
            console.log('Experiment ID:', this.experimentId);
            console.log('Filename:', filename);
            
            const response = await fetch('https://pipe.jspsych.org/api/data/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    experimentID: this.experimentId,
                    filename: filename,
                    data: dataString
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`DataPipe error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✓ Data sent to DataPipe successfully');
            
            // Also save to localStorage as backup
            localStorage.setItem(`pilot_backup_${participantId}`, dataString);
            
            return { success: true, result: result };
            
        } catch (error) {
            console.error('✗ Error sending to DataPipe:', error);
            
            // Save to localStorage as fallback
            const fallbackKey = `pilot_error_${Date.now()}`;
            localStorage.setItem(fallbackKey, JSON.stringify(data));
            console.log('Data saved to localStorage as backup:', fallbackKey);
            
            return { success: false, error: error.message };
        }
    }
}