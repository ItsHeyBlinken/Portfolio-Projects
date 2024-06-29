

// Keyboard input handler
const keys = {};
window.addEventListener('keydown', event => {
  if (event.key === ' ') {
    if (ball.speed === 0) {
      // Calculate the angle for the ball launch
      const dx = Math.cos(Math.PI / 4) * player.width;
      const dy = Math.sin(Math.PI / 4) * player.height;

      // Set the ball's position and speed
      ball.x = player.x + dx;
      ball.y = player.y - player.height - dy;
      ball.speed = 6; // Adjust the ball speed
      ball.angle = Math.PI / 4; // Adjust the launch angle (-45 degrees)
    }
  }
  keys[event.key] = true;
});

window.addEventListener('keyup', event => {
  keys[event.key] = false;
});

// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player object
const player = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: 75,
  height: 25,
  color: 'yellow',
  speed: 10
};

// Ball object
const ball = {
  x: player.x + player.width / 2, // Start ball position on top of player
  y: player.y - player.height / 2,
  radius: 10,
  speed: 8,
  angle: -Math.PI / -2, // Initial angle in radians (-45 degrees)
  color: 'red'
};

// Blocks array
const blocks = [];

// Create blocks
function createBlocks() {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 8; j++) {
      blocks.push(new Block(j * (player.width + 1), i * (player.height + 1)));
    }
  }
}

// Block constructor
function Block(x, y) {
  this.x = x;
  this.y = y;
  this.width = 72.5;
  this.height = 25;
  this.color = 'green';
}

// Initialize game
function init() {
    // Attach event listener to start button
    const startButton = document.getElementById('startButton')
    startButton.addEventListener('click', startGame);
  
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Display start button
    startButton.style.display = 'block';
  
    // Create blocks
    createBlocks();
  }

// Key down handler
function keyDownHandler(event) {
    keys[event.key] = true;
  }
  
  // Key up handler
  function keyUpHandler(event) {
    keys[event.key] = false;
  }

// Start game function
function startGame() {
  // Hide start button
  startButton.style.display = 'none';

  // Add event listeners for keyboard input
  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup', keyUpHandler);

  // Start game logic
  createBlocks();
  update();
}

// Draw everything function
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blocks
  for (const block of blocks) {
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.width, block.height);
  }

  // Draw the player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw the ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  ctx.fillStyle = ball.color;
  ctx.fill();
}


// Update function
function update() {
  // Move player based on keyboard input
  if (keys['ArrowLeft'] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }

  // Check if there are no more blocks remaining
  if (blocks.length === 0) {
    // Display game over message
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over - Refresh tab to play again', canvas.width / 2, canvas.height / 2);
    return; // Stop the update loop
  }

  // Check for collision between ball and player
  if (
    ball.y + ball.radius > player.y &&
    ball.x + ball.radius > player.x &&
    ball.x - ball.radius < player.x + player.width
  ) {
    // Reverse the ball's direction
    ball.angle = -ball.angle;
  }

  // Update ball position based on angle and speed
  if (ball.speed > 0) {
    ball.x += ball.speed * Math.cos(ball.angle);
    ball.y -= ball.speed * Math.sin(ball.angle);

    // Prevent the ball from leaving the top of the canvas
    if (ball.y - ball.radius < 0) {
      ball.angle = -ball.angle; // Reverse the ball's angle
      ball.y = ball.radius; // Reset the ball's y-coordinate to stay within the canvas
    }

    // Check if the ball has gone below the canvas's bottom edge
    if (ball.y + ball.radius > canvas.height) {
      // Reset the ball's position on top of the player
      const dx = Math.cos(Math.PI / 4) * player.width;
      const dy = Math.sin(Math.PI / 4) * player.height;
      ball.x = player.x + dx;
      ball.y = player.y - player.height - dy;
      ball.speed = 0; // Set ball speed to 0 to wait for player input

      // Set the ball's angle to point upwards (towards the blocks)
      ball.angle = -Math.PI / 4; // Adjust the launch angle (-45 degrees)
    }

    // Bounce ball off canvas edges
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.angle = Math.PI - ball.angle;
    }

    // Check for ball-block collisions
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i];
      if (
        ball.x + ball.radius > block.x &&
        ball.x - ball.radius < block.x + block.width &&
        ball.y + ball.radius > block.y &&
        ball.y - ball.radius < block.y + block.height
      ) {
        // Remove the block from the array
        blocks.splice(i, 1);

        // Calculate the center of the block
        const blockCenterX = block.x + block.width / 2;
        const blockCenterY = block.y + block.height / 2;

        // Calculate the difference between the ball and block centers
        const dx = ball.x - blockCenterX;
        const dy = ball.y - blockCenterY;

        // Calculate the angle of reflection based on the normal vector of the block's surface
        const normalAngle = Math.atan2(block.height, block.width);
        const incidentAngle = Math.atan2(dy, dx);
        const reflectionAngle = 2 * normalAngle - incidentAngle;

        // Update the ball's angle
        ball.angle = reflectionAngle;

        // Move the ball slightly to avoid getting stuck in the block
        ball.x += Math.cos(ball.angle) * ball.radius;
        ball.y += Math.sin(ball.angle) * ball.radius;
      }
    }
  }

  // Draw everything
  draw();

  // Request next frame
  requestAnimationFrame(update);
}



// Start the game
init();
