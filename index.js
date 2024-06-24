const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const wireXPositions = [150, 300, 450, 600];
const wireCount = wireXPositions.length;

const gameOverMusic = new Audio(
  "aeests/sounds/TunePocket-Funny-Fail-Game-Over-Preview.mp3"
);                                                              // Replace with your game over music path
gameOverMusic.volume = 0.5;

const backgroundImage = new Image();
backgroundImage.src = "aeests/images/ground.png"; // Replace with your background image path

const bugImage = new Image();
bugImage.src = "aeests/images/pokemon-removebg-preview.png"; // Replace with your bug GIF image path

const jumpSound = new Audio("aeests/sounds/cartoon-jump-6462.mp3");
jumpSound.volume=0.5;



const spriteSheetWidth = 256;
const spriteSheetHeight = 57;
const bugFrameWidth = spriteSheetWidth / 4;
const bugFrameHeight = spriteSheetHeight / 1;
const totalBugFrames = 4;
let bugCurrentFrame = 0;
let frameCount = 0;

let bug = {
  x: wireXPositions[0] - 25, // Initial position of the bug on the wire
  y: canvasHeight - 90,
  width: 70,
  height: 65,
  image: bugImage,
  wireIndex: 0,
  jumping: false,
  jumpHeight: 0,
  jumpSpeed: 0,
};

const obstacleImages = [
  { src: "aeests/images/crow.png", width: 50, height: 70 },
  { src: "aeests/images/lion-removebg-preview.png", width: 80, height: 80 },
  { src: "aeests/images/hayina-removebg-preview.png", width: 120, height: 60 },
];

let obstacles = [];
let score = 0;
let gameOver = false;
let obstacleSpeed = 5;

let backgroundMusic = document.getElementById("backgroundMusic");
backgroundMusic.volume = 0.2;

// Game state variables
const GAME_STATE_START = "start";
const GAME_STATE_RUNNING = "running";
const GAME_STATE_OVER = "over";
let gameState = GAME_STATE_START;

// Ensure all images are loaded before starting the game loop
let imagesLoaded = 0;
const totalImages = 1 + obstacleImages.length;

function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    startBackgroundMusic();
    gameLoop(); // Start the game loop once all images are loaded
  }
}

function startBackgroundMusic() {
  backgroundMusic.play();
}


function stopBackgroundMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0; // Reset the music to the beginning
}

bugImage.onload = imageLoaded; //bugImage call function imageLoaded after it is finished loading
backgroundImage.onload = imageLoaded;


obstacleImages.forEach((obstacle) => {  //load obstacle images
  const img = new Image();
  img.src = obstacle.src;
  obstacle.image = img;
  img.onload = imageLoaded;
});

function drawBug() {
  const row = Math.floor(bugCurrentFrame / 4);
  const col = bugCurrentFrame % 4;
  ctx.drawImage(
    bugImage,
    col * bugFrameWidth + 6,
    row * bugFrameHeight, // Source x, y
    bugFrameWidth,
    bugFrameHeight, // Source width, height
    bug.x,
    bug.y - bug.jumpHeight, // Destination x, y (adjusted for jump height) //
    bug.width,
    bug.height // Destination width, height
  );

  // Update frame count and switch frame if needed
  frameCount++;
  if (frameCount % 10 === 0) {
    // Change frame every 10 game loops
    bugCurrentFrame = (bugCurrentFrame + 1) % totalBugFrames;
  }

  // Handle jumping mechanics
  if (bug.jumping) {
    bug.jumpHeight += bug.jumpSpeed;
    bug.jumpSpeed -= 1; // Gravity effect

    if (bug.jumpHeight <= 0) {
      bug.jumpHeight = 0;
      bug.jumping = false;
    }
  }
}

function drawWires() {
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 5;
  wireXPositions.forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  });
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(
      obstacle.image,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  });
}

function moveObstacles() {
  obstacles = obstacles.filter((obstacle) => obstacle.y + obstacle.height > 0);
  obstacles.forEach((obstacle) => {
    obstacle.y += obstacleSpeed;
  });
}

function createObstacle() {
  if (gameState !== GAME_STATE_RUNNING) return;
  const wireIndex = Math.floor(Math.random() * wireCount);
  const obstacleType =
    obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
  const obstacle = {
    x: wireXPositions[wireIndex] - obstacleType.width / 2,
    y: 0,
    width: obstacleType.width,
    height: obstacleType.height,
    image: obstacleType.image,
  };
  obstacles.push(obstacle);
}

function checkCollision() {
  // Loop through each obstacle in the obstacles array
  for (let obstacle of obstacles) {
    // Checks if the bug's bounding box intersects with the obstacle's bounding box
    if (
      bug.x < obstacle.x + obstacle.width && // The left side of the bug is to the left of the right side of the obstacle
      bug.x + bug.width > obstacle.x && // The right side of the bug is to the right of the left side of the obstacle
      bug.y - bug.jumpHeight < obstacle.y + obstacle.height - 10 && // The top side of the bug (adjusted for jumping) is above the bottom side of the obstacle
      bug.y + bug.height - bug.jumpHeight > obstacle.y + 10 // The bottom side of the bug (adjusted for jumping) is below the top side of the obstacle
    ) {
      // If all these conditions are true, a collision has occurred
      gameOver = true; // Set the gameOver flag to true to end the game
      gameState = GAME_STATE_OVER;
      stopBackgroundMusic(); // Stop the background music
    }
  }
}

let scoreUpdateCounter = 0;

function updateScore() {
  if (gameState !== GAME_STATE_RUNNING) return;
  scoreUpdateCounter++;
  if (scoreUpdateCounter % 10 === 0) {
    // Update score every 10 frames
    score += 1;
    if (score > 50) {
      obstacleSpeed = 8;
    }
    if (score > 100) {
      obstacleSpeed = 12;
    }
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "22px Arial bold";
  ctx.fillText(`Score: ${score}`, canvasWidth - 120, 40);
}

function drawLevelMessage() {
  ctx.fillStyle = "lightblue";
  ctx.font = "30px Arial bold";
  ctx.fillText("LEVEL 2", canvasWidth / 2 - 60, 60);
}

function drawLevel3Message() {
  ctx.fillStyle = "lightblue";
  ctx.font = "30px Arial";
  ctx.fillText("LEVEL 3", canvasWidth / 2 - 60, 60);
}

function resetGame() {
  bug.x = wireXPositions[0] - 25;
  bug.y = canvasHeight - 90;
  bug.wireIndex = 0;
  bug.jumping = false;
  bug.jumpHeight = 0;
  bug.jumpSpeed = 0;
  obstacles = [];
  score = 0;
  scoreUpdateCounter = 0;
  gameOver = false;
  obstacleSpeed = 5;
  stopBackgroundMusic(); // Start the music when the game resets
  gameState = GAME_STATE_RUNNING;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  ctx.fill();
}

// function drawStartPage() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     // Draw the background
//     ctx.fillStyle = '#000000';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     // Draw the title in graffiti style
//     ctx.fillStyle = '#FF0000';
//     ctx.font = '60px Arial';
//     ctx.fillText('Bug on a Wire', canvas.width / 2 - 180, 200);
    
//     // Draw instructions
//     ctx.fillStyle = '#FFFFFF';
//     ctx.font = '20px Arial';
//     ctx.fillText('Instructions:', canvas.width / 2 - 70, 280);
//     ctx.fillText('Arrow Up - Move Up', canvas.width / 2 - 100, 320);
//     ctx.fillText('Arrow Down - Move Down', canvas.width / 2 - 100, 360);
//     ctx.fillText('Arrow Right - Jump', canvas.width / 2 - 100, 400);

//     // Draw start button
//     ctx.fillStyle = '#00FF00';
//     ctx.fillRect(canvas.width / 2 - 50, 450, 100, 50);
//     ctx.fillStyle = '#000000';
//     ctx.font = '20px Arial';
//     ctx.fillText('Start', canvas.width / 2 - 20, 480);

//     // Draw "Press Enter to Start"
//     ctx.fillStyle = '#FFFFFF';
//     ctx.font = '20px Arial';
//     ctx.fillText('Press Enter to Start', canvas.width / 2 - 90, 540);
// }

function drawStartMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the title in graffiti style
    ctx.fillStyle = '#FF0000';
    ctx.font = '60px Arial';
    ctx.fillText('Bug on a Wire', canvas.width / 2 - 180, 200);
    
    // Draw instructions
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Instructions:', canvas.width / 2 - 70, 280);
    ctx.fillText('Arrow Up - JUMP', canvas.width / 2 - 100, 320);
    ctx.fillText('Arrow Left - Shift Left', canvas.width / 2 - 100, 360);
    ctx.fillText('Arrow Right - Shift Right', canvas.width / 2 - 100, 400);

    // Draw start button
    ctx.fillStyle = 'blue';
    ctx.fillRect(canvas.width / 2 - 50, 450, 100, 50);
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial bold';
    ctx.fillText('Start', canvas.width / 2 - 20, 480);

    // Draw "Press Enter to Start"
    ctx.fillStyle = 'blue';
    ctx.font = '20px Arial bold';
    ctx.fillText('Press Space to Start', canvas.width / 2 - 90, 540);
}

function gameLoop() {
  ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

  if (gameState === GAME_STATE_START) {
    drawStartMenu();

  } else if (gameState === GAME_STATE_RUNNING) {
    drawWires();
    drawBug();
    moveObstacles();
    drawObstacles();
    checkCollision();
    updateScore();
    drawScore();
startBackgroundMusic();
    if (score > 50) {
      drawLevelMessage();
    }
    if (score > 100) {
      drawLevel3Message();
    }
  } else if (gameState === GAME_STATE_OVER) {
    ctx.fillStyle = "lightblue";
    drawRoundedRect(
      ctx,
      canvasWidth / 4 - 14,
      canvasHeight / 2 - 45,
      340,
      120,
      20
    );
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(
      `Game Over! Score: ${score}`,
      canvasWidth / 4,
      canvasHeight / 2
    );
    ctx.fillText(
      "Press Space to Restart",
      canvasWidth / 4,
      canvasHeight / 2 + 40
    );

    // Play game over music if it's not already playing
    if (gameOverMusic.paused) {
      gameOverMusic.play().catch((error) => {
        console.error("Error playing game over music:", error);
      });
    }
  }

  requestAnimationFrame(gameLoop);
}

if (score <= 50) {
  setInterval(createObstacle, 600);
} else if (score > 50) {
  drawLevelMessage();
  setInterval(createObstacle, 200);
}
if (score > 100) {
  drawLevel3Message();
  setInterval(createObstacle, 100);
}

document.addEventListener("keydown", (event) => {
  if (
    event.code === "ArrowLeft" &&
    bug.wireIndex > 0 &&
    gameState === GAME_STATE_RUNNING
  ) {
    bug.wireIndex -= 1;
    bug.x = wireXPositions[bug.wireIndex] - 20;
    jumpSound.currentTime = 0; // Reset sound to start
    jumpSound.play().catch((error) => {
      console.error("Error playing jump sound:", error);
    });
  } else if (
    event.code === "ArrowRight" &&
    bug.wireIndex < wireCount - 1 &&
    gameState === GAME_STATE_RUNNING
  ) {
    bug.wireIndex += 1;
    bug.x = wireXPositions[bug.wireIndex] - 20;
    jumpSound.currentTime = 0; // Reset sound to start
    jumpSound.play().catch((error) => {
      console.error("Error playing jump sound:", error);
    });
  } else if (
    event.code === "ArrowUp" &&
    !bug.jumping &&
    gameState === GAME_STATE_RUNNING
  ) {
    bug.jumping = true;
    bug.jumpSpeed = 15; // Initial jump speed
    jumpSound.currentTime = 0; // Reset sound to start
    jumpSound.play().catch((error) => {
      console.error("Error playing jump sound:", error);
    });
  } else if (event.code === "Space") {
    if (gameState === GAME_STATE_START || gameState === GAME_STATE_OVER) {
      resetGame();
    }
  }
});
