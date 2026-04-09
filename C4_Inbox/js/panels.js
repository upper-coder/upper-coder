/**
 * PANELS SYSTEM
 * Manages tab switching between Email, Work, and Game
 * STATUS: IMPLEMENTED
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
                <p class="placeholder">Click a task button or wait for tasks to be assigned.</p>
            </div>
        `;
        
        const mainContent = document.getElementById('main-content');
        mainContent.appendChild(workPanel);
        
        this.panels.work = workPanel;
    }

createGamePanel() {
        const gamePanel = document.createElement('div');
        gamePanel.id = 'game-content';
        gamePanel.className = 'content-panel hidden';
        gamePanel.innerHTML = `
            <div class="content-header">
                <h2>Break Room</h2>
            </div>
            <div id="game-area" class="game-area">
                <div class="game-container">
                    <button id="close-game-btn" class="close-game-btn">✕ Close Game</button>
                    <h3>Snake Game</h3>
                    <p>Use arrow keys to move. Press any arrow key to start.</p>
                    <canvas id="snake-canvas" width="400" height="400"></canvas>
                    <div class="game-score">Score: <span id="game-score">0</span></div>
                </div>
            </div>
        `;
        
        const mainContent = document.getElementById('main-content');
        mainContent.appendChild(gamePanel);
        
        this.panels.game = gamePanel;
        
        // Add close button handler
        setTimeout(() => {
            const closeGameBtn = document.getElementById('close-game-btn');
            if (closeGameBtn) {
                closeGameBtn.addEventListener('click', () => {
                    this.switchPanel('email');
                });
            }
        }, 100);
    }
    /**
     * Set up navigation button listeners
     */
    setupNavigation() {
        const workBtn = document.getElementById('work-btn');
        const gameBtn = document.getElementById('game-btn');
        
        // Initially disable buttons (will be enabled during tutorial or free play)
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
                // Make sure email viewer is closed and list is showing
                if (this.experiment.emailSystem) {
                    this.experiment.emailSystem.closeEmailViewer();
                }
                break;
        }
    }

    /**
     * Initialize work panel
     */
initializeWorkPanel() {
    const taskArea = document.getElementById('work-task-area');
    
    // Update containerElement to point to work container
    if (this.experiment.taskSystem) {
        this.experiment.taskSystem.containerElement = this.experiment.taskSystem.workContainer || taskArea;
    }
    
    // Update work stats counter
    this.updateWorkStats();
    
    // Show task interface if task system exists and not already shown
    if (this.experiment.taskSystem && taskArea.querySelector('.placeholder')) {
        this.experiment.taskSystem.showTaskInterface(taskArea, false, false);
    }
}

    /**
     * Initialize game panel
     */
    initializeGamePanel() {
        const gameArea = document.getElementById('game-area');
        
        // Initialize game if not already initialized
        if (!this.gameInitialized) {
            this.loadGame();
            this.gameInitialized = true;
        }
    }

/**
     * Load Snake game (simple implementation)
     */
    loadGame() {
        const canvas = document.getElementById('snake-canvas');
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Simple Snake game variables
        let snake = [{x: 200, y: 200}];
        let direction = {x: 0, y: 0};
        let food = {x: 0, y: 0};
        let score = 0;
        let gameRunning = false;
        let gameInterval = null;
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        // Place food randomly
        const placeFood = () => {
            food = {
                x: Math.floor(Math.random() * tileCount) * gridSize,
                y: Math.floor(Math.random() * tileCount) * gridSize
            };
        };
        
        // Draw game
        const draw = () => {
            // Clear canvas
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw snake
            ctx.fillStyle = '#27ae60';
            snake.forEach(segment => {
                ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
            });
            
            // Draw food
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
        };
        
        // Update game state
        const update = () => {
            if (!gameRunning) return;
            
            // Move snake
            const head = {
                x: snake[0].x + direction.x,
                y: snake[0].y + direction.y
            };
            
            // Check wall collision
            if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
                gameOver();
                return;
            }
            
            // Check self collision
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score++;
                document.getElementById('game-score').textContent = score;
                placeFood();
                
                // Track game interaction
                if (this.experiment.tracker && this.experiment.tracker.isTracking) {
                    this.experiment.tracker.logEvent('game_score', { score: score });
                }
            } else {
                snake.pop();
            }
            
            draw();
        };
        
        // Game over
        const gameOver = () => {
            gameRunning = false;
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '20px Arial';
            ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Press arrow key to restart', canvas.width / 2, canvas.height / 2 + 50);
        };
        
        // Reset game state
        const resetGame = () => {
            snake = [{x: 200, y: 200}];
            direction = {x: 0, y: 0};
            score = 0;
            document.getElementById('game-score').textContent = score;
            gameRunning = false;
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            
            placeFood();
            draw();
        };
        
        // Start game
        const startGame = () => {
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            gameRunning = true;
            gameInterval = setInterval(update, 100);
        };
        
        // Keyboard controls
        const keyHandler = (e) => {
            // Only respond when game panel is active
            if (this.currentPanel !== 'game') return;
            
            // Only respond to arrow keys
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                return;
            }
            
            e.preventDefault();
            
            // If game not running, reset and start
            if (!gameRunning) {
                resetGame();
                startGame();
            // Resume clock when game actually starts (during tutorial)
                if (this.experiment.clock && this.experiment.clock.isPaused) {
                    this.experiment.clock.resume();
                }
            }
            
            // Change direction
            switch(e.key) {
                case 'ArrowUp':
                    if (direction.y === 0) direction = {x: 0, y: -gridSize};
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) direction = {x: 0, y: gridSize};
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) direction = {x: -gridSize, y: 0};
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) direction = {x: gridSize, y: 0};
                    break;
            }
        };
        
        // Add event listener
        document.addEventListener('keydown', keyHandler);
        
        // Initialize
        resetGame();
        
        console.log('Snake game loaded');
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
    if (!this.experiment.taskSystem) return;
    
    const stats = this.experiment.taskSystem.getPerformanceStats();
    const counterElement = document.getElementById('work-completed-count');
    
    if (counterElement) {
        counterElement.textContent = `Completed: ${stats.total} (Avg: ${stats.averageEfficiencyPercent}%)`;
    }
}
}