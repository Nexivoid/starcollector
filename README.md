# 🪐 Star Collector

## Overview
**Star Collector** is a simple web-based arcade game built with HTML5 Canvas and JavaScript. You control a small player circle to collect stars while avoiding moving enemies. The game runs for **60 seconds** — collect as many stars as you can before time runs out. Difficulty increases over time as enemies speed up.

## 🎮 How to Play (Tutorial)
1. Enter the website!
2. The game starts immediately or after pressing a start/replay button (if present).
3. Move your player to collect glowing stars. Each star increases your score by 1.
4. Avoid colliding with enemies — hitting one ends the game early.
5. Keep collecting until the 60-second timer hits zero, then check your final score.
6. To play again, click the **Replay** button or refresh the page.

## 🕹️ Controls
### Keyboard
- **Up:** `W` or `↑`  
- **Down:** `S` or `↓`  
- **Left:** `A` or `←`  
- **Right:** `D` or `→`

### Touch (mobile)
- On-screen directional buttons: **▲ ▼ ◀ ▶** — tap to move in that direction.

## 🔊 Audio
- Star collection plays a short "ping" sound generated client-side (Web Audio API). No external audio files required.

## 💡 Features
- 60-second timed sessions  
- Increasing enemy difficulty over time  
- Keyboard and touch support  
- Responsive canvas that scales with window size  
- Minimal dependencies — pure client-side HTML & JS

## Tips & Strategy
- Move smoothly — sudden direction changes can make you run into enemies.
- Prioritize nearby stars; spending too long chasing distant stars increases collision risk.
- Use edges and corners carefully: they can provide escape routes but also trap you if enemies swarm.

## Troubleshooting
- If the canvas doesn't render, ensure JavaScript is enabled in your browser.
- For mobile input issues, try rotating the device or resizing the browser window.
- If sounds don't play, confirm the browser supports the Web Audio API and that audio is not muted.

## Credits
- Nexivoid

---
*Enjoy collecting stars!*
