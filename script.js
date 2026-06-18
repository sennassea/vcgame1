const ball = document.getElementById("ball");
const bat = document.getElementById("bat");
const scoreText = document.getElementById("score");
const ballsLeftText = document.getElementById("ballsLeft");
const resultText = document.getElementById("resultText");
const startButton = document.getElementById("startButton");
const swingButton = document.getElementById("swingButton");
const restartButton = document.getElementById("restartButton");
const soundButton = document.getElementById("soundButton");
const resultModal = document.getElementById("resultModal");
const modalCard = document.getElementById("modalCard");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const finalScore = document.getElementById("finalScore");
const strikeZone = document.getElementById("strikeZone");
const homerunZone = document.getElementById("homerunZone");
const whooshText = document.getElementById("whooshText");

let score = 0;
let ballsLeft = 10;
let ballX = 250;
let ballY = 292;
let speed = 5.8;
let isPlaying = false;
let canSwing = false;
let animationId = null;
let soundOn = true;
let audioContext = null;

const totalBalls = 10;
const winScore = 10;
const startX = 250;
const endX = 760;

swingButton.disabled = true;

startButton.addEventListener("click", startGame);
swingButton.addEventListener("click", swing);
restartButton.addEventListener("click", startGame);
soundButton.addEventListener("click", toggleSound);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    swing();
  }
});

function startGame() {
  score = 0;
  ballsLeft = totalBalls;
  speed = 5.8;
  isPlaying = true;
  canSwing = false;

  resultModal.classList.add("hidden");
  startButton.disabled = true;
  swingButton.disabled = false;
  resultText.textContent = "게임 시작!";
  updateScoreBoard();
  resetBall();

  setTimeout(throwBall, 500);
}

function throwBall() {
  if (!isPlaying) return;

  if (ballsLeft <= 0) {
    endGame();
    return;
  }

  resetBall();
  canSwing = true;
  playPitchSound();
  showWhooshText();
  animationId = requestAnimationFrame(moveBall);
}

function moveBall() {
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
  if (!isPlaying || !canSwing) return;

  canSwing = false;
  cancelAnimationFrame(animationId);
  playSwingAnimation();

  const hitResult = judgeHit();

  if (hitResult === "homerun") {
    score += 2;
    resultText.textContent = "홈런! +2점";
    playAluminumHitSound();
  } else if (hitResult === "hit") {
    score += 1;
    resultText.textContent = "안타! +1점";
    playAluminumHitSound();
  } else {
    resultText.textContent = "헛스윙!";
    playMissSound();
  }

  ballsLeft -= 1;
  updateScoreBoard();
  setTimeout(throwBall, 900);
}

function judgeHit() {
  const ballRect = ball.getBoundingClientRect();
  const whiteRect = strikeZone.getBoundingClientRect();
  const yellowRect = homerunZone.getBoundingClientRect();

  const ballArea = ballRect.width * ballRect.height;
  const yellowOverlapArea = getOverlapArea(ballRect, yellowRect);

  if (yellowOverlapArea >= ballArea * 0.5) {
    return "homerun";
  }

  const ballCenterX = ballRect.left + ballRect.width / 2;
  const ballCenterY = ballRect.top + ballRect.height / 2;

  const isBallCenterInWhiteZone =
    ballCenterX >= whiteRect.left &&
    ballCenterX <= whiteRect.right &&
    ballCenterY >= whiteRect.top &&
    ballCenterY <= whiteRect.bottom;

  if (isBallCenterInWhiteZone) {
    return "hit";
  }

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
  ballsLeft -= 1;
  updateScoreBoard();
  setTimeout(throwBall, 700);
}

function updateScoreBoard() {
  scoreText.textContent = score;
  ballsLeftText.textContent = ballsLeft;
}

function endGame() {
  isPlaying = false;
  canSwing = false;
  startButton.disabled = false;
  swingButton.disabled = true;
  finalScore.textContent = score;

  if (score >= winScore) {
    modalCard.classList.remove("lose");
    modalIcon.textContent = "🏆";
    modalTitle.textContent = "승리!";
    modalMessage.textContent = "10점 이상 달성! 홈런왕이에요!";
    resultText.textContent = `승리! 최종 ${score}점`;
    playWinSound();
  } else {
    modalCard.classList.add("lose");
    modalIcon.textContent = "😢";
    modalTitle.textContent = "패배!";
    modalMessage.textContent = "아쉽네요! 다시 도전해요!";
    resultText.textContent = `패배! 최종 ${score}점`;
    playLoseSound();
  }

  resultModal.classList.remove("hidden");
}

function playSwingAnimation() {
  bat.classList.remove("swinging");
  void bat.offsetWidth;
  bat.classList.add("swinging");
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

function playPitchSound() {
  if (!soundOn) return;

  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(950, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(260, context.currentTime + 0.28);
  gain.gain.setValueAtTime(0.12, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.28);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.28);
}

function playAluminumHitSound() {
  playTone(1350, 0.08, "triangle", 0.22);
  playTone(2050, 0.12, "sine", 0.16, 0.025);
  playTone(780, 0.11, "square", 0.07, 0.04);
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
