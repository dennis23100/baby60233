// =====================================================
// 三個小遊戲邏輯 + 音樂控制
// =====================================================

// ===================
// BACKGROUND MUSIC
// ===================
let musicPlaying = false;
const musicTracks = [
  "music/抖音《愛的就是你》劉佳【動態歌詞Lyrics】.mp3",
  "music/新樂塵符 - 123我愛你『這首專屬情歌 請記得！』【動態歌詞Lyrics】.mp3"
];
let currentTrackIndex = 0;
let bgAudio = null;

function initMusic() {
  bgAudio = new Audio();
  bgAudio.volume = 0.4;
  bgAudio.src = musicTracks[currentTrackIndex];

  bgAudio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
    bgAudio.src = musicTracks[currentTrackIndex];
    bgAudio.play();
  });
}

function toggleMusic() {
  if (!bgAudio) initMusic();
  const btn = document.getElementById('musicBtn');

  if (musicPlaying) {
    bgAudio.pause();
    musicPlaying = false;
    btn.textContent = '🔇';
    btn.classList.remove('playing');
  } else {
    bgAudio.play().catch(() => {});
    musicPlaying = true;
    btn.textContent = '🎵';
    btn.classList.add('playing');
  }
}

function tryAutoplayMusic() {
  if (!bgAudio) initMusic();
  bgAudio.play().then(() => {
    musicPlaying = true;
    const btn = document.getElementById('musicBtn');
    btn.textContent = '🎵';
    btn.classList.add('playing');
  }).catch(() => {
    // Autoplay blocked — user will click music button
  });
}

// ===================
// GAME 1: MEMORY MATCH (Photo Cards)
// ===================
let matchFlipped = [], matchLocked = false, matchMoves = 0, matchPairsFound = 0;

function initMatchGame() {
  const grid = document.getElementById('matchGrid');
  grid.innerHTML = '';
  matchMoves = 0; matchPairsFound = 0;
  matchFlipped = []; matchLocked = false;
  document.getElementById('matchMoves').textContent = '0';
  document.getElementById('matchPairs').textContent = '0';

  // 8 photos × 2 = 16 cards
  let photos = [...CONFIG.matchPhotos, ...CONFIG.matchPhotos];
  for (let i = photos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photos[i], photos[j]] = [photos[j], photos[i]];
  }

  photos.forEach((photo) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.dataset.photo = photo;
    card.innerHTML = `
      <div class="card-front"></div>
      <div class="card-back"><img src="${photo}" alt="" loading="eager"></div>
    `;
    card.addEventListener('click', () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (matchLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  matchFlipped.push(card);

  if (matchFlipped.length === 2) {
    matchLocked = true; matchMoves++;
    document.getElementById('matchMoves').textContent = matchMoves;
    const [a, b] = matchFlipped;

    if (a.dataset.photo === b.dataset.photo) {
      a.classList.add('matched'); b.classList.add('matched');
      matchPairsFound++;
      document.getElementById('matchPairs').textContent = matchPairsFound;
      matchFlipped = []; matchLocked = false;
      if (matchPairsFound === 8) {
        setTimeout(() => completeMiniGame('game-memory'), 800);
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        matchFlipped = []; matchLocked = false;
      }, 900);
    }
  }
}

// ===================
// GAME 2: QUIZ (2 questions, special mechanics)
// ===================
let quizIndex = 0;

function initQuiz() {
  quizIndex = 0;
  showQuizQuestion();
}

function showQuizQuestion() {
  const card = document.getElementById('quizCard');
  const q = CONFIG.quizQuestions[quizIndex];
  card.innerHTML = `
    <div class="quiz-question">
      <span class="emoji">${q.emoji}</span>
      ${q.question}
    </div>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" onclick="answerQuiz(${i},this)">${opt}</button>
      `).join('')}
    </div>
    <div class="quiz-extra" id="quizExtra">${q.extraMsg}</div>
    <button class="quiz-next-btn" id="quizNextBtn" onclick="nextQuizQuestion()">
      ${quizIndex < CONFIG.quizQuestions.length - 1 ? '下一題 →' : '完成！🎉'}
    </button>
  `;
}

function answerQuiz(idx, btn) {
  const q = CONFIG.quizQuestions[quizIndex];
  const options = btn.parentElement.querySelectorAll('.quiz-option');
  options.forEach(o => o.style.pointerEvents = 'none');

  if (q.correctIndex === -1) {
    btn.classList.add('wrong');
  } else if (idx === q.correctIndex) {
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    options[q.correctIndex].classList.add('correct');
  }

  setTimeout(() => {
    document.getElementById('quizExtra').classList.add('visible');
    document.getElementById('quizNextBtn').classList.add('visible');
  }, 800);
}

function nextQuizQuestion() {
  quizIndex++;
  if (quizIndex < CONFIG.quizQuestions.length) {
    showQuizQuestion();
  } else {
    completeMiniGame('game-quiz');
  }
}

// ===================
// GAME 3: SCRATCH CARD + PUZZLE (刮刮樂 + 拼圖)
// ===================
let scratchCtx = null;
let scratchDragging = false;
let scratchTotal = 0;
let scratchCleared = 0;
let scratchDone = false;

// Puzzle state
let puzzleTiles = [];    // current tile arrangement (0-8, where 8 = empty)
let puzzleMoves = 0;
let puzzleSolved = false;

function initScratchGame() {
  scratchDone = false;
  scratchCleared = 0;
  puzzleSolved = false;
  puzzleMoves = 0;

  // Make sure Phase 1 is visible, Phase 2 is hidden
  document.getElementById('scratchPhase1').style.display = '';
  document.getElementById('puzzlePhase2').classList.remove('active');

  const wrapper = document.getElementById('scratchWrapper');
  const canvas = document.getElementById('scratchCanvas');
  const img = document.getElementById('scratchImg');

  // Reset canvas visibility
  canvas.style.transition = '';
  canvas.style.opacity = '1';

  // Set photo
  img.src = CONFIG.scratchPhoto;

  // Wait a frame for layout
  requestAnimationFrame(() => {
    const w = wrapper.offsetWidth;
    const h = wrapper.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    scratchCtx = canvas.getContext('2d');
    // Reset composite mode for drawing cover
    scratchCtx.globalCompositeOperation = 'source-over';

    // Draw the scratch cover — gradient + pattern
    const grad = scratchCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#FFB6C1');
    grad.addColorStop(0.3, '#E8D5F5');
    grad.addColorStop(0.6, '#B0D4E8');
    grad.addColorStop(1, '#FFB6C1');
    scratchCtx.fillStyle = grad;
    scratchCtx.fillRect(0, 0, w, h);

    // Decorative text
    scratchCtx.fillStyle = 'rgba(255,255,255,0.4)';
    scratchCtx.font = 'bold 18px "Noto Sans TC", sans-serif';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText('用手指刮開這裡 ✨', w / 2, h / 2 - 10);
    scratchCtx.font = 'bold 14px "Noto Sans TC", sans-serif';
    scratchCtx.fillText('隱藏著一個驚喜...', w / 2, h / 2 + 15);

    // Hearts pattern
    scratchCtx.font = '20px sans-serif';
    scratchCtx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 20; i++) {
      scratchCtx.fillText('♡', Math.random() * w, Math.random() * h);
    }

    scratchTotal = w * h;

    // Set composite for erasing
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.lineWidth = 40;
    scratchCtx.lineCap = 'round';
    scratchCtx.lineJoin = 'round';

    // Reset progress
    document.getElementById('scratchProgressFill').style.width = '0%';
    document.getElementById('scratchHint').textContent = '用手指刮開灰色區域 ✨';
  });

  // Touch events
  canvas.addEventListener('touchstart', scratchStart, { passive: false });
  canvas.addEventListener('touchmove', scratchMove, { passive: false });
  canvas.addEventListener('touchend', scratchEnd);
  canvas.addEventListener('mousedown', scratchStartMouse);
  canvas.addEventListener('mousemove', scratchMoveMouse);
  canvas.addEventListener('mouseup', scratchEnd);
}

function getScratchPos(canvas, e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height)
  };
}

function scratchStart(e) {
  e.preventDefault();
  scratchDragging = true;
  const pos = getScratchPos(e.target, e.touches[0]);
  scratchCtx.beginPath();
  scratchCtx.moveTo(pos.x, pos.y);
}

function scratchMove(e) {
  e.preventDefault();
  if (!scratchDragging || scratchDone) return;
  const pos = getScratchPos(e.target, e.touches[0]);
  scratchCtx.lineTo(pos.x, pos.y);
  scratchCtx.stroke();
  checkScratchProgress();
}

function scratchStartMouse(e) {
  scratchDragging = true;
  const pos = getScratchPos(e.target, e);
  scratchCtx.beginPath();
  scratchCtx.moveTo(pos.x, pos.y);
}

function scratchMoveMouse(e) {
  if (!scratchDragging || scratchDone) return;
  const pos = getScratchPos(e.target, e);
  scratchCtx.lineTo(pos.x, pos.y);
  scratchCtx.stroke();
  checkScratchProgress();
}

function scratchEnd() {
  scratchDragging = false;
}

function checkScratchProgress() {
  const canvas = document.getElementById('scratchCanvas');
  const data = scratchCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  let cleared = 0;
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] === 0) cleared++;
  }
  const total = data.length / 16;
  const pct = (cleared / total) * 100;

  document.getElementById('scratchProgressFill').style.width = Math.min(pct, 100) + '%';

  if (pct >= 55 && !scratchDone) {
    scratchDone = true;
    document.getElementById('scratchHint').textContent = '🎉 照片揭曉！準備拼圖挑戰...';
    // Fade out canvas
    canvas.style.transition = 'opacity .8s ease';
    canvas.style.opacity = '0';
    // After reveal, transition to puzzle phase
    setTimeout(() => {
      document.getElementById('scratchPhase1').style.display = 'none';
      initPuzzleGame();
    }, 1500);
  }
}

// ===================
// PUZZLE (3×3 Sliding Puzzle / 華容道)
// ===================

function initPuzzleGame() {
  puzzleMoves = 0;
  puzzleSolved = false;
  document.getElementById('puzzleMoves').textContent = '0';

  // Show puzzle phase
  const phase2 = document.getElementById('puzzlePhase2');
  phase2.classList.add('active');

  // Create solvable shuffled arrangement
  // Tiles 0-7 are image pieces, 8 is the empty space
  puzzleTiles = generateSolvablePuzzle();

  renderPuzzle();
}

function generateSolvablePuzzle() {
  let tiles;
  do {
    tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // Fisher-Yates shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable(tiles) || isSolved(tiles));
  return tiles;
}

function isSolvable(tiles) {
  // For a 3×3 puzzle, the puzzle is solvable if inversion count is even.
  // Inversions: count pairs (i,j) where i < j but tiles[i] > tiles[j], ignoring the empty tile (8).
  let inversions = 0;
  for (let i = 0; i < 9; i++) {
    if (tiles[i] === 8) continue;
    for (let j = i + 1; j < 9; j++) {
      if (tiles[j] === 8) continue;
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

function isSolved(tiles) {
  for (let i = 0; i < 9; i++) {
    if (tiles[i] !== i) return false;
  }
  return true;
}

function renderPuzzle() {
  const board = document.getElementById('puzzleBoard');
  board.innerHTML = '';

  const photoUrl = CONFIG.scratchPhoto;

  puzzleTiles.forEach((tileValue, index) => {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    tile.dataset.index = index;

    if (tileValue === 8) {
      // Empty tile
      tile.classList.add('empty');
    } else {
      // Calculate background-position to show the correct piece of the photo
      // tileValue 0-7 maps to a 3×3 grid position
      const col = tileValue % 3;
      const row = Math.floor(tileValue / 3);
      tile.style.backgroundImage = `url('${photoUrl}')`;
      tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
      // background-size 300% 300% is set via CSS

      // Highlight correctly placed tiles
      if (tileValue === index) {
        tile.classList.add('correct');
      }
    }

    tile.addEventListener('click', () => clickPuzzleTile(index));
    board.appendChild(tile);
  });
}

function clickPuzzleTile(index) {
  if (puzzleSolved) return;

  const emptyIndex = puzzleTiles.indexOf(8);

  // Check if clicked tile is adjacent to empty space
  if (!isAdjacent(index, emptyIndex)) return;

  // Swap tiles
  [puzzleTiles[index], puzzleTiles[emptyIndex]] = [puzzleTiles[emptyIndex], puzzleTiles[index]];
  puzzleMoves++;
  document.getElementById('puzzleMoves').textContent = puzzleMoves;

  renderPuzzle();

  // Check win
  if (isSolved(puzzleTiles)) {
    puzzleSolved = true;
    // Show completed puzzle (fill in the empty space too)
    setTimeout(() => {
      showCompletedPuzzle();
    }, 300);
    setTimeout(() => {
      completeMiniGame('game-scratch');
    }, 1500);
  }
}

function isAdjacent(a, b) {
  const rowA = Math.floor(a / 3), colA = a % 3;
  const rowB = Math.floor(b / 3), colB = b % 3;
  const dist = Math.abs(rowA - rowB) + Math.abs(colA - colB);
  return dist === 1;
}

function showCompletedPuzzle() {
  // Fill the empty space with the last piece to show complete photo
  const board = document.getElementById('puzzleBoard');
  const tiles = board.querySelectorAll('.puzzle-tile');
  tiles.forEach((tile, index) => {
    tile.classList.remove('empty', 'correct');
    const col = index % 3;
    const row = Math.floor(index / 3);
    tile.style.backgroundImage = `url('${CONFIG.scratchPhoto}')`;
    tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
    tile.style.boxShadow = '0 0 0 2px rgba(102,187,106,.6)';
  });
  // Add a flash animation
  board.style.boxShadow = '0 0 40px rgba(255,215,0,.5), 0 8px 32px rgba(255,133,162,.3)';
}
