const ball = document.getElementById("ball");
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

  ballX = startX;
  ballY = 115 + Math.random() * 35;
  canSwing = true;
  updateBallPosition();

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

  if (ballX >= strikeZoneStart && ballX <= strikeZoneEnd) {
    score += 1;
    resultText.textContent = "홈런! +1점";
  } else if (ballX >= strikeZoneStart - 60 && ballX <= strikeZoneEnd + 40) {
    resultText.textContent = "안타! 아깝지만 점수 없음";
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
