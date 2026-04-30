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
                
                <div style="background-color: #e8f5e9; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #27ae60; text-align: left; max-width: 350px; margin-left: auto; margin-right: auto;">
                    <strong>🎮 How to Play:</strong><br>
                    • Use <strong>arrow keys</strong> (↑ ↓ ← →) to move<br>
                    • Eat <span style="color: #e74c3c;">■ food</span> to grow longer and get points<br>
                    • Avoid hitting <span style="color: #95a5a6;">■ obstacles</span>, walls, or your tail<br>
                    • The snake speeds up as it grows longer!<br>
                    • Press any arrow key to start!
                </div>
                
                <canvas id="snake-canvas" width="300" height="300"></canvas>
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
    
    // Define obstacle map patterns (in grid coordinates 0-19)
    const obstacleMaps = [
        // Map 1: Empty (classic Snake)
        [],
        
        // Map 2: Center cross
        [
            {x: 9, y: 5}, {x: 9, y: 6}, {x: 9, y: 7}, {x: 9, y: 8}, {x: 9, y: 9}, {x: 9, y: 10}, {x: 9, y: 11}, {x: 9, y: 12}, {x: 9, y: 13},
            {x: 5, y: 9}, {x: 6, y: 9}, {x: 7, y: 9}, {x: 8, y: 9}, {x: 10, y: 9}, {x: 11, y: 9}, {x: 12, y: 9}, {x: 13, y: 9}
        ],
        
        // Map 3: Four corners
        [
            {x: 2, y: 2}, {x: 3, y: 2}, {x: 2, y: 3}, {x: 3, y: 3},
            {x: 16, y: 2}, {x: 17, y: 2}, {x: 16, y: 3}, {x: 17, y: 3},
            {x: 2, y: 16}, {x: 3, y: 16}, {x: 2, y: 17}, {x: 3, y: 17},
            {x: 16, y: 16}, {x: 17, y: 16}, {x: 16, y: 17}, {x: 17, y: 17}
        ],
        
        // Map 5: Diagonal lines
        [
            {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 6}, {x: 7, y: 7}, {x: 8, y: 8}, {x: 9, y: 9}, {x: 10, y: 10}, {x: 11, y: 11}, {x: 12, y: 12}, {x: 13, y: 13}, {x: 14, y: 14}, {x: 15, y: 15}, {x: 16, y: 16},
            {x: 16, y: 3}, {x: 15, y: 4}, {x: 14, y: 5}, {x: 13, y: 6}, {x: 12, y: 7}, {x: 11, y: 8}, {x: 10, y: 9}, {x: 9, y: 10}, {x: 8, y: 11}, {x: 7, y: 12}, {x: 6, y: 13}, {x: 5, y: 14}, {x: 4, y: 15}, {x: 3, y: 16}
        ],
        
        // Map 6: Scattered boxes
        [
            {x: 5, y: 5}, {x: 6, y: 5}, {x: 5, y: 6}, {x: 6, y: 6},
            {x: 13, y: 5}, {x: 14, y: 5}, {x: 13, y: 6}, {x: 14, y: 6},
            {x: 5, y: 13}, {x: 6, y: 13}, {x: 5, y: 14}, {x: 6, y: 14},
            {x: 13, y: 13}, {x: 14, y: 13}, {x: 13, y: 14}, {x: 14, y: 14},
            {x: 9, y: 9}, {x: 10, y: 9}, {x: 9, y: 10}, {x: 10, y: 10}
        ],
        
        // Map 7: Vertical pillars
        [
            {x: 5, y: 3}, {x: 5, y: 4}, {x: 5, y: 5}, {x: 5, y: 6}, {x: 5, y: 7},
            {x: 9, y: 12}, {x: 9, y: 13}, {x: 9, y: 14}, {x: 9, y: 15}, {x: 9, y: 16},
            {x: 14, y: 3}, {x: 14, y: 4}, {x: 14, y: 5}, {x: 14, y: 6}, {x: 14, y: 7}
        ],
        
        // Map 8: Horizontal lines
        [
            {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6},
            {x: 11, y: 13}, {x: 12, y: 13}, {x: 13, y: 13}, {x: 14, y: 13}, {x: 15, y: 13}, {x: 16, y: 13}
        ]
    ];
    
    // Game variables
    let snake = [{x: 150, y: 150}];
    let direction = {x: 0, y: 0};
    let food = {x: 0, y: 0};
    let obstacles = [];
    let currentMap = [];
    let score = 0;
    let gameRunning = false;
    let gameInterval = null;
    let baseSpeed = 100;
    let currentSpeed = baseSpeed;
    
    const gridSize = 15;
    const tileCount = canvas.width / gridSize;
    
    // Select random map and convert to pixel coordinates
    const selectRandomMap = () => {
        const randomIndex = Math.floor(Math.random() * obstacleMaps.length);
        currentMap = obstacleMaps[randomIndex];
        obstacles = currentMap.map(obs => ({
            x: obs.x * gridSize,
            y: obs.y * gridSize
        }));
        console.log('Selected map:', randomIndex, 'with', obstacles.length, 'obstacles');
    };
    
    // Find safe spawn position for snake
    const getSafeSpawnPosition = () => {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * tileCount) * gridSize;
            const y = Math.floor(Math.random() * tileCount) * gridSize;
            
            // Check if position is clear and has space around it
            const onObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
            const nearObstacle = obstacles.some(obs => 
                Math.abs(obs.x - x) <= gridSize * 2 && 
                Math.abs(obs.y - y) <= gridSize * 2
            );
            
            if (!onObstacle && !nearObstacle) {
                return {x, y};
            }
            
            attempts++;
        }
        
        // Fallback to center
        return {x: 150, y: 150};
    };
    
    // Place food randomly (avoiding snake and obstacles)
    const placeFood = () => {
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 100) {
            food = {
                x: Math.floor(Math.random() * tileCount) * gridSize,
                y: Math.floor(Math.random() * tileCount) * gridSize
            };
            
            const onSnake = snake.some(segment => segment.x === food.x && segment.y === food.y);
            const onObstacle = obstacles.some(obs => obs.x === food.x && obs.y === food.y);
            
            if (!onSnake && !onObstacle) {
                validPosition = true;
            }
            
            attempts++;
        }
    };
    
    // Draw game
    const draw = () => {
        // Clear canvas
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = '#dfe6e9';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
        
        // Draw obstacles
        ctx.fillStyle = '#95a5a6';
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x + 1, obstacle.y + 1, gridSize - 2, gridSize - 2);
            
            // Add slight 3D effect
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(obstacle.x + 1, obstacle.y + 1, gridSize - 2, 3);
            ctx.fillStyle = '#95a5a6';
        });
        
        // Draw snake with gradient
        snake.forEach((segment, index) => {
            const brightness = 255 - (index * 10);
            const green = Math.max(174, brightness);
            ctx.fillStyle = `rgb(39, ${green}, 96)`;
            ctx.fillRect(segment.x + 1, segment.y + 1, gridSize - 2, gridSize - 2);
        });
        
        // Draw food with pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 2 + 13;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(
            food.x + gridSize / 2,
            food.y + gridSize / 2,
            pulse,
            0,
            Math.PI * 2
        );
        ctx.fill();
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
        
        // Check obstacle collision
        if (obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
            gameOver();
            return;
        }
        
        snake.unshift(head);
        
        // Check food collision
        if (head.x === food.x && head.y === food.y) {
            score++;
            document.getElementById('game-score').textContent = score;
            
            // Speed up as score increases
            currentSpeed = Math.max(50, baseSpeed - (score * 3));
            clearInterval(gameInterval);
            gameInterval = setInterval(update, currentSpeed);
            
            // Show milestone messages
            if (score === 5) showMessage('Nice! Keep going! 🎯');
            if (score === 10) showMessage('Awesome! You\'re on fire! 🔥');
            if (score === 15) showMessage('Amazing! 15 points! ⭐');
            if (score === 20) showMessage('Incredible! 20 points! 🏆');
            
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
    
    // Show milestone message
    const showMessage = (text) => {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(52, 152, 219, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeOut 2s forwards;
        `;
        
        const container = document.querySelector('.game-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(messageDiv);
            setTimeout(() => messageDiv.remove(), 2000);
        }
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
        // Select a random map
        selectRandomMap();
        
        // Spawn snake in safe position
        const spawnPos = getSafeSpawnPosition();
        snake = [spawnPos];
        
        direction = {x: 0, y: 0};
        score = 0;
        currentSpeed = baseSpeed;
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
        gameInterval = setInterval(update, currentSpeed);
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
    
    console.log('Enhanced Snake game loaded with obstacle maps');
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