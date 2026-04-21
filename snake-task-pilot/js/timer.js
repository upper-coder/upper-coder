/**
 * COUNTDOWN TIMER
 * 5-minute countdown for activity task
 */

class Timer {
    constructor(durationSeconds, onComplete) {
        this.duration = durationSeconds;
        this.remaining = durationSeconds;
        this.onComplete = onComplete;
        this.interval = null;
        this.display = document.getElementById('timer-display');
    }

    start() {
        this.updateDisplay();
        
        this.interval = setInterval(() => {
            this.remaining--;
            this.updateDisplay();
            
            if (this.remaining <= 0) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.remaining / 60);
        const seconds = this.remaining % 60;
        this.display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when time is running low
        if (this.remaining <= 30) {
            this.display.style.color = '#e74c3c';
        } else if (this.remaining <= 60) {
            this.display.style.color = '#f39c12';
        }
    }

    getElapsedTime() {
        return this.duration - this.remaining;
    }
}