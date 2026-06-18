const ball = document.getElementById("ball");
const scoreText = document.getElementById("score");
const ballsLeftText = document.getElementById("ballsLeft");
const resultText = document.getElementById("resultText");
const startButton = document.getElementById("startButton");
const swingButton = document.getElementById("swingButton");
const resultModal = document.getElementById("resultModal");
const modalCard = document.getElementById("modalCard");
const modalEmoji = document.getElementById("modalEmoji");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const restartButton = document.getElementById("restartButton");

let score = 0;
let ballsLeft = 10;
let ballX = 95;
let ballY = 125;
let speed = 5;
let isPlaying = false;
let canSwing = false;
let animationId = null;
let audioContext = null;

const startX = 95;
const endX = 620;

const hitZoneStart = 563;
const hitZoneEnd = 620;
const homeRunZoneStart = 579;
const homeRunZoneEnd = 604;

swingButton.disabled = true;

startButton.addEventListener("click", startGame);
swingButton.addEventListener("click", swing);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    event.preventDefault();
    swing();
  }
});

function startGame() {
  score = 0;
  ballsLeft = 10;
  speed = 5;
  isPlaying = true;

  scoreText.textContent = score;
  ballsLeftText.textContent = ballsLeft;
  resultText.textContent = "게임 시작!";
  startButton.disabled = true;
  swingButton.disabled = false;
  resultModal.classList.add("hidden");

  throwBall();
}

function throwBall() {
  if (ballsLeft <= 0) {
    endGame();
    return;
  }

  ballX = startX;
  ballY = 115 + Math.random() * 35;
  canSwing = true;
  updateBallPosition();
  playPitchSound();

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

function updateBallPosition() {
  ball.style.left = ballX + "px";
  ball.style.top = ballY + "px";
}

function swing() {
  if (!isPlaying || !canSwing) return;

  canSwing = false;
  cancelAnimationFrame(animationId);

  if (ballX >= homeRunZoneStart && ballX <= homeRunZoneEnd) {
    score += 2;
    resultText.textContent = "홈런! +2점";
    playAluminumHitSound(true);
  } else if (ballX >= hitZoneStart && ballX <= hitZoneEnd) {
    score += 1;
    resultText.textContent = "안타! +1점";
    playAluminumHitSound(false);
  } else {
    resultText.textContent = "헛스윙!";
    playSwingMissSound();
  }

  ballsLeft -= 1;
  updateScore();

  setTimeout(throwBall, 900);
}

function missPitch() {
  canSwing = false;
  cancelAnimationFrame(animationId);

  resultText.textContent = "공을 놓쳤습니다!";
  ballsLeft -= 1;
  updateScore();

  setTimeout(throwBall, 900);
}

function updateScore() {
  scoreText.textContent = score;
  ballsLeftText.textContent = ballsLeft;
}

function endGame() {
  isPlaying = false;
  canSwing = false;
  startButton.disabled = false;
  swingButton.disabled = true;

  if (score >= 10) {
    resultText.textContent = `승리! 최종 점수 ${score}점`;
    showResultModal(true);
    playWinSound();
  } else {
    resultText.textContent = `패배! 최종 점수 ${score}점`;
    showResultModal(false);
    playLoseSound();
  }
}

function showResultModal(isWin) {
  modalCard.classList.remove("win", "lose");

  if (isWin) {
    modalCard.classList.add("win");
    modalEmoji.textContent = "🏆";
    modalTitle.textContent = "승리!";
    modalMessage.textContent = `${score}점 달성! 알루미늄 배트로 멋진 경기를 완성했습니다.`;
  } else {
    modalCard.classList.add("lose");
    modalEmoji.textContent = "😢";
    modalTitle.textContent = "패배!";
    modalMessage.textContent = `${score}점입니다. 10점 이상이면 승리할 수 있어요.`;
  }

  resultModal.classList.remove("hidden");
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency, duration, type, volume, startTime = 0) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
}

function playPitchSound() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(950, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.22);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.22);
}

function playAluminumHitSound(isHomeRun) {
  const baseVolume = isHomeRun ? 0.22 : 0.16;

  playTone(1220, 0.08, "triangle", baseVolume);
  playTone(1860, 0.16, "sine", baseVolume * 0.8, 0.02);
  playTone(2440, 0.22, "sine", baseVolume * 0.45, 0.04);

  if (isHomeRun) {
    playTone(3200, 0.18, "sine", 0.07, 0.08);
  }
}

function playSwingMissSound() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(260, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.12);
}

function playWinSound() {
  playTone(523, 0.16, "sine", 0.16, 0);
  playTone(659, 0.16, "sine", 0.16, 0.16);
  playTone(784, 0.16, "sine", 0.16, 0.32);
  playTone(1046, 0.36, "sine", 0.18, 0.48);
}

function playLoseSound() {
  playTone(392, 0.22, "triangle", 0.14, 0);
  playTone(330, 0.22, "triangle", 0.13, 0.22);
  playTone(262, 0.45, "triangle", 0.12, 0.44);
}
