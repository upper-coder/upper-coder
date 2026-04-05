/**
 * TRACKING SYSTEM
 * Tracks all participant actions and behaviors
 * STATUS: OUTLINE
 */

class Tracker {
    constructor(experiment) {
        this.experiment = experiment;
        this.isTracking = false;
        
        // Data storage
        this.events = []; // All discrete events
        this.tabTimes = {
            email: 0,
            work: 0,
            game: 0
        };
        this.currentTab = 'email';
        this.tabStartTime = null;
        
        this.taskData = {
            attempted: 0,
            completed: 0,
            correct: 0,
            tasks: []
        };
        
        this.helpData = {
            tasksCompleted: 0,
            tasksCorrect: 0,
            timeSpent: 0
        };
    }

    /**
     * Start tracking participant behavior
     */
    startTracking() {
        this.isTracking = true;
        this.tabStartTime = Date.now();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Tracking started');
    }

    /**
     * Stop tracking
     */
    stopTracking() {
        this.isTracking = false;
        
        // Record final tab time
        this.recordTabSwitch(null);
        
        console.log('Tracking stopped');
    }

    /**
     * Set up event listeners for tracking
     */
    setupEventListeners() {
        // TODO: Track tab switches
        document.getElementById('work-btn').addEventListener('click', () => {
            this.recordTabSwitch('work');
        });
        
        document.getElementById('game-btn').addEventListener('click', () => {
            this.recordTabSwitch('game');
        });
        
        // TODO: Track other events as needed
        // - Email clicks
        // - Task submissions
        // - etc.
    }

    /**
     * Record a discrete event
     */
    logEvent(eventType, eventData = {}) {
        if (!this.isTracking) return;
        
        const event = {
            type: eventType,
            timestamp: Date.now(),
            simTime: this.experiment.clock ? this.experiment.clock.getCurrentSimTime() : null,
            data: eventData
        };
        
        this.events.push(event);
        
        console.log('Event logged:', eventType, eventData);
    }

    /**
     * Record tab switch
     */
    recordTabSwitch(newTab) {
        if (!this.isTracking) return;
        
        // Calculate time spent on previous tab
        if (this.tabStartTime && this.currentTab) {
            const timeSpent = Date.now() - this.tabStartTime;
            this.tabTimes[this.currentTab] += timeSpent;
        }
        
        // Log the switch event
        if (newTab) {
            this.logEvent('tab_switch', {
                from: this.currentTab,
                to: newTab
            });
        }
        
        // Update current tab
        this.currentTab = newTab;
        this.tabStartTime = Date.now();
        
        console.log('Tab switch:', this.currentTab, 'Total times:', this.tabTimes);
    }

    /**
     * Record task attempt
     */
    recordTaskAttempt(taskId, answer, isCorrect, timeSpent) {
        if (!this.isTracking) return;
        
        this.taskData.attempted++;
        if (isCorrect) {
            this.taskData.correct++;
        }
        
        const taskRecord = {
            taskId: taskId,
            answer: answer,
            correct: isCorrect,
            timeSpent: timeSpent,
            timestamp: Date.now()
        };
        
        this.taskData.tasks.push(taskRecord);
        
        this.logEvent('task_submitted', taskRecord);
        
        console.log('Task recorded:', taskId, 'Correct:', isCorrect);
    }

    /**
     * Record help task (for prosocial email)
     */
    recordHelpTask(taskId, answer, isCorrect, timeSpent) {
        if (!this.isTracking) return;
        
        this.helpData.tasksCompleted++;
        if (isCorrect) {
            this.helpData.tasksCorrect++;
        }
        this.helpData.timeSpent += timeSpent;
        
        this.logEvent('help_task_completed', {
            taskId: taskId,
            correct: isCorrect,
            timeSpent: timeSpent
        });
        
        console.log('Help task recorded:', taskId);
    }

    /**
     * Record bug reassignment (for competition email)
     */
    recordBugReassignment(fromUser, toUser, bugCount) {
        if (!this.isTracking) return;
        
        this.logEvent('bugs_reassigned', {
            from: fromUser,
            to: toUser,
            count: bugCount
        });
        
        console.log('Bugs reassigned:', bugCount, 'to', toUser);
    }

    /**
     * Record boss response (for competition email - lying detection)
     */
    recordBossResponse(reportedBugs, actualBugs) {
        if (!this.isTracking) return;
        
        const lied = reportedBugs !== actualBugs;
        const discrepancy = reportedBugs - actualBugs;
        
        this.logEvent('boss_response', {
            reported: reportedBugs,
            actual: actualBugs,
            lied: lied,
            discrepancy: discrepancy
        });
        
        console.log('Boss response:', reportedBugs, 'Actual:', actualBugs, 'Lied:', lied);
    }

    /**
     * Get all tracking data for export
     */
    getAllData() {
        return {
            events: this.events,
            tabTimes: this.tabTimes,
            taskPerformance: {
                attempted: this.taskData.attempted,
                correct: this.taskData.correct,
                accuracy: this.taskData.attempted > 0 
                    ? this.taskData.correct / this.taskData.attempted 
                    : 0,
                tasks: this.taskData.tasks
            },
            prosocialBehavior: {
                tasksCompleted: this.helpData.tasksCompleted,
                tasksCorrect: this.helpData.tasksCorrect,
                timeSpent: this.helpData.timeSpent,
                accuracy: this.helpData.tasksCompleted > 0
                    ? this.helpData.tasksCorrect / this.helpData.tasksCompleted
                    : 0
            },
            summary: {
                totalEvents: this.events.length,
                totalTimeEmail: this.tabTimes.email,
                totalTimeWork: this.tabTimes.work,
                totalTimeGame: this.tabTimes.game
            }
        };
    }

    /**
     * Export data to DataPipe
     */
    async exportToDataPipe() {
        // TODO: Implement DataPipe integration
        console.log('Exporting to DataPipe...');
        
        const exportData = {
            participantId: this.experiment.state.participantId,
            condition: this.experiment.state.condition,
            tracking: this.getAllData(),
            emails: this.experiment.emailSystem.getTrackingData(),
            timestamp: new Date().toISOString()
        };
        
        console.log('Export data:', exportData);
        
        // TODO: Send to DataPipe API
        return exportData;
    }
}