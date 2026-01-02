# 🏛️ Holo-Museum
### Augmented Reality Experience

A marker-based Augmented Reality application that brings museum artifacts to life. Built with A-Frame and AR.js for seamless web-based AR experiences.

![AR Badge](https://img.shields.io/badge/AR-WebXR-blue)
![A-Frame](https://img.shields.io/badge/A--Frame-1.4.0-pink)
![AR.js](https://img.shields.io/badge/AR.js-Marker--Based-green)

---

## ✨ Features

### 🎯 Core AR Features
- **Multi-Marker Detection** - Supports multiple custom pattern markers
- **3D Model Rendering** - High-quality glTF models (Damaged Helmet, Antique Camera)
- **Real-time Tracking** - Smooth marker tracking with status indicators

### 🎮 Interactive Controls
| Button | Function |
|--------|----------|
| 🗣️ Info | Speaks artifact description using Text-to-Speech |
| 🔄 Spin | Toggles rotation animation |
| 🕸️ X-Ray | Toggles wireframe/X-ray view mode |
| 🎓 Quiz | Starts an interactive quiz about the artifact |
| 📸 Snapshot | Captures AR photo with 3D model overlay |

### 🎵 Audio Features
- **Ambient Music** - Flute & string ensemble plays on experience start
- **Proximity Audio** - Music volume increases as you move closer to artifacts
- **Voice Narration** - Text-to-Speech describes artifacts

### 🎨 Premium UI
- Glassmorphism design with gold accents
- Cinematic splash screen with animations
- Dynamic status indicators
- Mobile-optimized controls

---

## 📱 Running on Mobile Phone

### Step 1: Start Local Server (on your PC)

1. **Open Command Prompt (CMD)**
   - Press `Windows + R`
   - Type `cmd` and press Enter

2. **Navigate to project folder**:
   ```cmd
   cd "path to your cloned folder"
   ```

3. **Start Python server on port 8000**:
   ```cmd
   python -m http.server 8000
   ```
   > You should see: `Serving HTTP on :: port 8000 (http://[::]:8000/) ...`

4. **Find your PC's IP address**:
   ```cmd
   ipconfig
   ```
   > Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

---

### Step 2: Configure Chrome on Mobile

#### On Android:

1. **Connect to same WiFi** as your PC

2. **Open Chrome** on your phone

3. **Enable Camera Access**:
   - Go to Chrome Settings (⋮) → Site Settings → Camera → Allow

4. **Allow Insecure Content** (Required for HTTP):
   - Type in address bar: `chrome://flags`
   - Search for: `Insecure origins treated as secure`
   - Add your PC's address: `http://192.168.1.100:8000`
   - Click "Enable" 
   - Restart Chrome

5. **Navigate to the app**:
   ```
   http://YOUR_PC_IP:8000
   ```
   Example: `http://192.168.1.100:8000`

6. **Allow camera permission** when prompted

#### On iPhone (Safari):

1. **Connect to same WiFi** as your PC

2. **Open Safari**

3. **Navigate to**:
   ```
   http://YOUR_PC_IP:8000
   ```

4. **Allow camera access** when prompted

---

### Step 3: Using the AR App

1. ✅ Click **"Enter Experience"**
2. ✅ Point camera at the **printed marker**
3. ✅ Watch the 3D model appear!
4. ✅ Use buttons: Info, Spin, X-Ray, Quiz, Snapshot

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not working | Enable camera in Chrome Settings → Site Settings |
| Page not loading | Check if PC and phone are on same WiFi |
| "Not Secure" warning | Add URL to Chrome flags (see Step 2.4) |
| Models not appearing | Make sure marker is clearly visible and well-lit |
| No audio | Unmute phone, check Chrome audio settings |

---

## 🖼️ Using the Markers

1. **Print the marker images** or display on another screen
2. **Open the app** and click "Enter Experience"
3. **Point your camera** at the marker
4. **Enjoy the AR experience!**

### Marker Files Required:
- `helmet.patt` - Pattern file for Warrior Helmet
- `camera.patt` - Pattern file for Antique Camera

> **Note**: Generate marker patterns using [AR.js Marker Trainer](https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html)

---

## 📁 Project Structure

```
Augmented Reality app/
├── index.html      # Main HTML with A-Frame scene
├── styles.css      # Premium glassmorphism styling
├── script.js       # AR logic, voice, quiz, audio
├── helmet.patt     # Helmet marker pattern
├── camera.patt     # Camera marker pattern
└── README.md       # This file
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| A-Frame 1.4.0 | WebVR/AR framework |
| AR.js | Marker-based AR |
| Web Speech API | Text-to-Speech narration |
| Web Audio API | Procedural ambient music |
| HTML5 Canvas | Snapshot feature |
| Vanilla CSS | Glassmorphism UI |

---

## 🎯 Quick Start

1. **Clone/Download** the project
2. **Open terminal** in project folder
3. **Start local server**:
   ```bash
   npx live-server
   ```
4. **Open in browser** or on mobile (see instructions above)
5. **Print markers** and enjoy!

---

## 📝 License

This project was created for educational purposes.

**3D Models**: Khronos Group glTF Sample Models (Public Domain)


