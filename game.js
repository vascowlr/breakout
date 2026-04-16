const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const uiLayer = document.getElementById("ui-layer");
const messageTitle = document.getElementById("message-title");
const messageSubtitle = document.getElementById("message-subtitle");
const restartBtn = document.getElementById("restart-btn");

// Status do Jogo
let score = 0;
let lives = 3;
let gameState = "PLAYING"; 
let animationId;

// Raquete (Paddle)
const paddleWidth = 100;
const paddleHeight = 15;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleY = canvas.height - 40;
const paddleSpeed = 8;
let rightPressed = false;
let leftPressed = false;

// Bola (Ball)
let ballRadius = 8;
let ballX = canvas.width / 2;
let ballY = paddleY - ballRadius;
let ballDX = 4;
let ballDY = -4;

// Tijolos (Bricks)
const brickRowCount = 6;
const brickColumnCount = 8;
const brickWidth = 80;
const brickHeight = 25;
const brickPadding = 12;
const brickOffsetTop = 60;
// Centralizando os tijolos: (800 - (8*80 + 7*12)) / 2  -> (800 - 640 - 84)/2 = 76/2 = 38
const brickOffsetLeft = 38; 

// Cores estilo neon
const brickColors = [
    "#ff0055", // Rosa / Vermelho
    "#ff00ff", // Magenta
    "#aa00ff", // Roxo
    "#0055ff", // Azul
    "#00ffff", // Ciano
    "#00ff00"  // Verde
];

let bricks = [];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: brickColors[r] };
        }
    }
}

// Controladores de Evento
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
restartBtn.addEventListener("click", resetGame);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
        if (paddleX < 0) paddleX = 0;
        if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                // Determina o ponto mais próximo do tijolo em relação à bola
                let closestX = Math.max(b.x, Math.min(ballX, b.x + brickWidth));
                let closestY = Math.max(b.y, Math.min(ballY, b.y + brickHeight));

                // Calcula a distância entre a bola e o ponto mais próximo
                let distanceX = ballX - closestX;
                let distanceY = ballY - closestY;
                let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

                if (distanceSquared < (ballRadius * ballRadius)) {
                    // Colisão com o tijolo
                    b.status = 0;
                    score += 10;
                    
                    // Aproximação para definir qual lado foi atingido e inverter a direção correta
                    if (Math.abs(distanceX) > Math.abs(distanceY)) {
                        ballDX = -ballDX;
                    } else {
                        ballDY = -ballDY;
                    }
                    
                    checkWin();
                }
            }
        }
    }
}

function checkWin() {
    let win = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                win = false;
                break;
            }
        }
    }
    if (win) {
        gameState = "WIN";
        endGame(true);
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fff";
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.beginPath();
    // Borda arredondada se suportado
    if (ctx.roundRect) {
        ctx.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, 5);
    } else {
        ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    }
    ctx.fillStyle = "#00ffff"; // Ciano neon
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ffff";
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 3);
                } else {
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                }
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = bricks[c][r].color;
                ctx.closePath();
                ctx.shadowBlur = 0;
            }
        }
    }
}

function drawText() {
    ctx.font = "bold 20px 'Courier New'";
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#fff";
    ctx.fillText("SCORE: " + score, 20, 30);
    ctx.fillText("LIVES: " + lives, canvas.width - 120, 30);
    ctx.shadowBlur = 0;
}

function resetBallAndPaddle() {
    ballX = canvas.width / 2;
    ballY = paddleY - ballRadius - 5;
    ballDX = 4 * (Math.random() > 0.5 ? 1 : -1);
    ballDY = -4;
    paddleX = (canvas.width - paddleWidth) / 2;
}

function resetGame() {
    score = 0;
    lives = 3;
    gameState = "PLAYING";
    uiLayer.classList.add("hidden");
    messageTitle.className = "";
    initBricks();
    resetBallAndPaddle();
    draw();
}

function endGame(isWin) {
    uiLayer.classList.remove("hidden");
    messageSubtitle.innerText = "FINAL SCORE: " + score;
    if (isWin) {
        messageTitle.innerText = "YOU WIN!";
        messageTitle.className = "win";
    } else {
        messageTitle.innerText = "GAME OVER";
        messageTitle.className = "game-over";
    }
}

function draw() {
    if (gameState !== "PLAYING") return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawBall();
    drawPaddle();
    drawText();
    collisionDetection();

    // Colisão com as paredes laterais
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    
    // Colisão com o teto
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    } 
    
    // Colisão com a Raquete
    if (ballY + ballRadius >= paddleY && ballY - ballRadius <= paddleY + paddleHeight) {
        if (ballX + ballRadius >= paddleX && ballX - ballRadius <= paddleX + paddleWidth) {
            // Garante que a bola vá para cima
            ballDY = -Math.abs(ballDY);
            
            // Ajusta o ballDX baseado em onde a bola bateu na raquete
            let hitPoint = ballX - (paddleX + paddleWidth / 2);
            let normalizedHitPoint = hitPoint / (paddleWidth / 2); // de -1 a 1
            ballDX = normalizedHitPoint * 6; // Velocidade lateral máxima
            
            // Garante uma velocidade mínima em Y
            if (Math.abs(ballDY) < 3) ballDY = -3;
        }
    }
    
    // Passou da base (Perde vida)
    if (ballY + ballRadius > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameState = "GAME_OVER";
            endGame(false);
            return;
        } else {
            resetBallAndPaddle();
        }
    }

    // Movimento da raquete (Teclado)
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    // Movimenta a bola
    ballX += ballDX;
    ballY += ballDY;

    animationId = requestAnimationFrame(draw);
}

// Inicia o jogo
initBricks();
resetBallAndPaddle();
requestAnimationFrame(draw);
