/* HOLO-MUSEUM LOGIC - All Features */

// Global State
let voiceActive = false;
let recognition;
let synth = window.speechSynthesis;

let currentArtifact = null;
let activeEntity = null;
let currentMarker = null;

// Feature Flags
let quizActive = false;

// Artifact Database (6 existing + 4 new antiques = 10 total)
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
            a: "Bellows",
            options: ["The Lens", "The Flash", "The Bellows"]
        }
    },
    'lantern': {
        name: 'Old Lantern',
        description: 'An oil-based lantern used for lighting before electricity. Commonly used by miners and travelers.',
        entityId: 'entity-lantern',
        markerId: 'marker-lantern',
        quiz: {
            q: "What fuel did this use?",
            a: "Oil",
            options: ["Battery", "Oil", "Solar"]
        }
    },
    'engine': {
        name: '2-Cylinder Engine',
        description: 'A classic internal combustion engine. It converts chemical energy into mechanical energy.',
        entityId: 'entity-engine',
        markerId: 'marker-engine',
        quiz: {
            q: "What does it convert?",
            a: "Energy",
            options: ["Water", "Energy", "Data"]
        }
    },
    'dragon': {
        name: 'Mythical Dragon',
        description: 'A glasswork statue of a legendary creature. Dragons appear in the folklore of many cultures around the world.',
        entityId: 'entity-dragon',
        markerId: 'marker-dragon',
        quiz: {
            q: "Is this creature real?",
            a: "Mythical",
            options: ["Real", "Mythical", "Extinct"]
        }
    },
    'waterbottle': {
        name: 'Water Bottle',
        description: 'A reusable water container. Essential for hydration during long expeditions.',
        entityId: 'entity-waterbottle',
        markerId: 'marker-waterbottle',
        quiz: {
            q: "What is it for?",
            a: "Hydration",
            options: ["Cooking", "Hydration", "Decoration"]
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const startBtn = document.getElementById('start-btn');
    const splashScreen = document.getElementById('splash-screen');
    const uiLayer = document.getElementById('ui-layer');

    // Start Experience
    startBtn.addEventListener('click', () => {
        splashScreen.style.opacity = '0';
        setTimeout(() => splashScreen.remove(), 800);
        uiLayer.classList.remove('hidden');

        speak("Welcome. Please scan a marker.");

        // Initialize Web Audio API
        initAncientAmbience();

        // Start Proximity Loop
        startProximityCheck();
    });

    // MARKER EVENTS - Initialize ALL artifacts
    Object.keys(ARTIFACTS).forEach(key => {
        setupMarkerEvents(key);
    });

    function setupMarkerEvents(key) {
        const marker = document.getElementById(ARTIFACTS[key].markerId);
        if (!marker) {
            console.warn(`Marker element not found for: ${key}`);
            return;
        }

        marker.addEventListener('markerFound', () => {
            currentArtifact = key;
            currentMarker = marker;

            // Enforce Visibility: Hide ALL others, Show THIS one
            Object.keys(ARTIFACTS).forEach(k => {
                const el = document.getElementById(ARTIFACTS[k].entityId);
                if (el) {
                    el.setAttribute('visible', k === key ? 'true' : 'false');
                }
            });

            activeEntity = document.getElementById(ARTIFACTS[key].entityId);
            updateStatus(true, ARTIFACTS[key].name);

            // Start Music
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

/* --- AMBIENT MUSIC (Web Audio API) --- */
let audioCtx = null;
let masterGain = null;

function initAncientAmbience() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // Flute-like melody
        const fluteNotes = [293.66, 369.99, 440, 587.33];
        fluteNotes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const oscGain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            oscGain.gain.setValueAtTime(0.06 - (i * 0.01), audioCtx.currentTime);

            const vibrato = audioCtx.createOscillator();
            const vibratoGain = audioCtx.createGain();
            vibrato.frequency.setValueAtTime(5 + i, audioCtx.currentTime);
            vibratoGain.gain.setValueAtTime(3, audioCtx.currentTime);
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            vibrato.start();

            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start();
        });

        // String pad
        const stringNotes = [146.83, 220, 329.63];
        stringNotes.forEach((freq) => {
            for (let d = -5; d <= 5; d += 10) {
                const osc = audioCtx.createOscillator();
                const oscGain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                osc.detune.setValueAtTime(d, audioCtx.currentTime);
                oscGain.gain.setValueAtTime(0.015, audioCtx.currentTime);

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

        console.log("Ambience Started");
    } catch (e) {
        console.error("Web Audio API Error:", e);
    }
}

/* --- PROXIMITY AUDIO --- */
function startProximityCheck() {
    setInterval(() => {
        if (!masterGain || !currentMarker || !currentArtifact) {
            if (masterGain && audioCtx) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
            return;
        }

        const cameraEl = document.querySelector('[camera]');
        const camPos = new THREE.Vector3();
        cameraEl.object3D.getWorldPosition(camPos);

        const markPos = new THREE.Vector3();
        currentMarker.object3D.getWorldPosition(markPos);

        const d = camPos.distanceTo(markPos);
        let vol = 1 - ((d - 0.3) / 1.2);
        if (vol < 0.1) vol = 0.1;
        if (vol > 0.5) vol = 0.5;

        masterGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);
    }, 200);
}

/* --- HOTSPOT --- */
window.showHotspot = function (title, text) {
    const tooltip = document.getElementById('hotspot-tooltip');
    document.getElementById('hotspot-title').innerText = title;
    document.getElementById('hotspot-text').innerText = text;

    tooltip.classList.remove('hidden');
    speak(title + ". " + text);

    setTimeout(() => tooltip.classList.add('hidden'), 5000);
};

/* --- SNAPSHOT --- */
window.takeSnapshot = function () {
    speak("SMILE!");

    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:white;z-index:99999;transition:opacity 0.2s';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = 0; setTimeout(() => flash.remove(), 200); }, 50);

    requestAnimationFrame(() => {
        const video = document.querySelector('video');
        const aScene = document.querySelector('a-scene');
        const glCanvas = aScene.renderer.domElement;

        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = glCanvas.width;
        captureCanvas.height = glCanvas.height;
        const ctx = captureCanvas.getContext('2d');

        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        ctx.drawImage(glCanvas, 0, 0);

        const link = document.createElement('a');
        link.download = `holo-museum-${Date.now()}.png`;
        link.href = captureCanvas.toDataURL('image/png');
        link.click();

        speak("Photo saved.");
    });
};

/* --- QUIZ --- */
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

    qBox.innerHTML = '';
    data.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, data.a);
        qBox.appendChild(btn);
    });

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
    const feedback = document.getElementById('quiz-options');

    if (userAnswer.includes(correctAnswer)) {
        speak("Correct! Well done.");
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

function interact(action) {
    if (!activeEntity) return;

    if (action === 'rotate') {
        const anim = activeEntity.getAttribute('animation');
        activeEntity.setAttribute('animation', 'enabled', !anim.enabled);
    }
}

// 360 View - Rotate on multiple axes
let is360Active = false;
window.toggle360View = function () {
    if (!activeEntity) {
        speak("Scan an artifact first.");
        return;
    }

    is360Active = !is360Active;

    if (is360Active) {
        activeEntity.setAttribute('animation__360x', {
            property: 'rotation',
            to: '360 0 0',
            loop: true,
            dur: 8000,
            easing: 'linear'
        });
        activeEntity.setAttribute('animation__360y', {
            property: 'object3D.rotation.y',
            from: 0,
            to: 6.28,
            loop: true,
            dur: 10000,
            easing: 'linear'
        });
        speak("360 view enabled.");
    } else {
        activeEntity.removeAttribute('animation__360x');
        activeEntity.removeAttribute('animation__360y');
        activeEntity.object3D.rotation.set(0, 0, 0);
        speak("360 view disabled.");
    }
};

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
    window.speechSynthesis.cancel();
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.pitch = 1;
    utterThis.rate = 1;
    window.speechSynthesis.speak(utterThis);
}

function showVoiceFeedback(text) {
    const feedback = document.getElementById('voice-feedback');
    document.getElementById('voice-text').innerText = text;
    feedback.classList.remove('hidden');
    setTimeout(() => feedback.classList.add('hidden'), 3000);
}
