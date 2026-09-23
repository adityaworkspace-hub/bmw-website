/**
 * BMW VIBRANT - MAIN APPLICATION JAVASCRIPT
 * Handles navigation, interactive audio synthesizer, scroll reveals
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initEngineSound();
});

/* ==========================================================================
   NAVBAR & MOBILE DRAWER
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Sticky header background transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.innerHTML = '☰';
      });
    });
  }
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.feature-card, .model-card, .art-card, .builder-step-card, .spec-chip'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(25px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  }
}

/* ==========================================================================
   WEB AUDIO API ENGINE SYNTHESIZER
   Generates a high-performance twin-turbo engine rev sound in real-time!
   ========================================================================== */
function initEngineSound() {
  const soundBtn = document.getElementById('engineSoundBtn');
  if (!soundBtn) return;

  let audioCtx = null;
  let isPlaying = false;

  soundBtn.addEventListener('click', () => {
    if (isPlaying) return;
    isPlaying = true;
    soundBtn.classList.add('playing');
    soundBtn.innerHTML = `<span>🔊</span> Revving Engine...`;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      const duration = 2.4; // 2.4 seconds rev
      const now = audioCtx.currentTime;

      // 1. Low rumble oscillator (V8/Twin Turbo baseline)
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      // Pitch rev ramp (Idle 65Hz -> Peak 280Hz -> Idle 75Hz)
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.8);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 1.4);
      osc1.frequency.exponentialRampToValueAtTime(360, now + 1.8);
      osc1.frequency.exponentialRampToValueAtTime(70, now + duration);

      osc2.frequency.setValueAtTime(32, now);
      osc2.frequency.exponentialRampToValueAtTime(160, now + 0.8);
      osc2.frequency.exponentialRampToValueAtTime(70, now + 1.4);
      osc2.frequency.exponentialRampToValueAtTime(180, now + 1.8);
      osc2.frequency.exponentialRampToValueAtTime(35, now + duration);

      // Low-pass filter for beefy exhaust tone
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.linearRampToValueAtTime(1200, now + 0.8);
      filter.frequency.linearRampToValueAtTime(400, now + 1.4);
      filter.frequency.linearRampToValueAtTime(1400, now + 1.8);
      filter.frequency.linearRampToValueAtTime(200, now + duration);

      // Volume envelope
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.2);
      gainNode.gain.linearRampToValueAtTime(0.45, now + 0.8);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 1.4);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 1.8);
      gainNode.gain.linearRampToValueAtTime(0.001, now + duration);

      // 2. White noise buffer for exhaust pop & air rush
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450, now);
      noiseFilter.frequency.linearRampToValueAtTime(2200, now + 1.8);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.12, now + 1.8);
      noiseGain.gain.linearRampToValueAtTime(0.001, now + duration);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);

      // Route oscillators
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      noise.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);
      noise.stop(now + duration);

      setTimeout(() => {
        isPlaying = false;
        soundBtn.classList.remove('playing');
        soundBtn.innerHTML = `<span>⚡</span> Start M Twin-Turbo Engine`;
      }, duration * 1000 + 200);

    } catch (err) {
      console.warn('Web Audio playback error or not supported:', err);
      isPlaying = false;
      soundBtn.classList.remove('playing');
      soundBtn.innerHTML = `<span>⚡</span> Start M Twin-Turbo Engine`;
    }
  });
}
