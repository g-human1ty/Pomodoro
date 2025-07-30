class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.interval = null;
        this.completedSessions = 0;
        this.totalMinutes = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('time');
        this.timerLabel = document.getElementById('timer-label');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.completedSessionsDisplay = document.getElementById('completed-sessions');
        this.totalTimeDisplay = document.getElementById('total-time');
        this.modeButtons = document.querySelectorAll('.mode-btn');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn));
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            this.interval = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.complete();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            clearInterval(this.interval);
        }
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.getCurrentModeTime() * 60;
        this.updateDisplay();
        // Reset tab title to original
        document.title = 'Pomodoro Timer';
    }
    
    complete() {
        this.pause();
        this.completedSessions++;
        this.totalMinutes += this.getCurrentModeTime();
        
        // Add completion animation
        this.timeDisplay.parentElement.classList.add('timer-complete');
        setTimeout(() => {
            this.timeDisplay.parentElement.classList.remove('timer-complete');
        }, 500);
        
        // Show notification
        this.showNotification();
        
        // Play sound (if supported)
        this.playSound();
        
        this.updateStats();
    }
    
    switchMode(button) {
        // Remove active class from all buttons
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Update timer label
        this.timerLabel.textContent = button.dataset.label;
        
        // Reset timer with new time
        this.pause();
        this.timeLeft = parseInt(button.dataset.time) * 60;
        this.updateDisplay();
    }
    
    getCurrentModeTime() {
        const activeButton = document.querySelector('.mode-btn.active');
        return parseInt(activeButton.dataset.time);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update the display
        this.timeDisplay.textContent = timeString;
        
        // Update the browser tab title
        this.updateTabTitle(timeString);
    }
    
    updateTabTitle(timeString) {
        const activeButton = document.querySelector('.mode-btn.active');
        const modeLabel = activeButton ? activeButton.dataset.label : 'Pomodoro';
        const status = this.isRunning ? '⏸️' : '⏸️';
        
        // Only update title if timer is running or paused
        if (this.isRunning || this.timeLeft < this.getCurrentModeTime() * 60) {
            document.title = `${timeString} - ${modeLabel} - Pomodoro Timer`;
        } else {
            // Reset to original title when timer is reset
            document.title = 'Pomodoro Timer';
        }
    }
    
    updateStats() {
        this.completedSessionsDisplay.textContent = this.completedSessions;
        this.totalTimeDisplay.textContent = this.totalMinutes;
    }
    
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Complete!', {
                body: 'Time to take a break!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
            });
        } else if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification();
                }
            });
        }
    }
    
    playSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Audio not supported');
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    document.addEventListener('DOMContentLoaded', () => {
        // Show a subtle hint about notifications
        setTimeout(() => {
            if (confirm('Would you like to receive notifications when your timer completes?')) {
                Notification.requestPermission();
            }
        }, 2000);
    });
} 