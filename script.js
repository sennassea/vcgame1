const ball = document.getElementById("ball");
const bat = document.getElementById("bat");
const pitcher = document.querySelector(".pitcher");
const scoreText = document.getElementById("score");
const targetScoreText = document.getElementById("targetScore");
const stageText = document.getElementById("stageText");
const ballsLeftText = document.getElementById("ballsLeft");
const resultText = document.getElementById("resultText");
const startButton = document.getElementById("startButton");
const swingButton = document.getElementById("swingButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");
const soundButton = document.getElementById("soundButton");
const stageModal = document.getElementById("stageModal");
const stageIcon = document.getElementById("stageIcon");
const stageTitle = document.getElementById("stageTitle");
const stageCondition = document.getElementById("stageCondition");
const stagePrevResult = document.getElementById("stagePrevResult");
const stageStartButton = document.getElementById("stageStartButton");
const resultModal = document.getElementById("resultModal");
const modalCard = document.getElementById("modalCard");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const finalScore = document.getElementById("finalScore");
const strikeZone = document.getElementById("strikeZone");
const homerunZone = document.getElementById("homerunZone");
const whooshText = document.getElementById("whooshText");
const missCountText = document.getElementById("missCount");
const missScoreText = document.getElementById("missScore");
const hitCountText = document.getElementById("hitCount");
const hitScoreText = document.getElementById("hitScore");
const homerunCountText = document.getElementById("homerunCount");
const homerunScoreText = document.getElementById("homerunScore");
const perfectCountText = document.getElementById("perfectCount");
const perfectScoreText = document.getElementById("perfectScore");
const stageResultList = document.getElementById("stageResultList");
const nicknameInput = document.getElementById("nicknameInput");
const saveRankButton = document.getElementById("saveRankButton");
const rankingList = document.getElementById("rankingList");

const totalBalls = 10;
const maxStage = 3;
const startX = 250;
const endX = 760;
const rankingStorageKey = "homerunTimingGameRankings";

const stageSettings = {
  1: { target: 15, minSpeed: 5.8, maxSpeed: 5.8, description: "기본 속도의 공 10개로 15점 이상을 달성하세요." },
  2: { target: 15, minSpeed: 5.8, maxSpeed: 8.4, description: "공마다 속도가 랜덤하게 바뀝니다. 15점 이상을 달성하세요." },
  3: { target: 20, minSpeed: 6.4, maxSpeed: 9.6, description: "더 빠른 랜덤 속도 공 10개로 20점 이상을 달성하세요." }
};

let currentStage = 1;
let stageScore = 0;
let totalScore = 0;
let ballsLeft = totalBalls;
let ballX = startX;
let ballY = 292;
let speed = stageSettings[1].minSpeed;
let isPlaying = false;
let isPaused = false;
let canSwing = false;
let waitingNextPitch = false;
let animationId = null;
let nextPitchTimer = null;
let soundOn = true;
let audioContext = null;
let rankSavedThisGame = false;
let lastStageResultText = "첫 단계입니다. 준비되면 시작하세요!";

const stageStats = createStats();
const totalStats = createStats();
const stageResults = [];

swingButton.disabled = true;
pauseButton.disabled = true;
stageModal.classList.add("hidden");
renderRankingList();
updateScoreBoard();

startButton.addEventListener("click", () => {
  if (isPlaying) return;
  showStageIntro(currentStage, lastStageResultText);
});

stageStartButton.addEventListener("click", startStage);
swingButton.addEventListener("click", swing);
pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", prepareRestart);
soundButton.addEventListener("click", toggleSound);
saveRankButton.addEventListener("click", saveRanking);

nicknameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") saveRanking();
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    swing();
  }
  if (event.code === "KeyP") togglePause();
});

function createStats() {
  return {
    miss: { count: 0, score: 0 },
    hit: { count: 0, score: 0 },
    homerun: { count: 0, score: 0 },
    perfect: { count: 0, score: 0 }
  };
}

function resetStats(stats) {
  stats.miss.count = 0;
  stats.miss.score = 0;
  stats.hit.count = 0;
  stats.hit.score = 0;
  stats.homerun.count = 0;
  stats.homerun.score = 0;
  stats.perfect.count = 0;
  stats.perfect.score = 0;
}

function resetAllStats() {
  resetStats(stageStats);
  resetStats(totalStats);
}

function showStageIntro(stage, previousResult) {
  const setting = stageSettings[stage];
  stageIcon.textContent = stage === 1 ? "⚾" : stage === 2 ? "🔥" : "🏟️";
  stageTitle.textContent = `${stage}단계 도전`;
  stageCondition.innerHTML = `성공 조건: <strong>${setting.target}점 이상</strong><br>${setting.description}`;
  stagePrevResult.textContent = previousResult;
  stageStartButton.textContent = `${stage}단계 시작`;
  stageModal.classList.remove("hidden");
  resultModal.classList.add("hidden");
}

function startStage() {
  clearTimeout(nextPitchTimer);
  cancelAnimationFrame(animationId);

  stageModal.classList.add("hidden");
  resetStats(stageStats);
  stageScore = 0;
  ballsLeft = totalBalls;
  speed = getPitchSpeed();
  isPlaying = true;
  isPaused = false;
  canSwing = false;
  waitingNextPitch = false;

  startButton.disabled = true;
  swingButton.disabled = false;
  pauseButton.disabled = false;
  pauseButton.textContent = "일시정지";
  resultText.textContent = `${currentStage}단계 시작!`;
  updateScoreBoard();
  resetBall();
  nextPitchTimer = setTimeout(throwBall, 500);
}

function prepareRestart() {
  clearTimeout(nextPitchTimer);
  cancelAnimationFrame(animationId);

  currentStage = 1;
  stageScore = 0;
  totalScore = 0;
  ballsLeft = totalBalls;
  speed = stageSettings[1].minSpeed;
  isPlaying = false;
  isPaused = false;
  canSwing = false;
  waitingNextPitch = false;
  rankSavedThisGame = false;
  lastStageResultText = "첫 단계입니다. 준비되면 시작하세요!";
  stageResults.length = 0;
  resetAllStats();

  resultModal.classList.add("hidden");
  stageModal.classList.add("hidden");
  startButton.disabled = false;
  swingButton.disabled = true;
  pauseButton.disabled = true;
  pauseButton.textContent = "일시정지";
  resultText.textContent = "대기 중";
  nicknameInput.value = "";
  saveRankButton.disabled = false;
  saveRankButton.textContent = "기록 저장";
  updateScoreBoard();
  resetBall();
}

function throwBall() {
  if (!isPlaying || isPaused) {
    waitingNextPitch = true;
    return;
  }

  if (ballsLeft <= 0) {
    finishStage();
    return;
  }

  waitingNextPitch = false;
  speed = getPitchSpeed();
  resetBall();
  canSwing = true;
  playPitcherThrowAnimation();
  playPitchSound();
  showWhooshText();
  animationId = requestAnimationFrame(moveBall);
}

function getPitchSpeed() {
  const setting = stageSettings[currentStage];
  if (setting.minSpeed === setting.maxSpeed) return setting.minSpeed;
  return setting.minSpeed + Math.random() * (setting.maxSpeed - setting.minSpeed);
}

function moveBall() {
  if (!isPlaying || isPaused) return;

  ballX += speed;
  updateBallPosition();

  if (ballX >= endX) {
    missPitch();
    return;
  }

  animationId = requestAnimationFrame(moveBall);
}

function resetBall() {
  ballX = startX;
  ballY = 284 + Math.random() * 34;
  updateBallPosition();
}

function updateBallPosition() {
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
}

function swing() {
  if (!isPlaying || isPaused || !canSwing) return;

  canSwing = false;
  cancelAnimationFrame(animationId);
  playSwingAnimation();

  const hitResult = judgeHit();

  if (hitResult === "perfect") {
    addResultStat("perfect", 3);
    resultText.textContent = "퍼펙트 홈런! +3점";
    playPerfectHomerunSound();
  } else if (hitResult === "homerun") {
    addResultStat("homerun", 2);
    resultText.textContent = "홈런! +2점";
    playHomerunSound();
  } else if (hitResult === "hit") {
    addResultStat("hit", 1);
    resultText.textContent = "안타! +1점";
    playAluminumHitSound();
  } else {
    addResultStat("miss", 0);
    resultText.textContent = "헛스윙!";
    playMissSound();
  }

  ballsLeft -= 1;
  updateScoreBoard();
  scheduleNextPitch(900);
}

function judgeHit() {
  const ballRect = ball.getBoundingClientRect();
  const whiteRect = strikeZone.getBoundingClientRect();
  const yellowRect = homerunZone.getBoundingClientRect();

  const ballArea = ballRect.width * ballRect.height;
  const yellowOverlapArea = getOverlapArea(ballRect, yellowRect);

  const isBallFullyInYellow =
    ballRect.left >= yellowRect.left &&
    ballRect.right <= yellowRect.right &&
    ballRect.top >= yellowRect.top &&
    ballRect.bottom <= yellowRect.bottom;

  if (isBallFullyInYellow) return "perfect";
  if (yellowOverlapArea >= ballArea * 0.5) return "homerun";

  const ballCenterX = ballRect.left + ballRect.width / 2;
  const ballCenterY = ballRect.top + ballRect.height / 2;

  const isBallCenterInWhiteZone =
    ballCenterX >= whiteRect.left &&
    ballCenterX <= whiteRect.right &&
    ballCenterY >= whiteRect.top &&
    ballCenterY <= whiteRect.bottom;

  if (isBallCenterInWhiteZone) return "hit";
  return "miss";
}

function getOverlapArea(rectA, rectB) {
  const overlapWidth = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
  const overlapHeight = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
  return overlapWidth * overlapHeight;
}

function missPitch() {
  canSwing = false;
  cancelAnimationFrame(animationId);
  resultText.textContent = "공을 놓쳤습니다!";
  addResultStat("miss", 0);
  ballsLeft -= 1;
  updateScoreBoard();
  scheduleNextPitch(700);
}

function addResultStat(type, point) {
  stageStats[type].count += 1;
  stageStats[type].score += point;
  totalStats[type].count += 1;
  totalStats[type].score += point;
  stageScore += point;
  totalScore += point;
}

function scheduleNextPitch(delay) {
  clearTimeout(nextPitchTimer);
  waitingNextPitch = true;
  nextPitchTimer = setTimeout(() => {
    if (isPaused) return;
    throwBall();
  }, delay);
}

function togglePause() {
  if (!isPlaying) return;

  isPaused = !isPaused;

  if (isPaused) {
    cancelAnimationFrame(animationId);
    clearTimeout(nextPitchTimer);
    pauseButton.textContent = "계속하기";
    resultText.textContent = "일시정지";
    swingButton.disabled = true;
  } else {
    pauseButton.textContent = "일시정지";
    swingButton.disabled = false;
    resultText.textContent = "게임 재개!";

    if (canSwing) {
      animationId = requestAnimationFrame(moveBall);
    } else if (waitingNextPitch) {
      nextPitchTimer = setTimeout(throwBall, 350);
    }
  }
}

function updateScoreBoard() {
  stageText.textContent = currentStage;
  scoreText.textContent = stageScore;
  targetScoreText.textContent = stageSettings[currentStage].target;
  ballsLeftText.textContent = ballsLeft;
}

function finishStage() {
  isPlaying = false;
  isPaused = false;
  canSwing = false;
  waitingNextPitch = false;
  clearTimeout(nextPitchTimer);
  cancelAnimationFrame(animationId);

  const target = stageSettings[currentStage].target;
  const cleared = stageScore >= target;
  const stageResult = {
    stage: currentStage,
    score: stageScore,
    target,
    cleared,
    stats: JSON.parse(JSON.stringify(stageStats))
  };
  stageResults.push(stageResult);

  startButton.disabled = false;
  swingButton.disabled = true;
  pauseButton.disabled = true;
  pauseButton.textContent = "일시정지";

  if (cleared && currentStage < maxStage) {
    playWinSound();
    lastStageResultText = `${currentStage}단계 성공! ${stageScore}점 / 목표 ${target}점`;
    resultText.textContent = lastStageResultText;
    currentStage += 1;
    stageScore = 0;
    ballsLeft = totalBalls;
    updateScoreBoard();
    setTimeout(() => showStageIntro(currentStage, lastStageResultText), 800);
    return;
  }

  endGame(cleared && currentStage === maxStage);
}

function updateResultSummary() {
  missCountText.textContent = totalStats.miss.count;
  missScoreText.textContent = totalStats.miss.score;
  hitCountText.textContent = totalStats.hit.count;
  hitScoreText.textContent = totalStats.hit.score;
  homerunCountText.textContent = totalStats.homerun.count;
  homerunScoreText.textContent = totalStats.homerun.score;
  perfectCountText.textContent = totalStats.perfect.count;
  perfectScoreText.textContent = totalStats.perfect.score;
}

function renderStageResults() {
  stageResultList.innerHTML = "";
  stageResults.forEach((result) => {
    const line = document.createElement("div");
    line.className = "stage-result-line";
    line.innerHTML = `
      <span>${result.stage}단계 ${result.cleared ? "성공" : "실패"}</span>
      <span>${result.score}점 / 목표 ${result.target}점</span>
    `;
    stageResultList.appendChild(line);
  });
}

function endGame(allCleared) {
  isPlaying = false;
  isPaused = false;
  canSwing = false;
  waitingNextPitch = false;
  clearTimeout(nextPitchTimer);
  cancelAnimationFrame(animationId);

  startButton.disabled = false;
  swingButton.disabled = true;
  pauseButton.disabled = true;
  pauseButton.textContent = "일시정지";
  finalScore.textContent = totalScore;
  updateResultSummary();
  renderStageResults();
  renderRankingList();
  nicknameInput.value = "";
  saveRankButton.disabled = false;
  saveRankButton.textContent = "기록 저장";

  if (allCleared) {
    modalCard.classList.remove("lose");
    modalIcon.textContent = "🏆";
    modalTitle.textContent = "최종 승리!";
    modalMessage.textContent = `3단계까지 모두 클리어! 총 ${totalScore}점입니다.`;
    resultText.textContent = `최종 승리! 총 ${totalScore}점`;
    playWinSound();
  } else {
    modalCard.classList.add("lose");
    modalIcon.textContent = "😢";
    modalTitle.textContent = "도전 종료";
    modalMessage.textContent = `${currentStage}단계 목표 점수에 도달하지 못했어요.`;
    resultText.textContent = `도전 종료! 총 ${totalScore}점`;
    playLoseSound();
  }

  resultModal.classList.remove("hidden");
}

function getRankings() {
  const savedRankings = localStorage.getItem(rankingStorageKey);
  if (!savedRankings) return [];
  try {
    const parsedRankings = JSON.parse(savedRankings);
    return Array.isArray(parsedRankings) ? parsedRankings : [];
  } catch (error) {
    return [];
  }
}

function setRankings(rankings) {
  localStorage.setItem(rankingStorageKey, JSON.stringify(rankings));
}

function saveRanking() {
  if (rankSavedThisGame) return;

  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    nicknameInput.focus();
    nicknameInput.placeholder = "닉네임을 입력하세요!";
    return;
  }

  const newRecord = {
    nickname,
    score: totalScore,
    stage: stageResults.length,
    date: new Date().toLocaleDateString("ko-KR")
  };

  const rankings = getRankings();
  rankings.push(newRecord);
  rankings.sort((a, b) => b.score - a.score);
  const topRankings = rankings.slice(0, 10);
  setRankings(topRankings);

  rankSavedThisGame = true;
  saveRankButton.disabled = true;
  saveRankButton.textContent = "저장 완료";
  renderRankingList();

  setTimeout(() => {
    saveRankButton.textContent = "기록 저장";
  }, 1200);
}

function renderRankingList() {
  const rankings = getRankings();
  rankingList.innerHTML = "";

  if (rankings.length === 0) {
    const emptyItem = document.createElement("div");
    emptyItem.className = "empty-ranking";
    emptyItem.textContent = "아직 저장된 기록이 없습니다.";
    rankingList.appendChild(emptyItem);
    return;
  }

  rankings.forEach((record, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span class="rank-number">${index + 1}위</span>
      <span class="rank-name">${escapeHtml(record.nickname)}</span>
      <span class="rank-score">${record.score}점</span>
    `;
    rankingList.appendChild(item);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function playSwingAnimation() {
  bat.classList.remove("swinging");
  void bat.offsetWidth;
  bat.classList.add("swinging");
}

function playPitcherThrowAnimation() {
  if (!pitcher) return;
  pitcher.classList.remove("throwing");
  void pitcher.offsetWidth;
  pitcher.classList.add("throwing");
}

function showWhooshText() {
  whooshText.classList.remove("show");
  void whooshText.offsetWidth;
  whooshText.classList.add("show");
}

function toggleSound() {
  soundOn = !soundOn;
  soundButton.textContent = soundOn ? "🔊 ON" : "🔇 OFF";
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency, duration, type = "sine", volume = 0.15, startTime = 0) {
  if (!soundOn) return;
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime + startTime);
  gain.gain.setValueAtTime(volume, context.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + startTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(context.currentTime + startTime);
  oscillator.stop(context.currentTime + startTime + duration);
}

function playNoise(duration = 0.25, volume = 0.12, startTime = 0) {
  if (!soundOn) return;
  const context = getAudioContext();
  const bufferSize = context.sampleRate * duration;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, context.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + startTime + duration);
  source.connect(gain);
  gain.connect(context.destination);
  source.start(context.currentTime + startTime);
  source.stop(context.currentTime + startTime + duration);
}

function playPitchSound() {
  if (!soundOn) return;
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(980, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(250, context.currentTime + 0.28);
  gain.gain.setValueAtTime(0.12, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.28);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.28);
}

function playAluminumHitSound() {
  playTone(2300, 0.055, "triangle", 0.26);
  playTone(3150, 0.11, "sine", 0.16, 0.018);
  playTone(1550, 0.16, "sine", 0.09, 0.035);
  playNoise(0.045, 0.05, 0);
}

function playHomerunSound() {
  playNoise(0.09, 0.16, 0);
  playTone(190, 0.075, "square", 0.16, 0);
  playTone(2100, 0.15, "triangle", 0.3, 0.018);
  playTone(3400, 0.24, "sine", 0.19, 0.04);
  playTone(930, 0.2, "sine", 0.11, 0.09);
}

function playPerfectHomerunSound() {
  playHomerunSound();
  playCrowdCheerSound(0.18);
}

function playCrowdCheerSound(startTime = 0) {
  playNoise(0.95, 0.16, startTime);
  playTone(520, 0.18, "triangle", 0.08, startTime + 0.08);
  playTone(660, 0.18, "triangle", 0.08, startTime + 0.22);
  playTone(780, 0.2, "triangle", 0.08, startTime + 0.36);
  playTone(980, 0.25, "triangle", 0.07, startTime + 0.52);
}

function playMissSound() {
  playTone(170, 0.13, "sawtooth", 0.08);
}

function playWinSound() {
  playTone(523, 0.12, "triangle", 0.16, 0);
  playTone(659, 0.12, "triangle", 0.16, 0.13);
  playTone(784, 0.16, "triangle", 0.18, 0.26);
  playTone(1046, 0.22, "triangle", 0.18, 0.43);
}

function playLoseSound() {
  playTone(392, 0.18, "sine", 0.14, 0);
  playTone(330, 0.2, "sine", 0.13, 0.2);
  playTone(262, 0.3, "sine", 0.13, 0.42);
}
