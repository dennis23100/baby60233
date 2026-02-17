// =====================================================
// 主程式 — 地圖、角色移動、畫面管理
// =====================================================

// ---------- State ----------
const gameState = {
  gamesCompleted: new Set(),
  npcsTalked: new Set(),
  onMap: false,
  currentGame: null,
  finalUnlocked: false
};

let player = { x: 800, y: 800, speed: 4.5, walking: false };
let keys = {};
let joystickVec = { x: 0, y: 0 };
let tapTarget = null; // {x, y} for tap-to-move
let nearEntity = null;
let animFrame = null;

// ---------- Floating Background ----------
function createFloatingDeco() {
  const c = document.getElementById('floatingDeco');
  if (!c) return;
  const items = ['♪','♫','♡','✿','⭐','♬','❀','🌸','💕','🎵','🎀','🌷'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'float-item';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = (18 + Math.random() * 22) + 's';
    el.style.animationDelay = (Math.random() * 18) + 's';
    el.style.fontSize = (12 + Math.random() * 14) + 'px';
    c.appendChild(el);
  }
}

// ---------- Opening ----------
let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;
  document.getElementById('envelope').classList.add('opened');
  setTimeout(() => {
    const btn = document.getElementById('startBtn');
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }, 1000);
}

function enterMap() {
  document.getElementById('screen-opening').style.display = 'none';
  document.getElementById('screen-map').classList.add('active');
  gameState.onMap = true;
  initMap();
  startGameLoop();
  // Start music on user interaction (entering map = user clicked)
  tryAutoplayMusic();
}

// ---------- Map Initialization ----------
function initMap() {
  const world = document.getElementById('mapWorld');
  world.innerHTML = '';
  const MAP_SIZE = 1600;

  // Paths
  CONFIG.paths.forEach(p => {
    const el = document.createElement('div');
    el.className = 'map-path';
    el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
    el.style.width = p.w + 'px'; el.style.height = p.h + 'px';
    world.appendChild(el);
  });

  // Decorations
  CONFIG.decorations.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'map-deco';
    el.textContent = d.emoji;
    el.style.left = d.x + 'px'; el.style.top = d.y + 'px';
    el.style.animationDelay = (i * 0.25) + 's';
    el.style.fontSize = (18 + Math.random() * 14) + 'px';
    world.appendChild(el);
  });

  // Center fountain
  const fountain = document.createElement('div');
  fountain.className = 'map-deco';
  fountain.textContent = '⛲';
  fountain.style.left = '780px'; fountain.style.top = '770px';
  fountain.style.fontSize = '52px';
  fountain.id = 'mapFountain';
  world.appendChild(fountain);

  // Buildings
  CONFIG.buildings.forEach(b => {
    const el = document.createElement('div');
    el.className = 'map-building';
    el.id = 'building-' + b.id;
    el.style.left = b.x + 'px'; el.style.top = b.y + 'px';
    el.dataset.game = b.game;
    const done = gameState.gamesCompleted.has(b.game);
    el.innerHTML = `
      <div class="building-glow"></div>
      <div class="building-icon">${b.emoji}</div>
      <div class="building-label">${b.label}</div>
      ${done ? '<div class="building-status">✅</div>' : ''}
    `;
    world.appendChild(el);
  });

  // NPCs
  CONFIG.npcs.forEach(n => {
    const el = document.createElement('div');
    el.className = 'npc' + (gameState.npcsTalked.has(n.id) ? ' talked' : '');
    el.id = 'npc-' + n.id;
    el.style.left = n.x + 'px'; el.style.top = n.y + 'px';
    el.style.animationDelay = (Math.random() * 2) + 's';
    el.innerHTML = `
      <div class="npc-indicator">❗</div>
      <div class="npc-body" style="background:${n.color}">${n.emoji}</div>
      <div class="npc-name">${n.name}</div>
    `;
    world.appendChild(el);
  });

  // Treasure chest (hidden, appears after 3 games)
  const chest = document.createElement('div');
  chest.id = 'treasureChest';
  chest.className = 'map-building';
  chest.style.left = '770px'; chest.style.top = '720px';
  chest.style.display = 'none';
  chest.innerHTML = `
    <div class="building-glow"></div>
    <div class="building-icon">🎁</div>
    <div class="building-label">神秘寶箱</div>
  `;
  world.appendChild(chest);

  // Player
  const pl = document.createElement('div');
  pl.className = 'player'; pl.id = 'playerEl';
  pl.innerHTML = `
    <div class="player-body">🐶</div>
    <div class="player-shadow"></div>
    <div class="player-name">寶貝</div>
  `;
  world.appendChild(pl);

  updateHud();
  updateCamera();
}

// ---------- HUD ----------
function updateHud() {
  document.getElementById('hudGames').textContent = gameState.gamesCompleted.size + '/3';
  const npcC = document.getElementById('hudNpc');
  npcC.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const h = document.createElement('span');
    h.className = 'hud-heart' + (i < gameState.npcsTalked.size ? ' filled' : '');
    h.textContent = '💕';
    npcC.appendChild(h);
  }
}

// ---------- Game Loop ----------
function startGameLoop() {
  if (animFrame) cancelAnimationFrame(animFrame);
  function loop() {
    if (gameState.onMap) {
      movePlayer();
      checkProximity();
      updateCamera();
    }
    animFrame = requestAnimationFrame(loop);
  }
  loop();
}

function movePlayer() {
  let dx = 0, dy = 0;

  // Keyboard input
  if (keys['ArrowUp'] || keys['w'] || keys['W']) dy = -1;
  if (keys['ArrowDown'] || keys['s'] || keys['S']) dy = 1;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx = -1;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx = 1;

  // Joystick input
  if (Math.abs(joystickVec.x) > 0.1 || Math.abs(joystickVec.y) > 0.1) {
    dx = joystickVec.x; dy = joystickVec.y;
    tapTarget = null; // cancel tap-to-move when joystick used
  }

  // Keyboard/joystick cancels tap target
  if (dx !== 0 || dy !== 0) tapTarget = null;

  // Tap-to-move
  if (tapTarget && dx === 0 && dy === 0) {
    const tdx = tapTarget.x - player.x;
    const tdy = tapTarget.y - player.y;
    const tdist = Math.hypot(tdx, tdy);
    if (tdist < 8) {
      tapTarget = null; // arrived
    } else {
      dx = tdx / tdist;
      dy = tdy / tdist;
    }
  }

  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag > 0) {
    dx /= mag; dy /= mag;
    player.x += dx * player.speed;
    player.y += dy * player.speed;
    player.x = Math.max(25, Math.min(1575, player.x));
    player.y = Math.max(25, Math.min(1575, player.y));
    player.walking = true;
  } else {
    player.walking = false;
  }

  const el = document.getElementById('playerEl');
  if (el) {
    el.style.left = (player.x - 20) + 'px';
    el.style.top = (player.y - 20) + 'px';
    if (player.walking) el.classList.add('walking');
    else el.classList.remove('walking');
  }
}

function updateCamera() {
  const vp = document.getElementById('mapViewport');
  if (!vp) return;
  const vw = vp.clientWidth, vh = vp.clientHeight;
  const world = document.getElementById('mapWorld');
  let cx = player.x - vw / 2;
  let cy = player.y - vh / 2;
  cx = Math.max(0, Math.min(1600 - vw, cx));
  cy = Math.max(0, Math.min(1600 - vh, cy));
  world.style.transform = `translate(${-cx}px, ${-cy}px)`;
}

function checkProximity() {
  const interactBtn = document.getElementById('interactBtn');
  let closest = null;
  let closestDist = Infinity;
  const threshold = 80;

  CONFIG.npcs.forEach(n => {
    if (gameState.npcsTalked.has(n.id)) return;
    const dist = Math.hypot(player.x - n.x, player.y - n.y);
    if (dist < threshold && dist < closestDist) {
      closestDist = dist; closest = { type: 'npc', data: n };
    }
  });

  CONFIG.buildings.forEach(b => {
    if (gameState.gamesCompleted.has(b.game)) return;
    const dist = Math.hypot(player.x - b.x, player.y - b.y);
    if (dist < threshold && dist < closestDist) {
      closestDist = dist; closest = { type: 'building', data: b };
    }
  });

  // Treasure chest appears after completing all 3 games
  if (!gameState.finalUnlocked && gameState.gamesCompleted.size >= 3) {
    const chest = document.getElementById('treasureChest');
    if (chest) chest.style.display = '';
    const dist = Math.hypot(player.x - 800, player.y - 750);
    if (dist < 90) { closest = { type: 'treasure', data: {} }; closestDist = dist; }
  }

  nearEntity = closest;
  if (closest) {
    interactBtn.classList.add('visible');
    interactBtn.textContent = closest.type === 'npc' ? '對話' : closest.type === 'building' ? '挑戰' : '🎁';
  } else {
    interactBtn.classList.remove('visible');
  }
}

// ---------- Keyboard ----------
document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });
document.addEventListener('keydown', e => {
  if ((e.key === ' ' || e.key === 'Enter') && nearEntity && gameState.onMap) {
    e.preventDefault(); handleInteract();
  }
});

// ---------- Interact ----------
document.getElementById('interactBtn').addEventListener('click', handleInteract);

function handleInteract() {
  if (!nearEntity) return;
  if (nearEntity.type === 'npc') showDialogue(nearEntity.data);
  else if (nearEntity.type === 'building') enterMiniGame(nearEntity.data.game);
  else if (nearEntity.type === 'treasure') openTreasureChest();
}

// ---------- Joystick ----------
(function initJoystick() {
  const base = document.getElementById('joystickBase');
  const stick = document.getElementById('joystickStick');
  let dragging = false;
  const maxDist = 32;

  function getCenter() {
    const r = base.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function handleMove(cx, cy) {
    const center = getCenter();
    let dx = cx - center.x, dy = cy - center.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) { dx = dx / dist * maxDist; dy = dy / dist * maxDist; }
    stick.style.left = `calc(50% + ${dx}px)`;
    stick.style.top = `calc(50% + ${dy}px)`;
    stick.style.transform = 'translate(-50%,-50%)';
    joystickVec.x = dx / maxDist;
    joystickVec.y = dy / maxDist;
  }

  function reset() {
    dragging = false;
    stick.style.left = '50%'; stick.style.top = '50%';
    stick.style.transform = 'translate(-50%,-50%)';
    joystickVec.x = 0; joystickVec.y = 0;
  }

  base.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; handleMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  base.addEventListener('touchmove', e => { e.preventDefault(); if (!dragging) return; handleMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  base.addEventListener('touchend', e => { e.preventDefault(); reset(); }, { passive: false });
  base.addEventListener('touchcancel', () => reset());
  base.addEventListener('mousedown', e => { dragging = true; handleMove(e.clientX, e.clientY); });
  window.addEventListener('mousemove', e => { if (!dragging) return; handleMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup', () => { if (dragging) reset(); });
})();

// ---------- Tap-to-Move on Map ----------
(function initTapToMove() {
  const viewport = document.getElementById('mapViewport');
  let tapStartTime = 0;
  let tapStartPos = { x: 0, y: 0 };

  // Use pointerdown/pointerup for unified mouse+touch handling
  viewport.addEventListener('pointerdown', e => {
    tapStartTime = Date.now();
    tapStartPos = { x: e.clientX, y: e.clientY };
  });

  viewport.addEventListener('pointerup', e => {
    if (!gameState.onMap) return;
    const dt = Date.now() - tapStartTime;
    const moved = Math.hypot(e.clientX - tapStartPos.x, e.clientY - tapStartPos.y);
    // Only count as tap if quick and didn't drag
    if (dt > 300 || moved > 15) return;

    // Ignore if tapped on joystick or interact button area
    const tag = e.target.closest('.joystick-container, .interact-btn, .hud, .npc, .map-building');
    if (tag) return;

    // Convert screen position to map world coordinates
    const world = document.getElementById('mapWorld');
    const transform = world.style.transform;
    const match = transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
    const offsetX = match ? parseFloat(match[1]) : 0;
    const offsetY = match ? parseFloat(match[2]) : 0;
    const vpRect = viewport.getBoundingClientRect();

    const worldX = (e.clientX - vpRect.left) - offsetX;
    const worldY = (e.clientY - vpRect.top) - offsetY;

    tapTarget = { x: Math.max(25, Math.min(1575, worldX)), y: Math.max(25, Math.min(1575, worldY)) };

    // Show tap indicator
    showTapIndicator(worldX, worldY);
  });
})();

function showTapIndicator(wx, wy) {
  const world = document.getElementById('mapWorld');
  const ind = document.createElement('div');
  ind.className = 'tap-indicator';
  ind.style.left = wx + 'px';
  ind.style.top = wy + 'px';
  world.appendChild(ind);
  setTimeout(() => ind.remove(), 600);
}

// ---------- NPC Dialogue ----------
function showDialogue(npc) {
  gameState.onMap = false;
  document.getElementById('dialogueIcon').textContent = npc.emoji;
  document.getElementById('dialogueName').textContent = npc.name;
  document.getElementById('dialogueText').textContent = npc.msg;
  document.getElementById('dialogueOverlay').classList.add('active');
  gameState.npcsTalked.add(npc.id);
  const npcEl = document.getElementById('npc-' + npc.id);
  if (npcEl) npcEl.classList.add('talked');
  updateHud();
  checkAllDone();
}

function closeDialogue() {
  document.getElementById('dialogueOverlay').classList.remove('active');
  gameState.onMap = true;
}

// ---------- Mini Game Management ----------
function enterMiniGame(gameId) {
  gameState.onMap = false;
  gameState.currentGame = gameId;
  document.getElementById(gameId).classList.add('active');
  if (gameId === 'game-memory') initMatchGame();
  else if (gameId === 'game-quiz') initQuiz();
  else if (gameId === 'game-scratch') initScratchGame();
}

function exitMiniGame() {
  if (gameState.currentGame) {
    document.getElementById(gameState.currentGame).classList.remove('active');
    // no cleanup needed for scratch
  }
  gameState.currentGame = null;
  gameState.onMap = true;
}

function completeMiniGame(gameId) {
  gameState.gamesCompleted.add(gameId);
  document.getElementById(gameId).classList.remove('active');
  gameState.currentGame = null;

  CONFIG.buildings.forEach(b => {
    if (b.game === gameId) {
      const bel = document.getElementById('building-' + b.id);
      if (bel) {
        const existing = bel.querySelector('.building-status');
        if (existing) existing.textContent = '✅';
        else {
          const s = document.createElement('div');
          s.className = 'building-status'; s.textContent = '✅';
          bel.appendChild(s);
        }
      }
    }
  });
  updateHud();
  showUnlock(gameId);
}

function showUnlock(gameId) {
  const data = CONFIG.unlocks[gameId];
  if (!data) return;
  document.getElementById('unlockIcon').textContent = data.icon;
  document.getElementById('unlockTitle').textContent = data.title;
  document.getElementById('unlockText').textContent = data.text;
  const photoEl = document.getElementById('unlockPhoto');
  if (data.photo) {
    photoEl.style.display = '';
    photoEl.innerHTML = `<img src="${data.photo}" alt="回憶照片">`;
  } else {
    photoEl.style.display = 'none';
  }
  document.getElementById('unlockOverlay').classList.add('active');
}

function closeUnlock() {
  document.getElementById('unlockOverlay').classList.remove('active');
  gameState.onMap = true;
  checkAllDone();
}

function checkAllDone() {
  if (gameState.gamesCompleted.size >= 3 && !gameState.finalUnlocked) {
    const chest = document.getElementById('treasureChest');
    if (chest) chest.style.display = '';
  }
}

// ---------- Treasure Chest → Password ----------
function openTreasureChest() {
  gameState.onMap = false;
  document.getElementById('passwordOverlay').classList.add('active');
  document.getElementById('passwordInput').value = '';
  document.getElementById('passwordError').classList.remove('visible');
  setTimeout(() => document.getElementById('passwordInput').focus(), 300);
}

function submitPassword() {
  const input = document.getElementById('passwordInput');
  const val = input.value.trim();
  if (val === CONFIG.treasurePassword) {
    document.getElementById('passwordOverlay').classList.remove('active');
    gameState.finalUnlocked = true;
    document.getElementById('screen-map').classList.remove('active');
    startSlideshow();
  } else {
    document.getElementById('passwordError').classList.add('visible');
    input.value = '';
    input.focus();
    setTimeout(() => document.getElementById('passwordError').classList.remove('visible'), 2000);
  }
}

// Allow Enter key to submit password
document.getElementById('passwordInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); submitPassword(); }
});

// ---------- Photo Slideshow ----------
let slideshowPhotos = [];
let slideshowIndex = 0;

function startSlideshow() {
  // Pick 9 random photos from allPhotos
  const all = [...CONFIG.allPhotos];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  slideshowPhotos = all.slice(0, 9);
  slideshowIndex = 0;

  const screen = document.getElementById('slideshowScreen');
  screen.classList.add('active');
  launchConfetti();
  showSlideshowPhoto();
}

function showSlideshowPhoto() {
  if (slideshowIndex >= slideshowPhotos.length) {
    // Slideshow done → go to letter
    document.getElementById('slideshowScreen').classList.remove('active');
    showLetterScreen();
    return;
  }

  const container = document.getElementById('slideshowPhoto');
  const counter = document.getElementById('slideshowCounter');
  counter.textContent = `${slideshowIndex + 1} / ${slideshowPhotos.length}`;

  // Fade out old
  const oldImg = container.querySelector('img');
  if (oldImg) {
    oldImg.style.animation = 'slideshowOut .5s ease forwards';
    setTimeout(() => {
      oldImg.remove();
      insertNewSlide();
    }, 500);
  } else {
    insertNewSlide();
  }

  function insertNewSlide() {
    const img = document.createElement('img');
    img.src = slideshowPhotos[slideshowIndex];
    img.alt = `回憶 ${slideshowIndex + 1}`;
    container.appendChild(img);
    slideshowIndex++;
    setTimeout(() => showSlideshowPhoto(), 2500);
  }
}

// ---------- Letter Screen ----------
function showLetterScreen() {
  const screen = document.getElementById('screen-letter');
  screen.classList.add('active');
  document.getElementById('letterBody').textContent = CONFIG.letterContent;
}

// ---------- Video ----------
function openVideo() {
  if (CONFIG.videoEmbedUrl) {
    window.open(CONFIG.videoEmbedUrl.replace('/preview', '/view'), '_blank');
  }
}

// ---------- Confetti ----------
function launchConfetti() {
  const box = document.getElementById('confettiBox');
  box.innerHTML = '';
  const colors = ['#FFB6C1', '#FFD700', '#FF85A2', '#E8D5F5', '#B0D4E8', '#C8E6D0', '#FF69B4', '#FFAA00'];
  const shapes = ['50%', '3px', '0'];
  for (let i = 0; i < 100; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    const size = 5 + Math.random() * 9;
    c.style.width = size + 'px';
    c.style.height = (size * (0.5 + Math.random() * 0.8)) + 'px';
    c.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
    c.style.animationDuration = (2.5 + Math.random() * 3) + 's';
    c.style.animationDelay = (Math.random() * 2.5) + 's';
    box.appendChild(c);
  }
  setTimeout(() => box.innerHTML = '', 7000);
}

// ---------- Init ----------
window.addEventListener('load', () => {
  createFloatingDeco();
});
