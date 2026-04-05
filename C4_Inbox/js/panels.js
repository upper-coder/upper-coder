/**
 * PANELS SYSTEM
 * Manages tab switching between Email, Work, and Game
 * STATUS: OUTLINE
 */

class PanelManager {
    constructor(experiment) {
        this.experiment = experiment;
        this.currentPanel = 'email';
        this.panels = {
            email: null,
            work: null,
            game: null
        };
        
        this.setupPanels();
        this.setupNavigation();
    }

    /**
     * Set up panel elements
     */
    setupPanels() {
        // Email panel already exists in HTML
        this.panels.email = document.getElementById('inbox-content');
        
        // Create work panel
        this.createWorkPanel();
        
        // Create game panel
        this.createGamePanel();
        
        console.log('Panels initialized');
    }

    /**
     * Create work panel
     */
    createWorkPanel() {
        const workPanel = document.createElement('div');
        workPanel.id = 'work-content';
        workPanel.className = 'content-panel hidden';
        workPanel.innerHTML = `
            <div class="content-header">
                <h2>Work Tasks</h2>
                <div class="work-stats">
                    <span id="work-completed-count">Completed: 0</span>
                </div>
            </div>
            <div id="work-task-area" class="work-task-area">
                <p class="placeholder">Tasks will appear here once you begin.</p>
            </div>
        `;
        
        const mainContent = document.getElementById('main-content');
        mainContent.appendChild(workPanel);
        
        this.panels.work = workPanel;
    }

    /**
     * Create game panel
     */
    createGamePanel() {
        const gamePanel = document.createElement('div');
        gamePanel.id = 'game-content';
        gamePanel.className = 'content-panel hidden';
        gamePanel.innerHTML = `
            <div class="content-header">
                <h2>Break Room</h2>
            </div>
            <div id="game-area" class="game-area">
                <p class="placeholder">Game will load here.</p>
                <!-- TODO: Add Snake game canvas or iframe -->
            </div>
        `;
        
        const mainContent = document.getElementById('main-content');
        mainContent.appendChild(gamePanel);
        
        this.panels.game = gamePanel;
    }

    /**
     * Set up navigation button listeners
     */
    setupNavigation() {
        const workBtn = document.getElementById('work-btn');
        const gameBtn = document.getElementById('game-btn');
        
        // Initially disable buttons (will be enabled during tutorial)
        workBtn.disabled = true;
        gameBtn.disabled = true;
        
        // Add click handlers
        workBtn.addEventListener('click', () => {
            if (!workBtn.disabled) {
                this.switchPanel('work');
            }
        });
        
        gameBtn.addEventListener('click', () => {
            if (!gameBtn.disabled) {
                this.switchPanel('game');
            }
        });
        
        // TODO: Add "Back to Email" functionality if needed
        // Could be a button in work/game panels or always-visible email button
    }

    /**
     * Switch to a different panel
     */
    switchPanel(panelName) {
        if (this.currentPanel === panelName) {
            console.log('Already on panel:', panelName);
            return;
        }
        
        // Track the switch if tracking is active
        if (this.experiment.tracker && this.experiment.tracker.isTracking) {
            this.experiment.tracker.recordTabSwitch(panelName);
        }
        
        // Hide current panel
        if (this.panels[this.currentPanel]) {
            this.panels[this.currentPanel].classList.add('hidden');
        }
        
        // Show new panel
        if (this.panels[panelName]) {
            this.panels[panelName].classList.remove('hidden');
        }
        
        // Update current panel
        this.currentPanel = panelName;
        
        // Handle panel-specific initialization
        this.onPanelEnter(panelName);
        
        console.log('Switched to panel:', panelName);
    }

    /**
     * Handle panel-specific setup when entering
     */
    onPanelEnter(panelName) {
        switch(panelName) {
            case 'work':
                this.initializeWorkPanel();
                break;
            case 'game':
                this.initializeGamePanel();
                break;
            case 'email':
                // Email panel is always initialized
                break;
        }
    }

    /**
     * Initialize work panel
     */
    initializeWorkPanel() {
        const taskArea = document.getElementById('work-task-area');
        
        // Show task interface if not already shown
        if (taskArea.querySelector('.placeholder')) {
            this.experiment.taskSystem.showTaskInterface(taskArea, false, false);
        }
    }

    /**
     * Initialize game panel
     */
    initializeGamePanel() {
        const gameArea = document.getElementById('game-area');
        
        // Load game if not already loaded
        if (gameArea.querySelector('.placeholder')) {
            this.loadGame(gameArea);
        }
    }

    /**
     * Load Snake game
     */
    loadGame(container) {
        // TODO: Implement Snake game
        // Options:
        // 1. Build custom Snake with Canvas
        // 2. Embed existing Snake game via iframe
        // 3. Use a simple JavaScript library
        
        container.innerHTML = `
            <div class="game-container">
                <h3>Snake Game</h3>
                <p>Use arrow keys to move</p>
                <canvas id="snake-canvas" width="400" height="400"></canvas>
                <div class="game-score">Score: <span id="game-score">0</span></div>
            </div>
        `;
        
        // TODO: Initialize Snake game
        // this.initializeSnakeGame();
        
        console.log('Game loaded');
    }

    /**
     * Initialize Snake game (placeholder)
     */
    initializeSnakeGame() {
        // TODO: Implement Snake game logic
        // This is a complex component that needs its own implementation
        // For now, this is just a placeholder
        
        console.log('Snake game would be initialized here');
        
        // Could use a library like:
        // - Custom Canvas implementation
        // - Phaser.js
        // - p5.js
        // Or embed from external source
    }

    /**
     * Enable navigation buttons
     */
    enableNavigation() {
        document.getElementById('work-btn').disabled = false;
        document.getElementById('game-btn').disabled = false;
        
        console.log('Navigation enabled');
    }

    /**
     * Disable navigation buttons
     */
    disableNavigation() {
        document.getElementById('work-btn').disabled = true;
        document.getElementById('game-btn').disabled = true;
        
        console.log('Navigation disabled');
    }

    /**
     * Force switch to a specific panel (used by tutorial)
     */
    forceSwitch(panelName) {
        this.switchPanel(panelName);
    }

    /**
     * Get current panel name
     */
    getCurrentPanel() {
        return this.currentPanel;
    }

    /**
     * Update work task counter
     */
    updateWorkStats() {
        const stats = this.experiment.taskSystem.getPerformanceStats();
        const counterElement = document.getElementById('work-completed-count');
        
        if (counterElement) {
            counterElement.textContent = `Completed: ${stats.total} (${Math.round(stats.accuracy * 100)}% correct)`;
        }
    }
}