/**
 * TRACKING SYSTEM
 * Tracks all participant actions and behaviors with efficiency-based metrics
 * STATUS: IMPLEMENTED
 */

class Tracker {
    constructor(experiment) {
        this.experiment = experiment;
        this.isTracking = false;
        
        // Discrete event log
        this.events = [];
        
        // Tab time tracking
        this.tabTimes = {
            email: 0,
            work: 0,
            game: 0
        };
        this.currentTab = 'email';
        this.tabStartTime = null;
        
        // Personal work task performance
        this.workTasks = {
            completed: 0,
            totalEfficiency: 0,
            totalTime: 0,
            tasks: []
        };
        
        // Help task performance (prosocial behavior)
        this.helpTasks = {
            completed: 0,
            totalEfficiency: 0,
            totalTime: 0,
            tasks: []
        };
        
        // Email interaction data
        this.emailInteractions = {
            prosocialEmail: {
                opened: false,
                firstOpenTime: null,
                totalTimeOpen: 0,
                timesOpened: 0,
                helpProvided: false
            },
            competitionEmail: {
                opened: false,
                firstOpenTime: null,
                totalTimeOpen: 0,
                timesOpened: 0,
                jiraChecked: false,
                bugsReassigned: 0,
                reportedBugs: null,
                actualBugs: null,
                lied: false
            }
        };
    }

    /**
     * Start tracking participant behavior
     */
    startTracking() {
        this.isTracking = true;
        this.tabStartTime = Date.now();
        
        console.log('✓ Tracking started');
    }

    /**
     * Stop tracking
     */
    stopTracking() {
        if (!this.isTracking) return;
        
        this.isTracking = false;
        
        // Record final tab time
        if (this.tabStartTime && this.currentTab) {
            const timeSpent = Date.now() - this.tabStartTime;
            this.tabTimes[this.currentTab] += timeSpent;
        }
        
        console.log('✓ Tracking stopped');
    }

    /**
     * Log a discrete event
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
        
        console.log('Tab switch:', this.currentTab);
    }

    /**
     * Record personal work task completion
     */
    recordWorkTask(taskId, routeAnswer, timeSpent, metrics) {
        if (!this.isTracking) return;
        
        const efficiency = metrics.efficiency || 0;
        
        this.workTasks.completed++;
        this.workTasks.totalEfficiency += efficiency;
        this.workTasks.totalTime += timeSpent;
        
        const taskRecord = {
            taskId: taskId,
            route: routeAnswer,
            efficiency: efficiency,
            efficiencyPercent: metrics.efficiencyPercent || Math.round(efficiency * 100),
            distance: metrics.distance,
            optimalDistance: metrics.optimalDistance,
            timeSpent: timeSpent,
            timestamp: Date.now()
        };
        
        this.workTasks.tasks.push(taskRecord);
        
        this.logEvent('work_task_completed', {
            taskId: taskId,
            efficiency: efficiency,
            efficiencyPercent: taskRecord.efficiencyPercent
        });
        
        console.log(`Work task completed: ${taskId} (${taskRecord.efficiencyPercent}% efficient)`);
    }

    /**
     * Record help task completion (prosocial behavior)
     */
    recordHelpTask(taskId, routeAnswer, timeSpent, metrics) {
        if (!this.isTracking) return;
        
        const efficiency = metrics.efficiency || 0;
        
        this.helpTasks.completed++;
        this.helpTasks.totalEfficiency += efficiency;
        this.helpTasks.totalTime += timeSpent;
        
        const taskRecord = {
            taskId: taskId,
            route: routeAnswer,
            efficiency: efficiency,
            efficiencyPercent: metrics.efficiencyPercent || Math.round(efficiency * 100),
            distance: metrics.distance,
            optimalDistance: metrics.optimalDistance,
            timeSpent: timeSpent,
            timestamp: Date.now()
        };
        
        this.helpTasks.tasks.push(taskRecord);
        
        // Mark that help was provided
        this.emailInteractions.prosocialEmail.helpProvided = true;
        
        this.logEvent('help_task_completed', {
            taskId: taskId,
            efficiency: efficiency,
            efficiencyPercent: taskRecord.efficiencyPercent
        });
        
        console.log(`Help task completed: ${taskId} (${taskRecord.efficiencyPercent}% efficient)`);
    }

    /**
     * Record bug reassignment (competition email interaction)
     */
    recordBugReassignment(fromUser, toUser, bugCount) {
        if (!this.isTracking) return;
        
        this.emailInteractions.competitionEmail.jiraChecked = true;
        this.emailInteractions.competitionEmail.bugsReassigned += bugCount;
        
        this.logEvent('bugs_reassigned', {
            from: fromUser,
            to: toUser,
            count: bugCount
        });
        
        console.log(`Bugs reassigned: ${bugCount} to ${toUser}`);
    }

    /**
     * Record boss response (competition email - lying detection)
     */
    recordBossResponse(reportedBugs, actualBugs) {
        if (!this.isTracking) return;
        
        const lied = reportedBugs !== actualBugs;
        const discrepancy = reportedBugs - actualBugs;
        
        this.emailInteractions.competitionEmail.reportedBugs = reportedBugs;
        this.emailInteractions.competitionEmail.actualBugs = actualBugs;
        this.emailInteractions.competitionEmail.lied = lied;
        
        this.logEvent('boss_response', {
            reported: reportedBugs,
            actual: actualBugs,
            lied: lied,
            discrepancy: discrepancy
        });
        
        console.log(`Boss response - Reported: ${reportedBugs}, Actual: ${actualBugs}, Lied: ${lied}`);
    }

    /**
     * Update email interaction tracking (called by email system)
     */
    updateEmailTracking(emailId, interactionData) {
        if (!this.isTracking) return;
        
        // Map email IDs to tracking categories
        if (emailId === 'prosocial_email') {
            Object.assign(this.emailInteractions.prosocialEmail, interactionData);
        } else if (emailId === 'competition_email') {
            Object.assign(this.emailInteractions.competitionEmail, interactionData);
        }
    }

    /**
     * Calculate summary statistics
     */
    calculateSummaryStats() {
        return {
            // Work task stats
            workTasksCompleted: this.workTasks.completed,
            workAverageEfficiency: this.workTasks.completed > 0 
                ? this.workTasks.totalEfficiency / this.workTasks.completed 
                : 0,
            workAverageEfficiencyPercent: this.workTasks.completed > 0 
                ? Math.round((this.workTasks.totalEfficiency / this.workTasks.completed) * 100)
                : 0,
            workAverageTime: this.workTasks.completed > 0 
                ? Math.round(this.workTasks.totalTime / this.workTasks.completed)
                : 0,
            
            // Help task stats
            helpTasksCompleted: this.helpTasks.completed,
            helpAverageEfficiency: this.helpTasks.completed > 0 
                ? this.helpTasks.totalEfficiency / this.helpTasks.completed 
                : 0,
            helpAverageEfficiencyPercent: this.helpTasks.completed > 0 
                ? Math.round((this.helpTasks.totalEfficiency / this.helpTasks.completed) * 100)
                : 0,
            helpAverageTime: this.helpTasks.completed > 0 
                ? Math.round(this.helpTasks.totalTime / this.helpTasks.completed)
                : 0,
            helpProvided: this.emailInteractions.prosocialEmail.helpProvided,
            
            // Time allocation
            totalTimeEmail: this.tabTimes.email,
            totalTimeWork: this.tabTimes.work,
            totalTimeGame: this.tabTimes.game,
            percentTimeEmail: this.getTimePercentage('email'),
            percentTimeWork: this.getTimePercentage('work'),
            percentTimeGame: this.getTimePercentage('game'),
            
            // Competitive behavior
            liedToBoss: this.emailInteractions.competitionEmail.lied,
            bugsReassigned: this.emailInteractions.competitionEmail.bugsReassigned,
            
            // Overall engagement
            totalEvents: this.events.length
        };
    }

    /**
     * Get percentage of time spent on a specific tab
     */
    getTimePercentage(tab) {
        const totalTime = this.tabTimes.email + this.tabTimes.work + this.tabTimes.game;
        if (totalTime === 0) return 0;
        return Math.round((this.tabTimes[tab] / totalTime) * 100);
    }

    /**
     * Get all tracking data for export
     */
    getAllData() {
        const summary = this.calculateSummaryStats();
        
        return {
            // Summary statistics
            summary: summary,
            
            // Detailed work task data
            workTasks: {
                completed: this.workTasks.completed,
                totalEfficiency: this.workTasks.totalEfficiency,
                totalTime: this.workTasks.totalTime,
                averageEfficiency: summary.workAverageEfficiency,
                averageEfficiencyPercent: summary.workAverageEfficiencyPercent,
                averageTime: summary.workAverageTime,
                tasks: this.workTasks.tasks
            },
            
            // Detailed help task data
            helpTasks: {
                completed: this.helpTasks.completed,
                totalEfficiency: this.helpTasks.totalEfficiency,
                totalTime: this.helpTasks.totalTime,
                averageEfficiency: summary.helpAverageEfficiency,
                averageEfficiencyPercent: summary.helpAverageEfficiencyPercent,
                averageTime: summary.helpAverageTime,
                tasks: this.helpTasks.tasks
            },
            
            // Email interactions
            emailInteractions: this.emailInteractions,
            
            // Time allocation
            tabTimes: {
                email: this.tabTimes.email,
                work: this.tabTimes.work,
                game: this.tabTimes.game,
                percentEmail: summary.percentTimeEmail,
                percentWork: summary.percentTimeWork,
                percentGame: summary.percentTimeGame
            },
            
            // Event log
            events: this.events
        };
    }

    /**
     * Export data to DataPipe
     */
    async exportToDataPipe() {
        console.log('Preparing data for export...');
        
        const exportData = {
            participantId: this.experiment.state.participantId,
            condition: this.experiment.state.condition,
            inconsistency: this.experiment.state.inconsistency,
            mindset: this.experiment.state.mindset,
            startTime: this.experiment.state.startTime,
            endTime: Date.now(),
            duration: Date.now() - this.experiment.state.startTime,
            tracking: this.getAllData(),
            emails: this.experiment.emailSystem ? this.experiment.emailSystem.getTrackingData() : {},
            timestamp: new Date().toISOString()
        };
        
        console.log('Export data compiled:', exportData);
        
        // TODO: Send to DataPipe
        // For now, save to localStorage as backup
        localStorage.setItem(
            `experiment_data_${this.experiment.state.participantId}`, 
            JSON.stringify(exportData)
        );
        console.log('✓ Data saved to localStorage as backup');
        
        return exportData;
    }

    /**
     * Get current help task count (for overlay display)
     */
    getHelpTaskCount() {
        return this.helpTasks.completed;
    }

    /**
     * Get current work task count (for panel display)
     */
    getWorkTaskCount() {
        return this.workTasks.completed;
    }
}