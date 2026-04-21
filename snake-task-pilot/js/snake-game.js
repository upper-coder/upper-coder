/**
 * SNAKE GAME
 * Standalone snake game for pilot study
 */

class SnakeGame {
    constructor(canvasId, onGameOver) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.onGameOver = onGameOver;
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.food = {x: 0, y: 0};
        this.score = 0;
        this.gameRunning = false;
        this.gameInterval = null;
        
        this.scoreDisplay = document.getElementById('game-score');
        
        this.init();
    }

    init() {
        this.placeFood();
        this.draw();
        this.setupControls();
    }

    placeFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#27ae60';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
    }

    update() {
        if (!this.gameRunning) return;
        
        // Calculate new head position
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.scoreDisplay.textContent = this.score;
            this.placeFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }

    startGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        this.gameRunning = true;
        this.gameInterval = setInterval(() => this.update(), 100);
    }

    endGame() {
        this.gameRunning = false;
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        // Show game over
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText('Press arrow key to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        // Callback with score
        if (this.onGameOver) {
            this.onGameOver(this.score);
        }
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        this.gameRunning = false;
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        this.placeFood();
        this.draw();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                return;
            }
            
            e.preventDefault();
            
            // Start game if not running
            if (!this.gameRunning) {
                this.resetGame();
                this.startGame();
            }
            
            // Change direction
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) this.direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) this.direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) this.direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) this.direction = {x: 1, y: 0};
                    break;
            }
        });
    }
}