// --- Configuration ---
const CONFIG = {
    focusDuration: 25 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 15 * 60
};

// --- Custom Cursor ---
class CustomCursor {
    constructor() {
        this.dot = document.getElementById('cursor-dot');
        this.ring = document.getElementById('cursor-ring');
        this.setup();
    }

    setup() {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            // Direct mapping for dot
            this.dot.style.left = `${x}px`;
            this.dot.style.top = `${y}px`;

            // Lag for ring
            setTimeout(() => {
                this.ring.style.left = `${x}px`;
                this.ring.style.top = `${y}px`;
            }, 80);
        });

        // Hover Effects
        document.querySelectorAll('button, a').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hover-active'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'));
        });
    }
}

// --- Visual & Audio Effects ---
class EffectManager {
    constructor() {
        this.starsContainer = document.getElementById('stars-container');
        this.createStars(100);
        this.audioCtx = null;
        this.masterGain = null;
        this.soundEnabled = false;
        this.musicEnabled = false;

        // Music Nodes
        this.ambientNodes = [];
        this.nextNoteTime = 0;
        this.musicSchedulerId = null;
    }

    createStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 2 + 1;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 5;
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.setProperty('--duration', `${duration}s`);
            star.style.setProperty('--delay', `${delay}s`);
            this.starsContainer.appendChild(star);
        }
    }

    initAudio() {
        if (this.audioCtx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.3; // safe volume
        this.masterGain.connect(this.audioCtx.destination);
    }

    // --- Generative Ambient Engine ---
    playPadChord() {
        if (!this.musicEnabled || !this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        // Simple Dm9 chord: D3, F3, A3, C4, E4
        const freqs = [146.83, 174.61, 220.00, 261.63, 329.63];
        // Pick 3 random notes
        const chord = freqs.sort(() => 0.5 - Math.random()).slice(0, 3);

        chord.forEach(freq => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            // Filter to make it soft
            const filter = this.audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400 + Math.random() * 200;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            // Long Attack/Release for pad texture
            const attack = 2 + Math.random() * 2;
            const release = 4 + Math.random() * 3;
            const duration = attack + release;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + attack);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.start(now);
            osc.stop(now + duration + 1);

            // Clean up later
            setTimeout(() => { osc.disconnect(); gain.disconnect(); }, (duration + 1) * 1000);
        });
    }

    playRandomTinkle() {
        if (!this.musicEnabled || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        // Pentatonic scale higher up
        const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        const freq = scale[Math.floor(Math.random() * scale.length)];

        osc.frequency.setValueAtTime(freq, now);

        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

        osc.start(now);
        osc.stop(now + 3);
    }

    scheduler() {
        if (!this.musicEnabled) return;

        // Schedule next event
        if (Math.random() > 0.6) this.playPadChord();
        if (Math.random() > 0.4) this.playRandomTinkle();

        // Loop
        this.musicSchedulerId = setTimeout(() => this.scheduler(), 4000 + Math.random() * 2000);
    }

    toggleMusic() {
        this.initAudio();

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        this.musicEnabled = !this.musicEnabled;

        if (this.musicEnabled) {
            // Start the engine
            this.playPadChord(); // Start immediately
            this.scheduler();
        } else {
            // Stop
            if (this.musicSchedulerId) clearTimeout(this.musicSchedulerId);
            // Optionally fade out master, but simple toggle for now
        }

        return this.musicEnabled;
    }

    // --- UI Sounds ---
    playBeep(type = 'click') {
        if (!this.soundEnabled) return;
        this.initAudio();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.audioCtx.currentTime;

        if (type === 'click') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'start') {
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'finish') {
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(1108, now + 0.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.5);
            osc.start(now);
            osc.stop(now + 1.5);
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
}

// --- Main Timer Logic ---
class TimerApp {
    constructor() {
        this.timeLeft = CONFIG.focusDuration;
        this.totalTime = CONFIG.focusDuration;
        this.isActive = false;
        this.mode = 'focus'; // focus | break
        this.interval = null;

        // Dom Elements
        this.timeDisplay = document.getElementById('time-display');
        this.modeDisplay = document.getElementById('mode-display');
        this.ringProgress = document.querySelector('.ring-progress');
        this.orbitPath = document.getElementById('orbit-path');

        this.btnToggle = document.getElementById('btn-toggle');
        this.btnReset = document.getElementById('btn-reset');
        this.btnMode = document.getElementById('btn-mode');
        this.btnSound = document.getElementById('btn-sound');

        this.effects = new EffectManager();
        new CustomCursor(); // Init Cursor

        this.initEvents();
        this.render();
    }

    initEvents() {
        // Toggle (Play/Pause)
        this.btnToggle.addEventListener('click', () => {
            this.effects.playBeep('click');
            if (this.isActive) {
                this.pause();
            } else {
                this.start();
            }
        });

        // Reset
        this.btnReset.addEventListener('click', () => {
            this.effects.playBeep('click');
            this.reset();
        });

        // Loop Modes
        this.btnMode.addEventListener('click', () => {
            this.effects.playBeep('click');
            this.switchMode();
        });

        // Sound Toggle
        this.btnSound.addEventListener('click', () => {
            // In this version, Sound Toggle also toggles Music for simplicity or we should add a separate music button?
            // Since we only have a volume/sound button, let's treat it as a master toggle initially for "Audio"
            // But user asked for Music specifically. 
            // Let's check if we have another button. In index.html we have btn-sound (volume) and btn-mode (coffee).
            // Let's repurpose the "logo-area" or just make btn-sound toggle BOTH beeps and ambient for now, 
            // OR add a specific music interaction. 
            // Better: btn-sound toggles Sfx, and let's add a NEW music button or make the "mode" button double as music? 
            // No, let's just make btn-sound toggle EVERYTHING (SFX + Ambient) for a "Focus Mode" on/off.
            // Actually, let's look at index.html, we have a secondary controls area.
            // Let's auto-play music when timer starts? Or just toggle music with this button.

            // Let's make btn-sound toggle Music.
            const isMusicOn = this.effects.toggleMusic();
            // Also toggle SFX
            const isSfxOn = this.effects.toggleSound();

            this.btnSound.classList.toggle('active', isMusicOn);
            if (isSfxOn) this.effects.playBeep('click');
        });
    }

    start() {
        if (!this.isActive) {
            this.isActive = true;
            this.effects.playBeep('start');
            this.btnToggle.innerHTML = '<span class="btn-text">PAUSE MISSION</span><i data-lucide="pause" class="btn-icon-right"></i>';
            this.orbitPath.style.animationPlayState = 'running';
            lucide.createIcons();

            this.interval = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                    this.render();
                } else {
                    this.complete();
                }
            }, 1000);
        }
    }

    pause() {
        this.isActive = false;
        clearInterval(this.interval);
        this.btnToggle.innerHTML = '<span class="btn-text">RESUME MISSION</span><i data-lucide="play" class="btn-icon-right"></i>';
        this.orbitPath.style.animationPlayState = 'paused';
        lucide.createIcons();
    }

    reset() {
        this.pause();
        this.timeLeft = this.totalTime;
        this.btnToggle.innerHTML = '<span class="btn-text">START MISSION</span><i data-lucide="play" class="btn-icon-right"></i>';
        this.render();
        lucide.createIcons();
    }

    complete() {
        this.pause();
        this.effects.playBeep('finish');
        // Simple alert for MVP, ideally a modal
        // setTimeout(() => alert('Mission Complete!'), 100); 
        this.switchMode(); // Auto switch for flow
    }

    switchMode() {
        this.reset();

        if (this.mode === 'focus') {
            this.mode = 'break';
            this.totalTime = CONFIG.breakDuration;
            document.body.classList.add('mode-break');
            this.modeDisplay.innerText = 'BREAK TIME';
        } else {
            this.mode = 'focus';
            this.totalTime = CONFIG.focusDuration;
            document.body.classList.remove('mode-break');
            this.modeDisplay.innerText = 'FOCUS';
        }

        this.timeLeft = this.totalTime;
        this.render();
    }

    render() {
        // Time Text
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        this.timeDisplay.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        // Ring Progress
        // Radius 140 -> Circumference ~ 879.6
        const circumference = 2 * Math.PI * 140;
        const offset = circumference - (this.timeLeft / this.totalTime) * circumference;

        this.ringProgress.style.strokeDasharray = circumference;
        this.ringProgress.style.strokeDashoffset = offset;
    }
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const app = new TimerApp();
});
