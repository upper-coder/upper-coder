/**
 * TASK SYSTEM
 * Manages work tasks (logic puzzles, math problems, etc.)
 * STATUS: OUTLINE
 */

class TaskSystem {
    constructor(experiment) {
        this.experiment = experiment;
        this.taskPool = [];
        this.currentTask = null;
        this.taskStartTime = null;
        this.completedTasks = [];
        
        this.containerElement = null; // Will be set when work tab is shown
    }

    /**
     * Initialize task pool
     */
    async loadTasks() {
        // TODO: Load tasks from data/tasks.json
        // OR generate tasks programmatically
        
        console.log('Loading task pool...');
        
        // TODO: Decide on task type and generate accordingly
        this.generateTaskPool();
    }

    /**
     * Generate task pool (example with math problems)
     */
    generateTaskPool() {
        // TODO: Decide final task type
        // Options: math problems, logic puzzles, pattern recognition, etc.
        
        // Placeholder: Generate simple math problems
        const difficulties = ['easy', 'medium', 'hard'];
        
        for (let i = 0; i < CONFIG.TASK_POOL_SIZE; i++) {
            const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            const task = this.generateMathProblem(difficulty);
            task.id = `task_${i + 1}`;
            task.difficulty = difficulty;
            this.taskPool.push(task);
        }
        
        console.log('Task pool generated:', this.taskPool.length, 'tasks');
    }

    /**
     * Generate a single math problem (example)
     */
    generateMathProblem(difficulty) {
        // TODO: Implement actual task generation
        // This is a placeholder
        
        let num1, num2, operation, answer;
        
        switch(difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                operation = '+';
                answer = num1 + num2;
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 50) + 10;
                num2 = Math.floor(Math.random() * 50) + 10;
                operation = Math.random() > 0.5 ? '+' : '-';
                answer = operation === '+' ? num1 + num2 : num1 - num2;
                break;
            case 'hard':
                num1 = Math.floor(Math.random() * 20) + 5;
                num2 = Math.floor(Math.random() * 12) + 2;
                operation = '×';
                answer = num1 * num2;
                break;
        }
        
        return {
            question: `${num1} ${operation} ${num2} = ?`,
            answer: answer,
            type: 'math'
        };
    }

    /**
     * Get next task from pool
     */
    getNextTask() {
        if (this.taskPool.length === 0) {
            console.warn('Task pool exhausted');
            return null;
        }
        
        // Get random task
        const randomIndex = Math.floor(Math.random() * this.taskPool.length);
        const task = this.taskPool.splice(randomIndex, 1)[0];
        
        return task;
    }

    /**
     * Show task interface
     */
    showTaskInterface(container, isPractice = false, isHelping = false) {
        this.containerElement = container;
        
        // Get a task
        this.currentTask = this.getNextTask();
        
        if (!this.currentTask) {
            container.innerHTML = '<p>No more tasks available.</p>';
            return;
        }
        
        this.taskStartTime = Date.now();
        
        // Render task
        container.innerHTML = `
            <div class="task-container">
                <div class="task-header">
                    <h3>${isPractice ? 'Practice Task' : (isHelping ? 'Help Request' : 'Task')}</h3>
                    ${!isPractice ? `<div class="task-stats">
                        <span>Completed: ${this.completedTasks.length}</span>
                    </div>` : ''}
                </div>
                
                <div class="task-body">
                    <div class="task-question">
                        ${this.renderTaskQuestion(this.currentTask)}
                    </div>
                    
                    <div class="task-answer">
                        <input type="text" 
                               id="task-answer-input" 
                               placeholder="Your answer"
                               autocomplete="off">
                        <button id="task-submit-btn" class="task-submit-btn">
                            Submit
                        </button>
                    </div>
                    
                    ${isPractice ? '<div id="task-feedback" class="task-feedback"></div>' : ''}
                </div>
            </div>
        `;
        
        // Add event listeners
        const submitBtn = document.getElementById('task-submit-btn');
        const answerInput = document.getElementById('task-answer-input');
        
        submitBtn.addEventListener('click', () => {
            this.submitTask(isPractice, isHelping);
        });
        
        // Allow Enter key to submit
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitTask(isPractice, isHelping);
            }
        });
        
        // Focus input
        answerInput.focus();
    }

    /**
     * Render task question based on task type
     */
    renderTaskQuestion(task) {
        // TODO: Handle different task types
        
        switch(task.type) {
            case 'math':
                return `<p class="math-question">${task.question}</p>`;
            // TODO: Add other task types
            default:
                return `<p>${task.question}</p>`;
        }
    }

    /**
     * Submit task answer
     */
    submitTask(isPractice = false, isHelping = false) {
        const answerInput = document.getElementById('task-answer-input');
        const userAnswer = answerInput.value.trim();
        
        if (!userAnswer) {
            alert('Please enter an answer');
            return;
        }
        
        const timeSpent = Date.now() - this.taskStartTime;
        const isCorrect = this.checkAnswer(userAnswer, this.currentTask.answer);
        
        // Record the task
        if (isHelping) {
            this.experiment.tracker.recordHelpTask(
                this.currentTask.id,
                userAnswer,
                isCorrect,
                timeSpent
            );
        } else if (!isPractice) {
            this.experiment.tracker.recordTaskAttempt(
                this.currentTask.id,
                userAnswer,
                isCorrect,
                timeSpent
            );
            
            this.completedTasks.push({
                task: this.currentTask,
                answer: userAnswer,
                correct: isCorrect,
                timeSpent: timeSpent
            });
        }
        
        // Handle feedback
        if (isPractice) {
            this.showPracticeFeedback(isCorrect);
        } else {
            // Show next task
            this.showTaskInterface(this.containerElement, false, isHelping);
        }
        
        console.log('Task submitted:', this.currentTask.id, 'Correct:', isCorrect);
    }

    /**
     * Check if answer is correct
     */
    checkAnswer(userAnswer, correctAnswer) {
        // TODO: Implement more sophisticated checking if needed
        
        // Convert both to numbers for comparison
        const userNum = parseFloat(userAnswer);
        const correctNum = parseFloat(correctAnswer);
        
        return userNum === correctNum;
    }

    /**
     * Show feedback for practice task
     */
    showPracticeFeedback(isCorrect) {
        const feedbackElement = document.getElementById('task-feedback');
        
        if (isCorrect) {
            feedbackElement.innerHTML = `
                <div class="feedback-correct">
                    ✓ Correct! Great job.
                </div>
                <button id="practice-continue-btn" class="task-submit-btn">
                    Continue to Work Period
                </button>
            `;
            
            // Add continue button listener
            document.getElementById('practice-continue-btn').addEventListener('click', () => {
                // TODO: Notify tutorial to advance
                if (this.experiment.tutorial) {
                    this.experiment.tutorial.forceAdvance();
                }
            });
        } else {
            feedbackElement.innerHTML = `
                <div class="feedback-incorrect">
                    ✗ Not quite. The correct answer is ${this.currentTask.answer}.
                </div>
                <button id="practice-retry-btn" class="task-submit-btn">
                    Try Another
                </button>
            `;
            
            // Add retry button listener
            document.getElementById('practice-retry-btn').addEventListener('click', () => {
                this.showTaskInterface(this.containerElement, true, false);
            });
        }
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const total = this.completedTasks.length;
        const correct = this.completedTasks.filter(t => t.correct).length;
        const avgTime = total > 0 
            ? this.completedTasks.reduce((sum, t) => sum + t.timeSpent, 0) / total
            : 0;
        
        return {
            total: total,
            correct: correct,
            accuracy: total > 0 ? correct / total : 0,
            avgTimeMs: avgTime
        };
    }
}