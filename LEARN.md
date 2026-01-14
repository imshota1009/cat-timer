# 🎓 Learning Guide: Galactic Cat Focus

Welcome to the **Galactic Cat Focus** codebase! This project is a great example of how to build a polished, interactive web application using **Vanilla JavaScript** (no frameworks), focusing on modern browser APIs and clean architecture.

Here is a breakdown of what you can learn from this project.

---

## 🏗️ Project Architecture

The project follows a simple, class-based structure in `script.js` to keep code organized and maintainable.

### Core Classes

1.  **`TimerApp`**: The main controller.
    *   Manages application state (`focus`, `break`, `isActive`).
    *   Handles the main timer loop with `setInterval`.
    *   Updates the DOM elements (Timer text, SVG Ring).
2.  **`EffectManager`**: Handles all "juice" and sensory feedback.
    *   Manages the **Web Audio API** context.
    *   Generates procedural soundscapes (Music) and UI sound effects (SFX).
    *   Creates and animates background stars.
3.  **`CustomCursor`**: Pure visual polish.
    *   Adds the trailing cursor effect using simple DOM manipulation and basic physics (lag).

---

## 🌟 Key Concepts Explained

### 1. Generative Audio (Web Audio API)
Instead of loading large MP3 files, this project **generates sound in real-time**. This reduces file size to zero and creates an infinite, non-repetitive musical experience.

*   **Oscillators**: We use `audioCtx.createOscillator()` to create sound waves (Sine, Triangle).
*   **Gain Nodes**: Used to control volume envelopes (Attack, Decay, Release) to make sounds fade in and out smoothly.
*   **Scheduling**: The `scheduler()` function recursively calls `setTimeout` with random intervals to play notes, creating an "always different" melody.

**Code Snippet (`EffectManager`):**
```javascript
// Creates a soft "pad" sound
const osc = this.audioCtx.createOscillator();
const gain = this.audioCtx.createGain();
osc.connect(gain);
gain.connect(this.masterGain);

// Envelope: Fade in -> Fade out
gain.gain.linearRampToValueAtTime(0.05, now + attack);
gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
```

### 2. SVG Progress Ring
The circular timer is not a canvas or an image; it's an **SVG** with a `stroke-dasharray`.

*   **Technique**: We set `stroke-dasharray` to the circumference of the circle. Then, we manipulate `stroke-dashoffset` to "hide" a portion of the stroke based on the remaining time.
*   **Math**: `Offset = Circumference - (TimeLeft / TotalTime * Circumference)`

### 3. Glassmorphism & Modern CSS
The UI relies heavily on modern CSS features:
*   **`backdrop-filter: blur()`**: Creates the frosted glass effect on panels.
*   **CSS Variables**: Colors are defined once in `:root` and reused everywhere (`var(--color-accent-1)`).
*   **`@keyframes`**: Used for the floating animations (`float`) and liquid waves.

---

## 🔧 Extending the Project

Want to practice? Here are some challenges to extend the functionality:

1.  **Add a Long Break**: Currently, it only toggles between Focus (25m) and Short Break (5m). Try adding a logic to trigger a Long Break (15m) after 4 focus sessions.
2.  **Visualizer**: Use an `AnalyserNode` in the Web Audio API to make the "Liquid Wave" react to the music beat.
3.  **Persist Settings**: Use `localStorage` to save the user's volume preference or custom timer durations so they persist after refreshing the page.

---

## 📚 Resources

*   [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
*   [CSS-Tricks: A Complete Guide to SVG Line Animation](https://css-tricks.com/svg-line-animation-works/)
*   [Lucide Icons](https://lucide.dev/)

Happy Coding! 🚀
