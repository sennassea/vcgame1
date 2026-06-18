const ball = document.getElementById("ball");
const bat = document.querySelector(".bat");
const scoreText = document.getElementById("score");
const ballsLeftText = document.getElementById("ballsLeft");
const resultText = document.getElementById("resultText");
const startButton = document.getElementById("startButton");
const swingButton = document.getElementById("swingButton");

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
const strikeZoneStart = 530;
const strikeZoneEnd = 615;

swingButton.disabled = true;

startButton.addEventListener("click", startGame);
swingButton.addEventListener("click", swing);

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    event.preventDefault();
    swing();
  }
});

function startGame() {
  prepareAudio();

  score = 0;
  ballsLeft = 10;
  speed = 5;
  isPlaying = true;

  scoreText.textContent = score;
  ballsLeftText.textContent = ballsLeft;
  resultText.textContent = "게임 시작!";
  startButton.disabled = true;
  swingButton.disabled = false;

  throwBall();
}

function throwBall() {
  if (ballsLeft <= 0) {
    endGame();
    return;
  }

  ball.classList.remove("hit");
  bat.classList.remove("swing");

  ballX = startX;
  ballY = 115 + Math.random() * 35;
  canSwing = true;
  updateBallPosition();
  playThrowSound();

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
  playBatSwingAnimation();

  if (ballX >= strikeZoneStart && ballX <= strikeZoneEnd) {
    score += 1;
    resultText.textContent = "홈런! 탁! +1점";
    playHitSound();
    playBallHitAnimation();
  } else if (ballX >= strikeZoneStart - 60 && ballX <= strikeZoneEnd + 40) {
    resultText.textContent = "안타! 탁! 아깝지만 점수 없음";
    playHitSound();
    playBallHitAnimation();
  } else {
    resultText.textContent = "헛스윙!";
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

  if (score >= 7) {
    resultText.textContent = `승리! ${score}점으로 홈런왕 달성!`;
  } else {
    resultText.textContent = `패배! ${score}점입니다. 다시 도전하세요!`;
  }
}

function prepareAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playThrowSound() {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(900, now);
  oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.35);

  filter.type = "highpass";
  filter.frequency.setValueAtTime(400, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.36);
}

function playHitSound() {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(180, now);
  oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.08);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.13);
}

function playBatSwingAnimation() {
  bat.classList.remove("swing");
  void bat.offsetWidth;
  bat.classList.add("swing");
}

function playBallHitAnimation() {
  ball.classList.remove("hit");
  void ball.offsetWidth;
  ball.classList.add("hit");
}
