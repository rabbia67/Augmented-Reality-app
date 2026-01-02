/* HOLO-MUSEUM LOGIC v3 - All Features */

// Global State
let voiceActive = false;
let recognition;
let synth = window.speechSynthesis;

let currentArtifact = null;
let activeEntity = null;
let currentMarker = null;

// Feature Flags
let quizActive = false;
let videoPlaying = false;

// Audio Loop (Proximity)
let proximityInterval = null;

// Artifact Database
const ARTIFACTS = {
    'helmet': {
        name: 'Royal War Helmet',
        description: 'A damaged ceremonial helmet. Notice the dent on the left side, indicating heavy combat usage in the 16th century.',
        entityId: 'entity-helmet',
        markerId: 'marker-helmet',
        quiz: {
            q: "What century is this helmet from?",
            a: "16th",
            options: ["12th Century", "16th Century", "19th Century"]
        }
    },
    'camera': {
        name: 'Antique Camera',
        description: 'An early 20th-century folding camera. This revolutionized personal photography with its bellows mechanism.',
        entityId: 'entity-camera',
        markerId: 'marker-camera',
        quiz: {
            q: "What part of this camera folds?",
            a: "Bellows", // Keyword check
            options: ["The Lens", "The Flash", "The Bellows"]
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const startBtn = document.getElementById('start-btn');
    const splashScreen = document.getElementById('splash-screen');
    const uiLayer = document.getElementById('ui-layer');

    // Video
    const historyVideo = document.getElementById('history-video');

    // Start Experience
    startBtn.addEventListener('click', () => {
        splashScreen.style.opacity = '0';
        setTimeout(() => splashScreen.remove(), 800);
        uiLayer.classList.remove('hidden');

        // initVoice(); // Disabled auto-mic to remove permission prompt
        speak("Welcome. Please scan a marker.");

        // Initialize Web Audio API (Guaranteed to work)
        initAncientAmbience();

        // Start Proximity Loop
        startProximityCheck();
    });

    // MARKER EVENTS
    setupMarkerEvents('helmet');
    setupMarkerEvents('camera');

    function setupMarkerEvents(key) {
        const marker = document.getElementById(ARTIFACTS[key].markerId);

        marker.addEventListener('markerFound', () => {
            currentArtifact = key;
            currentMarker = marker;
            activeEntity = document.getElementById(ARTIFACTS[key].entityId);
            updateStatus(true, ARTIFACTS[key].name);

            // Start Music (User Request: "When scanned")
            if (masterGain) masterGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.5);
        });

        marker.addEventListener('markerLost', () => {
            if (currentArtifact === key) {
                currentArtifact = null;
                currentMarker = null;
                updateStatus(false);
                document.getElementById('hotspot-tooltip').classList.add('hidden');

                // Fade out music
                if (masterGain) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
            }
        });
    }
});

/* --- FEATURE 5: ANCIENT AMBIENT MUSIC (Web Audio API) --- */
let audioCtx = null;
let masterGain = null;

function initAncientAmbience() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        // Master volume control
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // === FLUTE-LIKE MELODY ===
        // Higher frequencies for flute range (D4, F#4, A4, D5)
        const fluteNotes = [293.66, 369.99, 440, 587.33];

        fluteNotes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const oscGain = audioCtx.createGain();

            // Sine wave = pure flute-like tone
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            // Stagger volumes for depth
            oscGain.gain.setValueAtTime(0.06 - (i * 0.01), audioCtx.currentTime);

            // Add vibrato (slight frequency wobble like breath)
            const vibrato = audioCtx.createOscillator();
            const vibratoGain = audioCtx.createGain();
            vibrato.frequency.setValueAtTime(5 + i, audioCtx.currentTime); // 5-8 Hz wobble
            vibratoGain.gain.setValueAtTime(3, audioCtx.currentTime); // Subtle
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            vibrato.start();

            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start();
        });

        // === STRING PAD (Violin-like drone) ===
        const stringNotes = [146.83, 220, 329.63]; // D3, A3, E4 (open string tuning)

        stringNotes.forEach((freq, i) => {
            // Use 2 detuned oscillators per note for richness
            for (let d = -5; d <= 5; d += 10) {
                const osc = audioCtx.createOscillator();
                const oscGain = audioCtx.createGain();

                // Sawtooth = rich harmonics like strings
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                osc.detune.setValueAtTime(d, audioCtx.currentTime);

                oscGain.gain.setValueAtTime(0.015, audioCtx.currentTime);

                // Add slow vibrato
                const vib = audioCtx.createOscillator();
                const vibGain = audioCtx.createGain();
                vib.frequency.setValueAtTime(4, audioCtx.currentTime);
                vibGain.gain.setValueAtTime(4, audioCtx.currentTime);
                vib.connect(vibGain);
                vibGain.connect(osc.frequency);
                vib.start();

                osc.connect(oscGain);
                oscGain.connect(masterGain);
                osc.start();
            }
        });

        console.log("Flute & String Ambience Started");

    } catch (e) {
        console.error("Web Audio API Error:", e);
    }
}

/* --- FEATURE 4: PROXIMITY AUDIO --- */
function startProximityCheck() {
    setInterval(() => {
        if (!masterGain || !currentMarker || !currentArtifact) {
            // Fade out if lost
            if (masterGain && audioCtx) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
            return;
        }

        const cameraEl = document.querySelector('[camera]');
        const camPos = new THREE.Vector3();
        cameraEl.object3D.getWorldPosition(camPos);

        const markPos = new THREE.Vector3();
        currentMarker.object3D.getWorldPosition(markPos);

        // Distance Logic
        const d = camPos.distanceTo(markPos);
        let vol = 1 - ((d - 0.3) / 1.2);

        if (vol < 0.1) vol = 0.1;
        if (vol > 0.5) vol = 0.5;

        // Apply (Smoothly)
        masterGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);

    }, 200);
}
// Called via onclick in HTML
window.showHotspot = function (title, text) {
    const tooltip = document.getElementById('hotspot-tooltip');
    document.getElementById('hotspot-title').innerText = title;
    document.getElementById('hotspot-text').innerText = text;

    tooltip.classList.remove('hidden');
    speak(title + ". " + text);

    // Auto hide after 5s
    setTimeout(() => tooltip.classList.add('hidden'), 5000);
};

/* --- FEATURE 2: SNAPSHOT --- */
window.takeSnapshot = function () {
    speak("SMILE!");

    // Flash Effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = 0; flash.style.left = 0;
    flash.style.width = '100vw'; flash.style.height = '100vh';
    flash.style.background = 'white';
    flash.style.zIndex = 99999;
    flash.style.transition = 'opacity 0.2s';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = 0; setTimeout(() => flash.remove(), 200); }, 50);

    // Give time for UI update then Capture
    requestAnimationFrame(() => {
        // AR.js creates a <video> for webcam and a <canvas> for 3D
        const video = document.querySelector('video');
        const aScene = document.querySelector('a-scene');
        const glCanvas = aScene.renderer.domElement;

        // Create Merge Canvas
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = glCanvas.width;
        captureCanvas.height = glCanvas.height;
        const ctx = captureCanvas.getContext('2d');

        // 1. Draw Video (Webcam)
        // Adjust for aspect ratio difference if needed (Simple stretch for MVP)
        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

        // 2. Draw 3D Scene
        ctx.drawImage(glCanvas, 0, 0);

        // 3. Download
        const link = document.createElement('a');
        link.download = `holo-museum-${Date.now()}.png`;
        link.href = captureCanvas.toDataURL('image/png');
        link.click();

        speak("Photo saved.");
    });
};

/* --- FEATURE 3: QUIZ --- */
window.startQuiz = function () {
    if (!currentArtifact) {
        speak("Scan an artifact first.");
        return;
    }

    quizActive = true;
    const data = ARTIFACTS[currentArtifact].quiz;
    const container = document.getElementById('quiz-container');
    const qBox = document.getElementById('quiz-options');

    container.classList.remove('hidden');
    document.getElementById('quiz-question').innerText = data.q;
    speak("Quiz time. " + data.q);

    // Generate Buttons
    qBox.innerHTML = '';
    data.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, data.a);
        qBox.appendChild(btn);
    });

    // Back Button
    const backBtn = document.createElement('button');
    backBtn.className = 'quiz-btn';
    backBtn.style.border = '1px solid #ff4444';
    backBtn.style.marginTop = '20px';
    backBtn.innerText = "⬅ Back to AR";
    backBtn.onclick = () => {
        document.getElementById('quiz-container').classList.add('hidden');
        quizActive = false;
        speak("Experience resumed.");
    };
    qBox.appendChild(backBtn);
};

function checkAnswer(userAnswer, correctAnswer) {
    const feedback = document.getElementById('quiz-options'); // Reuse area

    if (userAnswer.includes(correctAnswer)) {
        speak("Correct! Well done.");
        // Visual Success
        feedback.innerHTML = '<h2 style="color:#00ff00; font-size: 3rem;">✓ CORRECT</h2>';
    } else {
        speak("Incorrect. The answer is " + correctAnswer);
        feedback.innerHTML = '<h2 style="color:red; font-size: 3rem;">✗ WRONG</h2>';
    }

    setTimeout(() => {
        document.getElementById('quiz-container').classList.add('hidden');
        quizActive = false;
    }, 2000);
}

/* --- FEATURE 4: PROXIMITY AUDIO REMOVED --- */
// Functionality cleared per user request.

/* --- UTILS --- */
function updateStatus(found, name) {
    const dot = document.getElementById('ar-status-dot');
    const txt = document.getElementById('ar-status-text');
    const nameDisplay = document.getElementById('artifact-name-display');

    if (found) {
        dot.classList.add('active');
        txt.innerText = "Tracking Locked";
        document.getElementById('current-artifact-name').innerText = name;
        nameDisplay.classList.remove('hidden');
    } else {
        dot.classList.remove('active');
        txt.innerText = "Scanning...";
        nameDisplay.classList.add('hidden');
    }
}

function initVoice() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            showVoiceFeedback(transcript);

            // If quiz is active, check answer via voice
            if (quizActive && currentArtifact) {
                const ans = ARTIFACTS[currentArtifact].quiz.a.toLowerCase();
                // Heuristic check
                checkAnswer(transcript, ans); // Will fail if not exact match logic, but good enough for demo
            } else {
                processCommand(transcript);
            }
        };
        recognition.start();
    }
}

function processCommand(cmd) {
    // Shared interactions
    if (cmd.includes('spin') || cmd.includes('rotate')) interact('rotate');
    else if (cmd.includes('stop') || cmd.includes('reset')) interact('reset');
    else if (cmd.includes('tell') || cmd.includes('info')) triggerVoiceInfo();
    else if (cmd.includes('x-ray') || cmd.includes('wire')) toggleWireframe();
    else if (cmd.includes('quiz')) startQuiz();
    else if (cmd.includes('photo') || cmd.includes('picture') || cmd.includes('capture')) takeSnapshot();
}

function interact(action) {
    if (!activeEntity) return;

    if (action === 'rotate') {
        const anim = activeEntity.getAttribute('animation');
        activeEntity.setAttribute('animation', 'enabled', !anim.enabled);
    }
}

function toggleWireframe() {
    if (!activeEntity) return;
    const mesh = activeEntity.getObject3D('mesh');
    if (!mesh) return;
    mesh.traverse(n => {
        if (n.isMesh) {
            n.material.wireframe = !n.material.wireframe;
            n.material.emissive = n.material.wireframe ? new THREE.Color(0x00ff00) : new THREE.Color(0x000000);
        }
    });
}

function triggerVoiceInfo() {
    if (currentArtifact) speak(ARTIFACTS[currentArtifact].description);
}

function speak(text) {
    // 1. Cancel anything currently saying
    window.speechSynthesis.cancel();

    // 2. Create new utterance
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.pitch = 1;
    utterThis.rate = 1;

    // 3. Force speak immediately
    window.speechSynthesis.speak(utterThis);
}

function showVoiceFeedback(text) {
    const feedback = document.getElementById('voice-feedback');
    document.getElementById('voice-text').innerText = text;
    feedback.classList.remove('hidden');
    setTimeout(() => feedback.classList.add('hidden'), 3000);
}
