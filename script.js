// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];

let apple = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let level = 1;
let applesEaten = 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// Update high score display
document.getElementById('highScore').textContent = highScore;

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if(direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            if(direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if(direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            if(direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
});

// Button Controls
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('startBtn').textContent = 'متابعة';
        document.getElementById('pauseBtn').disabled = false;
        gameLoop();
    }
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').textContent = gamePaused ? 'استئناف' : 'إيقاف مؤقت';
        if (!gamePaused) {
            gameLoop();
        }
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    applesEaten = 0;
    gameSpeed = 100;
    gameRunning = false;
    gamePaused = false;
    
    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1';
    document.getElementById('startBtn').textContent = 'ابدأ اللعبة';
    document.getElementById('pauseBtn').textContent = 'إيقاف مؤقت';
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('gameOverScreen').style.display = 'none';
    
    generateApple();
    draw();
}

function gameLoop() {
    if (!gamePaused && gameRunning) {
        update();
        draw();
    }
    setTimeout(gameLoop, gameSpeed);
}

function update() {
    direction = nextDirection;
    
    // Add new head
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check collision with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    // Check collision with self
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check if apple is eaten
    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        applesEaten++;
        document.getElementById('score').textContent = score;
        
        // Level up every 5 apples
        if (applesEaten % 5 === 0) {
            level++;
            gameSpeed = Math.max(50, gameSpeed - 10);
            document.getElementById('level').textContent = level;
        }
        
        generateApple();
    } else {
        // Remove tail if no apple eaten
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#667eea';
            ctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#a0aef6';
            ctx.shadowColor = 'rgba(160, 174, 246, 0.3)';
            ctx.shadowBlur = 5;
        }
        
        ctx.fillRect(
            segment.x * gridSize + 2,
            segment.y * gridSize + 2,
            gridSize - 4,
            gridSize - 4
        );
        ctx.shadowColor = 'transparent';
    });
    
    // Draw apple
    ctx.fillStyle = '#f56565';
    ctx.shadowColor = 'rgba(245, 101, 101, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        apple.x * gridSize + gridSize / 2,
        apple.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function generateApple() {
    let newApple;
    let collision;
    
    do {
        collision = false;
        newApple = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Make sure apple doesn't spawn on snake
        for (let segment of snake) {
            if (newApple.x === segment.x && newApple.y === segment.y) {
                collision = true;
                break;
            }
        }
    } while (collision);
    
    apple = newApple;
}

function endGame() {
    gameRunning = false;
    gamePaused = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    // Show game over screen
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Initialize
draw();
document.getElementById('pauseBtn').disabled = true;